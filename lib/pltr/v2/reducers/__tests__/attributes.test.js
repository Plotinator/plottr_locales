import { identity } from 'lodash'

import { configureStore } from './fixtures/testStore'
import { goldilocks } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { loadFile, selectCharacterAttributeBookTab } from '../../actions/ui'
import { deleteBook, addBook } from '../../actions/books'
import {
  reorderCharacterAttribute,
  deleteCharacterAttribute,
  editCharacterAttributeMetadata,
} from '../../actions/attributes'
import { removeSystemKeys } from '../systemReducers'
import {
  addCharacter,
  createCharacterAttribute,
  editCharacterAttributeValue,
  addBook as addBookToCharacter,
} from '../../actions/characters'
import selectors from '../../selectors'

const { characterAttributesSelector, singleCharacterSelector } = selectors(identity)

const EMPTY_FILE = emptyFile('Test file')
const initialStore = () => {
  const store = configureStore()
  store.dispatch(
    loadFile(
      'Test file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://tmp/dummy-url-test-file.pltr'
    )
  )
  return store
}

const ignoringChangesWeDontCareAbout = (state) => {
  return {
    ...state,
    file: {
      ...state.file,
      dirty: null,
      versionStamp: null,
    },
  }
}

describe('editCharacterAttributeMetadata', () => {
  describe('given a store with legacy character attributes', () => {
    describe('and a different name to the attribute', () => {
      it('should leave the store unchanged', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Goldilocks',
            false,
            goldilocks,
            goldilocks.file.version,
            'device://tmp/dummy-goldilocks.pltr'
          )
        )
        const initialState = removeSystemKeys(store.getState())
        store.dispatch(editCharacterAttributeMetadata(null, 'new-name', 'paragraph', 'blarg'))
        const resultState = removeSystemKeys(store.getState())
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and the name of the legacy attribute', () => {
      it('should edit the name of the legacy attribute', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Goldilocks',
            false,
            goldilocks,
            goldilocks.file.version,
            'device://tmp/dummy-goldilocks.pltr'
          )
        )
        expect(store.getState().present.customAttributes.characters).toEqual([
          {
            name: 'Species',
            type: 'text',
          },
        ])
        store.dispatch(editCharacterAttributeMetadata(null, 'new-name', 'paragraph', 'Species'))
        expect(store.getState().present.customAttributes.characters).toEqual([
          {
            name: 'new-name',
            type: 'paragraph',
          },
        ])
        const characterSpecies = store
          .getState()
          .present.characters.map((character) => character['new-name'])
        expect(characterSpecies).toEqual(['Human', 'Bear', 'Bear', 'Bear'])
      })
    })
  })
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(editCharacterAttributeMetadata(1, 'John Doe', 'text', 'John Does'))
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(editCharacterAttributeMetadata(1, 'John Doe', 'text', 'John Does'))
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and a character attribute', () => {
      it('should change the details of that attribute', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(editCharacterAttributeMetadata(1, 'height', 'text', 'strength'))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should not change the details of that attribute if the id is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(editCharacterAttributeMetadata(2, 'height', 'text', 'strength'))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
  })
})

describe('deleteCharacterAttribute', () => {
  describe('given a store with legacy attributes', () => {
    describe('and a null id', () => {
      describe('and a name that is not a legacy attribute', () => {
        it('should leave the store unchanged', () => {
          const store = initialStore()
          store.dispatch(
            loadFile(
              'Goldilocks',
              false,
              goldilocks,
              goldilocks.file.version,
              'device://tmp/dummy-goldilocks.pltr'
            )
          )
          const initialState = removeSystemKeys(store.getState().present)
          store.dispatch(deleteCharacterAttribute(null, 'blarg'))
          const resultState = removeSystemKeys(store.getState().present)
          expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
            ignoringChangesWeDontCareAbout(resultState)
          )
        })
      })
      describe('and a name that is a legacy attribute', () => {
        it('should remove the legacy attribute', () => {
          const store = initialStore()
          store.dispatch(
            loadFile(
              'Goldilocks',
              false,
              goldilocks,
              goldilocks.file.version,
              'device://tmp/dummy-goldilocks.pltr'
            )
          )
          expect(store.getState().present.customAttributes.characters).toEqual([
            {
              name: 'Species',
              type: 'text',
            },
          ])
          store.dispatch(deleteCharacterAttribute(null, 'Species'))
          expect(store.getState().present.customAttributes.characters).toEqual([])
          const characterSpecies = store.getState().present.characters.map(({ Species }) => Species)
          expect(characterSpecies).toEqual([undefined, undefined, undefined, undefined])
        })
      })
    })
  })
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(deleteCharacterAttribute(1))
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(deleteCharacterAttribute(1))
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and a character attribute', () => {
      it('should delete that attribute', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(deleteCharacterAttribute(1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([])
      })
      it('should not delete that attribute if the id is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(deleteCharacterAttribute(2))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
  })
})

