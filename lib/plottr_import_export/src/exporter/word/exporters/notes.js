import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, ImageRun } from 'docx'

import exportItemAttachments from './itemAttachments'
import exportCustomAttributes from './customAttributes'
import { serialize } from './to_word'

export default function exportNotes(state, namesMapping, options) {
  let children = [new Paragraph({ text: '', pageBreakBefore: true })]

  if (options.notes.heading) {
    children.push(
      new Paragraph({
        text: t('Notes'),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  const paragraphs = notes(
    state.notes,
    namesMapping,
    state.images,
    options,
    state.customAttributes.notes
  )

  return [{ children: children.concat(paragraphs) }]
}

function notes(notes, namesMapping, images, options, customAttributes) {
  let paragraphs = []
  notes.forEach(function (n) {
    paragraphs.push(new Paragraph({ text: '' }))
    paragraphs.push(new Paragraph({ text: n.title, heading: HeadingLevel.HEADING_2 }))
    if (options.notes.images && n.imageId) {
      const imgData = images[n.imageId] && images[n.imageId].data
      if (imgData) {
        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imgData,
                transformation: {
                  width: 300,
                  height: 300,
                },
              }),
            ],
          })
        )
      }
    }
    if (options.notes.attachments) {
      paragraphs = [...paragraphs, ...exportItemAttachments(n, namesMapping)]
    }
    if (options.notes.content) {
      paragraphs = [...paragraphs, ...serialize(n.content)]
    }
    if (options.notes.customAttributes) {
      paragraphs = [
        ...paragraphs,
        ...exportCustomAttributes(n, customAttributes, HeadingLevel.HEADING_3),
      ]
    }
  })

  return paragraphs
}
