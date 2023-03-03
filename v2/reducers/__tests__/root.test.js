import { omit, difference } from 'lodash'
import fc from 'fast-check'

import {
  zelda,
  multi_tier_zelda,
  zelda_2_levels_in_book_7,
  zelda_2_levels_in_books_6_and_7,
} from './fixtures'
import { moveLine } from '../../actions/lines'
import { restructureTimeline } from '../../actions/beats'
import { ADD_LINES_FROM_TEMPLATE } from '../../constants/ActionTypes'
import rootReducerWithoutRepairers from '../root'
import * as tree from '../tree'
import { beatsByPosition } from '../../helpers/beats'
import {
  sortedBeatsForAnotherBookSelector,
  visibleSortedBeatsForTimelineByBookSelector,
  sortedBeatsHierachyLevels,
} from '../../selectors'

const rootReducer = rootReducerWithoutRepairers({
  normalizeRCEContent: (x) => x,
})

describe('rootReducer', () => {
  describe('ADD_LINES_FROM_TEMPLATE', () => {
    const enoughBeats = require('./fixtures/enough_beats.json')
    const notEnoughBeats = require('./fixtures/not_enough_beats.json')
    const templateData = require('./fixtures/7_point_template.json')
    const action = { type: ADD_LINES_FROM_TEMPLATE, templateData }
    describe('enough beats', () => {
      const result = rootReducer(enoughBeats, action)
      const beatsAfter = beatsByPosition(() => true)(result.beats['1']).map(({ id }) => id)
      it('doesnt add more beats', () => {
        const beatsBefore = beatsByPosition(() => true)(enoughBeats.beats['1']).map(({ id }) => id)
        expect(beatsBefore.length).toEqual(beatsAfter.length)
      })
      it('adds one line', () => {
        expect(result.lines.length).toEqual(enoughBeats.lines.length + 1)
      })
      it('gives cards the right ids', () => {
        // choose a random postion: 2
        // there should be a card there
        const beatId = beatsAfter[2]
        const card = result.cards.find((c) => c.beatId == beatId)
        expect(card).not.toEqual(undefined)
        expect(card.title).toEqual('Pinch 1')
      })
    })
    describe('not enough beats', () => {
      const result = rootReducer(notEnoughBeats, action)
      const beatsAfter = beatsByPosition(() => true)(result.beats['1']).map(({ id }) => id)
      it('adds more beats', () => {
        const beatsBefore = beatsByPosition(() => true)(notEnoughBeats.beats['1']).map(
          ({ id }) => id
        )
        expect(beatsBefore.length).not.toEqual(beatsAfter.length)
      })
      it('adds one line', () => {
        expect(result.lines.length).toEqual(notEnoughBeats.lines.length + 1)
      })
      it('gives cards the right ids', () => {
        // choose a random postion (after the last beat in the file): 2
        // there should be a card there
        const beatId = beatsAfter[2]
        const card = result.cards.find((c) => c.beatId == beatId)
        expect(card).not.toEqual(undefined)
        expect(card.title).toEqual('Pinch 1')
      })
    })
  })
  describe('MOVE_LINE', () => {
    describe('given a line id that is not in the state', () => {
      it('should leave the state untouched', () => {
        expect(rootReducer(zelda, moveLine(1234, 1))).toBe(zelda)
      })
    })
    describe('given a source and destination book id that are the same', () => {
      it('should leave the state untouched', () => {
        expect(rootReducer(zelda, moveLine(16, 7))).toBe(zelda)
      })
    })
    describe('given a source book with more levels than the target book', () => {
      it('should leave the state untouched', () => {
        expect(rootReducer(zelda_2_levels_in_book_7, moveLine(16, 1))).toBe(
          zelda_2_levels_in_book_7
        )
      })
    })
    describe('given a source book with fewer levels than the target book', () => {
      it('should leave the state untouched', () => {
        expect(rootReducer(zelda_2_levels_in_book_7, moveLine(9, 7))).toBe(zelda_2_levels_in_book_7)
      })
    })
    describe('given a source timeline with fewer beats than the destination', () => {
      const newState = rootReducer(zelda, moveLine(1, 7))
      it('should leave one line behind for the source book', () => {
        expect(newState.lines.filter(({ bookId }) => bookId === 1).length).toEqual(1)
      })
      it('should change the book of the line to the destination book', () => {
        expect(newState.lines.find(({ id }) => id === 17).bookId).toEqual(7)
      })
      it('should have three lines for the destination book', () => {
        expect(newState.lines.filter(({ bookId }) => bookId === 7).length).toEqual(3)
      })
      it('should move the plotline without creating more beats', () => {
        expect(newState.beats).toBe(zelda.beats)
      })
      it('should move the cards to their corresponding beats', () => {
        const cardsOnOriginalLine = zelda.cards.filter(({ lineId }) => lineId === 1)
        const cardsOnNewline = newState.cards.filter(({ lineId }) => lineId === 1)
        const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(newState, 7).map(
          ({ id }) => {
            return id
          }
        )
        for (let i = 0; i < cardsOnNewline.length; ++i) {
          expect(beatsInDestinationBook.indexOf(cardsOnNewline[i].beatId)).toBeGreaterThan(-1)
        }
        expect(cardsOnOriginalLine.map(({ id }) => id)).toEqual(
          expect.arrayContaining(cardsOnNewline.map(({ id }) => id))
        )
      })
      describe('and a destination of "series"', () => {
        const newState = rootReducer(zelda, moveLine(1, 'series'))
        it('should leave one line behind for the source book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 1).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newState.lines.find(({ id }) => id === 17).bookId).toEqual('series')
        })
        it('should have two lines for the destination book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 'series').length).toEqual(2)
        })
        it('should move the plotline without creating more beats', () => {
          expect(newState.beats).toBe(zelda.beats)
        })
        it('should move the cards to their corresponding beats', () => {
          const cardsOnOriginalLine = zelda.cards.filter(({ lineId }) => lineId === 1)
          const cardsOnNewline = newState.cards.filter(({ lineId }) => lineId === 1)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(newState, 'series').map(
            ({ id }) => {
              return id
            }
          )
          for (let i = 0; i < cardsOnNewline.length; ++i) {
            expect(beatsInDestinationBook.indexOf(cardsOnNewline[i].beatId)).toBeGreaterThan(-1)
          }
          expect(cardsOnOriginalLine.map(({ id }) => id)).toEqual(
            expect.arrayContaining(cardsOnNewline.map(({ id }) => id))
          )
        })
      })
    })
    describe('given a source timeline with more beats than the destination', () => {
      describe('the last card on the source timeline is positioned at an index lower than the beats in the destination book', () => {
        const newState = rootReducer(zelda, moveLine(16, 9))
        it('should leave one line behind for the source book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 7).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newState.lines.find(({ id }) => id === 17).bookId).toEqual(9)
        })
        it('should have two lines for the destination book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 9).length).toEqual(2)
        })
        it('should move the plotline without creating more beats', () => {
          expect(newState.beats).toBe(zelda.beats)
        })
        it('should move the cards to their corresponding beats', () => {
          const cardsOnOriginalLine = zelda.cards.filter(({ lineId }) => lineId === 16)
          const cardsOnNewline = newState.cards.filter(({ lineId }) => lineId === 17)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(newState, 9).map(
            ({ id }) => {
              return id
            }
          )
          for (let i = 0; i < cardsOnNewline.length; ++i) {
            expect(beatsInDestinationBook.indexOf(cardsOnNewline[i].beatId)).toBeGreaterThan(-1)
          }
          expect(cardsOnOriginalLine.map(({ title }) => title)).toEqual(
            expect.arrayContaining(cardsOnNewline.map(({ title }) => title))
          )
        })
      })
      describe('the last card on the source timeline is positioned at an index greater than the beats in the destination book', () => {
        const newState = rootReducer(zelda, moveLine(16, 1))
        it('should leave one line behind for the source book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 7).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newState.lines.find(({ id }) => id === 17).bookId).toEqual(1)
        })
        it('should have three lines for the destination book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 1).length).toEqual(3)
        })
        it('should create four more beats to accomodate the cards from the source timeline', () => {
          expect(beatsByPosition(() => true)(newState.beats[1]).length).toBe(7)
        })
        it('should move the cards to their corresponding beats', () => {
          const cardsOnOriginalLine = zelda.cards.filter(({ lineId }) => lineId === 16)
          const cardsOnNewline = newState.cards.filter(({ lineId }) => lineId === 17)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(newState, 1).map(
            ({ id }) => {
              return id
            }
          )
          for (let i = 0; i < cardsOnNewline.length; ++i) {
            expect(beatsInDestinationBook.indexOf(cardsOnNewline[i].beatId)).toBeGreaterThan(-1)
          }
          expect(cardsOnOriginalLine.map(({ title }) => title)).toEqual(
            expect.arrayContaining(cardsOnNewline.map(({ title }) => title))
          )
        })
      })
    })
    describe('given a source timeline with a multi-level hierarchy', () => {
      describe('and a destination with the same number of levels', () => {
        const newState = rootReducer(zelda_2_levels_in_books_6_and_7, moveLine(16, 6))
        it('should leave behind one line for the source book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 7).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newState.lines.find(({ id }) => id === 17).bookId).toEqual(6)
        })
        it('should have two lines for the destination book', () => {
          expect(newState.lines.filter(({ bookId }) => bookId === 1).length).toEqual(2)
        })
        it('should create scenes to accomodate the source', () => {
          expect(beatsByPosition(() => true)(newState.beats[6]).length).toBe(10)
        })
        it('should move the cards to their corresponding beats', () => {
          const cardsOnOriginalLine = zelda_2_levels_in_books_6_and_7.cards.filter(
            ({ lineId }) => lineId === 16
          )
          const cardsOnNewline = newState.cards.filter(({ lineId }) => lineId === 17)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(newState, 6).map(
            ({ id }) => {
              return id
            }
          )
          for (let i = 0; i < cardsOnNewline.length; ++i) {
            expect(beatsInDestinationBook.indexOf(cardsOnNewline[i].beatId)).toBeGreaterThan(-1)
          }
          expect(cardsOnOriginalLine.map(({ title }) => title)).toEqual(
            expect.arrayContaining(cardsOnNewline.map(({ title }) => title))
          )
        })
      })
    })
  })
  describe('RESTRUCTURE_TIMELINE', () => {
    describe('given the empty list of beats and hierarchies', () => {
      it('should produce the empty tree', () => {
        const newState = rootReducer(multi_tier_zelda, restructureTimeline([], []))
        const beats = newState.beats[newState.ui.currentTimeline]
        expect(beats).toEqual(tree.newTree('id'))
      })
    })
    describe('given the same beats and hierarchy levels as for the current book', () => {
      it('should produce the same beat tree', () => {
        const originalBeatTree = multi_tier_zelda.beats[multi_tier_zelda.ui.currentTimeline]
        const beatHierarchyLevels = sortedBeatsHierachyLevels(multi_tier_zelda)
        const originalBeats = visibleSortedBeatsForTimelineByBookSelector(multi_tier_zelda)
        const newState = rootReducer(
          multi_tier_zelda,
          restructureTimeline(originalBeats, beatHierarchyLevels)
        )
        const beats = newState.beats[newState.ui.currentTimeline]
        expect(beats.heap).toEqual(originalBeatTree.heap)
        for (const key of Object.keys(originalBeatTree.children)) {
          expect(beats.children[key]).toEqual(
            expect.arrayContaining(originalBeatTree.children[key])
          )
          expect(beats.children[key].length).toEqual(originalBeatTree.children[key].length)
        }
        expect(beats.index).toEqual(originalBeatTree.index)
      })
    })
    describe('given arbitrary re-orderings of beats', () => {
      it('should produce valid beat trees', () => {
        const beatHierarchyLevels = sortedBeatsHierachyLevels(multi_tier_zelda)
        const beatArray = visibleSortedBeatsForTimelineByBookSelector(multi_tier_zelda)
        const indices = beatArray.map((_beat, index) => {
          return index
        })

        fc.assert(
          fc.property(
            fc.shuffledSubarray(indices, {
              minLength: indices.length,
              maxLength: indices.length,
            }),
            (newOrdering) => {
              // Two properties:
              //
              //  1. It should never skip a level going lower.
              //
              //  2. It should contain all of the original beats in
              //     the new order.
              const newBeatHierarchyLevels = newOrdering.map((index) => {
                return beatHierarchyLevels[index]
              })
              const newBeatArray = newOrdering.map((index) => {
                return beatArray[index]
              })

              // Exercise the root reducer
              const newState = rootReducer(
                multi_tier_zelda,
                restructureTimeline(newBeatArray, newBeatHierarchyLevels)
              )
              const finalBeatHierarchyLevels = sortedBeatsHierachyLevels(newState)
              const finalBeatArray = visibleSortedBeatsForTimelineByBookSelector(newState)

              // Property 1.
              let previousLevel = 0
              for (const level of finalBeatHierarchyLevels) {
                if (previousLevel < level.level) {
                  expect(level.level - previousLevel).toBe(1)
                } else if (previousLevel >= level.level) {
                  expect(level.level).toBeGreaterThanOrEqual(0)
                }
                previousLevel = level.level
              }

              // Property 2.
              const newBeatIds = newBeatArray.map((beat) => {
                return beat.id
              })
              const finalIds = finalBeatArray.map((beat) => {
                return beat.id
              })
              const finalBeatIds = difference(finalIds, difference(finalIds, newBeatIds))
              expect(newBeatIds).toEqual(finalBeatIds)
            }
          )
        )
      })
    })
  })
})
