import { difference } from 'lodash'

import {
  file_2021_07_20,
  file_2021_07_20_missing_templates_on_cards,
  file_1_2_23,
  file_2021_07_07,
  file_2022_01_11_fix_doesnt_apply,
  file_2022_01_11_title_is_object_without_title,
  file_2022_01_11_title_is_object_with_title_and_description,
  file_2022_01_11_title_object_without_description,
  file_2022_01_11_title_is_object_with_non_string_title,
  file_2022_01_11_title_is_object_with_non_array_description,
} from './fixtures'
import applyAllFixes, {
  handle2021_07_07,
  handleMissingTemplatesFieldOnCards,
  handleMissingUIState,
  handleObjectTitlesOnCards,
  MINIMAL_SET_OF_UI_KEYS,
} from '../handleSpecialCases'
import { uiState } from '../../store/initialState'
import {
  file_with_empty_ui_state,
  file_with_minimal_ui_state,
  file_with_missing_ui_keys,
  file_with_no_ui_state,
} from './fixtures/index'

describe('handle2021_07_07', () => {
  describe('given a file with a different version', () => {
    it('should produce that file, untouched', () => {
      expect(handle2021_07_07(file_2021_07_20)).toEqual(file_2021_07_20)
    })
  })
  describe('given a file with the problematic version', () => {
    it('should give light and dark config to all hierarchy levels', () => {
      const fixed = handle2021_07_07(file_2021_07_07)
      const levels = Object.values(fixed.hierarchyLevels)
      for (const level of levels) {
        expect(level.light).toBeDefined()
        expect(level.light.borderColor).toBeDefined()
        expect(level.light.textColor).toBeDefined()
        expect(level.dark).toBeDefined()
        expect(level.dark.borderColor).toBeDefined()
        expect(level.dark.textColor).toBeDefined()
      }
      expect(fixed.file.appliedMigrations).toEqual(expect.arrayContaining(['m2021_7_7']))
    })
  })
})

describe('handleMissingTemplatesFieldOnCards', () => {
  describe('given a file older than the addition of templates', () => {
    it('should do nothing to the file', () => {
      expect(handleMissingTemplatesFieldOnCards(file_1_2_23)).toBe(file_1_2_23)
    })
  })
  describe('given a file more recent than the addition of templates', () => {
    describe('but with no problem fields', () => {
      it('should leave the file as-is', () => {
        expect(handleMissingTemplatesFieldOnCards(file_2021_07_20)).toBe(file_2021_07_20)
      })
    })
    describe('with cards that lack the templates property', () => {
      it('should fix those cards', () => {
        const thereAreMissingTemplatesBefore =
          file_2021_07_20_missing_templates_on_cards.cards.some(
            (card) => !card.templates || !Array.isArray(card.templates)
          )
        expect(thereAreMissingTemplatesBefore).toEqual(true)
        const fixed = handleMissingTemplatesFieldOnCards(file_2021_07_20_missing_templates_on_cards)
        const thereAreMissingTemplates = fixed.cards.some(
          (card) => !card.templates || !Array.isArray(card.templates)
        )
        expect(thereAreMissingTemplates).toEqual(false)
      })
    })
  })
})

