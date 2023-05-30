import { identity } from 'lodash'

import {
  ADD_CARD,
  ADD_CARD_IN_BEAT,
  ADD_LINES_FROM_TEMPLATE,
  ADD_TEMPLATE_TO_CARD,
  EDIT_CARD_DETAILS,
  EDIT_CARDS_ATTRIBUTE,
  REORDER_CARD_TEMPLATE_ATTRIBUTES,
} from '../../constants/ActionTypes'
import { card as defaultCard } from '../../store/initialState'
import cardsReducerWithoutRepairers from '../cards'
import { isEqual, uniq } from 'lodash'
import selectors from '../../selectors'

const { allCardsSelector } = selectors(identity)

const cardsReducer = cardsReducerWithoutRepairers({
  normalizeRCEContent: (x) => x,
})

// Only these functions should change if we change the structure of
// the state object.
const mountToState = (cards) => ({ cards })
const cardInState = ({ cards }, card) => cards.find((x) => isEqual(x, card))
const cardIdInState = ({ cards }, cardId) => cards.find(({ id }) => id === cardId)

// Test fixtures
const emptyState = cardsReducer(undefined, { type: 'blarg' })
const oneCardState = cardsReducer(undefined, { type: ADD_CARD, card: defaultCard })
const card1 = { ...defaultCard, id: 1 }
const card2 = { ...defaultCard, id: 2 }
const card3 = { ...defaultCard, id: 3 }
const card4 = { ...defaultCard, id: 4 }
const fourCardState = [card1, card2, card3, card4]

const cardtemplate1 = {
  id: 'sc1',
  type: 'scenes',
  name: 'Three Story Scene 1',
  description: 'Based on the book Three Story Method by J. Thorn',
  link: 'https://thecareerauthor.com/threestorymethod/',
  version: '2022.7.20',
  attributes: [
    {
      name: 'Conflict',
      type: 'text',
      description: 'What is the central conflict of the scene?',
    },
    {
      name: 'Choice',
      type: 'text',
      description: "What choice do the characters make to deal with the scene's conflict?",
    },
    {
      name: 'Consequence',
      type: 'text',
      description:
        'What is the consequence of the choice? Use the consequence as a hook to the next scene',
    },
  ],
}

const cardtemplate2 = {
  id: 'sc2',
  type: 'scenes',
  name: 'Three Story Scene 2',
  description: 'Based on the book Three Story Method by J. Thorn',
  link: 'https://thecareerauthor.com/threestorymethod/',
  version: '2022.7.20',
  attributes: [
    {
      name: 'Conflict',
      type: 'text',
      description: 'What is the central conflict of the scene?',
    },
    {
      name: 'Choice',
      type: 'text',
      description: "What choice do the characters make to deal with the scene's conflict?",
    },
    {
      name: 'Consequence',
      type: 'text',
      description:
        'What is the consequence of the choice? Use the consequence as a hook to the next scene',
    },
  ],
}

const cardtemplate3 = {
  id: 'sc3',
  type: 'scenes',
  name: 'Three Story Scene 3',
  description: 'Based on the book Three Story Method by J. Thorn',
  link: 'https://thecareerauthor.com/threestorymethod/',
  version: '2022.7.20',
  attributes: [
    {
      name: 'Conflict',
      type: 'text',
      description: 'What is the central conflict of the scene?',
    },
    {
      name: 'Choice',
      type: 'text',
      description: "What choice do the characters make to deal with the scene's conflict?",
    },
    {
      name: 'Consequence',
      type: 'text',
      description:
        'What is the consequence of the choice? Use the consequence as a hook to the next scene',
    },
  ],
}

// cardsReducer(undefined, {
//   type: ADD_LINES_FROM_TEMPLATE,
//   templateData: {
//     cards: [card1, card2, card3, card4],
//   },
// })
const cardWithStrength = { ...defaultCard, strength: 'You bet!' }
const strengthState = cardsReducer(undefined, { type: ADD_CARD, card: cardWithStrength })

