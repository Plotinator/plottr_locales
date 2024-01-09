import { Transforms } from 'slate'
import { html } from 'pltr/v2'

export const withHTML = (editor) => {
  const { insertData } = editor

  editor.insertData = (data) => {
    const htmlRootNode = data.getData('text/html')

    if (html) {
      Transforms.insertNodes(editor, html.slate.deserialise(htmlRootNode))
    } else {
      insertData(data)
    }
  }

  return editor
}
