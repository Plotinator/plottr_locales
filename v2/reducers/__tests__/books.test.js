import { omit } from 'lodash'

import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { eight_sequences_template } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import selectors from '../../selectors'
import actions from '../../actions'
import { lineFromTemplate } from '../../template'

const { allBooksSelector } = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)

const { addBookFromTemplate } = wiredUpActions.book
const { loadFile } = wiredUpActions.ui

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

describe('addBookFromTemplate', () => {
  describe('given a template that lacks a template id', () => {
    const store = initialStore()
    const originalBooks = allBooksSelector(store.getState())
    let template = null
    lineFromTemplate(eight_sequences_template, '2023.12.20', '', (e, t) => {
      if (e) {
        throw e
      } else {
        template = t
      }
    })
    store.dispatch(addBookFromTemplate(omit(template, 'id')))
    it('should not change the book state', () => {
      expect(allBooksSelector(store.getState())).toBe(originalBooks)
    })
  })
  describe('given a template that has a template id', () => {
    const store = initialStore()
    let template = null
    lineFromTemplate(eight_sequences_template, '2023.12.20', '', (e, t) => {
      if (e) {
        throw e
      } else {
        template = t
      }
    })
    store.dispatch(addBookFromTemplate(template))
    it('should add the book with a title, theme, genre and premise', () => {
      expect(allBooksSelector(store.getState())).toEqual({
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
          genre: '',
          id: 2,
          imageId: null,
          premise: '',
          templates: [],
          theme: '',
          timelineTemplates: ['pl2'],
          title: '',
        },
        allIds: [1, 2],
      })
    })
  })
})