describe('cardsReducer', () => {
  it('should produce a valid state object when supplied with an unknown event type', () => {
    expect(cardsReducer(emptyState, { type: 'herpa' })).toEqual(emptyState)
  })
  it('should produce a valid state when given no state object', () => {
    expect(cardsReducer(null, { type: 'derp' })).toEqual(emptyState)
  })
  describe('add card', () => {
    it('should add the default card if it is given a null card', () => {
      expect(
        cardInState(
          mountToState(cardsReducer(emptyState, { type: ADD_CARD, card: {} })),
          defaultCard
        )
      ).toEqual(defaultCard)
    })
    it('should produce a two card state from a one card state', () => {
      expect(
        allCardsSelector(mountToState(cardsReducer(oneCardState, { type: ADD_CARD, card: {} })))
      ).toHaveLength(2)
    })
    it('should produce cards with unique ids', () => {
      expect(
        uniq(
          allCardsSelector(
            mountToState(cardsReducer(oneCardState, { type: ADD_CARD, card: {} }))
          ).map(({ id }) => id)
        )
      ).toHaveLength(2)
    })
    it('should produce a one card state from an undefined state object', () => {
      expect(
        allCardsSelector(mountToState(cardsReducer(undefined, { type: ADD_CARD, card: {} })))
      ).toHaveLength(1)
    })
  })
  describe('add card in beat', () => {
    it('should add a card at position zero to an empty beat', () => {
      expect(
        cardInState(
          mountToState(cardsReducer(emptyState, { type: ADD_CARD_IN_BEAT, card: defaultCard })),
          defaultCard
        )
      ).toEqual(defaultCard)
    })
    describe('given a single card state', () => {
      describe('and given the re order ids [null, 1]', () => {
        it('should add a new card at positionWithinLine = 0', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(oneCardState, {
                  type: ADD_CARD_IN_BEAT,
                  card: defaultCard,
                  reorderIds: [null, 1],
                })
              )
            ).map(({ id, positionWithinLine }) => [id, positionWithinLine])
          ).toEqual([
            [2, 0],
            [1, 1],
          ])
        })
      })
      describe('and given the re order ids [1, null]', () => {
        it('should add a new card at positionWithinLine = 1', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(oneCardState, {
                  type: ADD_CARD_IN_BEAT,
                  card: defaultCard,
                  reorderIds: [1, null],
                })
              )
            ).map(({ id, positionWithinLine }) => [id, positionWithinLine])
          ).toEqual([
            [2, 1],
            [1, 0],
          ])
        })
      })
    })
  })
  describe('add lines from template', () => {
    it('should add all given cards to the state with correct ids', () => {
      const result = allCardsSelector(
        mountToState(
          cardsReducer(emptyState, {
            type: ADD_LINES_FROM_TEMPLATE,
            templateData: {
              cards: [card1, card2, card3, card4],
            },
            nextCardId: 5,
            nextLineId: 2,
            cardToBeatIdMap: { 1: 10, 2: 11, 3: 12, 4: 13 },
          })
        )
      )
      expect(result.length).toEqual(4)
      expect(result[0].id).toEqual(6)
      expect(result[0].beatId).toEqual(10)
      expect(result[0].lineId).toEqual(2)
    })
  })
  describe('edit card details', () => {
    describe('given the default state', () => {
      it('should produce the default state', () => {
        expect(
          cardsReducer(emptyState, {
            type: EDIT_CARD_DETAILS,
            id: 0,
            attributes: {
              best: true,
            },
          })
        ).toEqual(emptyState)
      })
    })
    describe('given a one card state', () => {
      describe('and an id for a different card', () => {
        it('should produce the same one card state', () => {
          expect(
            cardsReducer(oneCardState, {
              type: EDIT_CARD_DETAILS,
              id: 10,
              attributes: {
                best: true,
              },
            })
          ).toEqual(oneCardState)
        })
      })
      describe('and the id of that card', () => {
        it('should edit that card', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(oneCardState, {
                  type: EDIT_CARD_DETAILS,
                  id: 1,
                  attributes: {
                    best: true,
                  },
                })
              )
            )[0]
          ).toEqual({ ...defaultCard, best: true })
        })
      })
    })
    describe('given a four card state', () => {
      describe('and the id of card2', () => {
        it('should only edit card2', () => {
          expect(
            cardIdInState(
              mountToState(
                cardsReducer(fourCardState, {
                  type: EDIT_CARD_DETAILS,
                  id: 2,
                  attributes: {
                    best: true,
                  },
                })
              ),
              2
            )
          ).toEqual({ ...card2, best: true })
        })
      })
    })
  })
  // TODO: many tests to add.  Adding ones for recent features for
  // expedience.
  describe('edit scenes attributes', () => {
    describe('given an attribute to change', () => {
      const oldAttribute = { name: 'strength', type: 'text' }
      const newAttribute = { name: 'do-you-even-lift?', type: 'text' }
      describe('and the empty state', () => {
        it('should produce the empty state', () => {
          expect(
            cardsReducer(emptyState, {
              type: EDIT_CARDS_ATTRIBUTE,
              oldAttribute,
              newAttribute,
            })
          ).toEqual(emptyState)
        })
      })
      describe('and a four card state where no card contains the attribute', () => {
        it('should add the attribute to those cards', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(fourCardState, {
                  type: EDIT_CARDS_ATTRIBUTE,
                  oldAttribute,
                  newAttribute,
                })
              )
            )
          ).toEqual(fourCardState.map((card) => ({ ...card, ...{ [newAttribute.name]: '' } })))
        })
      })
      describe('and a state where a card has the original attribute', () => {
        it('should change the name of the attribute', () => {
          expect(
            cardIdInState(
              mountToState(
                cardsReducer(strengthState, {
                  type: EDIT_CARDS_ATTRIBUTE,
                  oldAttribute,
                  newAttribute,
                })
              ),
              1
            )
          ).toEqual({
            ...cardWithStrength,
            strength: undefined,
            'do-you-even-lift?': 'You bet!',
          })
        })
      })
    })
  })
})

