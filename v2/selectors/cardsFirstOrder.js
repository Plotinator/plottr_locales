// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { identity } from 'lodash'
import { createSelector } from 'reselect'

import { richContentIsNonEmpty } from '../helpers/cards'
import { nextId } from '../store/newIds'
import { createDeepEqualSelector } from './createDeepEqualSelector'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const allCardsSelector = createSelector(fullFileStateSelector, ({ cards }) => {
  return cards ?? []
})

const selectId = (_state, id) => id
export const singleCardSelector = createSelector(allCardsSelector, selectId, (cards, propId) =>
  cards.find(({ id }) => id === propId)
)

const templateMetadata = (template) => {
  return {
    ...template,
    attributes: template.attributes.map((attribute) => {
      const { name, type, description, link } = attribute
      return { name, type, description, link }
    }),
  }
}

const cardMetaData = (card) => {
  const {
    id,
    beatId,
    lineId,
    tags,
    color,
    places,
    characters,
    bookId,
    title,
    templates,
    positionWithinLine,
    description,
  } = card

  return {
    id,
    beatId,
    lineId,
    tags,
    color,
    places,
    characters,
    bookId,
    title,
    templates: templates.map(templateMetadata),
    positionWithinLine,
    hasDescription: richContentIsNonEmpty(description),
  }
}

export const allCardMetaDataSelector = createSelector(allCardsSelector, (cards) =>
  cards.map(cardMetaData)
)

const cardIdAndKeyData = (card) => {
  const { id, beatId, lineId, positionWithinLine } = card

  return {
    id,
    beatId,
    lineId,
    positionWithinLine,
  }
}

export const allCardIdAndKeyDataSelector = createSelector(allCardsSelector, (cards) =>
  cards.map(cardIdAndKeyData)
)

export const nextCardIdSelector = createSelector(allCardsSelector, (cards) => nextId(cards))

const cardIdSelector = (_state, cardId) => cardId
export const cardByIdSelector = createSelector(
  cardIdSelector,
  allCardsSelector,
  (cardId, cards) => {
    return cards.find((card) => card.id === cardId)
  }
)

export const cardDescriptionByIdSelector = createSelector(
  cardByIdSelector,
  (card) => card && card.description
)

const _cardMetaDataSelector = createSelector(cardByIdSelector, (card) => {
  if (!card) return null

  return cardMetaData(card)
})

export const cardMetaDataSelector = createDeepEqualSelector(_cardMetaDataSelector, (metadata) => {
  return metadata
})

export const attributeValueSelector = (cardId, attributeName) =>
  createSelector(identity, (state) => cardByIdSelector(state, cardId)[attributeName])

export const templateAttributeValueSelector = (cardId, templateId, attributeName) =>
  createSelector(identity, (state) => {
    const card = cardByIdSelector(state, cardId)
    const templateOnCard = card && card.templates.find(({ id }) => id === templateId)
    const valueInAttributes =
      templateOnCard && templateOnCard.attributes.find(({ name }) => name === attributeName).value
    const valueOnTemplate = templateOnCard && templateOnCard[attributeName]
    return valueInAttributes || valueOnTemplate
  })