describe('handleObjectTitlesOnCards', () => {
  describe('given a file where the title is not an object', () => {
    it('should produce the file, unchanged', () => {
      expect(handleObjectTitlesOnCards(file_2022_01_11_fix_doesnt_apply)).toBe(
        file_2022_01_11_fix_doesnt_apply
      )
    })
  })
  describe('given a file where the title is an object without a title', () => {
    it('should produce the file, unchanged', () => {
      expect(handleObjectTitlesOnCards(file_2022_01_11_title_is_object_without_title)).toBe(
        file_2022_01_11_title_is_object_without_title
      )
    })
  })
  describe('given a file where the title is an object without a description', () => {
    it('should produce the file, unchanged', () => {
      expect(handleObjectTitlesOnCards(file_2022_01_11_title_object_without_description)).toBe(
        file_2022_01_11_title_object_without_description
      )
    })
  })
  describe('given a file where the title is an object with a title that is not a string', () => {
    it('should produce the file, unchanged', () => {
      expect(handleObjectTitlesOnCards(file_2022_01_11_title_is_object_with_non_string_title)).toBe(
        file_2022_01_11_title_is_object_with_non_string_title
      )
    })
  })
  describe('given a file where the title is an object with a description that is not an array', () => {
    it('should produce the file, unchanged', () => {
      expect(
        handleObjectTitlesOnCards(file_2022_01_11_title_is_object_with_non_array_description)
      ).toBe(file_2022_01_11_title_is_object_with_non_array_description)
    })
  })
  describe('given a file where the title is an object with a string title and an array description', () => {
    it('should move the titles to the title and the description to the description', () => {
      expect(
        handleObjectTitlesOnCards(file_2022_01_11_title_is_object_with_title_and_description)
      ).toEqual({
        ...file_2022_01_11_fix_doesnt_apply,
        file: {
          ...file_2022_01_11_fix_doesnt_apply.file,
          appliedMigrations: [
            ...file_2022_01_11_fix_doesnt_apply.file.appliedMigrations,
            'm2022_1_11',
          ],
        },
      })
    })
  })
})

describe('applyAllFixes', () => {
  describe('given a file with a version that has no problems', () => {
    it('should levae the file, as-is', () => {
      expect(applyAllFixes(file_2021_07_20)).toEqual(file_2021_07_20)
    })
  })
  describe('given a file with a version that has the 2021-07-07 problem', () => {
    it('should levae the file, as-is', () => {
      const fixed = applyAllFixes(file_2021_07_07)
      const levels = Object.values(fixed.hierarchyLevels)
      for (const level of levels) {
        expect(level.light).toBeDefined()
        expect(level.light.borderColor).toBeDefined()
        expect(level.light.textColor).toBeDefined()
        expect(level.dark).toBeDefined()
        expect(level.dark.borderColor).toBeDefined()
        expect(level.dark.textColor).toBeDefined()
      }
      expect(fixed.file.appliedMigrations).toEqual(expect.arrayContaining(['m2021_7_7']))
    })
  })
})

describe('handleMissingUIState', () => {
  describe('given a file with minimal UI state', () => {
    const fileWithMinimalUiState = file_with_minimal_ui_state
    const fixedFile = handleMissingUIState(fileWithMinimalUiState)
    it('should leave the file unchanged', () => {
      expect(fixedFile).toBe(fileWithMinimalUiState)
    })
  })
  describe('given a file an empty UI state', () => {
    const fileWithEmptyUiState = file_with_empty_ui_state
    const fixedFile = handleMissingUIState(fileWithEmptyUiState)
    it('should add the missing ui state', () => {
      for (const key of MINIMAL_SET_OF_UI_KEYS) {
        expect(fixedFile.ui[key]).toEqual(uiState[key])
      }
    })
  })
  describe('given a file an no UI state', () => {
    const fileWithNoUiState = file_with_no_ui_state
    const fixedFile = handleMissingUIState(fileWithNoUiState)
    it('should add the missing ui state', () => {
      expect(fixedFile.ui).toBeDefined()
      for (const key of MINIMAL_SET_OF_UI_KEYS) {
        expect(fixedFile.ui[key]).toEqual(uiState[key])
      }
    })
  })
  describe('given a file missing some UI state', () => {
    const fileWithMissingUiKeys = file_with_missing_ui_keys
    const fixedFile = handleMissingUIState(fileWithMissingUiKeys)
    it('should add the missing ui state', () => {
      for (const key of difference(MINIMAL_SET_OF_UI_KEYS, Object.keys(fixedFile.ui))) {
        expect(fixedFile.ui[key]).toBe(uiState[key])
      }
    })
    it('should not modify any of the existing keys', () => {
      for (const key of Object.keys(fileWithMissingUiKeys.ui)) {
        expect(fixedFile.ui[key]).toBe(fileWithMissingUiKeys.ui[key])
      }
    })
  })
})
