import { Transforms } from 'slate'
import { slate } from 'pltr/v2'

export const withHTML = (editor) => {
  const { insertData } = editor

  editor.insertData = (data) => {
    const htmlRootNode = data.getData('text/html')

    if (htmlRootNode) {
      // Don't include fonts because we don't *yet* have a means of
      // picking a matching font from our supported subset.
      Transforms.insertNodes(editor, slate.html.deserialise(htmlRootNode, { stripFont: true }))
    } else {
      insertData(data)
    }
  }

  return editor
}
