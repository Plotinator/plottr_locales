import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { removeSystemKeys } from '../../reducers/systemReducers'
import { goldilocks } from './fixtures'
import selectors from '../../selectors'
import actions from '../'

const {
  fullFileStateSelector,
  characterCustomAttributesSelector,
  allCharacterAttributesSelector,
  characterAttributesSelector,
  singleCharacterSelector,
  characterAttributeTabSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile, selectCharacterAttributeBookTab } = wiredUpActions.ui
const { addBook } = wiredUpActions.book
const { editCharacterAttributeValue, addCharacter } = wiredUpActions.character
const removeBookFromCharacter = wiredUpActions.character.removeBook
const addBookToCharacter = wiredUpActions.character.addBook

const EMPTY_FILE = emptyFile('Test file')

const exampleBook1 = {
  title: 'Second Book',
  premise: "First's book sequel",
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook2 = {
  title: 'Third Book',
  premise: "Second's book sequel",
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook3 = {
  title: 'Fourth Book',
  premise: "Third's book sequel",
  genre: 'Suspense',
  theme: 'Sequel',
}

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

describe('editCharacterAttributeValue', () => {
  describe('given the initial state store', () => {
    it('should produce the initial state store', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(fullFileStateSelector(store.getState()))
      store.dispatch(editCharacterAttributeValue(1, 1, 'test'))
      const finalState = removeSystemKeys(fullFileStateSelector(store.getState()))
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(finalState)
      )
    })
  })
  describe('given a state with a legacy attribute', () => {
    describe('and an id that does not match that attribute', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Goldilocks', false, goldilocks, '2020.7.30', 'device:///tmp.dummy.pltr')
        )
        const initialState = removeSystemKeys(fullFileStateSelector(store.getState()))
        store.dispatch(editCharacterAttributeValue(1, 1, 'test'))
        const finalState = removeSystemKeys(fullFileStateSelector(store.getState()))
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(finalState)
        )
      })
    })
    describe('and the name of that attribute', () => {
      it('should add a new custom attribute and alter its value', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Goldilocks', false, goldilocks, '2020.7.30', 'device:///tmp.dummy.pltr')
        )
        const otherCharacterBefore = singleCharacterSelector(store.getState(), 2)
        expect(otherCharacterBefore.Species).toEqual('Bear')
        store.dispatch(editCharacterAttributeValue(1, 'Species', 'Borg'))
        const legacyAttributes = characterCustomAttributesSelector(store.getState())
        expect(legacyAttributes).toEqual([])
        const otherCharacterAfter = singleCharacterSelector(store.getState(), 2)
        expect(otherCharacterAfter.Species).toBeUndefined()
        expect(otherCharacterAfter.attributes).toEqual([
          {
            id: 1,
            bookId: 'all',
            value: 'Bear',
          },
        ])
        const character = singleCharacterSelector(store.getState(), 1)
        expect(character.Species).toBeUndefined()
        const characterAttributes = characterAttributesSelector(store.getState(), 1)
        expect(characterAttributes).toEqual([
          {
            id: 1,
            bookId: 'all',
            value: 'Borg',
            name: 'Species',
            type: 'text',
          },
        ])
        const attributes = allCharacterAttributesSelector(store.getState())
        expect(attributes).toEqual([
          {
            id: 1,
            type: 'text',
            name: 'Species',
          },
        ])
      })
    })
  })
})

describe('characterDeleteBook', () => {
  describe('given the state with emptyFile', () => {
    const store = initialStore()
    store.dispatch(addCharacter('character 1'))
    store.dispatch(addCharacter('character 2'))
    describe('and add 3 books', () => {
      store.dispatch(
        addBook(exampleBook1.title, exampleBook1.premise, exampleBook1.genre, exampleBook1.theme)
      )
      store.dispatch(
        addBook(exampleBook2.title, exampleBook2.premise, exampleBook2.genre, exampleBook2.theme)
      )
      store.dispatch(
        addBook(exampleBook3.title, exampleBook3.premise, exampleBook3.genre, exampleBook3.theme)
      )
      describe('and add books to characters', () => {
        const bookIdToRemove = 3
        store.dispatch(addBookToCharacter(1, 1))
        store.dispatch(addBookToCharacter(1, 2))
        store.dispatch(addBookToCharacter(1, bookIdToRemove))
        store.dispatch(addBookToCharacter(1, 4))
        store.dispatch(addBookToCharacter(2, 2))
        store.dispatch(addBookToCharacter(2, bookIdToRemove))
        store.dispatch(addBookToCharacter(2, 4))
        const stateAfterAddingBooks = store.getState()
        const character1 = singleCharacterSelector(stateAfterAddingBooks, 1)
        const character2 = singleCharacterSelector(stateAfterAddingBooks, 2)

        it('should have all books attach to each character', () => {
          expect(character1.bookIds).toHaveLength(4)
          expect(character2.bookIds).toHaveLength(3)
        })

        const stateAfterBooksRemove = store.getState()
        describe('given the user move to specific book tab', () => {
          describe('and removes from the character the book', () => {
            store.dispatch(selectCharacterAttributeBookTab())
            store.dispatch(removeBookFromCharacter(character1.id, bookIdToRemove))
            store.dispatch(removeBookFromCharacter(character2.id, bookIdToRemove))

            it('should select the "Series" tab if the book has no characters', () => {
              const currentTab = characterAttributeTabSelector(stateAfterBooksRemove)
              expect(currentTab).toBe('all')
            })
          })
        })
      })
    })
  })
})
