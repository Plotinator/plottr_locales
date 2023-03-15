import { Paragraph } from 'docx'

import { serialize } from './to_word'

export default function exportItemTemplates(item, headingLevel) {
  return interpret(exportItemTemplatesDirectives(item, headingLevel))
}

function interpret(directives) {
  return directives.flatMap(({ type, ...props }) => {
    switch (type) {
      case 'paragraph': {
        return [new Paragraph({ text: props.text })]
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

export function exportItemTemplatesDirectives(item, headingLevel) {
  return (item.templates || []).flatMap((t) => {
    return (t.attributes || []).flatMap((attr) => {
      const value =
        t?.values?.find(({ name }) => {
          return name === attr.name
        })?.value || attr.value
      let paragraphs = []
      if (!value) return []
      paragraphs.push({ type: 'paragraph', text: attr.name, heading: headingLevel })
      if (Array.isArray(value)) {
        paragraphs = [...paragraphs, { type: 'function', func: () => serialize(value) }]
      } else {
        paragraphs.push({ type: 'paragraph', text: value })
      }
      return paragraphs
    })
  })
}
