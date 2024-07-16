import { difference, omit, range, zip, identity, uniq } from 'lodash'
import fc from 'fast-check'

import {
  zelda as user_zelda,
  multi_tier_zelda as user_multi_tier_zelda,
  zelda_2_levels_in_book_7 as user_zelda_2_levels_in_book_7,
  zelda_2_levels_in_books_6_and_7 as user_zelda_2_levels_in_books_6_and_7,
  eight_sequences_template as user_eight_sequences_template,
} from './fixtures'
import { moveLine } from '../../actions/lines'
import { restructureTimeline } from '../../actions/beats'
import { addCard, reorderCardsWithinLine } from '../../actions/cards'
import { addBookFromTemplate } from '../../actions/books'
import { ADD_LINES_FROM_TEMPLATE } from '../../constants/ActionTypes'
import rootReducerWithoutRepairers from '../root'
import * as tree from '../tree'
import { beatsByPosition } from '../../helpers/beats'
import selectors from '../../selectors'
import { lineFromTemplate } from '../../template'

const {
  sortedBeatsForAnotherBookSelector,
  visibleSortedBeatsForTimelineByBookSelector,
  sortedBeatsHierachyLevels,
  sortedHierarchyLevels,
  sortedBeatsByBookSelector,
  allCardsSelector,
  allLinesSelector,
  allBeatsSelector,
  currentTimelineSelector,
  allBooksSelector,
} = selectors(identity)

const zelda = { user: user_zelda }
const multi_tier_zelda = { user: user_multi_tier_zelda }
const zelda_2_levels_in_book_7 = { user: user_zelda_2_levels_in_book_7 }
const zelda_2_levels_in_books_6_and_7 = { user: user_zelda_2_levels_in_books_6_and_7 }
const eight_sequences_template = user_eight_sequences_template

const rootReducer = rootReducerWithoutRepairers({
  normalizeRCEContent: (x) => x,
})

