import { omit } from 'lodash'

import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import selectors from '../../selectors'
import actions from '../../actions'
import { lineFromTemplate } from '../../template'
import { eight_sequences_template } from './fixtures'

const { allLinesSelector } = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile } = wiredUpActions.ui
const { addBookFromTemplate } = wiredUpActions.book

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
  describe('given a template without lines', () => {
    const store = initialStore()
    const originalLines = allLinesSelector(store.getState())
    let template = null
    lineFromTemplate(eight_sequences_template, '2023.12.20', '', (e, t) => {
      if (e) {
        throw e
      } else {
        template = t
      }
    })
    store.dispatch(addBookFromTemplate(omit(template, 'lines')))
    it('should not change the state of lines', () => {
      expect(allLinesSelector(store.getState())).toBe(originalLines)
    })
  })
  describe('given a template with lines', () => {
    const store = initialStore()
    let template = null
    const originalLines = allLinesSelector(store.getState())
    lineFromTemplate(eight_sequences_template, '2023.12.20', '', (e, t) => {
      if (e) {
        throw e
      } else {
        template = t
      }
    })
    store.dispatch(addBookFromTemplate(template))
    const withoutChangingData = (line) => {
      return omit(line, ['position', 'id', 'fromTemplateId', 'bookId', 'color'])
    }
    it('should add those lines', () => {
      expect(allLinesSelector(store.getState()).map(withoutChangingData)).toEqual(
        originalLines
          .map(withoutChangingData)
          .concat(eight_sequences_template.templateData.lines.map(withoutChangingData))
      )
    })
  })
})
