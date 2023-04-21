import { omit, differenceWith, isEqual, sortBy } from 'lodash'

import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { multi_tier_zelda } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { hierarchyLevel } from '../../store/initialState'
import { maxDepth, depth, nodeParent, findNode } from '../tree'
import actions from '../../actions'
import selectors from '../../selectors'

const { allBeatsSelector, beatsForAnotherBookSelector, fullFileStateSelector } =
  selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { changeCurrentTimeline, setTimelineView, loadFile } = wiredUpActions.ui
const { addBook } = wiredUpActions.book
const { setHierarchyLevels } = wiredUpActions.hierarchyLevels
const { insertBeat } = wiredUpActions.beat

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

describe('modifying the hierarchy (and its impact on beats)', () => {
  describe('when the level count does not change', () => {
    it('should not change the beats state', () => {
      const store = initialStore()
      const initialBeats = allBeatsSelector(store.getState())
      store.dispatch(setHierarchyLevels([{ 0: hierarchyLevel }]))
      const beatsAfter = allBeatsSelector(store.getState())
      expect(beatsAfter).toBe(initialBeats)
    })
  })
  describe('when the level count is set to more than three', () => {
    it('should not change the beats state', () => {
      const store = initialStore()
      const initialBeats = allBeatsSelector(store.getState())
      store.dispatch(
        setHierarchyLevels([
          { 0: hierarchyLevel },
          { 0: hierarchyLevel },
          { 0: hierarchyLevel },
          { 0: hierarchyLevel },
        ])
      )
      const beatsAfter = allBeatsSelector(store.getState())
      expect(beatsAfter).toBe(initialBeats)
    })
  })
  describe('when the level count is set to less than one', () => {
    it('should not change the beats state', () => {
      const store = initialStore()
      const initialBeats = allBeatsSelector(store.getState())
      store.dispatch(setHierarchyLevels([]))
      const beatsAfter = allBeatsSelector(store.getState())
      expect(initialBeats).toBe(beatsAfter)
    })
  })
  describe('when the level count does change', () => {
    describe('and the current timeline is book 1', () => {
      it('should adjust the number of levels of beats in book 1', () => {
        const store = initialStore()
        const initialBeats = beatsForAnotherBookSelector(store.getState(), 1)
        store.dispatch(setHierarchyLevels([{ 0: hierarchyLevel }, { 0: hierarchyLevel }]))
        const beatsAfter = beatsForAnotherBookSelector(store.getState(), 1)
        expect(maxDepth('id')(beatsAfter)).toBeGreaterThan(maxDepth('id')(initialBeats))
        expect(maxDepth('id')(beatsAfter)).toEqual(1)
      })
    })
    describe('and the current timeline is book 2', () => {
      it('should adjust the number of levels of beats in book 2', () => {
        const store = initialStore()
        const initialBeats = beatsForAnotherBookSelector(store.getState(), 2)
        store.dispatch(changeCurrentTimeline(2))
        store.dispatch(setHierarchyLevels([{ 0: hierarchyLevel }, { 0: hierarchyLevel }]))
        const beatsAfter = beatsForAnotherBookSelector(store.getState(), 2)
        expect(maxDepth('id')(beatsAfter)).toBeGreaterThan(maxDepth('id')(initialBeats))
        expect(maxDepth('id')(beatsAfter)).toEqual(1)
      })
    })
  })
})

const initialMultiTierZeldaStoreOnStacked = () => {
  const store = configureStore()
  store.dispatch(
    loadFile(
      'Test file',
      false,
      multi_tier_zelda,
      multi_tier_zelda.file.version,
      'device://tmp/multi-tier-zelda.pltr'
    )
  )
  return store
}

const withoutStateWeDontCareAbout = (state) => {
  return {
    ...state,
    file: omit(state.file, ['dirty', 'versionStamp']),
    project: omit(state.project, 'unsavedChanges'),
  }
}

const difference = (xs, ys) => differenceWith(xs, ys, isEqual)
const omitPosition = (x) => omit(x, 'position')

