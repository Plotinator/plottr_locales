import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import selectors from '../index'
import actions from '../../actions'

const wiredUpActions = actions(pltrAdaptor)
const { loadFile } = wiredUpActions.ui
const { addCharacter } = wiredUpActions.character
const { addBook } = wiredUpActions.book
const addBookToCharacter = wiredUpActions.character.addBook

const {
  allBooksWithCharactersInThemSelector,
  characterBookCategoriesSelector,
  allBookIdsSelector,
  allCharactersSelector,
  singleCharacterSelector,
  allBooksWithCharactersSortedByBookAllIdsPositionSelector,
} = selectors(pltrAdaptor)

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

describe('characterBookCategoriesSelector', () => {
  describe('given a store with no characters', () => {
    it('should produce the empty array', () => {
      const store = initialStore()
      const initialState = store.getState()
      expect(characterBookCategoriesSelector(initialState)).toEqual([])
    })
  })
  describe('given a store with a character', () => {
    describe('and a single book', () => {
      it('should produce an array with a single category called "Not in Book" with the book id in an array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        expect(characterBookCategoriesSelector(initialState)).toEqual([
          {
            glyph: 'plus',
            lineAbove: true,
            displayHeading: true,
            key: 'Not in Book',
            'Not in Book': [1],
          },
        ])
      })
      describe('and that character is associated with that book', () => {
        it('should produce an array with a single category, called "Characters In Book" with the book id in an array as the value', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          const initialState = store.getState()
          expect(characterBookCategoriesSelector(initialState)).toEqual([
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': [1],
            },
          ])
        })
      })
    })
    describe('and two books', () => {
      it('should produce an array with a single category, called "Not in Book" with the book ids in the array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBook())
        const initialState = store.getState()
        expect(characterBookCategoriesSelector(initialState)).toEqual([
          {
            glyph: 'plus',
            lineAbove: true,
            displayHeading: true,
            key: 'Not in Book',
            'Not in Book': [1],
          },
        ])
      })
      describe('and that character is associated with the first book', () => {
        it('should produce an array with two categories, called "Characters In Book" & "Not in Book" with the corresponding book ids', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBook())
          store.dispatch(addBookToCharacter(1, 1))
          const initialState = store.getState()
          expect(characterBookCategoriesSelector(initialState)).toEqual([
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': [1],
            },
          ])
        })
      })
      describe('and two characters', () => {
        describe('and the first character is associated with the first book', () => {
          it('should produce an array with two categories, called "Characters In Book" & "Not in Book" with the corresponding book ids', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addCharacter('Jane Doe'))
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            const initialState = store.getState()
            expect(characterBookCategoriesSelector(initialState)).toEqual([
              {
                displayHeading: false,
                key: 'Characters In Book',
                'Characters In Book': [1],
              },
              {
                glyph: 'plus',
                lineAbove: true,
                displayHeading: true,
                key: 'Not in Book',
                'Not in Book': [2],
              },
            ])
          })
        })
      })
    })
  })
})

describe('allBooksWithCharactersInThemSelector', () => {
  describe('given the empty file state', () => {
    it('should produce an object containing only the untitled book', () => {
      const store = initialStore()
      const state = store.getState()
      expect(allBooksWithCharactersInThemSelector(state)).toEqual({
        1: {
          id: 1,
          title: 'Test file',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
      })
    })
  })
  describe('given a file with two books', () => {
    it('should produce an object containing both books', () => {
      const store = initialStore()
      store.dispatch(addBook('', '', '', ''))
      const state = store.getState()
      expect(allBooksWithCharactersInThemSelector(state)).toEqual({
        1: {
          id: 1,
          title: 'Test file',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
        2: {
          id: 2,
          title: '',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
      })
    })
    describe('and one of the books is associated with the first character', () => {
      it('should only produce the first book', () => {
        const store = initialStore()
        store.dispatch(addBook())
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        const state = store.getState()
        expect(allBooksWithCharactersInThemSelector(state)).toEqual({
          1: {
            id: 1,
            title: 'Test file',
            premise: '',
            genre: '',
            theme: '',
            templates: [],
            timelineTemplates: [],
            imageId: null,
          },
        })
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
