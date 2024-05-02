import { omit, identity } from 'lodash'

import { tree } from '../../index'
import { EDIT_LINE_COLOR } from '../../constants/ActionTypes'

import { applyTemplate } from '../../reducers/root'
import { moveLineActions } from '../templates'
import {
  // Templates
  one_level_plotline_template,
  two_level_plotline_template,
  three_level_plotline_template,
  one_level_biased_top_plotline_template,
  two_level_biased_top_plotline_template,
  three_level_biased_top_plotline_template,
  one_level_biased_middle_plotline_template,
  two_level_biased_middle_plotline_template,
  three_level_biased_middle_plotline_template,
  one_level_biased_bottom_plotline_template,
  two_level_biased_bottom_plotline_template,
  three_level_biased_bottom_plotline_template,

  // Files
  file_with_one_level as raw_file_with_one_level,
  file_with_two_levels as raw_file_with_two_levels,
  file_with_three_levels as raw_file_with_three_levels,
  file_with_two_levels_but_no_chapter as raw_file_with_two_levels_but_no_chapter,
  file_with_three_levels_but_no_chapter as raw_file_with_three_levels_but_no_chapter,
  file_with_three_levels_but_no_scene as raw_file_with_three_levels_but_no_scene,
  zelda as raw_zelda,
} from './fixtures'
import selectors from '../../selectors'

const file_with_one_level = { user: raw_file_with_one_level }
const file_with_two_levels = { user: raw_file_with_two_levels }
const file_with_three_levels = { user: raw_file_with_three_levels }
const file_with_two_levels_but_no_chapter = { user: raw_file_with_two_levels_but_no_chapter }
const file_with_three_levels_but_no_chapter = { user: raw_file_with_three_levels_but_no_chapter }
const file_with_three_levels_but_no_scene = { user: raw_file_with_three_levels_but_no_scene }
const zelda = { user: raw_zelda }

const { allCardsSelector, beatsForAnotherBookSelector, allLinesSelector } = selectors(identity)

const withoutLineBeatOrCardIds = (x) => omit(x, 'id', 'lineId', 'beatId')
const withoutIdsPositionsOrColor = (x) => omit(x, 'id', 'position', 'color')
const withoutPositions = (x) => omit(x, 'position')
const withFromTemplateId = (id) => (x) => ({
  ...x,
  fromTemplateId: id,
})

const beatsLength = (beatTree) => {
  return tree.length(beatTree)
}