describe('insertBeat', () => {
  describe('given a multi-tier file', () => {
    describe("given that we're not on the stacked timeline view", () => {
      describe('and we add a peer to an act', () => {
        const store = initialMultiTierZeldaStoreOnStacked()
        const initialState = store.getState()
        store.dispatch(insertBeat(7, 35))
        const result = store.getState()
        it('should not modify anything outside of beats', () => {
          expect(withoutStateWeDontCareAbout(omit(fullFileStateSelector(result), 'beats'))).toEqual(
            withoutStateWeDontCareAbout(omit(fullFileStateSelector(initialState), 'beats'))
          )
        })
        const initialBeats = beatsForAnotherBookSelector(initialState, 7)
        const beatsAfter = beatsForAnotherBookSelector(result, 7)
        it('should only add the act', () => {
          const newBeats = difference(
            Object.values(beatsAfter.index).map(omitPosition),
            Object.values(initialBeats.index).map(omitPosition)
          )
          expect(newBeats.length).toEqual(1)
          expect(depth(beatsAfter, newBeats[0].id)).toBe(0)
        })
      })
      describe('and we add a peer to the chapter', () => {
        const store = initialMultiTierZeldaStoreOnStacked()
        const initialState = store.getState()
        store.dispatch(insertBeat(7, 34))
        const result = store.getState()
        it('should not modify anything outside of beats', () => {
          expect(withoutStateWeDontCareAbout(omit(fullFileStateSelector(result), 'beats'))).toEqual(
            withoutStateWeDontCareAbout(omit(fullFileStateSelector(initialState), 'beats'))
          )
        })
        const initialBeats = beatsForAnotherBookSelector(initialState, 7)
        const beatsAfter = beatsForAnotherBookSelector(result, 7)
        it('should only add the act', () => {
          const newBeats = difference(
            Object.values(beatsAfter.index).map(omitPosition),
            Object.values(initialBeats.index).map(omitPosition)
          )
          expect(newBeats.length).toBe(1)
          expect(depth(beatsAfter, newBeats[0].id)).toBe(1)
        })
      })
      describe('and we add a peer to a scene', () => {
        const store = initialMultiTierZeldaStoreOnStacked()
        const initialState = store.getState()
        store.dispatch(insertBeat(7, 26))
        const result = store.getState()
        it('should not modify anything outside of beats', () => {
          expect(withoutStateWeDontCareAbout(omit(fullFileStateSelector(result), 'beats'))).toEqual(
            withoutStateWeDontCareAbout(omit(fullFileStateSelector(initialState), 'beats'))
          )
        })
        const initialBeats = beatsForAnotherBookSelector(initialState, 7)
        const beatsAfter = beatsForAnotherBookSelector(result, 7)
        it('should only add the act', () => {
          const newBeats = difference(
            Object.values(beatsAfter.index).map(omitPosition),
            Object.values(initialBeats.index).map(omitPosition)
          )
          expect(newBeats.length).toBe(1)
          expect(depth(beatsAfter, newBeats[0].id)).toBe(2)
        })
      })
    })
    describe("given that we're on the stacked timeline view", () => {
      describe('and we add a peer to an act', () => {
        const store = initialMultiTierZeldaStoreOnStacked()
        store.dispatch(setTimelineView('stacked'))
        const initialState = store.getState()
        store.dispatch(insertBeat(7, 35))
        const result = store.getState()
        it('should not modify anything outside of beats', () => {
          expect(withoutStateWeDontCareAbout(omit(fullFileStateSelector(result), 'beats'))).toEqual(
            withoutStateWeDontCareAbout(omit(fullFileStateSelector(initialState), 'beats'))
          )
        })
        const initialBeats = beatsForAnotherBookSelector(initialState, 7)
        const beatsAfter = beatsForAnotherBookSelector(result, 7)
        const newBeats = difference(
          Object.values(beatsAfter.index).map(omitPosition),
          Object.values(initialBeats.index).map(omitPosition)
        )
        it('should add the act, chapter and a scene', () => {
          expect(newBeats.length).toBe(3)
          const beatDepths = newBeats.map((beat) => {
            return depth(beatsAfter, beat.id)
          })
          expect(beatDepths).toEqual(expect.arrayContaining([0, 1, 2]))
        })
        it('should correctly assign parent beats', () => {
          const sortedByDepth = sortBy(newBeats, (beat) => {
            return depth(beatsAfter, beat.id)
          })
          expect(nodeParent(beatsAfter, sortedByDepth[0].id)).toBe(null)
          expect(nodeParent(beatsAfter, sortedByDepth[1].id)).toBe(sortedByDepth[0].id)
          expect(nodeParent(beatsAfter, sortedByDepth[2].id)).toBe(sortedByDepth[1].id)
        })
      })
      describe('and we add a peer to the chapter', () => {
        const store = initialMultiTierZeldaStoreOnStacked()
        store.dispatch(setTimelineView('stacked'))
        const initialState = store.getState()
        store.dispatch(insertBeat(7, 34))
        const result = store.getState()
        it('should not modify anything outside of beats', () => {
          expect(withoutStateWeDontCareAbout(omit(fullFileStateSelector(result), 'beats'))).toEqual(
            withoutStateWeDontCareAbout(omit(fullFileStateSelector(initialState), 'beats'))
          )
        })
        const initialBeats = beatsForAnotherBookSelector(initialState, 7)
        const beatsAfter = beatsForAnotherBookSelector(result, 7)
        const newBeats = difference(
          Object.values(beatsAfter.index).map(omitPosition),
          Object.values(initialBeats.index).map(omitPosition)
        )
        it('should add the chapter and a scene', () => {
          expect(newBeats.length).toBe(2)
          const beatDepths = newBeats.map((beat) => {
            return depth(beatsAfter, beat.id)
          })
          expect(beatDepths).toEqual(expect.arrayContaining([1, 2]))
        })
        it('should correctly assign parent beats', () => {
          const sortedByDepth = sortBy(newBeats, (beat) => {
            return depth(beatsAfter, beat.id)
          })
          expect(
            omit(findNode(beatsAfter, nodeParent(beatsAfter, sortedByDepth[0].id)), 'id')
          ).toEqual(omit(findNode(initialBeats, 34), 'id'))
          expect(nodeParent(beatsAfter, sortedByDepth[1].id)).toBe(sortedByDepth[0].id)
        })
      })
      describe('and we add a peer to a scene', () => {
        const store = initialMultiTierZeldaStoreOnStacked()
        store.dispatch(setTimelineView('stacked'))
        const initialState = store.getState()
        store.dispatch(insertBeat(7, 26))
        const result = store.getState()
        it('should not modify anything outside of beats', () => {
          expect(withoutStateWeDontCareAbout(omit(fullFileStateSelector(result), 'beats'))).toEqual(
            withoutStateWeDontCareAbout(omit(fullFileStateSelector(initialState), 'beats'))
          )
        })
        const initialBeats = beatsForAnotherBookSelector(initialState, 7)
        const beatsAfter = beatsForAnotherBookSelector(result, 7)
        const newBeats = difference(
          Object.values(beatsAfter.index).map(omitPosition),
          Object.values(initialBeats.index).map(omitPosition)
        )
        it('should add a scene', () => {
          expect(newBeats.length).toBe(1)
          const beatDepths = newBeats.map((beat) => {
            return depth(beatsAfter, beat.id)
          })
          expect(beatDepths).toEqual(expect.arrayContaining([2]))
        })
        it('should correctly assign parent beats', () => {
          const sortedByDepth = sortBy(newBeats, (beat) => {
            return depth(beatsAfter, beat.id)
          })
          expect(
            omit(findNode(beatsAfter, nodeParent(beatsAfter, sortedByDepth[0].id)), [
              'id',
              'templates',
              'position',
            ])
          ).toEqual(omit(findNode(initialBeats, 26), ['id', 'templates', 'position']))
        })
      })
    })
  })
})
