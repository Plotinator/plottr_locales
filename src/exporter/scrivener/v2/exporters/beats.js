import { keyBy, includes, sortBy, omit } from 'lodash'

import { t } from 'plottr_locales'
import { helpers, tree } from 'pltr'

import {
  buildDescriptionFromObject,
  createFolderBinderItem,
  createTextBinderItem,
  buildTemplateProperties,
} from '../utils'

const {
  card: { sortCardsInBeat, cardMapping },
} = helpers

const CARD_BASE_ATTRIBUTES = ['description', 'characters', 'places', 'tags']

function namesInsteadOfIds(card, key, characters, places, tags) {
  switch (key) {
    case 'characters': {
      return card.characters
        .map((characterId) => {
          return characters.find(({ id }) => {
            return id === characterId
          })?.name
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'places': {
      return card.places
        .map((placeId) => {
          return places.find(({ id }) => {
            return id === placeId
          })?.name
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'tags': {
      return card.tags
        .map((tagId) => {
          return tags.find(({ id }) => {
            return id === tagId
          })?.title
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'description': {
      return card.description
    }
    default: {
      return []
    }
  }
}

function cardBaseAttributes(card, characters, places, tags) {
  return CARD_BASE_ATTRIBUTES.reduce((attributes, next) => {
    const value = namesInsteadOfIds(card, next, characters, places, tags)
    return {
      ...attributes,
      [next]: value,
    }
  }, {})
}

export default function exportBeats(state, documentContents, options, selectors) {
  const {
    sortedLinesByBookSelector,
    cardMapSelector,
    sortedBeatsByBookSelector,
    makeBeatTitleSelector,
    cardsCustomAttributesSelector,
    beatsByBookSelector,
    allTagsSelector,
    allPlacesSelector,
    allCharactersSelector,
    outlineFilterSelector,
  } = selectors

  // get current book id and select only those beats/lines/cards
  const beats = sortedBeatsByBookSelector(state)
  const beatTree = beatsByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const beatCardMapping = cardMapping(beats, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')
  const customAttrs = cardsCustomAttributesSelector(state)
  const outlineFilter = outlineFilterSelector(state)
  const outlineExportFilter = options.outline.filter
  const tags = allTagsSelector(state)
  const places = allPlacesSelector(state)
  const characters = allCharactersSelector(state)

  const getFilteredCards = (cards) => {
    if (outlineExportFilter) {
      return cards.filter((card) => includes(outlineExportFilter, card.lineId))
    } else if (!outlineExportFilter && outlineFilter) {
      return cards.filter((card) => includes(outlineFilter, card.lineId))
    } else {
      return cards
    }
  }

  // create a BinderItem for each beat (Type: Folder)
  //   create a BinderItem for each card (Type: Text)
  //
  // Nest each beat inside a parent if it has one.
  const topLevelBeats = []
  const sortByBeatPosition = (xs) => {
    return sortBy(xs, 'position')
  }
  const _allBeats = tree.sortingReduce('id', sortByBeatPosition)(
    beatTree,
    (acc, beat, parentId) => {
      const uniqueBeatTitleSelector = makeBeatTitleSelector(state)
      const title = uniqueBeatTitleSelector(state, beat.id)
      const { binderItem } = createFolderBinderItem(title)
      acc[beat.id] = binderItem
      if (acc[parentId]) {
        acc[parentId].Children.BinderItem.push(binderItem)
      } else if (parentId !== null) {
        throw new Error('Invalid tree detected while exporting')
      } else if (parentId === null) {
        topLevelBeats.push(binderItem)
      }

      if (options.outline.sceneCards) {
        // sort cards into beats by lines (like outline auto-sorting)
        const cards = beatCardMapping[beat.id]
        const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
        const filteredCards = getFilteredCards(sortedCards)

        filteredCards.forEach((c) => {
          const { id, binderItem: cardItem } = createTextBinderItem(c.title)
          // @ts-ignore
          binderItem['Children']['BinderItem'].push(cardItem)

          // save card info into documentContents
          let title = ''
          const lineId = c.lineId
          const line = linesById[lineId]
          if (line) title = line.title

          const descObj = cardBaseAttributes(c, characters, places, tags)

          // @ts-ignore
          descObj.plotline = title

          if (options.outline.customAttributes) {
            customAttrs.forEach((entry) => {
              descObj[entry.name] = c[entry.name]
            }, descObj)
          }

          if (options.outline.templates) {
            c.templates.forEach((t) => {
              t.attributes.forEach((attr) => {
                if (descObj[attr.name]) {
                  descObj[`${t.name}:${attr.name}`] = attr.value
                } else {
                  descObj[attr.name] = attr.value
                }
              })
            })
          }

          // handle template properties
          const description = options.outline.templates
            ? {
                ...descObj,
                ...buildTemplateProperties(c.templates),
              }
            : descObj

          const destinationForCardDescription = options.outline.where
          const destinationForCardAttributes =
            destinationForCardDescription === 'notes' ? 'body' : 'notes'

          const contents = {
            [destinationForCardDescription]: {
              description: buildDescriptionFromObject(
                { description: description.description },
                options.outline
              ),
            },
            [destinationForCardAttributes]: {
              docTitle: options.outline.plotlineInTitle ? t('Plotline: {title}', { title }) : null,
              description: buildDescriptionFromObject(omit(description, 'description'), true),
            },
          }
          documentContents[id] = contents
        })
      }

      return acc
    },
    {}
  )

  return topLevelBeats
}
