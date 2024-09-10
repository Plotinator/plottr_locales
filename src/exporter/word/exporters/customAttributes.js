import { Paragraph, TextRun } from 'docx'

import { serialize } from './to_word'

export default function exportCustomAttributes(item, customAttrs) {
  return interpret(exportCustomAttributesDirectives(item, customAttrs))
}

function interpret(directives) {
  return directives.flatMap(({ type, ...props }) => {
    switch (type) {
      case 'paragraph': {
        if (props.bold || props.italics) {
          return [
            new Paragraph({
              children: [
                new TextRun({
                  text: props.text,
                  italics: props.italics,
                  bold: props.bold,
                }),
              ],
            }),
          ]
        } else {
          return [new Paragraph({ text: props.text })]
        }
      }

      case 'function': {
        return props.func()
      }

      default: {
        return []
      }
    }
  })
}

export function exportCustomAttributesDirectives(item, customAttrs) {
  return (customAttrs || []).flatMap((ca) => {
    let paragraphs = []
    if (item[ca.name]) {
      paragraphs.push({ type: 'paragraph', text: ca.name, italics: true, bold: true })
      if (ca.type == 'paragraph') {
        paragraphs = [...paragraphs, { type: 'function', func: () => serialize(item[ca.name]) }]
      } else {
        if (item[ca.name]) paragraphs.push({ type: 'paragraph', text: item[ca.name] })
      }
    }
    return paragraphs
  })
}
