import { addSeriesHierarchyIfMissing } from '../handleSpecialCases'
import { file_without_series_hierarchy_levels, file_2023_3_29 } from './fixtures'

describe('addSeriesHierarchyIfMissing', () => {
  describe('given a file with missing series hierarchy levels', () => {
    it('should add that missing level', () => {
      expect(file_without_series_hierarchy_levels.hierarchyLevels.series).toBeUndefined()
      const result = addSeriesHierarchyIfMissing(file_without_series_hierarchy_levels)
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
  describe('given a file without missing hierarchy levels', () => {
    it("shouldn't touch the file", () => {
      expect(addSeriesHierarchyIfMissing(file_2023_3_29)).toBe(file_2023_3_29)
    })
  })
})
