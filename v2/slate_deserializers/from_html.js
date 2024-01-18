import { jsx } from 'slate-hyperscript'
import { intersection, isEqual } from 'lodash'
import * as htmlparser2 from 'htmlparser2'

import unescapeHTML from './unescapeHTML'

export function convertHTMLString(html, options = {}) {
  const parsed = htmlparser2.parseDocument(`<div id="body">${html}</div>`)
  const body = parsed.childNodes[0]
  const slate = deserialize(options)(null)(body)
  return slate.children.map(ensureWrapped).map(unnestLists)
}

const TYPE_OR_VALUE_ATTRIBUTES = ['type', 'text', 'children']

const isNotTypeOrValueAttribute = (key) => {
  return TYPE_OR_VALUE_ATTRIBUTES.every((typeOrValueKey) => {
    return !isEqual(key, typeOrValueKey)
  })
}

export function nonTypeOrValueAttributesAreSame(thisSlateElement, thatSlateElement) {
  const thisKeys = Object.keys(thisSlateElement).filter(isNotTypeOrValueAttribute)
  const thatKeys = Object.keys(thatSlateElement).filter(isNotTypeOrValueAttribute)
  const sharedKeys = intersection(thisKeys, thatKeys)

  return (
    thisKeys.length === sharedKeys.length &&
    thisKeys.every((key) => {
      return isEqual(thisSlateElement[key], thatSlateElement[key])
    })
  )
}

export function compressConsecutiveSlateChildren(slateNode) {
  if (Array.isArray(slateNode.children)) {
    const compressedChildren = slateNode.children.map(compressConsecutiveSlateChildren)
    return {
      ...slateNode,
      children: compressedChildren
        .reduce((childrenAcc, nextChild) => {
          const head = childrenAcc[0]
          if (typeof head === 'undefined') {
            return [nextChild]
          } else if (head.type === 'paragraph') {
            // Consecutive paragraphs never get merged.
            return [nextChild, ...childrenAcc]
          } else if (head.type === nextChild.type) {
            // We're in the same sort of thing.  Do the attributes
            // match between peer chidlren?
            if (nonTypeOrValueAttributesAreSame(head, nextChild)) {
              // The attributes match.  Are we dealing with text fields?
              if (typeof head.text === 'string') {
                // Yes, they're text.  Merge the text content.
                return [
                  {
                    ...head,
                    text: head.text + nextChild.text,
                  },
                  ...childrenAcc.slice(1),
                ]
              } else {
                // Attributes match, merge the children if they're present.
                const headHasChildren = Array.isArray(head.children)
                const nextHasChildren = Array.isArray(nextChild.children)
                const newChildren =
                  headHasChildren && nextHasChildren
                    ? head.chidren.concat(nextChild.children)
                    : headHasChildren
                    ? head.children
                    : nextHasChildren
                    ? nextChild.children
                    : null
                return [
                  {
                    ...head,
                    ...(newChildren ? { chidren: newChildren } : {}),
                  },
                  ...childrenAcc.slice(1),
                ]
              }
            } else {
              // There'sa mismatch between some attributes in the two
              // children.  Don't merge.
              return [nextChild, ...childrenAcc]
            }
          } else {
            // Node types don't match.  Don't merge.
            return [nextChild, ...childrenAcc]
          }
        }, [])
        .reverse(),
    }
  } else {
    return slateNode
  }
}

export function convertHTMLNodeList(nodeList) {
  // We wrap the content in a paragraph so that the compression
  // consecutive slate children algorithm has a top-level node to
  // insert peers into.
  return compressConsecutiveSlateChildren({
    type: 'paragraph',
    children: nodeList.map(deserialize({})(null)).flat(1),
  }).children
}

const PARAGRAPH_LIKE_ELEMENTS = [
  'paragraph',
  'block-quote',
  'heading-one',
  'heading-two',
  'bulleted-list',
  'numbered-list',
  'image-link',
  'image-data',
]

const getAttribute = (el, name) => {
  const lowercaseName = name.toLowerCase()
  return (el.attributes || []).find((attribute) => {
    return attribute.name.toLowerCase() === lowercaseName
  })?.value
}

const ensureWrapped = (child) => {
  if (PARAGRAPH_LIKE_ELEMENTS.includes(child.type)) {
    return child
  } else {
    return jsx('element', { type: 'paragraph' }, [child])
  }
}

const LIST_TYPES = ['bulleted-list', 'numbered-list']

const ensureAtLeastOneElement = (children) => {
  if (Array.isArray(children) && children.length === 0) {
    return [{ text: '' }]
  } else {
    return children
  }
}

export const parseStyleAttribute = (styleString) => {
  if (typeof styleString === 'string') {
    return styleString.split(';').reduce((acc, next) => {
      const keyValue = next.split(':').map((x) => {
        return x.trim()
      })

      if (keyValue.length === 2) {
        return {
          ...acc,
          [keyValue[0]]: keyValue[1],
        }
      } else {
        return acc
      }
    }, {})
  } else {
    return styleString
  }
}

const onlyWhiteSpaceInSpan = (parent) => (node) => {
  return (
    (typeof node.data === 'string' &&
      (parent.tagName.toLowerCase() === 'span' || !node.data.match(/^[\s]+$/))) ||
    typeof node.data !== 'string'
  )
}

const safeParseInt = (x) => {
  try {
    return parseInt(x, 10)
  } catch {
    return false
  }
}

const isListContainerNode = (node) => {
  return ['bulleted-list', 'numbered-list'].includes(node?.type)
}

