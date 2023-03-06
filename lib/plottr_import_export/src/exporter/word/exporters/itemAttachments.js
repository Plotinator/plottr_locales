import { Paragraph } from 'docx'
import { t } from 'plottr_locales'

export default function exportItemAttachments(item, namesMapping) {
  return interpret(exportItemAttachmentsDirectives(item, namesMapping))
}

function interpret(directives) {
  return directives.flatMap(({ type, ...props }) => {
    switch (type) {
      case 'paragraph': {
        return [new Paragraph({ text: props.text })]
      }

      default: {
        return []
      }
    }
  })
}

export function exportItemAttachmentsDirectives(item, namesMapping) {
  let paragraphs = []
  let characters = []
  let places = []
  let tags = []

  if (item.characters) characters = item.characters.map((ch) => namesMapping.characters[ch])
  if (item.places) places = item.places.map((pl) => namesMapping.places[pl])
  if (item.tags) tags = item.tags.map((tg) => namesMapping.tags[tg])

  if (characters.length) {
    paragraphs.push({ type: 'paragraph', text: `${t('Characters')}: ${characters.join(', ')}` })
  }
  if (places.length) {
    paragraphs.push({ type: 'paragraph', text: `${t('Places')}: ${places.join(', ')}` })
  }
  if (tags.length) {
    paragraphs.push({ type: 'paragraph', text: `${t('Tags')}: ${tags.join(', ')}` })
  }
  if (paragraphs.length) {
    paragraphs.push({ type: 'paragraph', text: '' })
  }
  return paragraphs
}
