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
  allBookIdsSelector,
  allCharactersSelector,
  allBooksWithCharactersSortedByBookAllIdsPositionSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile } = wiredUpActions.ui
const { editCharacterAttributeValue, addCharacter } = wiredUpActions.character
const { addBook } = wiredUpActions.book
const addBookToCharacter = wiredUpActions.character.addBook

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

const exampleBook1 = {
  title: 'Book',
  premise: 'First book',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook5 = {
  title: 'Last Book',
  premise: 'Last Sequel',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook2 = {
  title: 'Second Book',
  premise: 'Sequel 1',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook3 = {
  title: 'Third Book',
  premise: 'Sequel 2',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook4 = {
  title: 'Fourth Book',
  premise: 'Sequel 3',
  genre: 'Suspense',
  theme: 'Sequel',
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
    describe('and add 2 characters', () => {
      const store = initialStore()
      store.dispatch(addCharacter('character 1'))
      store.dispatch(addCharacter('character 2'))
      describe('and add 5 books', () => {
        store.dispatch(
          addBook(exampleBook1.title, exampleBook1.premise, exampleBook1.genre, exampleBook1.theme)
        )
        store.dispatch(
          addBook(exampleBook2.title, exampleBook2.premise, exampleBook2.genre, exampleBook2.theme)
        )
        store.dispatch(
          addBook(exampleBook3.title, exampleBook3.premise, exampleBook3.genre, exampleBook3.theme)
        )
        store.dispatch(
          addBook(exampleBook4.title, exampleBook4.premise, exampleBook4.genre, exampleBook4.theme)
        )
        store.dispatch(
          addBook(exampleBook5.title, exampleBook5.premise, exampleBook5.genre, exampleBook5.theme)
        )
        const stateAfterCharactersAndBooksAdd = store.getState()
        it('should return the goldilocks characters', () => {
          const allCharacters = allCharactersSelector(stateAfterCharactersAndBooksAdd)
          expect(allCharacters).toHaveLength(2)
        })
        it('should have all the 5 new books added', () => {
          const allBookIds = allBookIdsSelector(stateAfterCharactersAndBooksAdd)
          expect(allBookIds).toHaveLength(6)
        })
        describe('and attach books randomly to characters', () => {
          store.dispatch(addBookToCharacter(1, 2))
          store.dispatch(addBookToCharacter(1, 6))
          store.dispatch(addBookToCharacter(1, 3))
          store.dispatch(addBookToCharacter(1, 4))
          store.dispatch(addBookToCharacter(1, 5))
          store.dispatch(addBookToCharacter(2, 2))
          store.dispatch(addBookToCharacter(2, 6))
          store.dispatch(addBookToCharacter(2, 3))
          store.dispatch(addBookToCharacter(2, 4))
          store.dispatch(addBookToCharacter(2, 5))
          const stateAfterAddingBooks = store.getState()
          const character1 = singleCharacterSelector(stateAfterAddingBooks, 1)
          const character2 = singleCharacterSelector(stateAfterAddingBooks, 2)
          const allBookIds = allBookIdsSelector(stateAfterAddingBooks)
          const allBooksWithCharactersOrdered =
            allBooksWithCharactersSortedByBookAllIdsPositionSelector(stateAfterAddingBooks)

          it('should have attached the 5 books attach to each character', () => {
            expect(character1.bookIds).toHaveLength(5)
            expect(character2.bookIds).toHaveLength(5)
          })

          it('character bookIds should have same order as the book bookIds', () => {
            const stringifiedAllBookIds = allBookIds.map((id) => String(id))
            const allBooksWithCharactersIdsOrdered = allBooksWithCharactersOrdered.map(({ id }) =>
              String(id)
            )
            const filteredBookIds = stringifiedAllBookIds.filter((id) =>
              allBooksWithCharactersIdsOrdered.includes(id)
            )
            expect(filteredBookIds).toEqual(allBooksWithCharactersIdsOrdered)
          })
        })
      })
    })
  })
})
