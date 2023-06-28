import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import selectors from '../index'
import actions from '../../actions'

const wiredUpActions = actions(pltrAdaptor)
const { loadFile, changeCurrentTimeline, changeCurrentView } = wiredUpActions.ui
const { addBook, addNote } = wiredUpActions.note
const addNewBook = wiredUpActions.book.addBook

const { booksFilterItemsSelector } = selectors(pltrAdaptor)

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

describe('booksFilterItemsSelector', () => {
  describe("given that we're on the notes tab", () => {
    describe('and no note has a book associated with it', () => {
      const store = initialStore()
      store.dispatch(addNote())
      store.dispatch(changeCurrentTimeline(1))
      store.dispatch(changeCurrentView('notes'))
      it('should produce an empty books object', () => {
        expect(booksFilterItemsSelector(store.getState())).toEqual({ allIds: [] })
      })
    })
    describe('and a note has a book associated with it', () => {
      const store = initialStore()
      store.dispatch(addNote())
      store.dispatch(addBook(1, 1))
      store.dispatch(changeCurrentTimeline(1))
      store.dispatch(changeCurrentView('notes'))
      it('should produce those books', () => {
        expect(booksFilterItemsSelector(store.getState())).toEqual({
          1: {
            genre: '',
            id: 1,
            imageId: null,
            premise: '',
            templates: [],
            theme: '',
            timelineTemplates: [],
            title: 'Test file',
          },
          allIds: ['1'],
        })
      })
    })
    describe('and two notes associated with different books', () => {
      const store = initialStore()
      store.dispatch(addNote())
      store.dispatch(addNote())
      store.dispatch(addNewBook())
      store.dispatch(addBook(1, 1))
      store.dispatch(addBook(2, 2))
      store.dispatch(changeCurrentTimeline(1))
      store.dispatch(changeCurrentView('notes'))
      it('should produce all books', () => {
        const result = booksFilterItemsSelector(store.getState())
        expect(result).toEqual({
          1: {
            genre: '',
            id: 1,
            imageId: null,
            premise: '',
            templates: [],
            theme: '',
            timelineTemplates: [],
            title: 'Test file',
          },
          2: {
            genre: undefined,
            id: 2,
            imageId: null,
            premise: undefined,
            templates: [],
            theme: undefined,
            timelineTemplates: [],
            title: undefined,
          },
          allIds: ['1', '2'],
        })
      })
    })
    describe('and two notes where only one is associated with a book', () => {
      const store = initialStore()
      store.dispatch(addNote())
      store.dispatch(addNote())
      store.dispatch(addNewBook())
      store.dispatch(addBook(1, 1))
      store.dispatch(changeCurrentTimeline(1))
      store.dispatch(changeCurrentView('notes'))
      it('should produce only the associated book', () => {
        expect(booksFilterItemsSelector(store.getState())).toEqual({
          1: {
            genre: '',
            id: 1,
            imageId: null,
            premise: '',
            templates: [],
            theme: '',
            timelineTemplates: [],
            title: 'Test file',
          },
          allIds: ['1'],
        })
      })
    })
  })
})
