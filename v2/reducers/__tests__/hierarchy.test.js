import { omit } from 'lodash'

import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { post_multi_hierarchy_zelda } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { hierarchyLevel } from '../../store/initialState'
import selectors from '../../selectors'
import actions from '../../actions'

const { hierarchyLevelsForAnotherBookSelector, allHierarchyLevelsSelector } = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile, changeCurrentTimeline } = wiredUpActions.ui
const { addBook, deleteBook } = wiredUpActions.book
const { editHierarchyLevel, setHierarchyLevels } = wiredUpActions.hierarchyLevels

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
  store.dispatch(addBook('Second Book', 'A great story', 'Action', 'Careful what you wish for'))
  store.dispatch(changeCurrentTimeline(1))
  return store
}

// addBook is called in the setup
describe('addBook', () => {
  it('should add an appropriately keyed hierarchy level', () => {
    const store = initialStore()
    const hierarchy = hierarchyLevelsForAnotherBookSelector(store.getState(), 2)
    expect(hierarchy).toEqual({ 0: hierarchyLevel })
  })
})

describe('deleteBook', () => {
  it('should remove the hierarchy levels for that book', () => {
    const store = initialStore()
    store.dispatch(deleteBook(1))
    const hierarchiesForBookOne = hierarchyLevelsForAnotherBookSelector(store.getState(), 1)
    const hierarchiesForBookTwo = hierarchyLevelsForAnotherBookSelector(store.getState(), 2)
    expect(hierarchiesForBookOne).toBeUndefined()
    expect(hierarchiesForBookTwo).toBeDefined()
  })
})

describe('modifying the hierarchy', () => {
  describe('given a file with hierarchy levels for all books', () => {
    it('should only overwrite the levels for the current book', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(
        editHierarchyLevel({
          level: 0,
          color: 'blue',
        })
      )
      expect(hierarchyLevelsForAnotherBookSelector(store.getState(), 2)).toEqual(
        hierarchyLevelsForAnotherBookSelector(initialState, 2)
      )
      const resultLevel = hierarchyLevelsForAnotherBookSelector(store.getState(), 1)[0]
      const initialLevel = hierarchyLevelsForAnotherBookSelector(initialState, 1)[0]
      expect(omit(resultLevel, 'color')).toEqual(omit(initialLevel, 'color'))
      expect(resultLevel.color).toEqual('blue')
    })
    describe('when changing the book to 2', () => {
      it("should change that book's hierarchy instead", () => {
        const store = initialStore()
        const initialState = store.getState()
        store.dispatch(changeCurrentTimeline(2))
        store.dispatch(
          editHierarchyLevel({
            level: 0,
            color: 'blue',
          })
        )
        expect(hierarchyLevelsForAnotherBookSelector(store.getState(), 1)).toEqual(
          hierarchyLevelsForAnotherBookSelector(initialState, 1)
        )
        const resultLevel = hierarchyLevelsForAnotherBookSelector(store.getState(), 2)[0]
        const initialLevel = hierarchyLevelsForAnotherBookSelector(initialState, 2)[0]
        expect(omit(resultLevel, 'color')).toEqual(omit(initialLevel, 'color'))
        expect(resultLevel.color).toEqual('blue')
      })
    })
    describe('when there are multiple levels in the current book', () => {
      it('should change the appropriate level', () => {
        const store = initialStore()
        store.dispatch(setHierarchyLevels([hierarchyLevel, hierarchyLevel]))
        const initialState = store.getState()
        store.dispatch(
          editHierarchyLevel({
            level: 1,
            color: 'blue',
          })
        )
        expect(hierarchyLevelsForAnotherBookSelector(store.getState(), 2)).toEqual(
          hierarchyLevelsForAnotherBookSelector(initialState, 2)
        )
        const resultLevel = hierarchyLevelsForAnotherBookSelector(store.getState(), 1)[1]
        const initialLevel = hierarchyLevelsForAnotherBookSelector(store.getState(), 1)[1]
        expect(omit(resultLevel, 'color')).toEqual(omit(initialLevel, 'color'))
        expect(resultLevel.color).toEqual('blue')
      })
    })
    describe('when attempting to set the levels to empty', () => {
      it('should leave the state as-is (this is ilegal)', () => {
        const store = initialStore()
        const initialState = store.getState()
        store.dispatch(setHierarchyLevels([]))
        expect(allHierarchyLevelsSelector(store.getState())).toEqual(
          allHierarchyLevelsSelector(initialState)
        )
      })
    })
    describe('when attempting to set the levels to more than three', () => {
      it('should leave the state as-is (this is ilegal)', () => {
        const store = initialStore()
        const initialState = store.getState()
        store.dispatch(
          setHierarchyLevels([hierarchyLevel, hierarchyLevel, hierarchyLevel, hierarchyLevel])
        )
        expect(allHierarchyLevelsSelector(store.getState())).toEqual(
          allHierarchyLevelsSelector(initialState)
        )
      })
    })
  })
  describe('when going from 1 to 2 levels', () => {
    it('should default the lowest level name to "scene" when both levels would be "chapter"', () => {
      const store = initialStore()
      const initialHierarchyLevelName = hierarchyLevelsForAnotherBookSelector(
        store.getState(),
        1
      )[0].name
      expect(initialHierarchyLevelName).toEqual('Chapter')
      store.dispatch(setHierarchyLevels([hierarchyLevel, hierarchyLevel]))
      const resultHierarcyhLevels = hierarchyLevelsForAnotherBookSelector(store.getState(), 1)
      expect(resultHierarcyhLevels[0].name).not.toEqual(resultHierarcyhLevels[1].name)
      expect(resultHierarcyhLevels[0].name).toEqual('Chapter')
      expect(resultHierarcyhLevels[1].name).toEqual('Scene')
    })
  })
})