// Consider also testing:
//  - the names of inserted beats,
//  - the exact positions that cards end up in,
//  - the order of inserted plot lines, and
//  - more edge cases.
describe('applyTemplate', () => {
  describe('given a file with one level', () => {
    describe('and a template with one level', () => {
      describe('and the template is biased to the "top"', () => {
        const result = applyTemplate(file_with_one_level, 1, one_level_biased_top_plotline_template)
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_top_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many beats as the template', () => {
          const templateNumberOfBeats = beatsLength(
            one_level_biased_top_plotline_template.templateData.beats['1']
          )
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              one_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('plbda63b'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = one_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          expect(one_level_biased_top_plotline_template.templateData.cards.length).toEqual(
            addedCards.length
          )
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_top_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
      })
      describe('and the template is biased to the "middle"', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          one_level_biased_middle_plotline_template
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_middle_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many beats as the template', () => {
          const templateNumberOfBeats = beatsLength(
            one_level_biased_middle_plotline_template.templateData.beats['1']
          )
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              one_level_biased_middle_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('plbda63b'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            one_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          expect(one_level_biased_middle_plotline_template.templateData.cards.length).toEqual(
            addedCards.length
          )
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_middle_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
      })
      describe('and the template is biased to the "bottom"', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          one_level_biased_bottom_plotline_template
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many beats as the template', () => {
          const templateNumberOfBeats = beatsLength(
            one_level_biased_bottom_plotline_template.templateData.beats['1']
          )
          const resultBeats = beatsForAnotherBookSelector(result, '1')
          const resultNumberOfBeats = beatsLength(resultBeats)
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              one_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('plbda63b'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            one_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          expect(one_level_biased_bottom_plotline_template.templateData.cards.length).toEqual(
            addedCards.length
          )
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
      })
    })
    describe('and a template with two levels', () => {
      describe('and the template is biased to the "top"', () => {
        const result = applyTemplate(file_with_one_level, 1, two_level_biased_top_plotline_template)
        const topLevelBeats = tree.children(
          two_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          const topLevelBeatIds = topLevelBeats.map(({ id }) => id)
          const cardsInTemplate = two_level_biased_top_plotline_template.templateData.cards.filter(
            (card) => {
              return topLevelBeatIds.indexOf(card.beatId) !== -1
            }
          )
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the top level of the template', () => {
          const templateNumberOfBeats = topLevelBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = two_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const topLevelBeatIds = topLevelBeats.map(({ id }) => id)
          const templateCards = two_level_biased_top_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return topLevelBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the middle', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          two_level_biased_middle_plotline_template
        )
        const bottomLevelBeats = tree.children(
          two_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template from the bottom level', () => {
          const bottomLevelBeatIds = bottomLevelBeats.map(({ id }) => id)
          const cardsInBookFromTemplate =
            two_level_biased_middle_plotline_template.templateData.cards.filter((card) => {
              return bottomLevelBeatIds.indexOf(card.beatId) !== -1
            })
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInBookFromTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the bottom level of the template', () => {
          const templateNumberOfBeats = bottomLevelBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_middle_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            two_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const bottomLevelBeatIds = bottomLevelBeats.map(({ id }) => id)
          const templateCards = two_level_biased_middle_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return bottomLevelBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the bottom', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          two_level_biased_bottom_plotline_template
        )
        const topLevelBeats = tree.children(
          two_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const bottomLevelBeats = tree.children(
          two_level_biased_bottom_plotline_template.templateData.beats['1'],
          topLevelBeats[0].id
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template from the bottom level', () => {
          const bottomLevelBeatIds = bottomLevelBeats.map(({ id }) => id)
          const cardsInBookFromTemplate =
            two_level_biased_middle_plotline_template.templateData.cards.filter((card) => {
              return bottomLevelBeatIds.indexOf(card.beatId) !== -1
            })
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInBookFromTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the bottom level of the template', () => {
          const templateNumberOfBeats = bottomLevelBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            two_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const bottomLevelBeatIds = bottomLevelBeats.map(({ id }) => id)
          const templateCards = two_level_biased_bottom_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return bottomLevelBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
    })
    describe('and a template with three levels', () => {
      describe('and the template is biased to the top', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          three_level_biased_top_plotline_template
        )
        const topLevelBeats = tree.children(
          three_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          const topLevelBeatIds = topLevelBeats.map(({ id }) => id)
          const cardsInBookFromTemplate =
            three_level_biased_top_plotline_template.templateData.cards.filter((card) => {
              return topLevelBeatIds.indexOf(card.beatId) !== -1
            })
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInBookFromTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the top level of the template', () => {
          const templateNumberOfBeats = topLevelBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = three_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const topLevelBeatIds = topLevelBeats.map(({ id }) => id)
          const templateCards = three_level_biased_top_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return topLevelBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the middle', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          three_level_biased_middle_plotline_template
        )
        const topLevelBeats = tree.children(
          three_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const middleLevelBeats = tree.children(
          three_level_biased_middle_plotline_template.templateData.beats['1'],
          topLevelBeats[0].id
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          const middleLevelBeatIds = middleLevelBeats.map(({ id }) => id)
          const cardsInBookFromTemplate =
            three_level_biased_middle_plotline_template.templateData.cards.filter((card) => {
              return middleLevelBeatIds.indexOf(card.beatId) !== -1
            })
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInBookFromTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the middle level of the template', () => {
          const templateNumberOfBeats = middleLevelBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_middle_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const middleLevelBeatIds = middleLevelBeats.map(({ id }) => id)
          const templateCards =
            three_level_biased_middle_plotline_template.templateData.cards.filter(({ beatId }) => {
              return middleLevelBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the bottom', () => {
        const result = applyTemplate(
          file_with_one_level,
          1,
          three_level_biased_bottom_plotline_template
        )
        const topLevelBeats = tree.children(
          three_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const middleLevelBeats = tree.children(
          three_level_biased_bottom_plotline_template.templateData.beats['1'],
          topLevelBeats[0].id
        )
        const bottomLevelBeats = tree.children(
          three_level_biased_bottom_plotline_template.templateData.beats['1'],
          middleLevelBeats[0].id
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_one_level)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          const bottomLevelBeatIds = bottomLevelBeats.map(({ id }) => {
            return id
          })
          const cardsInBookFromTemplate =
            three_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
              return bottomLevelBeatIds.indexOf(beatId) !== -1
            })
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInBookFromTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the bottom level of the template', () => {
          const templateNumberOfBeats = bottomLevelBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should add the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        const originalLines = allLinesSelector(file_with_one_level)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on teh plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const bottomLevelBeatIds = bottomLevelBeats.map(({ id }) => id)
          const templateCards =
            three_level_biased_middle_plotline_template.templateData.cards.filter(({ beatId }) => {
              return bottomLevelBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
    })
  })
  describe('given a file with two levels', () => {
    describe('and a template with one level', () => {
      describe('and the template is biased to the "top"', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          one_level_biased_top_plotline_template
        )
        const templateBeats = tree.children(
          one_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          const templateBeatIds = templateBeats.map(({ beatId }) => {
            return beatId
          })
          const cardsInBookFromTemplate =
            one_level_biased_top_plotline_template.templateData.cards.filter((card) => {
              return templateBeatIds.indexOf(card.beatId) !== -1
            })
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(cardsInBookFromTemplate.map(withoutLineBeatOrCardIds))
          )
        })
        it('should have at least as many beats as the top level of the template', () => {
          const templateNumberOfBeats = templateBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_two_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = one_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateBeats.map(({ id }) => id)
          const templateCards = one_level_biased_top_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the "middle"', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          one_level_biased_middle_plotline_template
        )
        const templateBeats = tree.children(
          one_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_middle_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many beats as the top level of the template', () => {
          const templateNumberOfBeats = templateBeats.length
          const resultNumberOfBeats = beatsLength(beatsForAnotherBookSelector(result, '1'))
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_two_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            one_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateBeats.map(({ id }) => id)
          const templateCards = one_level_biased_middle_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the "bottom"', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          one_level_biased_bottom_plotline_template
        )
        const templateBeats = tree.children(
          one_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_two_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            one_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateBeats.map(({ id }) => id)
          const templateCards = one_level_biased_bottom_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the file has an act but lacks a chapter', () => {
        describe('and the application is biased to "chapter"', () => {
          const result = applyTemplate(
            file_with_two_levels_but_no_chapter,
            1,
            one_level_biased_bottom_plotline_template,
            1
          )
          const templateBeats = tree.children(
            one_level_biased_bottom_plotline_template.templateData.beats['1'],
            null
          )
          const resultCards = allCardsSelector(result)
          const originalCards = allCardsSelector(file_with_two_levels)
          it('should have more cards', () => {
            expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
          })
          it('should have the cards it used to have', () => {
            expect(resultCards).toEqual(expect.arrayContaining(originalCards))
          })
          it('should have the cards in the template', () => {
            expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
              expect.arrayContaining(
                one_level_biased_bottom_plotline_template.templateData.cards.map(
                  withoutLineBeatOrCardIds
                )
              )
            )
          })
          const resultLines = allLinesSelector(result)
          const originalLines = allLinesSelector(file_with_two_levels_but_no_chapter)
          it('should have the plotlines that were there originally', () => {
            expect(resultLines.map(withoutPositions)).toEqual(
              expect.arrayContaining(originalLines.map(withoutPositions))
            )
          })
          it('should only add cards to the new plotlines', () => {
            const existingPlotlines =
              one_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
                return id
              })
            const addedCards = resultCards.filter((card) => {
              return originalCards.map(({ id }) => id).indexOf(card.id) === -1
            })
            const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
              return existingPlotlines.indexOf(lineId) === -1
            })
            expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
          })
          const resultBeats = beatsForAnotherBookSelector(result, '1')
          it('should add the missing chapter', () => {
            expect(resultBeats.children[resultBeats.children[null][0]]).toEqual([
              10, 11, 12, 13, 14, 15, 16, 17, 18,
            ])
          })
          it('should insert cards on the plotlines from the template', () => {
            const addedCards = resultCards.filter((card) => {
              return originalCards.map(({ id }) => id).indexOf(card.id) === -1
            })
            const templateBeatIds = templateBeats.map(({ id }) => id)
            const templateCards =
              one_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
                return templateBeatIds.indexOf(beatId) !== -1
              })
            expect(templateCards.length).toEqual(addedCards.length)
            expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
              expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
            )
          })
        })
      })
    })
    describe('and a template with two levels', () => {
      describe('and the template is biased to the "top"', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          two_level_biased_top_plotline_template
        )
        const templateTopBeats = tree.children(
          two_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const templateBottomBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            two_level_biased_top_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultBottomBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              two_level_biased_top_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many beats as the template at the top level', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many beats as the template in the middle', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_two_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = two_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateBottomBeats).map(({ id }) => id)
          const templateCards = two_level_biased_top_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the middle', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          two_level_biased_middle_plotline_template
        )
        const templateTopBeats = tree.children(
          two_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const templateBottomBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            two_level_biased_middle_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultBottomBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have at least as many beats as the template at the top level', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many beats as the template in the middle', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(templateNumberOfBeats).toBeGreaterThanOrEqual(resultNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_two_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            two_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateBottomBeats).map(({ id }) => id)
          const templateCards = two_level_biased_middle_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the bottom', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          two_level_biased_bottom_plotline_template
        )
        const templateTopBeats = tree.children(
          two_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const templateBottomBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            two_level_biased_bottom_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultBottomBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              two_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many beats as the template at the top level', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many beats as the template in the middle', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            two_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateBottomBeats).map(({ id }) => id)
          const templateCards = two_level_biased_bottom_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
    })
    describe('and a template with three levels', () => {
      describe('and the template is biased to the top', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          three_level_biased_top_plotline_template
        )
        const templateTopBeats = tree.children(
          three_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const templateMiddleBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_top_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultBottomBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have at least as many beats as the template at the top level', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many beats as the template in the middle', () => {
          const templateNumberOfBeats = templateMiddleBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateMiddleBeats).map(({ id }) => id)
          const templateCards =
            three_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the middle', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          three_level_biased_middle_plotline_template
        )
        const templateTopBeats = tree.children(
          three_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const templateMiddleBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_middle_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultBottomBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have at least as many beats as the template at the top level', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many beats as the template in the middle', () => {
          const templateNumberOfBeats = templateMiddleBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_middle_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateMiddleBeats).map(({ id }) => id)
          const templateCards =
            three_level_biased_middle_plotline_template.templateData.cards.filter(({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the bottom', () => {
        const result = applyTemplate(
          file_with_two_levels,
          1,
          three_level_biased_bottom_plotline_template
        )
        const templateTopBeats = tree.children(
          three_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const templateMiddleBeats = tree.children(
          three_level_biased_bottom_plotline_template.templateData.beats['1'],
          templateTopBeats[0].id
        )
        const templateBottomBeats = templateMiddleBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_bottom_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultBottomBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_two_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have at least as many top beats as the middle level of the template', () => {
          const templateNumberOfBeats = templateMiddleBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many bottom beats as the bottom level of the template', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateMiddleBeats
            .concat(templateBottomBeats)
            .map(({ id }) => id)
          const templateCards =
            three_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
    })
  })
  describe('given a file with three levels', () => {
    describe('and a template with one level', () => {
      describe('and the template is biased to the "top"', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          one_level_biased_top_plotline_template
        )
        const templateBeats = tree.children(
          one_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_top_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many top beats as the template', () => {
          const templateNumberOfBeats = templateBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              one_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('plbda63b'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateBeats.map(({ id }) => id)
          const templateCards =
            three_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the "middle"', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          one_level_biased_middle_plotline_template
        )
        const templateBeats = tree.children(
          one_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_middle_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many middle beats as the template', () => {
          const templateNumberOfBeats = templateBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              one_level_biased_middle_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('plbda63b'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            one_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateBeats.map(({ id }) => id)
          const templateCards = one_level_biased_middle_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the "bottom"', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          one_level_biased_bottom_plotline_template
        )
        const templateBeats = tree.children(
          one_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultBottomBeats = resultMiddleBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards it used to have', () => {
          expect(resultCards).toEqual(expect.arrayContaining(originalCards))
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              one_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many bottom beats as the template', () => {
          const templateNumberOfBeats = templateBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              one_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('plbda63b'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            one_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateBeats.map(({ id }) => id)
          const templateCards = one_level_biased_bottom_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the file lacks a scene', () => {
        describe('and the application is biased to "scene"', () => {
          const result = applyTemplate(
            file_with_three_levels_but_no_chapter,
            1,
            one_level_biased_bottom_plotline_template,
            1
          )
          const templateBeats = tree.children(
            one_level_biased_bottom_plotline_template.templateData.beats['1'],
            null
          )
          const resultCards = allCardsSelector(result)
          const originalCards = allCardsSelector(file_with_three_levels_but_no_chapter)
          it('should have more cards', () => {
            expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
          })
          it('should have the cards it used to have', () => {
            expect(resultCards).toEqual(expect.arrayContaining(originalCards))
          })
          it('should have the cards in the template', () => {
            expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
              expect.arrayContaining(
                one_level_biased_bottom_plotline_template.templateData.cards.map(
                  withoutLineBeatOrCardIds
                )
              )
            )
          })
          const resultLines = allLinesSelector(result)
          const originalLines = allLinesSelector(file_with_three_levels_but_no_chapter)
          it('should have the plotlines that were there originally', () => {
            expect(resultLines.map(withoutPositions)).toEqual(
              expect.arrayContaining(originalLines.map(withoutPositions))
            )
          })
          it('should only add cards to the new plotlines', () => {
            const existingPlotlines =
              one_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
                return id
              })
            const addedCards = resultCards.filter((card) => {
              return originalCards.map(({ id }) => id).indexOf(card.id) === -1
            })
            const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
              return existingPlotlines.indexOf(lineId) === -1
            })
            expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
          })
          const resultBeats = beatsForAnotherBookSelector(result, '1')
          it('should add the missing chapter', () => {
            expect(resultBeats.children[resultBeats.children[null][0]]).toEqual([
              8, 9, 10, 11, 12, 13, 14, 15, 16,
            ])
          })
          it('should insert cards on the plotlines from the template', () => {
            const addedCards = resultCards.filter((card) => {
              return originalCards.map(({ id }) => id).indexOf(card.id) === -1
            })
            const templateBeatIds = templateBeats.map(({ id }) => id)
            const templateCards =
              one_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
                return templateBeatIds.indexOf(beatId) !== -1
              })
            expect(templateCards.length).toEqual(addedCards.length)
            expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
              expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
            )
          })
        })
      })
      describe('and the file lacks a chapter', () => {
        describe('and the application is biased to "chapter"', () => {
          const result = applyTemplate(
            file_with_three_levels_but_no_scene,
            1,
            one_level_biased_bottom_plotline_template,
            2
          )
          const templateBeats = tree.children(
            one_level_biased_bottom_plotline_template.templateData.beats['1'],
            null
          )
          const resultCards = allCardsSelector(result)
          const originalCards = allCardsSelector(file_with_three_levels_but_no_scene)
          it('should have more cards', () => {
            expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
          })
          it('should have the cards it used to have', () => {
            expect(resultCards).toEqual(expect.arrayContaining(originalCards))
          })
          it('should have the cards in the template', () => {
            expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
              expect.arrayContaining(
                one_level_biased_bottom_plotline_template.templateData.cards.map(
                  withoutLineBeatOrCardIds
                )
              )
            )
          })
          const resultLines = allLinesSelector(result)
          const originalLines = allLinesSelector(file_with_three_levels_but_no_scene)
          it('should have the plotlines that were there originally', () => {
            expect(resultLines.map(withoutPositions)).toEqual(
              expect.arrayContaining(originalLines.map(withoutPositions))
            )
          })
          it('should only add cards to the new plotlines', () => {
            const existingPlotlines =
              one_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
                return id
              })
            const addedCards = resultCards.filter((card) => {
              return originalCards.map(({ id }) => id).indexOf(card.id) === -1
            })
            const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
              return existingPlotlines.indexOf(lineId) === -1
            })
            expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
          })
          const resultBeats = beatsForAnotherBookSelector(result, '1')
          it('should add the missing chapter', () => {
            expect(
              resultBeats.children[resultBeats.children[resultBeats.children[null][0]][0]]
            ).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16])
          })
          it('should insert cards on the plotlines from the template', () => {
            const addedCards = resultCards.filter((card) => {
              return originalCards.map(({ id }) => id).indexOf(card.id) === -1
            })
            const templateBeatIds = templateBeats.map(({ id }) => id)
            const templateCards =
              one_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
                return templateBeatIds.indexOf(beatId) !== -1
              })
            expect(templateCards.length).toEqual(addedCards.length)
            expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
              expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
            )
          })
        })
      })
    })
    describe('and a template with two levels', () => {
      describe('and the template is biased to the "top"', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          two_level_biased_top_plotline_template
        )
        const templateTopBeats = tree.children(
          two_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const templateBottomBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            two_level_biased_top_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              two_level_biased_top_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many top beats as the template top beats', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many middle beats as the template bottom beats', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = two_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateBottomBeats).map(({ id }) => id)
          const templateCards = two_level_biased_top_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the middle', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          two_level_biased_middle_plotline_template
        )
        const templateTopBeats = tree.children(
          two_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const templateBottomBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            two_level_biased_middle_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultBottomBeats = resultMiddleBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              two_level_biased_middle_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many middle beats as the template top beats', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many bottom beats as the template bottom beats', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_middle_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            two_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateBottomBeats).map(({ id }) => id)
          const templateCards = two_level_biased_middle_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the bottom', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          two_level_biased_bottom_plotline_template
        )
        const templateTopBeats = tree.children(
          two_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const templateBottomBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            two_level_biased_bottom_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultBottomBeats = resultMiddleBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              two_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many middle beats as the template top beats', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many bottom beats as the template bottom beats', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              two_level_biased_bottom_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl7d013d'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            two_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats.concat(templateBottomBeats).map(({ id }) => id)
          const templateCards = two_level_biased_bottom_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
    })
    describe('and a template with three levels', () => {
      describe('and the template is biased to the top', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          three_level_biased_top_plotline_template
        )
        const templateTopBeats = tree.children(
          three_level_biased_top_plotline_template.templateData.beats['1'],
          null
        )
        const templateMiddleBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_top_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const templateBottomBeats = templateMiddleBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_top_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultBottomBeats = resultMiddleBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              three_level_biased_top_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many top beats as the template top beats', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many middle beats as the template middle beats', () => {
          const templateNumberOfBeats = templateMiddleBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many bottom beats as the template bottom beats', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        it('should have the plotlines from the template', () => {
          expect(resultLines.map(withoutIdsPositionsOrColor)).toEqual(
            expect.arrayContaining(
              three_level_biased_top_plotline_template.templateData.lines
                .map(withoutIdsPositionsOrColor)
                .map(withFromTemplateId('pl8b2c85'))
            )
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines = three_level_biased_top_plotline_template.templateData.lines.map(
            ({ id }) => {
              return id
            }
          )
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats
            .concat(templateMiddleBeats)
            .concat(templateBottomBeats)
            .map(({ id }) => id)
          const templateCards = three_level_biased_top_plotline_template.templateData.cards.filter(
            ({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            }
          )
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the middle', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          three_level_biased_middle_plotline_template
        )
        const templateTopBeats = tree.children(
          three_level_biased_middle_plotline_template.templateData.beats['1'],
          null
        )
        const templateMiddleBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_middle_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const templateBottomBeats = templateMiddleBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_middle_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultBottomBeats = resultMiddleBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              three_level_biased_middle_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many top beats as the template top beats', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many middle beats as the template middle beats', () => {
          const templateNumberOfBeats = templateMiddleBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many bottom beats as the template bottom beats', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_three_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_middle_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats
            .concat(templateMiddleBeats)
            .concat(templateBottomBeats)
            .map(({ id }) => id)
          const templateCards =
            three_level_biased_middle_plotline_template.templateData.cards.filter(({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
      describe('and the template is biased to the bottom', () => {
        const result = applyTemplate(
          file_with_three_levels,
          1,
          three_level_biased_bottom_plotline_template
        )
        const templateTopBeats = tree.children(
          three_level_biased_bottom_plotline_template.templateData.beats['1'],
          null
        )
        const templateMiddleBeats = templateTopBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_bottom_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const templateBottomBeats = templateMiddleBeats.flatMap((beat) => {
          return tree.children(
            three_level_biased_bottom_plotline_template.templateData.beats['1'],
            beat.id
          )
        })
        const resultTopBeats = tree.children(beatsForAnotherBookSelector(result, '1'), null)
        const resultMiddleBeats = resultTopBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultBottomBeats = resultMiddleBeats.flatMap((beat) => {
          return tree.children(beatsForAnotherBookSelector(result, '1'), beat.id)
        })
        const resultCards = allCardsSelector(result)
        const originalCards = allCardsSelector(file_with_three_levels)
        it('should have more cards', () => {
          expect(resultCards.length).toBeGreaterThanOrEqual(originalCards.length)
        })
        it('should have the cards in the template', () => {
          expect(resultCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(
              three_level_biased_bottom_plotline_template.templateData.cards.map(
                withoutLineBeatOrCardIds
              )
            )
          )
        })
        it('should have at least as many top beats as the template top beats', () => {
          const templateNumberOfBeats = templateTopBeats.length
          const resultNumberOfBeats = resultTopBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many middle beats as the template middle beats', () => {
          const templateNumberOfBeats = templateMiddleBeats.length
          const resultNumberOfBeats = resultMiddleBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        it('should have at least as many bottom beats as the template bottom beats', () => {
          const templateNumberOfBeats = templateBottomBeats.length
          const resultNumberOfBeats = resultBottomBeats.length
          expect(resultNumberOfBeats).toBeGreaterThanOrEqual(templateNumberOfBeats)
        })
        const resultLines = allLinesSelector(result)
        const originalLines = allLinesSelector(file_with_three_levels)
        it('should have the plotlines that were there originally', () => {
          expect(resultLines.map(withoutPositions)).toEqual(
            expect.arrayContaining(originalLines.map(withoutPositions))
          )
        })
        it('should only add cards to the new plotlines', () => {
          const existingPlotlines =
            three_level_biased_bottom_plotline_template.templateData.lines.map(({ id }) => {
              return id
            })
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const addedCardsOnNewLines = addedCards.filter(({ lineId }) => {
            return existingPlotlines.indexOf(lineId) === -1
          })
          expect(addedCardsOnNewLines).toEqual(expect.arrayContaining(addedCards))
        })
        it('should insert cards on the plotlines from the template', () => {
          const addedCards = resultCards.filter((card) => {
            return originalCards.map(({ id }) => id).indexOf(card.id) === -1
          })
          const templateBeatIds = templateTopBeats
            .concat(templateMiddleBeats)
            .concat(templateBottomBeats)
            .map(({ id }) => id)
          const templateCards =
            three_level_biased_bottom_plotline_template.templateData.cards.filter(({ beatId }) => {
              return templateBeatIds.indexOf(beatId) !== -1
            })
          expect(templateCards.length).toEqual(addedCards.length)
          expect(addedCards.map(withoutLineBeatOrCardIds)).toEqual(
            expect.arrayContaining(templateCards.map(withoutLineBeatOrCardIds))
          )
        })
      })
    })
  })
})

describe('moveLineActions', () => {
  describe('given a store with multiple books and lines', () => {
    describe('and a valid source and target', () => {
      it('should maintain the original lines colour', () => {
        const result = moveLineActions(zelda, 16, 9)
        const changeColourAction = result.actions.find(({ type }) => {
          return type === EDIT_LINE_COLOR
        })
        expect(changeColourAction).toEqual({
          color: '#78be20',
          id: 17,
          type: 'EDIT_STORYLINE_COLOR',
        })
      })
    })
  })
})
