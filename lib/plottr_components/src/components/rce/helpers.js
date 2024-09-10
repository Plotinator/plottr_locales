import { cloneDeep, isPlainObject } from 'lodash'
import {
  Editor,
  Element as SlateElement,
  Text as SlateText,
  Transforms,
  createEditor as createSlateEditor,
} from 'slate'
import { withReact } from 'slate-react'
import { rceDataRepair } from './rceDataRepair'
import { withLinks } from './LinkButton'
import { withImages } from './ImagesButton'
import { withHTML } from './withHTML'
import withNormalizer from './Normalizer'
import { withList } from './withList'
import { initialState, helpers } from 'pltr'

const { isEmpty } = helpers.text

const { RCE_INITIAL_VALUE } = initialState

export const LIST_TYPES = ['numbered-list', 'bulleted-list']
export const HEADING_TYPES = ['heading-one', 'heading-two']
export const IMAGE_TYPES = ['image-data', 'image-link']

export function useTextConverter(text, log) {
  let rceText = text
  if (!text || !text.length || typeof text === 'string') {
    // [{ type: 'paragraph', children: [{ text: '' }] }]
    rceText = cloneDeep(RCE_INITIAL_VALUE)
  }
  if (typeof text === 'string') {
    rceText[0].children[0].text = text
  }

  return rceDataRepair(rceText, log)
}

const NOP = () => {}

export function createEditor(log, addImage = NOP) {
  return withList(log)(
    withNormalizer(
      withHTML(
        withImages(
          withLinks(
            withReact(
              // @ts-ignore
              createSlateEditor()
            )
          ),
          addImage
        )
      )
    )
  )
}

export const countWords = (nodes) => {
  if (nodes && Array.isArray(nodes) && nodes.filter(Boolean).length) {
    const wordCount = (nodes || []).reduce((acc, node) => {
      if (!isPlainObject(node) || isEmpty(node)) {
        return acc
      } else if (node.children && Array.isArray(node.children) && node.children.length) {
        return acc + countWords(node.children)
      } else if (node.text) {
        const words = node.text.trim().split(/\s+/g)
        return acc + words.filter((word) => word !== '').length
      }
      return acc
    }, 0)
    return wordCount
  }
  return 0
}

// Gets the previous sibling node to the provided path at the same depth
// @ts-ignore
Editor.previousSibling = (editor, path) => {
  if (path == null) return null

  const last = path[path.length - 1]
  if (last === 0) return null

  const siblingPath = [...path.slice(0, path.length - 1), last - 1]
  const siblingNode = Editor.node(editor, siblingPath)
  return siblingNode
}

// Gets the next sibling node to the provided path at the same depth
// @ts-ignore
Editor.nextSibling = (editor, path) => {
  if (path == null) return null
  const last = path[path.length - 1]
  const siblingPath = [...path.slice(0, path.lenght - 1), last + 1]
  // if there is no next sibling the method will throw an error
  try {
    const siblingNode = Editor.node(editor, siblingPath)
    return siblingNode
  } catch (err) {
    return null
  }
}

// @ts-ignore
Editor.isInBlock = (editor, types, givenSelection = null) => {
  if (
    givenSelection ||
    // @ts-ignore
    Editor.validSelection(editor)
  ) {
    const selection = givenSelection ?? editor.selection
    if (!(typeof selection?.anchor === 'object' && typeof selection?.focus === 'object')) {
      return false
    } else {
      const [match] = Array.from(
        Editor.nodes(editor, {
          match: (node) =>
            !Editor.isEditor(node) &&
            SlateElement.isElement(node) &&
            // @ts-ignore
            types.includes(node.type),
        })
      )

      return !!match
    }
  } else {
    return false
  }
}

// @ts-ignore
Editor.isInList = (editor) => {
  // @ts-ignore
  return Editor.isInBlock(editor, LIST_TYPES)
}

// @ts-ignore
Editor.isInHeading = (editor) => {
  // @ts-ignore
  return Editor.isInBlock(editor, HEADING_TYPES)
}

// @ts-ignore
Editor.parentOfType = (editor, path, { match }) => {
  try {
    const [parent, parentPath] = Editor.parent(editor, path)
    if (match(parent)) {
      return [parent, parentPath]
    }

    // @ts-ignore
    return Editor.parentOfType(editor, parentPath, { match })
  } catch (err) {
    return []
  }
}

// @ts-ignore
Editor.removePropertyOnSelectionOrCurrentElement = (editor, property) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    const { selection } = editor
    if (typeof selection?.anchor === 'object' && typeof selection?.focus === 'object') {
      // There is a point, and not a selection.  So operate on the
      // current element.
      const [_node, path] = Editor.parent(editor, selection.anchor.path)
      Transforms.unsetNodes(editor, property, {
        match: SlateText.isText,
        at: Editor.range(editor, path),
      })
    }
  }
}

const isValidPath = (node, path) => {
  if (!Array.isArray(path)) {
    return false
  } else if (!path.length) {
    return true
  } else {
    const nextNode = node?.children?.[path[0]]
    if (typeof nextNode === 'undefined') {
      return false
    } else {
      return isValidPath(nextNode, path.slice(1))
    }
  }
}

const validSelection = (editor) => {
  if (
    !Array.isArray(editor?.selection?.anchor?.path) ||
    !Array.isArray(editor?.selection?.focus?.path)
  ) {
    return false
  } else {
    const { anchor, focus } = editor.selection
    return isValidPath(editor, anchor.path) && isValidPath(editor, focus.path)
  }
}

// @ts-ignore
Editor.validSelection = (editor) => {
  return validSelection(editor)
}
