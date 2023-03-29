import { Paragraph } from 'docx'

import { serialize } from './to_word'

export default function exportCustomAttributes(item, customAttrs, headingLevel) {
  return interpret(exportCustomAttributesDirectives(item, customAttrs, headingLevel))
}

function interpret(directives) {
  return directives.flatMap(({ type, ...props }) => {
    switch (type) {
      case 'paragraph': {
        return [
          new Paragraph({ text: props.text, ...(props.heading ? { heading: props.heading } : {}) }),
        ]
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

export function exportCustomAttributesDirectives(item, customAttrs, headingLevel) {
  return (customAttrs || []).flatMap((ca) => {
    let paragraphs = []
    if (item[ca.name]) {
      paragraphs.push({ type: 'paragraph', text: ca.name, heading: headingLevel })
      if (ca.type == 'paragraph') {
        paragraphs = [...paragraphs, { type: 'function', func: () => serialize(item[ca.name]) }]
      } else {
        if (item[ca.name]) paragraphs.push({ type: 'paragraph', text: item[ca.name] })
      }
    }
    return paragraphs
  })
}