describe('reorderCardTemplateAttribute', () => {
  describe('given a four templates card state', () => {
    const template1OldPosition = 0 //cardtemplate1
    const template1NewPosition = 2 //cardtemplate1
    const template2OldPosition = 0 //cardtemplate2
    const template2NewPosition = 1 //cardtemplate2
    const template1SecondReorderOldPosition = 2 //cardtemplate1
    const template1SecondReorderNewPosition = 1 //cardtemplate1

    const withTemplate1 = allCardsSelector(
      mountToState(
        cardsReducer(oneCardState, {
          type: ADD_TEMPLATE_TO_CARD,
          templateData: cardtemplate1,
          id: 1,
        })
      )
    )
    const withTemplate2 = allCardsSelector(
      mountToState(
        cardsReducer(withTemplate1, {
          type: ADD_TEMPLATE_TO_CARD,
          templateData: cardtemplate2,
          id: 1,
        })
      )
    )
    const cardWithTemplates = allCardsSelector(
      mountToState(
        cardsReducer(withTemplate2, {
          type: ADD_TEMPLATE_TO_CARD,
          templateData: cardtemplate3,
          id: 1,
        })
      )
    )

    const cardAfterFirstReorder = cardIdInState(
      mountToState(
        cardsReducer(cardWithTemplates, {
          type: REORDER_CARD_TEMPLATE_ATTRIBUTES,
          originalPosition: template1OldPosition,
          destination: template1NewPosition,
          id: 1,
        })
      ),
      1
    )
    const allCardsAfterReorder = allCardsSelector(
      mountToState(
        cardsReducer(cardWithTemplates, {
          type: REORDER_CARD_TEMPLATE_ATTRIBUTES,
          originalPosition: template1OldPosition,
          destination: template1NewPosition,
          id: 1,
        })
      )
    )

    it('should be able to move the tab to the target position', () => {
      cardAfterFirstReorder.templates.forEach((template, idx) => {
        if (template.id === cardtemplate1.id) {
          expect(idx).toEqual(template1NewPosition)
        } else {
          expect(template.id).not.toEqual(cardtemplate1.id)
        }
      })
    })

    it('should be able to move or shuffle card templates attribute', () => {
      const newCardState = cardIdInState(
        mountToState(
          cardsReducer(allCardsAfterReorder, {
            type: REORDER_CARD_TEMPLATE_ATTRIBUTES,
            originalPosition: template2OldPosition,
            destination: template2NewPosition,
            id: 1,
          })
        ),
        1
      )
      const cardsAfterSecondReorder = allCardsSelector(
        mountToState(
          cardsReducer(allCardsAfterReorder, {
            type: REORDER_CARD_TEMPLATE_ATTRIBUTES,
            originalPosition: template2OldPosition,
            destination: template2NewPosition,
            id: 1,
          })
        )
      )

      newCardState.templates.forEach((template, idx) => {
        if (template.id === cardtemplate2.id) {
          expect(idx).toEqual(template2NewPosition)
        } else {
          expect(template.id).not.toEqual(cardtemplate2.id)
        }
      })

      const cardStateAfterThirdShuffle = cardIdInState(
        mountToState(
          cardsReducer(cardsAfterSecondReorder, {
            type: REORDER_CARD_TEMPLATE_ATTRIBUTES,
            originalPosition: template1SecondReorderOldPosition,
            destination: template1SecondReorderNewPosition,
            id: 1,
          })
        ),
        1
      )
      cardStateAfterThirdShuffle.templates.forEach((template, idx) => {
        if (template.id === cardtemplate1.id) {
          expect(idx).toEqual(template1SecondReorderNewPosition)
        } else {
          expect(template.id).not.toEqual(cardtemplate1.id)
        }
      })
    })
  })
})