describe('rootReducer', () => {
  describe('ADD_LINES_FROM_TEMPLATE', () => {
    // @ts-ignore
    const enoughBeats = { user: require('./fixtures/enough_beats.json') }
    // @ts-ignore
    const notEnoughBeats = { user: require('./fixtures/not_enough_beats.json') }
    // @ts-ignore
    const templateData = require('./fixtures/7_point_template.json')
    const action = { type: ADD_LINES_FROM_TEMPLATE, templateData }
    describe('enough beats', () => {
      const result = rootReducer(enoughBeats, action)
      const resultBeats = allBeatsSelector(result)
      const beatsAfter = beatsByPosition(() => true)(resultBeats['1']).map(({ id }) => id)
      it('doesnt add more beats', () => {
        // @ts-ignore
        const enoughBeatsBeats = allBeatsSelector(enoughBeats)
        const beatsBefore = beatsByPosition(() => true)(enoughBeatsBeats['1']).map(({ id }) => id)
        expect(beatsBefore.length).toEqual(beatsAfter.length)
      })
      it('adds one line', () => {
        const resultLines = allLinesSelector(result)
        // @ts-ignore
        const enoughBeatsLines = allLinesSelector(enoughBeats)
        expect(resultLines.length).toEqual(enoughBeatsLines.length + 1)
      })
      it('gives cards the right ids', () => {
        // choose a random postion: 2
        // there should be a card there
        const beatId = beatsAfter[2]
        const resultCards = allCardsSelector(result)
        const card = resultCards.find((c) => c.beatId == beatId)
        expect(card).not.toEqual(undefined)
        expect(card.title).toEqual('Pinch 1')
      })
    })
    describe('not enough beats', () => {
      const result = rootReducer(notEnoughBeats, action)
      const resultBeats = allBeatsSelector(result)
      const beatsAfter = beatsByPosition(() => true)(resultBeats['1']).map(({ id }) => id)
      it('adds more beats', () => {
        // @ts-ignore
        const notEnoughBeatsBeats = allBeatsSelector(notEnoughBeats)
        const beatsBefore = beatsByPosition(() => true)(notEnoughBeatsBeats['1']).map(
          ({ id }) => id
        )
        expect(beatsBefore.length).not.toEqual(beatsAfter.length)
      })
      it('adds one line', () => {
        const resultLines = allLinesSelector(result)
        // @ts-ignore
        const notEnoughBeatsLines = allLinesSelector(notEnoughBeats)
        expect(resultLines.length).toEqual(notEnoughBeatsLines.length + 1)
      })
      it('gives cards the right ids', () => {
        // choose a random postion (after the last beat in the file): 2
        // there should be a card there
        const beatId = beatsAfter[2]
        const resultCards = allCardsSelector(result)
        const card = resultCards.find((c) => c.beatId == beatId)
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
      const newLines = allLinesSelector(newState)
      it('should leave one line behind for the source book', () => {
        expect(newLines.filter(({ bookId }) => bookId === 1).length).toEqual(1)
      })
      it('should change the book of the line to the destination book', () => {
        expect(newLines.find(({ id }) => id === 17).bookId).toEqual(7)
      })
      it('should have three lines for the destination book', () => {
        expect(newLines.filter(({ bookId }) => bookId === 7).length).toEqual(3)
      })
      const newBeats = allBeatsSelector(newState)
      // @ts-ignore
      const originalBeats = allBeatsSelector(zelda)
      it('should move the plotline without creating more beats', () => {
        expect(newBeats).toBe(originalBeats)
      })
      it('should move the cards to their corresponding beats', () => {
        // @ts-ignore
        const oldCards = allCardsSelector(zelda)
        const cardsOnOriginalLine = oldCards.filter(({ lineId }) => lineId === 1)
        const newCards = allCardsSelector(newState)
        const cardsOnNewline = newCards.filter(({ lineId }) => lineId === 1)
        const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(
          newState,
          // @ts-ignore
          7
        ).map(({ id }) => {
          return id
        })
        for (let i = 0; i < cardsOnNewline.length; ++i) {
          expect(beatsInDestinationBook.indexOf(cardsOnNewline[i].beatId)).toBeGreaterThan(-1)
        }
        expect(cardsOnOriginalLine.map(({ id }) => id)).toEqual(
          expect.arrayContaining(cardsOnNewline.map(({ id }) => id))
        )
      })
      describe('and a destination of "series"', () => {
        const newState = rootReducer(zelda, moveLine(1, 'series'))
        const newStateLines = allLinesSelector(newState)
        const newStateBeats = allBeatsSelector(newState)
        it('should leave one line behind for the source book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 1).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newStateLines.find(({ id }) => id === 17).bookId).toEqual('series')
        })
        it('should have two lines for the destination book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 'series').length).toEqual(2)
        })
        it('should move the plotline without creating more beats', () => {
          // @ts-ignore
          const zeldaBeats = allBeatsSelector(zelda)
          expect(newStateBeats).toBe(zeldaBeats)
        })
        it('should move the cards to their corresponding beats', () => {
          // @ts-ignore
          const zeldaCards = allCardsSelector(zelda)
          const cardsOnOriginalLine = zeldaCards.filter(({ lineId }) => lineId === 1)
          const newStateCards = allCardsSelector(newState)
          const cardsOnNewline = newStateCards.filter(({ lineId }) => lineId === 1)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(
            newState,
            // @ts-ignore
            'series'
          ).map(({ id }) => {
            return id
          })
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
        const newStateLines = allLinesSelector(newState)
        const newStateBeats = allBeatsSelector(newState)
        it('should leave one line behind for the source book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 7).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newStateLines.find(({ id }) => id === 17).bookId).toEqual(9)
        })
        it('should have two lines for the destination book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 9).length).toEqual(2)
        })
        it('should move the plotline without creating more beats', () => {
          // @ts-ignore
          const zeldaBeats = allBeatsSelector(zelda)
          expect(newStateBeats).toBe(zeldaBeats)
        })
        it('should move the cards to their corresponding beats', () => {
          // @ts-ignore
          const zeldaCards = allCardsSelector(zelda)
          const cardsOnOriginalLine = zeldaCards.filter(({ lineId }) => lineId === 16)
          const newStateCards = allCardsSelector(newState)
          const cardsOnNewline = newStateCards.filter(({ lineId }) => lineId === 17)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(
            newState,
            // @ts-ignore
            9
          ).map(({ id }) => {
            return id
          })
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
        const newStateLines = allLinesSelector(newState)
        const newStateBeats = allBeatsSelector(newState)
        it('should leave one line behind for the source book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 7).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newStateLines.find(({ id }) => id === 17).bookId).toEqual(1)
        })
        it('should have three lines for the destination book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 1).length).toEqual(3)
        })
        it('should create four more beats to accomodate the cards from the source timeline', () => {
          expect(beatsByPosition(() => true)(newStateBeats[1]).length).toBe(7)
        })
        it('should move the cards to their corresponding beats', () => {
          // @ts-ignore
          const zeldaCards = allCardsSelector(zelda)
          const cardsOnOriginalLine = zeldaCards.filter(({ lineId }) => lineId === 16)
          const newStateCards = allCardsSelector(newState)
          const cardsOnNewline = newStateCards.filter(({ lineId }) => lineId === 17)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(
            newState,
            // @ts-ignore
            1
          ).map(({ id }) => {
            return id
          })
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
        const newStateLines = allLinesSelector(newState)
        const newStateBeats = allBeatsSelector(newState)
        it('should leave behind one line for the source book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 7).length).toEqual(1)
        })
        it('should change the book of the line to the destination book', () => {
          expect(newStateLines.find(({ id }) => id === 17).bookId).toEqual(6)
        })
        it('should have two lines for the destination book', () => {
          expect(newStateLines.filter(({ bookId }) => bookId === 1).length).toEqual(2)
        })
        it('should create scenes to accomodate the source', () => {
          expect(beatsByPosition(() => true)(newStateBeats[6]).length).toBe(10)
        })
        it('should move the cards to their corresponding beats', () => {
          const zelda_2_levels_in_books_6_and_7_cards = allCardsSelector(
            // @ts-ignore
            zelda_2_levels_in_books_6_and_7
          )
          const cardsOnOriginalLine = zelda_2_levels_in_books_6_and_7_cards.filter(
            ({ lineId }) => lineId === 16
          )
          const newStateCards = allCardsSelector(newState)
          const cardsOnNewline = newStateCards.filter(({ lineId }) => lineId === 17)
          const beatsInDestinationBook = sortedBeatsForAnotherBookSelector(
            newState,
            // @ts-ignore
            6
          ).map(({ id }) => {
            return id
          })
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
    const withoutPosition = (x) => omit(x, 'position')
    const withoutCardDetailsWeDontCareAbout = (x) => {
      return omit(x, 'beatId')
    }
    describe('given the timeline view is not stacked', () => {
      describe('given the empty list of beats and hierarchies', () => {
        it('should produce the empty tree', () => {
          const newState = rootReducer(multi_tier_zelda, restructureTimeline([], []))
          const newStateBeats = allBeatsSelector(newState)
          const newStateCurrentTimeline = currentTimelineSelector(newState)
          const beats = newStateBeats[newStateCurrentTimeline]
          expect(beats).toEqual(tree.newTree('id'))
        })
      })
      describe('given the same beats and hierarchy levels as for the current book', () => {
        it('should produce the same beat tree', () => {
          // @ts-ignore
          const timeline = currentTimelineSelector(multi_tier_zelda)
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const originalBeatTree = multi_tier_zelda_beats[timeline]
          const beatHierarchyLevels = sortedBeatsHierachyLevels(multi_tier_zelda).map(
            (hierarchyLevel) => {
              return hierarchyLevel.level
            }
          )
          // @ts-ignore
          const originalBeats = visibleSortedBeatsForTimelineByBookSelector(multi_tier_zelda)
          const newState = rootReducer(
            multi_tier_zelda,
            restructureTimeline(originalBeats, beatHierarchyLevels)
          )
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const beats = newStateBeats[newCurrentTimeline]
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
      describe('given a collection of new levels', () => {
        describe('where all the levels are "act"', () => {
          it('should produce a valid tree', () => {
            // @ts-ignore
            const originalBeats = visibleSortedBeatsForTimelineByBookSelector(multi_tier_zelda)
            const newState = rootReducer(
              multi_tier_zelda,
              restructureTimeline(originalBeats, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            )
            const newStateBeats = allBeatsSelector(newState)
            const newCurrentTimeline = currentTimelineSelector(newState)
            const beats = newStateBeats[newCurrentTimeline]
            const finalBeatHierarchyLevels = Object.values(newStateBeats['7'].index).map((beat) => {
              return tree.depth(newStateBeats['7'], beat.id)
            })
            // @ts-ignore
            const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
            const oldBeatTree = multi_tier_zelda_beats['7']
            expect(finalBeatHierarchyLevels).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            expect(beats.heap).toEqual(
              Object.keys(oldBeatTree.heap).reduce((acc, nextKey) => {
                return {
                  ...acc,
                  [nextKey]: null,
                }
              }, {})
            )
            expect(Object.values(beats.index).map(withoutPosition)).toEqual(
              Object.values(multi_tier_zelda_beats['7'].index).map(withoutPosition)
            )
            expect(omit(beats.children, 'null')).toEqual(
              Object.keys(omit(oldBeatTree.children, 'null')).reduce((acc, nextKey) => {
                if (nextKey === 'null') {
                  return acc
                } else {
                  return {
                    ...acc,
                    [nextKey]: [],
                  }
                }
              }, {})
            )
            expect(beats.children['null']).toEqual(
              expect.arrayContaining([
                ...Object.keys(omit(beats.children, 'null')).map((x) => parseInt(x)),
              ])
            )
          })
        })
      })
      describe('given arbitrary re-orderings of beats', () => {
        it('should produce valid beat trees', () => {
          const beatHierarchyLevels = sortedBeatsHierachyLevels(multi_tier_zelda)
          // @ts-ignore
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
                //
                //  3. It shouldn't make the tree deeper.
                const newBeatHierarchyLevels = newOrdering.map((index) => {
                  return beatHierarchyLevels[index].level
                })
                const newBeatArray = newOrdering.map((index) => {
                  return beatArray[index]
                })

                // Exercise the root reducer
                const newState = rootReducer(
                  multi_tier_zelda,
                  restructureTimeline(newBeatArray, newBeatHierarchyLevels)
                )
                const finalBeatArray = visibleSortedBeatsForTimelineByBookSelector(newState)
                const newStateBeats = allBeatsSelector(newState)
                const finalBeatHierarchyLevels = finalBeatArray.map((beat) => {
                  return tree.depth(newStateBeats['7'], beat.id)
                })

                // Property 1.
                let previousLevel = 0
                for (const level of finalBeatHierarchyLevels) {
                  if (previousLevel < level) {
                    expect(level - previousLevel).toBe(1)
                  } else if (previousLevel >= level) {
                    expect(level).toBeGreaterThanOrEqual(0)
                  }
                  // Property 3
                  expect(level).toBeGreaterThanOrEqual(0)
                  expect(level).toBeLessThanOrEqual(2)
                  previousLevel = level
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
      describe('given arbitrary re-assignment of beat depths', () => {
        it('should produce valid beat trees', () => {
          // @ts-ignore
          const beatArray = visibleSortedBeatsForTimelineByBookSelector(multi_tier_zelda)
          // @ts-ignore
          const hierarchyLevels = sortedHierarchyLevels(multi_tier_zelda)

          fc.assert(
            fc.property(
              fc.int32Array({
                min: 0,
                max: 2,
                minLength: beatArray.length,
                maxLength: beatArray.length,
              }),
              (newHeights) => {
                // Two properties:
                //
                //  1. It should never skip a level going lower.
                //
                //  2. It should contain all of the original beats in
                //     the new order.
                //
                //  3. No higher level beat should be without children
                //
                //  4. It shouldn't make the tree deeper.
                const newBeatHierarchyLevels = newHeights.map((height) => {
                  return hierarchyLevels[height].level
                })

                // Exercise the root reducer
                const newState = rootReducer(
                  multi_tier_zelda,
                  restructureTimeline(beatArray, newBeatHierarchyLevels)
                )
                const finalBeatArray = visibleSortedBeatsForTimelineByBookSelector(newState)
                const newStateBeats = allBeatsSelector(newState)
                const finalBeatHierarchyLevels = finalBeatArray.map((beat) => {
                  return tree.depth(newStateBeats['7'], beat.id)
                })

                // Property 1 & 3.
                let previousLevel = 0
                for (const level of finalBeatHierarchyLevels) {
                  if (previousLevel < level) {
                    expect(level - previousLevel).toBe(1)
                  } else if (previousLevel >= level) {
                    expect(level).toBeGreaterThanOrEqual(0)
                  }
                  // Property 4
                  expect(level).toBeGreaterThanOrEqual(0)
                  expect(level).toBeLessThanOrEqual(2)
                  previousLevel = level
                }

                // Property 2.
                const newBeatIds = beatArray.map((beat) => {
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
    describe('given the timeline view is stacked', () => {
      const stacked_multi_tier_zelda = {
        ...multi_tier_zelda,
        user: {
          ...multi_tier_zelda.user,
          ui: {
            ...multi_tier_zelda.user.ui,
            timeline: {
              ...multi_tier_zelda.user.ui.timeline,
              view: 'stacked',
            },
          },
        },
      }
      describe('given the empty list of beats and hierarchies', () => {
        it('should produce the empty tree', () => {
          const newState = rootReducer(stacked_multi_tier_zelda, restructureTimeline([], []))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const beats = newStateBeats[newCurrentTimeline]
          expect(beats).toEqual(tree.newTree('id'))
        })
      })
      describe('given the same beats and hierarchy levels as for the current book', () => {
        it('should fill in the missing beats', () => {
          const beatHierarchyLevels = sortedBeatsHierachyLevels(stacked_multi_tier_zelda).map(
            (hierarchyLevel) => {
              return hierarchyLevel.level
            }
          )
          // @ts-ignore
          const originalBeats = sortedBeatsByBookSelector(stacked_multi_tier_zelda)
          const newState = rootReducer(
            stacked_multi_tier_zelda,
            restructureTimeline(originalBeats, beatHierarchyLevels)
          )
          const beats = sortedBeatsByBookSelector(newState)
          expect(beats.map(withoutPosition)).toEqual(
            expect.arrayContaining(Object.values(originalBeats).map(withoutPosition))
          )
          const newStateBeats = allBeatsSelector(newState)
          const finalBeatHierarchyLevels = beats.map((beat) => {
            return tree.depth(newStateBeats['7'], beat.id)
          })
          let previousLevel = 0
          for (const [level, index] of zip(
            finalBeatHierarchyLevels,
            range(finalBeatHierarchyLevels.length)
          )) {
            if (previousLevel < level) {
              expect(level - previousLevel).toBe(1)
            } else if (previousLevel === level && index !== 0) {
              expect(level).toBe(2)
            }
            previousLevel = level
          }
        })
      })
      describe('given arbitrary re-orderings of beats', () => {
        it('should produce valid beat trees', () => {
          const beatHierarchyLevels = sortedBeatsHierachyLevels(stacked_multi_tier_zelda)
          // @ts-ignore
          const beatArray = sortedBeatsByBookSelector(stacked_multi_tier_zelda)
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
                // Three properties:
                //
                //  1. It should never skip a level going lower.
                //
                //  2. It should contain all of the original beats in
                //     the new order.
                //
                //  3. The tree shouldn't exceed a depth of three.
                const newBeatHierarchyLevels = newOrdering.map((index) => {
                  return beatHierarchyLevels[index].level
                })
                const newBeatArray = newOrdering.map((index) => {
                  return beatArray[index]
                })

                // Exercise the root reducer
                const newState = rootReducer(
                  stacked_multi_tier_zelda,
                  restructureTimeline(newBeatArray, newBeatHierarchyLevels)
                )
                const finalBeatArray = sortedBeatsByBookSelector(newState)
                const newStateBeats = allBeatsSelector(newState)
                const finalBeatHierarchyLevels = finalBeatArray.map((beat) => {
                  return tree.depth(newStateBeats['7'], beat.id)
                })

                // Property 1.
                let previousLevel = 0
                for (const [level, index] of zip(
                  finalBeatHierarchyLevels,
                  range(finalBeatHierarchyLevels.length)
                )) {
                  if (previousLevel < level) {
                    expect(level - previousLevel).toBe(1)
                  } else if (previousLevel === level && index !== 0) {
                    expect(level).toBe(2)
                  }
                  // Property 3
                  expect(level).toBeGreaterThanOrEqual(0)
                  expect(level).toBeLessThanOrEqual(2)
                  previousLevel = level
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
      describe('given a re-assignment of beats all to act', () => {
        it('should ensure that the cards are all transfered down to scenes per act', () => {
          // @ts-ignore
          const beatArray = sortedBeatsByBookSelector(stacked_multi_tier_zelda)
          // @ts-ignore
          const stacked_multi_tier_zelda_beats = allBeatsSelector(stacked_multi_tier_zelda)
          const sceneBeats = beatArray
            .filter((beat) => {
              return tree.depth(stacked_multi_tier_zelda_beats['7'], beat.id) === 2
            })
            .map((beat) => {
              return beat.id
            })
          // @ts-ignore
          const allCards = allCardsSelector(stacked_multi_tier_zelda)
          const sceneBeatCards = allCards.filter((card) => {
            return sceneBeats.indexOf(card.beatId) !== -1
          })
          // @ts-ignore
          const hierarchyLevels = sortedHierarchyLevels(stacked_multi_tier_zelda)
          const newHeights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          // Two properties:
          //
          //  1. It should never skip a level going lower.
          //
          //  2. It should contain all of the original beats in
          //     the new order.
          //
          //  3. No higher level beat should be without children
          //
          //  4. It shouldn't make the tree deeper.
          //
          //  5. All cards on scenes should remain on scenes.
          const newBeatHierarchyLevels = newHeights.map((height) => {
            return hierarchyLevels[height].level
          })

          // Exercise the root reducer
          const newState = rootReducer(
            stacked_multi_tier_zelda,
            restructureTimeline(beatArray, newBeatHierarchyLevels)
          )
          const finalBeatArray = sortedBeatsByBookSelector(newState)
          const newStateBeats = allBeatsSelector(newState)
          const finalBeatHierarchyLevels = finalBeatArray.map((beat) => {
            return tree.depth(newStateBeats['7'], beat.id)
          })
          const finalSceneBeats = finalBeatArray
            .filter((beat) => {
              return tree.depth(newStateBeats['7'], beat.id) === 2
            })
            .map((beat) => {
              return beat.id
            })
          const finalAllCards = allCardsSelector(newState)
          const finalSceneBeatCards = finalAllCards.filter((card) => {
            return finalSceneBeats.indexOf(card.beatId) !== -1
          })

          // Property 5.
          expect(finalSceneBeatCards.map(withoutCardDetailsWeDontCareAbout)).toEqual(
            expect.arrayContaining(sceneBeatCards.map(withoutCardDetailsWeDontCareAbout))
          )

          // Property 1 & 3.
          let previousLevel = 0
          for (const [level, index] of zip(
            finalBeatHierarchyLevels,
            range(finalBeatHierarchyLevels.length)
          )) {
            if (previousLevel < level) {
              expect(level - previousLevel).toBe(1)
            } else if (previousLevel === level && index !== 0) {
              expect(level).toBe(2)
            }
            // Property 4
            expect(level).toBeGreaterThanOrEqual(0)
            expect(level).toBeLessThanOrEqual(2)
            previousLevel = level
          }

          // Property 2.
          const newBeatIds = beatArray.map((beat) => {
            return beat.id
          })
          const finalIds = finalBeatArray.map((beat) => {
            return beat.id
          })
          const finalBeatIds = difference(finalIds, difference(finalIds, newBeatIds))
          expect(newBeatIds).toEqual(finalBeatIds)
        })
      })
      describe('given arbitrary re-assignment of beat depths', () => {
        it('should produce valid beat trees', () => {
          // @ts-ignore
          const beatArray = sortedBeatsByBookSelector(stacked_multi_tier_zelda)
          // @ts-ignore
          const stacked_multi_tier_zelda_beats = allBeatsSelector(stacked_multi_tier_zelda)
          const sceneBeats = beatArray
            .filter((beat) => {
              return tree.depth(stacked_multi_tier_zelda_beats['7'], beat.id) === 2
            })
            .map((beat) => {
              return beat.id
            })
          // @ts-ignore
          const allCards = allCardsSelector(stacked_multi_tier_zelda)
          const sceneBeatCards = allCards.filter((card) => {
            return sceneBeats.indexOf(card.beatId) !== -1
          })
          // @ts-ignore
          const hierarchyLevels = sortedHierarchyLevels(stacked_multi_tier_zelda)

          fc.assert(
            fc.property(
              fc.int32Array({
                min: 0,
                max: 2,
                minLength: beatArray.length,
                maxLength: beatArray.length,
              }),
              (newHeights) => {
                // Two properties:
                //
                //  1. It should never skip a level going lower.
                //
                //  2. It should contain all of the original beats in
                //     the new order.
                //
                //  3. No higher level beat should be without children
                //
                //  4. It shouldn't make the tree deeper.
                //
                //  5. All cards on scenes should remain on scenes.
                const newBeatHierarchyLevels = newHeights.map((height) => {
                  return hierarchyLevels[height].level
                })

                // Exercise the root reducer
                const newState = rootReducer(
                  stacked_multi_tier_zelda,
                  restructureTimeline(beatArray, newBeatHierarchyLevels)
                )
                const finalBeatArray = sortedBeatsByBookSelector(newState)
                const newStateBeats = allBeatsSelector(newState)
                const finalBeatHierarchyLevels = finalBeatArray.map((beat) => {
                  return tree.depth(newStateBeats['7'], beat.id)
                })
                const finalSceneBeats = finalBeatArray
                  .filter((beat) => {
                    return tree.depth(newStateBeats['7'], beat.id) === 2
                  })
                  .map((beat) => {
                    return beat.id
                  })
                const finalAllCards = allCardsSelector(newState)
                const finalSceneBeatCards = finalAllCards.filter((card) => {
                  return finalSceneBeats.indexOf(card.beatId) !== -1
                })

                // Property 5.
                expect(finalSceneBeatCards.map(withoutCardDetailsWeDontCareAbout)).toEqual(
                  expect.arrayContaining(sceneBeatCards.map(withoutCardDetailsWeDontCareAbout))
                )

                // Property 1 & 3.
                let previousLevel = 0
                for (const [level, index] of zip(
                  finalBeatHierarchyLevels,
                  range(finalBeatHierarchyLevels.length)
                )) {
                  if (previousLevel < level) {
                    expect(level - previousLevel).toBe(1)
                  } else if (previousLevel === level && index !== 0) {
                    expect(level).toBe(2)
                  }
                  // Property 4
                  expect(level).toBeGreaterThanOrEqual(0)
                  expect(level).toBeLessThanOrEqual(2)
                  previousLevel = level
                }

                // Property 2.
                const newBeatIds = beatArray.map((beat) => {
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
})

describe('ADD_CARD', () => {
  describe('given a multi-tier structure', () => {
    describe('and a card with a beat id', () => {
      describe('that points at the root', () => {
        describe('and we signal to add missing beats', () => {
          const newCard = {
            title: 'Test Card',
            beatId: 35,
            lineId: 16,
            positionWithinLine: 0,
          }
          // @ts-ignore
          const allBeats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = allBeats['7']
          const newState = rootReducer(multi_tier_zelda, addCard(newCard, true))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newChapters = difference(tree.children(newBeats, 35), tree.children(oldBeats, 35))
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should add the missing chapter', () => {
            expect(newChapters.length).toBe(1)
            expect(tree.nodeParent(newBeats, newChapters[0].id)).toEqual(
              tree.findNode(oldBeats, 35).id
            )
          })
          const newChapter = newChapters[0]
          const newScenes = newChapter && tree.children(newBeats, newChapter.id)
          it('should add the missing scene', () => {
            expect(newScenes.length).toBe(1)
            expect(tree.nodeParent(newBeats, newScenes[0].id)).toEqual(
              tree.findNode(newBeats, newChapter.id).id
            )
          })
          it('should add one new card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate the card with the new scene', () => {
            expect(newCards[0].beatId).toBe(newScenes[0].id)
          })
        })
        describe('and we signal not to add missing beats', () => {
          const newCard = {
            title: 'Test Card',
            beatId: 35,
            lineId: 16,
            positionWithinLine: 0,
          }
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, addCard(newCard))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should add one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(35)
          })
        })
      })
      describe('that points at a chapter', () => {
        describe('and we signal to add missing beats', () => {
          const newCard = {
            title: 'Test Card',
            beatId: 34,
            lineId: 16,
            positionWithinLine: 0,
          }
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, addCard(newCard, true))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newScenes = difference(tree.children(newBeats, 34), tree.children(oldBeats, 34))
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should add the missing scene', () => {
            expect(newScenes.length).toBe(1)
            expect(tree.nodeParent(newBeats, newScenes[0].id)).toEqual(
              tree.findNode(newBeats, 34).id
            )
          })
          it('should add one new card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate the card with the new scene', () => {
            expect(newCards[0].beatId).toBe(newScenes[0].id)
          })
        })
        describe('and we signal not to add missing beats', () => {
          const newCard = {
            title: 'Test Card',
            beatId: 34,
            lineId: 16,
            positionWithinLine: 0,
          }
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, addCard(newCard))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should add one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(34)
          })
        })
      })
      describe('that points at a scene', () => {
        describe('and we signal to add missing beats', () => {
          const newCard = {
            title: 'Test Card',
            beatId: 26,
            lineId: 16,
            positionWithinLine: 0,
          }
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, addCard(newCard, true))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should add one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(26)
          })
        })
        describe('and we signal not to add missing beats', () => {
          const newCard = {
            title: 'Test Card',
            beatId: 26,
            lineId: 16,
            positionWithinLine: 0,
          }
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, addCard(newCard))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should add one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(26)
          })
        })
      })
    })
  })
})

describe('REORDER_CARDS_WITHIN_LINE', () => {
  describe('given a multi-tier structure', () => {
    describe('and a beat id', () => {
      describe('that points at the root', () => {
        describe('and we signal to add missing beats', () => {
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, reorderCardsWithinLine(35, 16, [31], true))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newChapters = difference(tree.children(newBeats, 35), tree.children(oldBeats, 35))
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should add the missing chapter', () => {
            expect(newChapters.length).toBe(1)
            expect(tree.nodeParent(newBeats, newChapters[0].id)).toEqual(
              tree.findNode(oldBeats, 35).id
            )
          })
          const newChapter = newChapters[0]
          const newScenes = newChapter && tree.children(newBeats, newChapter.id)
          it('should add the missing scene', () => {
            expect(newScenes.length).toBe(1)
            expect(tree.nodeParent(newBeats, newScenes[0].id)).toEqual(
              tree.findNode(newBeats, newChapter.id).id
            )
          })
          it('should change one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate the card with the new scene', () => {
            expect(newCards[0].beatId).toBe(newScenes[0].id)
          })
        })
        describe('and we signal not to add missing beats', () => {
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, reorderCardsWithinLine(35, 16, [31]))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should change one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(35)
          })
        })
      })
      describe('that points at a chapter', () => {
        describe('and we signal to add missing beats', () => {
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, reorderCardsWithinLine(34, 16, [31], true))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newScenes = difference(tree.children(newBeats, 34), tree.children(oldBeats, 34))
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should add the missing scene', () => {
            expect(newScenes.length).toBe(1)
            expect(tree.nodeParent(newBeats, newScenes[0].id)).toEqual(
              tree.findNode(newBeats, 34).id
            )
          })
          it('should change one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate the card with the new scene', () => {
            expect(newCards[0].beatId).toBe(newScenes[0].id)
          })
        })
        describe('and we signal not to add missing beats', () => {
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, reorderCardsWithinLine(34, 16, [31]))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should change one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(34)
          })
        })
      })
      describe('that points at a scene', () => {
        describe('and we signal to add missing beats', () => {
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, reorderCardsWithinLine(26, 16, [31], true))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should change one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(26)
          })
        })
        describe('and we signal not to add missing beats', () => {
          // @ts-ignore
          const multi_tier_zelda_beats = allBeatsSelector(multi_tier_zelda)
          const oldBeats = multi_tier_zelda_beats['7']
          const newState = rootReducer(multi_tier_zelda, reorderCardsWithinLine(26, 16, [31]))
          const newStateBeats = allBeatsSelector(newState)
          const newCurrentTimeline = currentTimelineSelector(newState)
          const newBeats = newStateBeats[newCurrentTimeline]
          const newStateCards = allCardsSelector(newState)
          // @ts-ignore
          const multi_tier_zelda_cards = allCardsSelector(multi_tier_zelda)
          const newCards = difference(newStateCards, multi_tier_zelda_cards)
          it('should not change the beats', () => {
            expect(oldBeats).toEqual(newBeats)
          })
          it('should change one card', () => {
            expect(newCards.length).toEqual(1)
          })
          it('should associate that card with the orginally supplied beatId', () => {
            expect(newCards[0].beatId).toBe(26)
          })
        })
      })
    })
  })
})

describe('addBookFromTemplate', () => {
  describe('given a valid template', () => {
    let template = null
    lineFromTemplate(eight_sequences_template, '2023.12.20', '', (e, t) => {
      if (e) {
        throw e
      } else {
        template = t
      }
    })
    const newState = rootReducer(multi_tier_zelda, addBookFromTemplate(omit(template, 'lines')))
    it('should add a book, lines, beats and cards with non-conflicting ids', () => {
      const books = allBooksSelector(newState)
      expect(books.allIds.length).toEqual(uniq(books.allIds).length)
      const getId = ({ id }) => {
        return id
      }
      const newStateBeats = allBeatsSelector(newState)
      const newStateLines = allLinesSelector(newState)
      const newStateCards = allCardsSelector(newState)
      expect(newStateCards.map(getId).length).toEqual(uniq(newStateCards.map(getId)).length)
      expect(newStateLines.map(getId).length).toEqual(uniq(newStateLines.map(getId)).length)
      expect(Object.values(newStateBeats[8].index).map(getId).length).toEqual(
        uniq(Object.values(newStateBeats[8].index).map(getId)).length
      )
    })
  })
})