const isListItemNode = (node) => {
  return node?.type === 'list-item'
}

const unnestLists = (slate) => {
  function iter(node) {
    if (Array.isArray(node.children) && isListContainerNode(node)) {
      const children = node.children.reduce((acc, nextChild) => {
        if (isListItemNode(nextChild)) {
          const containerChildren = nextChild.children.filter(isListContainerNode)
          const itemChildren = nextChild.children.filter((child) => {
            return !isListContainerNode(child)
          })
          return [...acc, { ...nextChild, children: itemChildren }, ...containerChildren]
        } else {
          return [...acc, nextChild]
        }
      }, [])
      return {
        ...node,
        children: children.map(unnestLists),
      }
    } else {
      return {
        ...node,
        ...(Array.isArray(node.children) ? { children: node?.children?.map(unnestLists) } : {}),
      }
    }
  }
  return iter(slate)
}

export const deserialize = (options) => (parent) => (el) => {
  const deserializeIter = (parent) => (el) => {
    if (el.nodeType === 3 && !parent) {
      return jsx('element', { type: 'paragraph' }, [{ text: unescapeHTML(el.data ?? '') }])
    } else if (el.nodeType === 3 && parent) {
      return { text: unescapeHTML(el.data ?? '') }
    } else if (el.nodeType !== 1) {
      return null
    }

    const children = ensureAtLeastOneElement(
      (el.childNodes ?? []).filter(onlyWhiteSpaceInSpan(el)).flatMap(deserializeIter(el))
    )

    const style = parseStyleAttribute(
      (el.attributes ?? []).find((attribute) => {
        return attribute.name === 'style'
      })?.value
    )

    const extraProps = {
      ...(typeof style?.color === 'string' ? { color: style?.color } : {}),
      ...(typeof style?.['font-family'] === 'string' && !options.stripFont
        ? { font: style?.['font-family'] }
        : {}),
      ...(typeof style?.['font-size'] === 'string' && typeof safeParseInt(style?.size) === 'number'
        ? { fontSize: safeParseInt(style?.['font-size']) }
        : {}),
    }

    const jsxWithProps = (type, properties, jsxChildren) => {
      return jsx(type, { ...properties, ...extraProps }, jsxChildren)
    }

    switch (el.tagName?.toLowerCase() || '') {
      case 'div': {
        // if it's only child is a br
        const elementChildren =
          Array.isArray(el.childNodes) &&
          el.childNodes.length === 1 &&
          el.childNodes[0]?.tagName?.toLowerCase() === 'br'
            ? [{ text: '' }]
            : children
        return jsxWithProps(
          'element',
          { type: 'paragraph' },
          elementChildren.flatMap((child) => {
            if (child.type === 'paragraph' && parent !== null) {
              return child.children
            } else {
              return child
            }
          })
        )
      }
      // case 'br':
      //   return jsxWithProps('element', { type: 'paragraph' }, [{ text: '' }])
      case 'blockquote':
        return jsxWithProps('element', { type: 'block-quote' }, children.map(ensureWrapped))
      case 'p':
        return jsxWithProps(
          'element',
          { type: 'paragraph' },
          children.flatMap((child) => {
            if (child.type === 'paragraph' && parent !== null) {
              return child.children
            } else {
              return child
            }
          })
        )
      case 'h1':
        return jsxWithProps('element', { type: 'heading-one' }, children)
      case 'h2':
        return jsxWithProps('element', { type: 'heading-two' }, children)
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'h7':
        return jsxWithProps('element', { type: 'heading-two' }, children)
      case 'ul':
        return jsxWithProps('element', { type: 'bulleted-list' }, children)
      case 'li': {
        if (children.length === 1 && LIST_TYPES.includes(children[0].type)) {
          return children[0]
        } else {
          return jsxWithProps('element', { type: 'list-item' }, children)
        }
      }
      case 'ol':
        return jsxWithProps('element', { type: 'numbered-list' }, children)
      case 'em':
      case 'i': {
        return children.map((child) => {
          return {
            ...child,
            ...extraProps,
            italic: true,
          }
        })
      }
      case 'b':
      case 'strong': {
        return children.map((child) => {
          return {
            ...child,
            ...extraProps,
            bold: true,
          }
        })
      }
      case 'u': {
        return children.map((child) => {
          return {
            ...child,
            ...extraProps,
            underline: true,
          }
        })
      }
      case 'span': {
        return children.map((child) => {
          return {
            ...child,
            ...extraProps,
          }
        })
      }
      case 'del':
      case 'strike':
      case 's': {
        return children.map((child) => {
          return {
            ...extraProps,
            ...child,
            strike: true,
          }
        })
      }
      case 'img': {
        const storageUrl = getAttribute(el, 'data-storageUrl')
        if (storageUrl) {
          const childrenNodes = [{ text: '' }]
          return jsxWithProps(
            'element',
            { type: 'image-link', storageUrl: getAttribute(el, 'data-storageUrl') },
            childrenNodes
          )
        } else if (typeof storageUrl === 'undefined') {
          const childrenNodes = [{ text: '' }]
          return jsxWithProps(
            'element',
            { type: 'image-data', data: getAttribute(el, 'src') },
            childrenNodes
          )
        } else {
          // Replace with blank span if others failed
          return jsxWithProps('text', {}, '')
        }
      }
      case 'a': {
        return jsxWithProps('element', { type: 'link', url: getAttribute(el, 'href') }, children)
      }
      default:
        return children
    }
  }

  return deserializeIter(parent)(el)
}
