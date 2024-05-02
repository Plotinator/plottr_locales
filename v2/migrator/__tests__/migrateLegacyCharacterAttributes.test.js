import { omit } from 'lodash'

import { emptyFile } from 'pltr'

import {
  file_with_character_attributes,
  file_with_legacy_character_attributes_but_no_values,
  file_with_legacy_character_attributes_and_values,
  file_with_new_character_attributes,
  file_with_new_and_legacy_character_attributes,
  file_with_new_and_legacy_character_attributes_where_values_overlap,
  file_with_legacy_character_attribute_named_attributes,
} from './fixtures'
import { migrateLegacyCharacterAttributes } from '../handleSpecialCases'

/**
 * - migration with existing values for series attributes, and
 * - migration when a legacy attribute was named "attributes".
 */

describe('migrateLegacyCharacterAttributes', () => {
  describe('given an empty initial file', () => {
    it('should produce the file unchanged', () => {
      const initialFile = emptyFile()
      expect(migrateLegacyCharacterAttributes(initialFile)).toBe(initialFile)
    })
  })
  describe('given a non-initial file with no legacy character custom attributes', () => {
    it('should produce that file unchanged', () => {
      expect(migrateLegacyCharacterAttributes(file_with_character_attributes)).toBe(
        file_with_character_attributes
      )
    })
  })
  describe('given a file with legacy character custom attributes', () => {
    describe('when those attributes have no values', () => {
      const result = migrateLegacyCharacterAttributes(
        file_with_legacy_character_attributes_but_no_values
      )
      it('should change those attributes into new character attributes and remove the old ones', () => {
        expect(result).not.toBe(file_with_legacy_character_attributes_but_no_values)
        expect(result.customAttributes.characters).toEqual([])
        expect(result.attributes.characters).toEqual([
          { id: 2, name: 'attr 1', type: 'text' },
          { id: 3, name: 'attr2', type: 'paragraph' },
        ])
      })
      it('should leave the other legacy attributes unchanged', () => {
        expect(omit(result.customAttributes, 'characters')).toEqual(
          omit(file_with_legacy_character_attributes_but_no_values.customAttributes, 'characters')
        )
      })
      it('should leave the rest of the file alone', () => {
        for (const key of Object.keys(result)) {
          if (key !== 'customAttributes' && key !== 'attributes') {
            expect(result[key]).toBe(file_with_legacy_character_attributes_but_no_values[key])
          }
        }
      })
    })
    describe('when those attributes have values', () => {
      const result = migrateLegacyCharacterAttributes(
        file_with_legacy_character_attributes_and_values
      )
      it('should change those attributes into new character attributes and remove the old ones', () => {
        expect(result).not.toBe(file_with_legacy_character_attributes_and_values)
        expect(result.customAttributes.characters).toEqual([])
        expect(result.attributes.characters).toEqual([
          { id: 2, name: 'attr 1', type: 'text' },
          { id: 3, name: 'attr2', type: 'paragraph' },
        ])
      })
      it('should leave the other legacy attributes unchanged', () => {
        expect(omit(result.customAttributes, 'characters')).toEqual(
          omit(file_with_legacy_character_attributes_and_values.customAttributes, 'characters')
        )
      })
      it('should remove the legacy attribute values from the effected characters', () => {
        for (const character of result.characters) {
          for (const legacyAttribute of file_with_legacy_character_attributes_and_values
            .customAttributes.characters) {
            expect(character[legacyAttribute.name]).toBeUndefined()
          }
        }
      })
      it('should add the attributes to the series book on effected characters', () => {
        for (const character of result.characters) {
          for (const legacyAttribute of file_with_legacy_character_attributes_and_values
            .customAttributes.characters) {
            const attributeId = result.attributes.characters.find(({ name }) => {
              return name === legacyAttribute.name
            })?.id
            const oldCharacter = file_with_legacy_character_attributes_and_values.characters.find(
              (oldCharacter) => {
                return oldCharacter.id === character.id
              }
            )
            if (typeof oldCharacter[legacyAttribute.name] !== 'undefined') {
              const newAttributeValue = character.attributes?.find((newAttribute) => {
                return newAttribute.id === attributeId && newAttribute.bookId === 'all'
              })?.value
              expect(newAttributeValue).toBe(oldCharacter[legacyAttribute.name])
            }
          }
        }
      })
      it('should add new attributes corresponding to the migrated legacy attributes', () => {
        expect(result.attributes.characters).toEqual([
          { id: 2, name: 'attr 1', type: 'text' },
          { id: 3, name: 'attr2', type: 'paragraph' },
        ])
      })
      it('should leave the rest of the file alone', () => {
        for (const key of Object.keys(result)) {
          if (key !== 'customAttributes' && key !== 'attributes' && key !== 'characters') {
            expect(result[key]).toBe(file_with_legacy_character_attributes_and_values[key])
          }
        }
      })
    })
    describe('when the file already has some new attributes', () => {
      const result = migrateLegacyCharacterAttributes(file_with_new_and_legacy_character_attributes)
      it('should change those attributes into new character attributes and remove the old ones', () => {
        expect(result).not.toBe(file_with_new_and_legacy_character_attributes)
        expect(result.customAttributes.characters).toEqual([])
        expect(result.attributes.characters).toEqual([
          {
            name: 'category',
            type: 'base-attribute',
            id: 1,
          },
          {
            name: 'description',
            type: 'base-attribute',
            id: 2,
          },
          {
            name: 'attr 1',
            type: 'text',
            id: 3,
          },
          { id: 4, name: 'a legacy character attribute', type: 'text' },
          { id: 5, name: 'another legacy character attribute', type: 'paragraph' },
        ])
      })
      it('should leave the other legacy attributes unchanged', () => {
        expect(omit(result.customAttributes, 'characters')).toEqual(
          omit(file_with_new_and_legacy_character_attributes.customAttributes, 'characters')
        )
      })
      it('should remove the legacy attribute values from the effected characters', () => {
        for (const character of result.characters) {
          for (const legacyAttribute of file_with_new_and_legacy_character_attributes
            .customAttributes.characters) {
            expect(character[legacyAttribute.name]).toBeUndefined()
          }
        }
      })
      it('should add the attributes to the series book on effected characters', () => {
        for (const character of result.characters) {
          for (const legacyAttribute of file_with_new_and_legacy_character_attributes
            .customAttributes.characters) {
            const attributeId = result.attributes.characters.find(({ name }) => {
              return name === legacyAttribute.name
            })?.id
            const oldCharacter = file_with_new_and_legacy_character_attributes.characters.find(
              (oldCharacter) => {
                return oldCharacter.id === character.id
              }
            )
            if (typeof oldCharacter[legacyAttribute.name] !== 'undefined') {
              const newAttributeValue = character.attributes.find((newAttribute) => {
                return newAttribute.id === attributeId && newAttribute.bookId === 'all'
              })?.value
              expect(newAttributeValue).toBe(oldCharacter[legacyAttribute.name])
            }
          }
        }
      })
      it('should add new attributes corresponding to the migrated legacy attributes', () => {
        expect(result.attributes.characters).toEqual([
          {
            name: 'category',
            type: 'base-attribute',
            id: 1,
          },
          {
            name: 'description',
            type: 'base-attribute',
            id: 2,
          },
          {
            name: 'attr 1',
            type: 'text',
            id: 3,
          },
          { id: 4, name: 'a legacy character attribute', type: 'text' },
          { id: 5, name: 'another legacy character attribute', type: 'paragraph' },
        ])
      })
      it('should leave the rest of the file alone', () => {
        for (const key of Object.keys(result)) {
          if (key !== 'customAttributes' && key !== 'attributes' && key !== 'characters') {
            expect(result[key]).toBe(file_with_new_and_legacy_character_attributes[key])
          }
        }
      })
    })
    describe('where the old and new attributes are defined for the same book', () => {
      const result = migrateLegacyCharacterAttributes(
        file_with_new_and_legacy_character_attributes_where_values_overlap
      )
      it('should remove the legacy attribute', () => {
        expect(result.customAttributes.characters).toEqual([])
        for (const character of result.characters) {
          for (const legacyAttribute of file_with_new_and_legacy_character_attributes_where_values_overlap
            .customAttributes.characters) {
            expect(character[legacyAttribute.name]).toBeUndefined()
          }
        }
      })
      it('should not duplicate attributes', () => {
        expect(result.attributes.characters).toEqual([
          {
            name: 'category',
            type: 'base-attribute',
            id: 1,
          },
          {
            name: 'description',
            type: 'base-attribute',
            id: 2,
          },
          {
            name: 'attr 1',
            type: 'text',
            id: 3,
          },
          { id: 4, name: 'a legacy character attribute', type: 'text' },
          { id: 5, name: 'another legacy character attribute', type: 'paragraph' },
        ])
      })
      it('should not change the new attribute', () => {
        for (const character of result.characters) {
          const oldCharacter =
            file_with_new_and_legacy_character_attributes_where_values_overlap.characters.find(
              (oldCharacter) => {
                return oldCharacter.id === character.id
              }
            )
          const isExistingAttribute = ({ id }) => {
            return id <= 3
          }
          expect(character.attributes.filter(isExistingAttribute)).toEqual(
            oldCharacter?.attributes?.filter(isExistingAttribute) ?? []
          )
        }
      })
    })
    describe('when the file has a legacy attribute named "attributes"', () => {
      const result = migrateLegacyCharacterAttributes(
        file_with_legacy_character_attribute_named_attributes
      )
      it('should add a new attribute named "attributes"', () => {
        expect(result.attributes.characters).toEqual([
          {
            name: 'category',
            type: 'base-attribute',
            id: 1,
          },
          {
            name: 'description',
            type: 'base-attribute',
            id: 2,
          },
          { id: 3, name: 'attributes', type: 'paragraph' },
        ])
      })
      it('should port the value from the impacted characters', () => {
        for (const character of result.characters) {
          const legacyCharacter =
            file_with_legacy_character_attribute_named_attributes.characters.find(({ id }) => {
              return id === character.id
            })
          if (
            typeof character.attributes !== 'undefined' &&
            typeof character.attributes[0]?.id !== 'number'
          ) {
            const newAttribute = character?.attributes?.find(({ id }) => {
              return id === 3
            })
            expect(newAttribute.value).toBe(legacyCharacter.attributes)
          }
        }
      })
    })
  })
  describe('given a file with new attributes, but no old attributes', () => {
    it('should produce the file unchanged', () => {
      expect(migrateLegacyCharacterAttributes(file_with_new_character_attributes)).toBe(
        file_with_new_character_attributes
      )
    })
  })
})