describe('reorderCharacterAttribute', () => {
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(reorderCharacterAttribute(1, 1))
      const resultState = removeSystemKeys(store.getState().present)
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(reorderCharacterAttribute(1, 1))
        const resultState = removeSystemKeys(store.getState().present)
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('and a character attribute', () => {
      it('should leave that attribute unchanged when the target index is 0', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, 0))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should leave that attribute unchanged when the target index is 1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, 1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should leave that attribute unchanged when the target index is -1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, -1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should not reorder that attribute if the given attribute is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, 1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
    describe('and a two character attributes', () => {
      it('should leave that attribute unchanged when the target index is 0', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        store.dispatch(createCharacterAttribute('text', 'height'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, 0))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should move that attribute when the target index is 1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        store.dispatch(createCharacterAttribute('text', 'height'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, 1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should leave that attribute unchanged when the target index is -1', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        store.dispatch(createCharacterAttribute('text', 'height'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(1, -1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
      it('should not reorder that attribute if the given attribute is different', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'strength'))
        store.dispatch(createCharacterAttribute('text', 'height'))
        const initialState = removeSystemKeys(store.getState().present)
        const initialAttributes = characterAttributesSelector(initialState, 1)
        expect(initialAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
        store.dispatch(reorderCharacterAttribute(3, 1))
        const resultState = removeSystemKeys(store.getState().present)
        const resultAttributes = characterAttributesSelector(resultState, 1)
        expect(resultAttributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            name: 'strength',
            type: 'text',
            value: undefined,
          },
          {
            bookId: 'all',
            id: 2,
            name: 'height',
            type: 'text',
            value: undefined,
          },
        ])
      })
    })
  })
})

describe('deleteBook', () => {
  describe('given a store with no characters in it', () => {
    it('should leave the characters unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(store.getState().present)
      store.dispatch(deleteBook(1))
      const resultState = removeSystemKeys(store.getState().present)
      expect(initialState.characters).toEqual(resultState.characters)
    })
  })
  describe('given a store with a character in it', () => {
    describe('and no character attributes', () => {
      it('should leave the characters unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(store.getState().present)
        store.dispatch(deleteBook(1))
        const resultState = removeSystemKeys(store.getState().present)
        expect(initialState.characters).toEqual(resultState.characters)
      })
    })
    describe('and character attributes', () => {
      describe('and the id of the book for which the attribute was defined', () => {
        it('should remove the attribute from the character', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(createCharacterAttribute('text', 'strength'))
          store.dispatch(addBook('A book', '', '', ''))
          store.dispatch(addBookToCharacter(1, 1))
          store.dispatch(selectCharacterAttributeBookTab(1))
          store.dispatch(editCharacterAttributeValue(1, 1, 'New value'))
          const originalCharacter = singleCharacterSelector(store.getState().present, 1)
          expect(originalCharacter.attributes).toEqual(
            expect.arrayContaining([
              {
                id: 1,
                bookId: 1,
                value: 'New value',
              },
              {
                id: 1,
                bookId: 'all',
                value: undefined,
              },
            ])
          )
          store.dispatch(deleteBook(1))
          const resultState = store.getState()
          const character = singleCharacterSelector(resultState.present, 1)
          expect(character.attributes).toEqual([
            {
              id: 1,
              bookId: 'all',
              value: undefined,
            },
          ])
        })
      })
      describe('and the id of another book', () => {
        it('should leave the characters as-is', () => {
          const store = initialStore()
          store.dispatch(addBook('A book', '', '', ''))
          store.dispatch(addBook('Another book', '', '', ''))
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(createCharacterAttribute('text', 'strength'))
          store.dispatch(addBookToCharacter(1, 1))
          store.dispatch(selectCharacterAttributeBookTab(1))
          store.dispatch(editCharacterAttributeValue(1, 1, 'New value'))
          const originalCharacter = singleCharacterSelector(store.getState().present, 1)
          store.dispatch(deleteBook(2))
          const resultState = store.getState()
          const character = singleCharacterSelector(resultState.present, 1)
          expect(character).toBe(originalCharacter)
        })
      })
    })
  })
})
