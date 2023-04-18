import { addHierarchiesIfMissing } from '../handleSpecialCases'
import {
  file_without_series_hierarchy_levels,
  file_2023_3_29,
  file_without_hierarchy_levels,
  file_with_series_hierarchy_levels_but_no_others,
} from './fixtures'

describe('addHierarchiesIfMissing', () => {
  describe('given a file with missing series hierarchy levels', () => {
    it('should add that missing level', () => {
      expect(file_without_series_hierarchy_levels.hierarchyLevels.series).toBeUndefined()
      const result = addHierarchiesIfMissing(file_without_series_hierarchy_levels)
      for (const key of Object.keys(result)) {
        const value = result[key]
        if (key === 'hierarchyLevels') {
          expect(value.series).toBeDefined()
        } else {
          expect(value).toBe(file_without_series_hierarchy_levels[key])
        }
      }
    })
  })
  describe('given a file with missing hierarchy levels', () => {
    it('should add all missing levels', () => {
      expect(file_without_hierarchy_levels.hierarchyLevels).toBeUndefined()
      const result = addHierarchiesIfMissing(file_without_hierarchy_levels)
      const bookIds = file_without_hierarchy_levels.books.allIds
      for (const id of bookIds) {
        expect(result.hierarchyLevels[id]).toBeDefined()
        expect(result.hierarchyLevels[id][0]).toBeDefined()
      }
    })
  })
  describe('given a file with missing hierarchy levels for books, but levels for series', () => {
    it('should add all missing levels', () => {
      expect(file_with_series_hierarchy_levels_but_no_others.hierarchyLevels[1]).toBeUndefined()
      expect(file_with_series_hierarchy_levels_but_no_others.hierarchyLevels.series).toBeDefined()
      const result = addHierarchiesIfMissing(file_with_series_hierarchy_levels_but_no_others)
      const bookIds = file_without_hierarchy_levels.books.allIds
      for (const id of bookIds) {
        expect(result.hierarchyLevels[id]).toBeDefined()
        expect(result.hierarchyLevels[id][0]).toBeDefined()
      }
    })
  })
  describe('given a file without missing hierarchy levels', () => {
    it("shouldn't touch the file", () => {
      expect(addHierarchiesIfMissing(file_2023_3_29)).toBe(file_2023_3_29)
    })
  })
})
