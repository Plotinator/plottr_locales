import { emptyFile } from '../../store/newFileState'
import selectors from '../../selectors'
import actions from '../../actions'
import { configureStore, pltrAdaptor } from './fixtures/testStore'
import placeholder_test_file from './fixtures/placeholder-test-file.json'
import placeholder_test_file_missing_middle from './fixtures/placeholder-test-file-missing-middle.json'

const wiredUpActions = actions(pltrAdaptor)

const { loadFile } = wiredUpActions.ui

const { secondTierBeatsInAtLeastTwoTierArrangementSelector } = selectors(pltrAdaptor)

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

describe('secondTierBeatsInAtLeastTwoTierArrangementSelector', () => {
  describe('given an empty file', () => {
    const store = initialStore()
    it('should produce an empty array', () => {
      expect(secondTierBeatsInAtLeastTwoTierArrangementSelector(store.getState())).toEqual([])
    })
  })
  describe('given a file with three tiers and a missing first beat', () => {
    const store = initialStore()
    store.dispatch(
      loadFile(
        'placeholders',
        false,
        placeholder_test_file,
        placeholder_test_file.file.version,
        'device://tmp/placeholders.pltr'
      )
    )
    it('should produce a placeholder for the first beat regardless', () => {
      const beats = secondTierBeatsInAtLeastTwoTierArrangementSelector(store.getState())
      expect(beats).toEqual([
        {
          type: 'insert-placeholder',
        },
        {
          type: 'insert-placeholder',
        },
        {
          autoOutlineSort: true,
          bookId: 1,
          expanded: true,
          fromTemplateId: null,
          id: 7,
          position: 0,
          time: 0,
          title: 'auto',
        },
      ])
    })
  })
  describe('given a file with three tiers and missing beats in the middle', () => {
    const store = initialStore()
    store.dispatch(
      loadFile(
        'placeholders',
        false,
        placeholder_test_file_missing_middle,
        placeholder_test_file_missing_middle.file.version,
        'device://tmp/placeholders.pltr'
      )
    )
    it('should produce a placeholder for the first beat regardless', () => {
      const beats = secondTierBeatsInAtLeastTwoTierArrangementSelector(store.getState())
      expect(beats).toEqual([
        {
          autoOutlineSort: true,
          bookId: 1,
          expanded: true,
          fromTemplateId: null,
          id: 23,
          position: 0,
          time: 0,
          title: 'auto',
        },
        {
          type: 'insert-placeholder',
        },
        {
          type: 'insert-placeholder',
        },
        {
          autoOutlineSort: true,
          bookId: 1,
          expanded: true,
          fromTemplateId: null,
          id: 25,
          position: 0,
          time: 0,
          title: 'auto',
        },
      ])
    })
  })
})
