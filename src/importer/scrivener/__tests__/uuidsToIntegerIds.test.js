import { emptyFile } from 'pltr'

import { Goldilocks, UUIDFile } from './fixtures'
import { uuidsToIntegerIds } from '../uuidsToIntegerIds'

const asNumber = (x) => {
  if (typeof x === 'number') return true
  if (typeof x !== 'string') return false

  return !isNaN(Number.parseInt(x)) && Number.parseInt(x)
}

expect.extend({
  toBeANaturalNumber(received) {
    const pass =
      (typeof received === 'string' || typeof received === 'number') &&
      // @ts-ignore
      asNumber(received) >= 1
    if (pass) {
      return {
        message: () => `expected ${received} to be a natural number`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a natural number`,
        pass: false,
      }
    }
  },
  toBeANaturalNumberorNull(received) {
    const pass =
      received === null ||
      received === 'null' ||
      ((typeof received === 'string' || typeof received === 'number') &&
        // @ts-ignore
        asNumber(received) >= 1)
    if (pass) {
      return {
        message: () => `expected ${received} to be a natural number or null`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a natural number or null`,
        pass: false,
      }
    }
  },
})

describe('uuidsToIntegerIds', () => {
  describe('given an empty file', () => {
    it('should produce the empty file', () => {
      expect(uuidsToIntegerIds({})).toEqual({})
    })
  })
  describe('given a new file', () => {
    it('should produce the new file', () => {
      expect(uuidsToIntegerIds(emptyFile())).toEqual(emptyFile())
    })
  })
  describe('given a valid example file', () => {
    it('should produce that file unchanged', () => {
      expect(uuidsToIntegerIds(Goldilocks)).toEqual(Goldilocks)
    })
  })
  describe('given a file with uuids instead of integer ids', () => {
    const fixed = uuidsToIntegerIds(UUIDFile)
    it('should effect some sort of change at the very least', () => {
      expect(fixed).not.toEqual(UUIDFile)
    })
    // books
    it('should ensure that all books have integer ids', () => {
      for (const bookId in fixed.books) {
        if (bookId === 'allIds') continue

        // @ts-ignore
        expect(bookId).toBeANaturalNumber()
        // @ts-ignore
        expect(fixed.books[bookId].id).toBeANaturalNumber()
      }
    })
    // beats
    it('should ensure that all beats have integer ids', () => {
      for (const beatTreeId in fixed.beats) {
        const beatTree = fixed.beats[beatTreeId]
        // children
        for (const beatId in beatTree.children) {
          // @ts-ignore
          expect(beatId).toBeANaturalNumberorNull()
          for (const childId of beatTree.children[beatId]) {
            // @ts-ignore
            expect(childId).toBeANaturalNumber()
          }
        }
        // heap
        for (const beatId in beatTree.heap) {
          // @ts-ignore
          expect(beatId).toBeANaturalNumber()
          // @ts-ignore
          expect(beatTree.heap[beatId]).toBeANaturalNumberorNull()
        }
        // index
        for (const beatId in beatTree.index) {
          // @ts-ignore
          expect(beatId).toBeANaturalNumber()
          // @ts-ignore
          expect(beatTree.index[beatId].id).toBeANaturalNumber()
          // @ts-ignore
          expect(beatTree.index[beatId].bookId).toBeANaturalNumber()
        }
      }
    })
    it('should associate a matching beat id for uuids that were the same before', () => {
      const uuidBeat = Object.values(UUIDFile.beats['1'].index).find(
        ({ title }) => title === 'Chapter 1'
      )
      // @ts-ignore
      expect(uuidBeat.id).toEqual(UUIDFile.cards[0].beatId)
      const fixedBeat = Object.values(fixed.beats['1'].index).find(
        ({ title }) => title === 'Chapter 1'
      )
      expect(fixedBeat.id).toEqual(fixed.cards[0].beatId)

      const uuidBeat2 = Object.values(UUIDFile.beats['1'].index).find(
        ({ title }) => title === 'Chapter 2'
      )
      // @ts-ignore
      expect(uuidBeat2.id).toEqual(UUIDFile.cards[3].beatId)
      const fixedBeat2 = Object.values(fixed.beats['1'].index).find(
        ({ title }) => title === 'Chapter 2'
      )
      expect(fixedBeat2.id).toEqual(fixed.cards[3].beatId)
    })
    // cards
    it('should ensure that all cards have integer ids', () => {
      for (const card of fixed.cards) {
        // @ts-ignore
        expect(card.id).toBeANaturalNumber()
      }
    })
    it('should associate a matching card id for uuids that were the same before', () => {
      const uuidCard = UUIDFile.cards.find(
        ({ title }) => title === 'Three little pigs leave home for the big world'
      )
      // @ts-ignore
      expect(uuidCard.id).toEqual(UUIDFile.characters[0].cards[0])
      const fixedCard = fixed.cards.find(
        ({ title }) => title === 'Three little pigs leave home for the big world'
      )
      expect(fixedCard.id).toEqual(fixed.characters[0].cards[0])

      const uuidCard2 = UUIDFile.cards.find(({ title }) => title === 'Lands in boiling pot of soup')
      // @ts-ignore
      expect(uuidCard2.id).toEqual(UUIDFile.places[0].cards[0])
      const fixedCard2 = fixed.cards.find(({ title }) => title === 'Lands in boiling pot of soup')
      expect(fixedCard2.id).toEqual(fixed.places[0].cards[0])
    })
    // categories
    it('should ensure that all categories have integer ids', () => {
      // characters
      for (const category of fixed.categories.characters) {
        // @ts-ignore
        expect(category.id).toBeANaturalNumber()
      }
      // places
      for (const place of fixed.categories.characters) {
        // @ts-ignore
        expect(place.id).toBeANaturalNumber()
      }
      // notes
      for (const note of fixed.categories.notes) {
        // @ts-ignore
        expect(note.id).toBeANaturalNumber()
      }
      // tags
      for (const tag of fixed.categories.tags) {
        // @ts-ignore
        expect(tag.id).toBeANaturalNumber()
      }
    })
    // characters
    it('should ensure that all characters have integer ids', () => {
      for (const character of fixed.characters) {
        // @ts-ignore
        expect(character.id).toBeANaturalNumber()
        // cards
        for (const cardId of character.cards) {
          // @ts-ignore
          expect(cardId).toBeANaturalNumber()
        }
        // noteIds
        for (const noteId of character.noteIds) {
          // @ts-ignore
          expect(noteId).toBeANaturalNumber()
        }
        // tags
        for (const tagId of character.tags) {
          // @ts-ignore
          expect(tagId).toBeANaturalNumber()
        }
        // categoryId
        // @ts-ignore
        expect(character.categoryId).toBeANaturalNumber()
        // bookIds
        for (const bookId of character.bookIds) {
          // @ts-ignore
          expect(bookId).toBeANaturalNumber()
        }
      }
    })
    // lines
    it('should ensure that all lines have integer ids', () => {
      for (const line of fixed.lines) {
        // @ts-ignore
        expect(line.id).toBeANaturalNumber()
        // @ts-ignore
        expect(line.bookId).toBeANaturalNumber()
        // @ts-ignore
        expect(line.characterId).toBeANaturalNumberorNull()
      }

      const uuidLine = UUIDFile.lines.find(({ title }) => title === 'Wolf')
      const uuidCard = UUIDFile.cards.find(({ title }) => title === 'Scene with the Wolf')
      // @ts-ignore
      expect(uuidLine.id).toEqual(uuidCard.lineId)
      const fixedLine = fixed.lines.find(({ title }) => title === 'Wolf')
      const fixedCard = fixed.cards.find(({ title }) => title === 'Scene with the Wolf')
      expect(fixedLine.id).toEqual(fixedCard.lineId)

      const uuidLine2 = UUIDFile.lines.find(({ title }) => title === 'Pig #3')
      const uuidCards2 = UUIDFile.cards.filter(({ title }) => title === 'Lives happily ever after')
      expect(
        uuidCards2.some(({ lineId }) => {
          // @ts-ignore
          return lineId === uuidLine2.id
        })
      ).toBeTruthy()

      const fixedLine2 = fixed.lines.find(({ title }) => title === 'Pig #3')
      const fixedCards2 = fixed.cards.filter(({ title }) => title === 'Lives happily ever after')
      expect(
        fixedCards2.some(({ lineId }) => {
          return lineId === fixedLine2.id
        })
      ).toBeTruthy()
    })
    // notes
    it('should ensure that all notes have integer ids', () => {
      for (const note of fixed.notes) {
        // @ts-ignore
        expect(note.id).toBeANaturalNumber()
        // tags
        for (const tagId of note.tags) {
          // @ts-ignore
          expect(tagId).toBeANaturalNumber()
        }
        // characters
        for (const characterId of note.characters) {
          // @ts-ignore
          expect(characterId).toBeANaturalNumber()
        }
        // places
        for (const placeId of note.places) {
          // @ts-ignore
          expect(placeId).toBeANaturalNumber()
        }
        // books
        for (const bookId of note.bookIds) {
          // @ts-ignore
          expect(bookId).toBeANaturalNumber()
        }
      }
    })
    // places
    for (const place of fixed.places) {
      // @ts-ignore
      expect(place.id).toBeANaturalNumber()
      // cards
      for (const cardId of place.cards) {
        // @ts-ignore
        expect(cardId).toBeANaturalNumber()
      }
      for (const noteId of place.noteIds) {
        // @ts-ignore
        expect(noteId).toBeANaturalNumber()
      }
      for (const tagId of place.tags) {
        // @ts-ignore
        expect(tagId).toBeANaturalNumber()
      }
      for (const bookId of place.bookIds) {
        // @ts-ignore
        expect(bookId).toBeANaturalNumber()
      }
    }
    // tags
    for (const tag of fixed.tags) {
      // @ts-ignore
      expect(tag.id).toBeANaturalNumber()
    }
  })
})
