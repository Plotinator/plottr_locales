import { Editor, Transforms, Element, Node } from 'slate'

import { LIST_TYPES, HEADING_TYPES, IMAGE_TYPES, createEditor } from './helpers'

const withNormalizer = (editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = (entry) => {
    const [node, path] = entry

    // Only allow text in headings (no other elements as children)
    if (Element.isElement(node) && HEADING_TYPES.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type) {
          Transforms.unwrapNodes(editor, { at: childPath })
          return
        }
      }
    }

    // If the element is a paragraph, ensure its children are not paragraphs
    if (Element.isElement(node) && node.type == 'paragraph') {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type == 'paragraph') {
          Transforms.unwrapNodes(editor, { at: childPath })
          return
        }
      }
    }

    // Only allow list-items and list types as children of lists
    if (Element.isElement(node) && LIST_TYPES.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (
          Element.isElement(child) &&
          !(child.type === 'list-item' || LIST_TYPES.includes(child.type))
        ) {
          Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath })
          return
        }
      }
    }

    // Don't allow list-items to be children of other list-items
    if (Element.isElement(node) && node.type == 'list-item') {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type == 'list-item') {
          Transforms.liftNodes(editor, { at: childPath })
          return
        }
      }
    }

    // Don't allow image-links to be children of paragraphs
    if (Element.isElement(node) && node.type == 'image-link') {
      const parent = Node.parent(editor, path)
      if (parent && Element.isElement(parent) && parent.type == 'paragraph') {
        Transforms.liftNodes(editor, { at: path })
        return
      }
    }

    // Don't allow a collection of list items to not have a parent of a list type
    if (Element.isElement(node) && !LIST_TYPES.includes(node.type)) {
      let allChildrenAreListTypes =
        node.children && node.children.length && node.children.length > 0
      for (const [child] of Node.children(editor, path)) {
        allChildrenAreListTypes &= Element.isElement(child) && child.type === 'list-item'
      }
      if (allChildrenAreListTypes) {
        Transforms.setNodes(editor, { type: 'bulleted-list' }, { at: path })
        return
      }
    }

    // Don't allow root-level collections of nodes to all be list items.
    if (Array.isArray(path) && path.length === 0 && node.children && node.children.length > 0) {
      let allChildrenAreListTypes = node.children.length !== 0
      let allChildrenAreEmpty = node.children.length !== 0
      for (const child of node.children) {
        allChildrenAreListTypes &= Element.isElement(child) && child.type === 'list-item'
        allChildrenAreEmpty &=
          Element.isElement(child) &&
          Array.isArray(child.children) &&
          child.children.every((subChild) => {
            return subChild.text === ''
          })
      }
      if (allChildrenAreListTypes) {
        if (allChildrenAreEmpty) {
          node.children.forEach((child, index) => {
            Transforms.setNodes(editor, { type: 'paragraph' }, { at: [...path, index] })
          })
        } else {
          node.children = [
            {
              type: 'bulleted-list',
              children: node.children,
            },
          ]
        }
        return
      }
    }

    // If a paragraph is missing the "paragraph" type, then add it.
    if (Element.isElement(node) && node.type === undefined) {
      let allChildrenAreText = true
      for (const [child, _childPath] of Node.children(editor, path)) {
        allChildrenAreText &= child.text !== undefined
      }
      if (allChildrenAreText) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path })
        return
      }
    }

    // Ensure that there's always something (by default a paragraph)
    // after an image at the end of a document.
    if (Element.isElement(node) && IMAGE_TYPES.includes(node.type)) {
      const parent = Editor.parent(editor, path)
      // If we don't have a parent for an image then something's gone
      // horribly wrong(!)
      if (parent) {
        const [parentNode, parentPath] = parent
        // If this image is in the root's children, check whether it's
        // the last element
        if (
          parentPath.length === 0 &&
          parentNode.children.indexOf(node) === parentNode.children.length - 1
        ) {
          const emptyParagraph = {
            type: 'paragraph',
            children: [
              {
                text: '',
              },
            ],
          }
          Transforms.insertNodes(editor, emptyParagraph, { at: [parentNode.children.length] })
          return
        }
      } else {
        console.warn("Silent invariant violated.  Image doesn't have a parent!")
      }
    }

    // Don't allow paragraphs to contain lists as children, they
    // should be peers.
    if (Element.isElement(node) && LIST_TYPES.includes(node.type)) {
      const [parentNode, _parentPath] = Editor.parent(editor, path)
      if (parentNode?.type === 'paragraph') {
        // We're a bulleted list in a paragraph.  We should raise this
        // list out of the paragraph.
        Transforms.liftNodes(editor, { at: path })
        return
      }
    }

    // If multiple lists of the same type are separated by empty
    // paragraphs or abut each other.  Join them into a single list.
    if (Element.isElement(node) && LIST_TYPES.includes(node.type)) {
      const [parentNode, _parentPath] = Editor.parent(editor, path)
      // Step 1: find the element that comes before this list.
      const thisElementsIndex = parentNode?.children?.indexOf?.(node)
      const previousElement = parentNode?.children?.[thisElementsIndex - 1]
      if (Element.isElement(previousElement)) {
        // Step 2: check whether that element is the same list type as
        // this node and join their list items if that's the case.
        if (previousElement.type === node.type) {
          Transforms.mergeNodes(editor, {
            at: path,
          })
          return
        } else {
          const previousPreviousElement = parentNode?.children?.[thisElementsIndex - 2]
          // Alternative: if there's a blank paragraph in between two
          // lists of the same type, delete the paragraph and merge
          // the lists.
          if (
            Element.isElement(previousPreviousElement) &&
            previousPreviousElement.type === node.type &&
            previousElement.type === 'paragraph' &&
            previousElement.children?.length === 1 &&
            previousElement.children[0]?.text === ''
          ) {
            const pathToDelete = [...path.slice(0, -1), path[path.length - 1] - 1]
            Transforms.removeNodes(editor, { at: pathToDelete })
            // NOTE: that the list bumps one back to the position of
            // the element we just deleted.
            Transforms.mergeNodes(editor, {
              at: pathToDelete,
            })
            return
          }
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry)
  }

  return editor
}

export const normalize = (log) => (content) => {
  // Some RCE content is actually text that has not been modified yet.
  if (content?.constructor !== Array) {
    return [
      {
        type: 'paragraph',
        children: [
          {
            text: content,
          },
        ],
      },
    ]
  }

  const editor = withNormalizer(createEditor(log))
  editor.children = content
  Editor.normalize(editor, { force: true })
  return editor.children
}

export default withNormalizer
