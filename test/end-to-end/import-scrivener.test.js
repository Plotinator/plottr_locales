import { endsWith, keys } from 'lodash'
import {
  A_CORONERS_TALE_PATH,
  FRACTURED_TEST_PATH,
  readOutput,
  TEST_OUTPUT,
  THE_TURN_PATH,
} from './common'

function isAnObject(val) {
  if (val && val instanceof Object) {
    return true
  } else {
    return false
  }
}

const PROBLEMATIC_SCRIVENER_FILES = [A_CORONERS_TALE_PATH, FRACTURED_TEST_PATH, THE_TURN_PATH]

describe('ImportScrivener', () => {
  describe('A_CORONERS_TALE', () => {
    const aCoronersTale = readOutput(A_CORONERS_TALE_PATH)
    const bookId = '1'

    it('should have an array of lines', () => {
      expect(aCoronersTale.lines).toBeDefined()
      expect(Array.isArray(aCoronersTale.lines)).toBeTruthy()
    })

    it('should have 4 lines', () => {
      expect(aCoronersTale.lines).toBeDefined()
      expect(aCoronersTale.lines.length).toBe(4)
    })

    it('should only have 1 beat', () => {
      expect(aCoronersTale.lines).toBeDefined()
      expect(keys(aCoronersTale.beats[bookId].index).length).toBe(1)
    })
  })

  describe('FRACTURED_TEST', () => {
    const fracturedTest = readOutput(FRACTURED_TEST_PATH)
    const bookId = '1'

    it('should have an array of lines', () => {
      expect(fracturedTest.lines).toBeDefined()
      expect(Array.isArray(fracturedTest.lines)).toBeTruthy()
    })

    it('should only have 1 line', () => {
      expect(fracturedTest.lines).toBeDefined()
      expect(fracturedTest.lines.length).toBe(1)
      expect(fracturedTest.lines.length).toBeLessThan(2)
    })

    it('should only have 12 beats', () => {
      expect(fracturedTest.lines).toBeDefined()
      expect(keys(fracturedTest.beats[bookId].index).length).toBe(12)
    })

    it('should have be quite long first chapter title ', () => {
      expect(fracturedTest.lines).toBeDefined()
      expect(fracturedTest.beats[bookId].index['1'].title.length).toBeGreaterThan(100)
    })

    it('should produce second chapter with fewer title characters than the first chapter', () => {
      expect(fracturedTest.lines).toBeDefined()
      expect(fracturedTest.beats[bookId].index['2'].title.length).toBeGreaterThan(50)
      expect(fracturedTest.beats[bookId].index['2'].title.length).toBeLessThan(100)
    })

    it('should only have an array of characters', () => {
      expect(fracturedTest.characters).toBeDefined()
      expect(Array.isArray(fracturedTest.characters)).toBeTruthy()
    })

    it('should have produce more than 1 character', () => {
      expect(fracturedTest.characters.length).toBeGreaterThan(1)
    })

    it('should only have an array of cards', () => {
      expect(fracturedTest.cards).toBeDefined()
      expect(Array.isArray(fracturedTest.cards)).toBeTruthy()
    })

    it('should have produce more than 1 card', () => {
      expect(fracturedTest.cards.length).toBeGreaterThan(1)
    })
  })

  describe('THE_TURN', () => {
    const theTurn = readOutput(THE_TURN_PATH)
    const bookId = '1'

    it('should only have 1 line', () => {
      expect(theTurn.lines).toBeDefined()
      expect(theTurn.lines.length).toBe(1)
      expect(theTurn.lines.length).toBeLessThan(2)
    })

    it('should have 2 beats', () => {
      expect(theTurn.lines).toBeDefined()
      expect(keys(theTurn.beats[bookId].index).length).toBe(2)
      expect(keys(theTurn.beats[bookId].index).length).toBeLessThan(3)
    })

    it('should only have an array of places', () => {
      expect(theTurn.cards).toBeDefined()
      expect(Array.isArray(theTurn.cards)).toBeTruthy()
    })

    it('should have at least 1 item on places object', () => {
      expect(theTurn.places.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('All 3 scrivener files', () => {
    PROBLEMATIC_SCRIVENER_FILES.forEach((file) => {
      const testOutput = readOutput(file)
      const strippedFileName = file.split('/').pop().split('.pltr')[0]

      describe(`${strippedFileName} file`, () => {
        it('should produce a .pltr file', () => {
          expect(endsWith(TEST_OUTPUT, '.pltr')).toBeTruthy()
        })
      })

      describe(`${strippedFileName} json`, () => {
        it('should produce a json object', () => {
          expect(isAnObject(testOutput)).toBeTruthy()
        })

        it('should produce a json object', () => {
          expect(isAnObject(testOutput)).toBeTruthy()
        })

        it('should have a ui object', () => {
          expect(testOutput.ui).toBeDefined()
        })

        it('should have a file object', () => {
          expect(testOutput.file).toBeDefined()
        })

        it('should have a series object', () => {
          expect(testOutput.series).toBeDefined()
        })

        it('should have a books object', () => {
          expect(testOutput.books).toBeDefined()
        })

        it('should have a beats object', () => {
          expect(testOutput.beats).toBeDefined()
        })

        it('should have a customAttributes object', () => {
          expect(testOutput.customAttributes).toBeDefined()
        })

        it('should have a categories object', () => {
          expect(testOutput.categories).toBeDefined()
        })

        it('should have a hierarchyLevels object', () => {
          expect(testOutput.hierarchyLevels).toBeDefined()
        })

        it('should have an array of characters', () => {
          expect(testOutput.characters).toBeDefined()
          expect(Array.isArray(testOutput.characters)).toBeTruthy()
        })

        it('should have an array of lines', () => {
          expect(testOutput.lines).toBeDefined()
          expect(Array.isArray(testOutput.lines)).toBeTruthy()
        })

        it('should have an array of cards', () => {
          expect(testOutput.cards).toBeDefined()
          expect(Array.isArray(testOutput.cards)).toBeTruthy()
        })

        it('should have an array of places', () => {
          expect(testOutput.places).toBeDefined()
          expect(Array.isArray(testOutput.places)).toBeTruthy()
        })

        it('should have an array of tags', () => {
          expect(testOutput.tags).toBeDefined()
          expect(Array.isArray(testOutput.tags)).toBeTruthy()
        })
      })
    })
  })
})
