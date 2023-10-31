const { jsx } = require('slate-hyperscript')
const { intersection, isEqual } = require('lodash')
const MarkDown = require('pagedown')
const md = MarkDown.getSanitizingConverter()
const DomParser = require('dom-parser')
const parser = new DomParser()

export function convertMDString(text) {
  if (!text) return [{ type: 'paragraph', children: [{ text: '' }] }]
  if (text == '') return [{ type: 'paragraph', children: [{ text: '' }] }]

  const html = md.makeHtml(text)
  const dom = parser.parseFromString('<body>' + html + '</body>')
  const slate = deserialize(dom.getElementsByTagName('body')[0])
  if (!slate.length) {
    slate.push({ type: 'paragraph', children: [{ text: '' }] })
  }
  return slate
}

export function convertHTMLString(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const slate = deserialize(parsed.body)
  if (!slate.length) {
    slate.push({ type: 'paragraph', children: [{ text: '' }] })
  }
  return slate
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
              if (typeof head.text !== undefined) {
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
    children: nodeList.map(deserialize).flat(1),
  }).children
}

export function deserialize(el) {
  if (el.nodeType === 3) {
    // if it's only a bunch of white space, ignore it
    if (el.textContent == '\n' || el.textContent == '\n\n' || el.textContent == '\n\n\n') {
      return null
    }

    return {
      text: el.textContent.replace(/[\n]/g, ' '),
    }
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize).flat()
  const isBold =
    el.style.fontWeight &&
    (el.style.fontWeight.toLowerCase().trim() == 'bold' || el.style.fontWeight >= 700)

  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children)
    case 'BR':
      return '\n'
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'block-quote' }, children)
    case 'P':
    case 'DIV':
      return jsx('element', { type: 'paragraph' }, children)
    case 'H1':
      return jsx('element', { type: 'heading-one' }, children)
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
    case 'H2':
      return jsx('element', { type: 'heading-two' }, children)
    case 'UL':
      return jsx('element', { type: 'bulleted-list' }, children)
    case 'LI':
      return jsx('element', { type: 'list-item' }, children)
    case 'OL':
      return jsx('element', { type: 'numbered-list' }, children)
    // FIXME: these wont work if you have emph and bold
    // etc. recursively or if there are other structures nested
    // inside.
    case 'EM':
    case 'I':
      return jsx('text', { italic: true, text: el.textContent })
    case 'STRONG':
    case 'B':
      return jsx('text', { bold: true, text: el.textContent })
    case 'U':
      return jsx('text', { underline: true, text: el.textContent })
    case 'DEL':
      return jsx('text', { strike: true, text: el.textContent })
    case 'IMG': {
      let childrenNodes = children && children.length ? children : [{ text: '' }]
      return jsx('element', { type: 'image-link', url: el.getAttribute('src') }, childrenNodes)
    }
    case 'A':
      return jsx('element', { type: 'link', url: el.getAttribute('href') }, children)
    default: {
      if (children?.length === 0) {
        return el.textContent
      } else if (isBold) {
        if (Array.isArray(children) && children.length === 1) {
          return { ...children[0], isBold }
        } else {
          return { children, isBold }
        }
      } else {
        return children
      }
    }
  }
}
