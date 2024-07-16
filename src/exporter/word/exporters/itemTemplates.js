import { Paragraph, TextRun } from 'docx'

import { serialize } from './to_word'

export default function exportItemTemplates(item) {
  return interpret(exportItemTemplatesDirectives(item))
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

export function exportItemTemplatesDirectives(item) {
  return (item.templates || []).flatMap((t) => {
    return (t.attributes || []).flatMap((attr) => {
      const value =
        t?.values?.find(({ name }) => {
          return name === attr.name
        })?.value || attr.value
      let paragraphs = []
      if (!value) return []
      paragraphs.push({ type: 'paragraph', text: attr.name, italics: true, bold: true })
      if (Array.isArray(value)) {
        paragraphs = [...paragraphs, { type: 'function', func: () => serialize(value) }]
      } else {
        paragraphs.push({ type: 'paragraph', text: value })
      }
      return paragraphs
    })
  })
}
