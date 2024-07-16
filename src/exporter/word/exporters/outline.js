import { keyBy, includes } from 'lodash'
import { t } from 'plottr_locales'
import { helpers } from 'pltr'
import { Paragraph, AlignmentType, HeadingLevel, TextRun } from 'docx'

import { exportCustomAttributesDirectives } from './customAttributes'
import { exportItemTemplatesDirectives } from './itemTemplates'
import { exportItemAttachmentsDirectives } from './itemAttachments'
import { serialize } from './to_word'

const {
  card: { sortCardsInBeat, cardMapping },
} = helpers

export default function exportOutline(state, namesMapping, options, selectors) {
  return [{ children: interpret(exportOutlineDirectives(state, namesMapping, options, selectors)) }]
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
          return [
            new Paragraph({
              text: props.text,
              ...(props.heading ? { heading: props.heading } : {}),
              ...(props.alignment ? { alignment: props.alignment } : {}),
            }),
          ]
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

export function exportOutlineDirectives(state, namesMapping, options, selectors) {
  const {
    sortedLinesByBookSelector,
    cardMapSelector,
    sortedBeatsByBookSelector,
    makeBeatTitleSelector,
    cardsCustomAttributesSelector,
    hierarchyLevelSelector,
  } = selectors

  // get current book id and select only those beats/lines/cards
  const beats = sortedBeatsByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const outlineFilter = selectors.outlineFilterSelector(state)
  const outlineExportFilter = options.outline.filter
  const card2Dmap = cardMapSelector(state)
  const beatCardMapping = cardMapping(beats, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')

  let children = []

  if (options.outline.heading) {
    children.push({
      type: 'paragraph',
      text: t('Outline'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  }

  if (!beats.length) return children

  const getFilteredCards = (cards) => {
    if (outlineExportFilter) {
      return cards.filter((card) => includes(outlineExportFilter, card.lineId))
    } else if (!outlineExportFilter && outlineFilter) {
      return cards.filter((card) => includes(outlineFilter, card.lineId))
    } else {
      return cards
    }
  }

  const beatParagraphs = (beats || []).flatMap((beat) => {
    const uniqueBeatTitleSelector = makeBeatTitleSelector(state)
    const hierarchyLevel = hierarchyLevelSelector(state, beat.id)
    const title = uniqueBeatTitleSelector(state, beat.id)
    let paragraphs = [{ type: 'paragraph', text: '' }]

    const level = hierarchyLevel.level
    const heading =
      level === 0
        ? HeadingLevel.HEADING_2
        : level === 1
        ? HeadingLevel.HEADING_3
        : HeadingLevel.HEADING_4

    const cardHeadingLevel =
      level === 0
        ? HeadingLevel.HEADING_3
        : level === 1
        ? HeadingLevel.HEADING_4
        : HeadingLevel.HEADING_5

    if (!options.outline.sceneCards) {
      paragraphs.push({ type: 'paragraph', text: title, heading })
    } else {
      const cards = beatCardMapping[beat.id]
      const customAttrs = cardsCustomAttributesSelector(state)
      const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)

      const filteredCards = getFilteredCards(sortedCards)

      paragraphs.push({ type: 'paragraph', text: title, heading })

      const cardParagraphs = (filteredCards || []).flatMap((c) => {
        return card(c, linesById, namesMapping, customAttrs, options, cardHeadingLevel)
      })
      paragraphs = [...paragraphs, ...cardParagraphs]
    }

    return paragraphs
  })

  return [...children, ...beatParagraphs]
}

function card(card, linesById, namesMapping, customAttrs, options, cardHeadingLevel) {
  let paragraphs = [{ type: 'paragraph', text: '' }]
  let line = linesById[card.lineId]
  let titleString = card.title
  if (line) {
    if (options.outline.plotlineInTitle) {
      titleString = `${card.title} (${line.title})`
    } else {
      titleString = card.title
    }
  }
  paragraphs.push({ type: 'paragraph', text: titleString, heading: cardHeadingLevel })

  paragraphs = [...paragraphs, { type: 'paragraph', text: 'Begin Summary' }]

  if (options.outline.attachments) {
    paragraphs = [...paragraphs, ...exportItemAttachmentsDirectives(card, namesMapping)]
  }
  if (options.outline.description) {
    paragraphs = [
      // @ts-ignore
      ...paragraphs,
      // @ts-ignore
      { type: 'function', func: () => serialize(card.description) },
    ]
  }
  if (options.outline.customAttributes) {
    paragraphs = [...paragraphs, ...exportCustomAttributesDirectives(card, customAttrs)]
  }
  if (options.outline.templates) {
    paragraphs = [...paragraphs, ...exportItemTemplatesDirectives(card)]
  }

  paragraphs = [
    ...paragraphs,
    { type: 'paragraph', text: 'End Summary' },
    { type: 'paragraph', text: '' },
    { type: 'paragraph', text: '' },
  ]

  return paragraphs
}
