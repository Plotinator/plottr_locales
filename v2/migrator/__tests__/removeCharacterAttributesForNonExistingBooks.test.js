import {
  file_2023_3_29,
  file_with_character_attributes,
  file_with_non_existing_books_for_character_attributes,
} from './fixtures'
import { removeCharacterAttributesForNonExistingBooks } from '../handleSpecialCases'

describe('removeCharacterAttributesForNonExistingBooks', () => {
  describe('given a file with no character attributes', () => {
    it('should leave the file as-is', () => {
      expect(removeCharacterAttributesForNonExistingBooks(file_2023_3_29)).toBe(file_2023_3_29)
    })
  })
  describe('given a file with valid character attributes', () => {
    it('should levea the file as-is', () => {
      expect(removeCharacterAttributesForNonExistingBooks(file_with_character_attributes)).toBe(
        file_with_character_attributes
      )
    })
  })
  describe('given a file with character attributes', () => {
    describe('where some have valid book ids and others do not', () => {
      it('should leave the characters with valid attributes as-is and remove the invalid attributes on characters with invalid attributes', () => {
        const result = removeCharacterAttributesForNonExistingBooks(
          file_with_non_existing_books_for_character_attributes
        )
        for (const key of Object.keys(result)) {
          if (key === 'characters') {
            for (const character of result[key]) {
              // Char id 1 has invalid attributes
              if (character.id !== 1) {
                const oldCharacter =
                  file_with_non_existing_books_for_character_attributes.characters.find(
                    ({ id }) => {
                      return id === character.id
                    }
                  )
                expect(character).toBe(oldCharacter)
              } else {
                expect(character.attributes).toEqual([
                  {
                    bookId: 'all',
                    id: 1,
                    value: '6',
                  },
                ])
              }
            }
          } else {
            expect(result[key]).toBe(file_with_non_existing_books_for_character_attributes[key])
          }
        }
      })
    })
  })
})
