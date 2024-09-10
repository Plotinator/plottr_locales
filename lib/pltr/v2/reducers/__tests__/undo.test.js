import {
  FORCED_BATCH_START,
  FORCED_BATCH_END,
  UNDO,
  REDO,
  EDIT_CARD_CUSTOM_ATTRIBUTE,
  EDIT_CARD_TEMPLATE_ATTRIBUTE,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../../constants/ActionTypes'
import { addCharacterCategory } from '../../actions/categories'
import {
  editCharacterAttributeValue,
  editCharacterTemplateAttribute,
  createCharacterAttribute,
} from '../../actions/characters'
import { editPlaceTemplateAttribute, editPlaceCustomAttribute } from '../../actions/places'
import { editCardTemplateAttribute, editCardCustomAttribute } from '../../actions/cards'
import { editNoteTemplateAttribute, editNoteCustomAttribute } from '../../actions/notes'
import { loadFile, changeCurrentTimeline } from '../../actions/ui'
import {
  isAttributeEditThatShouldntBeBatched,
  entry,
  handleBatchStart,
  handleBatchEnd,
  handleUndo,
  handleRedo,
  advanceHistory,
  INITIAL_STATE,
  handleUndoNTimes,
  handleRedoNTimes,
} from '../undo'
import { emptyFile } from '../../store/newFileState'
import { configureStore } from './fixtures/testStore'

const emptyStore = () => {
  const EMPTY_FILE = emptyFile('Test file')
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
  store.dispatch(createCharacterAttribute('text', 'test'))
  store.dispatch(createCharacterAttribute('paragraph', 'test'))
  store.dispatch(changeCurrentTimeline(1))
  return store
}

describe('isAttributeEditThatShouldntBeBatched', () => {
  describe('given a non-attribute edit action', () => {
    it('should produce false', () => {
      expect(isAttributeEditThatShouldntBeBatched(addCharacterCategory('Test'))).toBeFalsy()
    })
  })
  const store = emptyStore()
  const getState = () => store.getState()
  describe('given any attribute action that edits a text field', () => {
    it('editCharacterAttributeValue: should produce false', () => {
      let action = null
      const dispatch = (dispatchedAction) => {
        action = dispatchedAction
      }
      editCharacterAttributeValue(1, 1, 'test', 'blah')(dispatch, getState)
      expect(isAttributeEditThatShouldntBeBatched(action)).toBeFalsy()
    })
    it('editCharacterTemplateAttribute: should produce false', () => {
      let action = null
      const dispatch = (dispatchedAction) => {
        action = dispatchedAction
      }
      editCharacterTemplateAttribute(1, 2, 'test', 'blah', null)(dispatch, getState)
      expect(isAttributeEditThatShouldntBeBatched(action)).toBeFalsy()
    })
    it('editPlaceTemplateAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(editPlaceTemplateAttribute(1, 2, 'test', 'blah', null))
      ).toBeFalsy()
    })
    it('editPlaceCustomAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(editPlaceCustomAttribute(1, 'test', 'blah', null))
      ).toBeFalsy()
    })
    it('editCardTemplateAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(editCardTemplateAttribute(1, 2, 'test', 'blah', null))
      ).toBeFalsy()
    })
    it('editCardCustomAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(editCardCustomAttribute(1, 'test', 'blah', null))
      ).toBeFalsy()
    })
    it('editNoteTemplateAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(editNoteTemplateAttribute(1, 2, 'test', 'blah', null))
      ).toBeFalsy()
    })
    it('editNoteCustomAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(editNoteCustomAttribute(1, 'test', 'blah', null))
      ).toBeFalsy()
    })
  })
  describe('given any attribute action that edits a paragraph field', () => {
    it('editCharacterAttributeValue: should produce false', () => {
      let action = null
      const dispatch = (dispatchedAction) => {
        action = dispatchedAction
      }
      editCharacterAttributeValue(
        1,
        2,
        [{ children: [{ text: 'blah' }] }],
        'test'
      )(dispatch, getState)
      expect(isAttributeEditThatShouldntBeBatched(action)).toBeTruthy()
    })
    it('editCharacterTemplateAttribute: should produce false', () => {
      let action = null
      const dispatch = (dispatchedAction) => {
        action = dispatchedAction
      }
      editCharacterTemplateAttribute(
        1,
        2,
        'test',
        [{ children: [{ text: 'blah' }] }],
        null
      )(dispatch, getState)
      expect(isAttributeEditThatShouldntBeBatched(action)).toBeTruthy()
    })
    it('editPlaceTemplateAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(
          editPlaceTemplateAttribute(1, 2, 'test', [{ children: [{ text: 'blah' }] }], null)
        )
      ).toBeTruthy()
    })
    it('editPlaceCustomAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(
          editPlaceCustomAttribute(1, 'test', [{ children: [{ text: 'blah' }] }], null)
        )
      ).toBeTruthy()
    })
    it('editCardTemplateAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(
          editCardTemplateAttribute(1, 2, 'test', [{ children: [{ text: 'blah' }] }], null)
        )
      ).toBeTruthy()
    })
    it('editCardCustomAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(
          editCardCustomAttribute(1, 'test', [{ children: [{ text: 'blah' }] }], null)
        )
      ).toBeTruthy()
    })
    it('editNoteTemplateAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(
          editNoteTemplateAttribute(1, 2, 'test', [{ children: [{ text: 'blah' }] }], null)
        )
      ).toBeTruthy()
    })
    it('editNoteCustomAttribute: should produce false', () => {
      expect(
        isAttributeEditThatShouldntBeBatched(
          editNoteCustomAttribute(1, 'test', [{ children: [{ text: 'blah' }] }], null)
        )
      ).toBeTruthy()
    })
  })
})

describe('entry', () => {
  describe('given an undefined action', () => {
    it('should produce null', () => {
      expect(entry(INITIAL_STATE)).toEqual(null)
    })
  })
  describe('given a null action', () => {
    it('should produce null', () => {
      expect(entry(INITIAL_STATE)).toEqual(null)
    })
  })
  describe('given an action without a shadow state', () => {
    it('should produce null', () => {
      expect(entry(INITIAL_STATE, { type: 'DO_THINGS' })).toEqual(null)
    })
  })
  describe('given an action with a shadow state', () => {
    describe('and a previous history element with a batch depth of zero', () => {
      it('should produce a value with state, an action type, a count of zero and a batchDepth of zero', () => {
        const state = { a: 1 }
        expect(entry(INITIAL_STATE, { type: 'DO_THINGS', _shadow: state })).toEqual({
          state,
          actionType: 'DO_THINGS',
          actionLabel: 'Do Things',
          count: 0,
          batchDepth: 0,
        })
      })
    })
    describe('and a previous history element with a bath depth of five', () => {
      it('should produce a value with a state, an action type, a count of zero and a batchDepth of five', () => {
        const state = { a: 1 }
        expect(
          entry(
            {
              ...INITIAL_STATE,
              history: [
                {
                  state,
                  actionType: 'DO_THINGS',
                  count: 0,
                  batchDepth: 5,
                },
              ],
            },
            { type: 'DO_THINGS', _shadow: state }
          )
        ).toEqual({
          state,
          actionType: 'DO_THINGS',
          actionLabel: 'Do Things',
          count: 0,
          batchDepth: 5,
        })
      })
    })
  })
})

describe('handleBatchStart', () => {
  describe('given a state with no history', () => {
    it('should produce a history with a single element, no future and a batch depth of 1', () => {
      const state = { a: 1 }
      expect(handleBatchStart(INITIAL_STATE, { type: FORCED_BATCH_START, _shadow: state })).toEqual(
        {
          ...INITIAL_STATE,
          history: [
            {
              state,
              actionType: FORCED_BATCH_START,
              actionLabel: 'Forced Batch Start',
              count: 0,
              batchDepth: 1,
            },
          ],
        }
      )
    })
    describe('given an action without a shadow state', () => {
      it('should produce the previous state', () => {
        expect(handleBatchStart(INITIAL_STATE, { type: FORCED_BATCH_START })).toEqual(INITIAL_STATE)
      })
    })
  })
  describe('given a state with a history', () => {
    describe('when the previous action was a FORCED_BATCH_START', () => {
      it('should produce a new batch state with a depth one greater than the historical entry', () => {
        const state = { a: 1 }
        expect(
          handleBatchStart(
            {
              ...INITIAL_STATE,
              history: [
                {
                  state,
                  actionType: FORCED_BATCH_START,
                  count: 0,
                  batchDepth: 1,
                },
              ],
            },
            { type: FORCED_BATCH_START, _shadow: state }
          )
        ).toEqual({
          ...INITIAL_STATE,
          history: [
            {
              state,
              actionType: FORCED_BATCH_START,
              actionLabel: 'Forced Batch Start',
              count: 0,
              batchDepth: 2,
            },
            {
              state,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 1,
            },
          ],
        })
      })
      describe('given an action without a shadow state', () => {
        it('should produce the previous state', () => {
          const state = { a: 1 }
          const initialState = {
            ...INITIAL_STATE,
            history: [
              {
                state,
                actionType: FORCED_BATCH_START,
                count: 0,
                batchDepth: 1,
              },
            ],
          }
          expect(handleBatchStart(initialState, { type: 'DO_THINGS' })).toEqual(initialState)
        })
      })
    })
    describe('when the previous action was not a FORCED_BATCH_START', () => {
      describe('and its batch depth is greater than zero', () => {
        it('should increase the batch depth of the previous history element', () => {
          const state = { a: 1 }
          expect(
            handleBatchStart(
              {
                ...INITIAL_STATE,
                history: [
                  {
                    state,
                    actionType: 'DO_THINGS',
                    count: 0,
                    batchDepth: 1,
                  },
                  {
                    state,
                    actionType: FORCED_BATCH_START,
                    count: 0,
                    batchDepth: 1,
                  },
                ],
              },
              { type: FORCED_BATCH_START, _shadow: state }
            )
          ).toEqual({
            ...INITIAL_STATE,
            history: [
              {
                state,
                actionType: 'DO_THINGS',
                count: 0,
                batchDepth: 2,
              },
              {
                state,
                actionType: FORCED_BATCH_START,
                count: 0,
                batchDepth: 1,
              },
            ],
          })
        })
        describe('given an action without a shadow state', () => {
          it('should produce the previous state', () => {
            const state = { a: 1 }
            const initialState = {
              ...INITIAL_STATE,
              history: [
                {
                  state,
                  actionType: 'DO_THINGS',
                  count: 0,
                  batchDepth: 1,
                },
                {
                  state,
                  actionType: FORCED_BATCH_START,
                  count: 0,
                  batchDepth: 1,
                },
              ],
            }
            expect(handleBatchStart(initialState, { type: 'DO_THINGS' })).toEqual(initialState)
          })
        })
      })
    })
  })
})

describe('handleBatchEnd', () => {
  describe('given there is no history', () => {
    it('should produce the given state', () => {
      const state = { a: 1 }
      expect(handleBatchEnd(INITIAL_STATE, { type: FORCED_BATCH_END, _shadow: state })).toEqual(
        INITIAL_STATE
      )
    })
  })
  describe('given there is a history', () => {
    describe('but the batch depth is 0', () => {
      it('should produce the current state', () => {
        const state = { a: 1 }
        const initialState = {
          ...INITIAL_STATE,
          history: [
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        expect(handleBatchEnd(initialState, { type: FORCED_BATCH_END, _shadow: state })).toEqual(
          initialState
        )
      })
    })
    describe('and a batch depth of 1', () => {
      describe('but there is no shadow state', () => {
        it('should produce the current state', () => {
          const state = { a: 1 }
          const initialState = {
            ...INITIAL_STATE,
            history: [
              {
                state,
                actionType: 'DO_THINGS',
                count: 0,
                batchDepth: 1,
              },
            ],
          }
          expect(handleBatchEnd(initialState, { type: FORCED_BATCH_END })).toEqual(initialState)
        })
      })
      describe('and there is a shadow state', () => {
        describe('and there was only one historical entry', () => {
          it('should produce a history with just that element and an indication of what was batched', () => {
            const state = { a: 1 }
            const initialState = {
              ...INITIAL_STATE,
              history: [
                {
                  state,
                  actionType: FORCED_BATCH_START,
                  count: 0,
                  batchDepth: 1,
                },
              ],
            }
            expect(
              handleBatchEnd(initialState, { type: FORCED_BATCH_END, _shadow: state })
            ).toEqual({
              ...INITIAL_STATE,
              history: [
                {
                  state,
                  actionType: FORCED_BATCH_START,
                  count: 0,
                  batchDepth: 0,
                  batchedActionTypes: [],
                },
              ],
            })
          })
        })
        describe('and there were many historical entries', () => {
          it('should produce a history with the entries up to the batch start collapsed into a single entry at the head and prior entries still in-tact', () => {
            const state = { a: 1 }
            const batchState = { b: 1 }
            const thirdState = { c: 2 }
            const fourthState = { d: 3 }
            const initialState = {
              ...INITIAL_STATE,
              history: [
                {
                  fourthState,
                  actionType: 'DO_A_FOURTH_THING',
                  count: 0,
                  batchDepth: 1,
                },
                {
                  thirdState,
                  actionType: 'DO_A_THIRD_THING',
                  count: 0,
                  batchDepth: 1,
                },
                {
                  state: batchState,
                  actionType: FORCED_BATCH_START,
                  count: 0,
                  batchDepth: 1,
                },
                {
                  state,
                  actionType: 'DO_OTHER_THINGS',
                  count: 0,
                  batchDepth: 0,
                },
                {
                  state,
                  actionType: 'DO_THINGS',
                  count: 0,
                  batchDepth: 0,
                },
              ],
            }
            expect(
              handleBatchEnd(initialState, { type: FORCED_BATCH_END, _shadow: state })
            ).toEqual({
              ...INITIAL_STATE,
              history: [
                {
                  state: batchState,
                  actionType: FORCED_BATCH_START,
                  count: 0,
                  batchDepth: 0,
                  batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
                },
                {
                  state,
                  actionType: 'DO_OTHER_THINGS',
                  count: 0,
                  batchDepth: 0,
                },
                {
                  state,
                  actionType: 'DO_THINGS',
                  count: 0,
                  batchDepth: 0,
                },
              ],
            })
          })
        })
      })
    })
    describe('and a batch depth of 2 or more', () => {
      describe('but there is no shadow state', () => {
        it('should produce the current state', () => {
          const state = { a: 1 }
          const initialState = {
            ...INITIAL_STATE,
            history: [
              {
                state,
                actionType: 'DO_THINGS',
                count: 0,
                batchDepth: 2,
              },
            ],
          }
          expect(handleBatchEnd(initialState, { type: FORCED_BATCH_END })).toEqual(initialState)
        })
      })
    })
  })
})

describe('handleUndo', () => {
  describe('if there is no shadow state', () => {
    it('should produce the current state', () => {
      const state = { a: 1 }
      const batchState = { b: 1 }
      const initialState = {
        ...INITIAL_STATE,
        history: [
          {
            state: batchState,
            actionType: FORCED_BATCH_START,
            count: 0,
            batchDepth: 0,
            batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
          },
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
      }
      expect(handleUndo(initialState, { type: UNDO })).toEqual(initialState)
    })
  })
  describe('if there is a shadow state', () => {
    it('should push the current state into the future and pop from the history', () => {
      const state = { a: 1 }
      const batchState = { b: 1 }
      const initialState = {
        ...INITIAL_STATE,
        history: [
          {
            state: batchState,
            actionType: FORCED_BATCH_START,
            count: 0,
            batchDepth: 0,
            batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
          },
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
      }
      const currentState = { zzz: 5 }
      expect(
        handleUndo(initialState, {
          type: UNDO,
          _shadow: currentState,
          id: 10,
          oldLabel: 'Do Something Amazing',
          oldType: 'DO_SOMETHING_AMAZING',
        })
      ).toEqual({
        ...initialState,
        history: [
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
        future: [
          {
            state: currentState,
            actionLabel: 'Do Something Amazing',
            actionType: 'DO_SOMETHING_AMAZING',
            count: 0,
            batchDepth: 0,
          },
        ],
        generation: 1,
        changeId: 10,
        recentlyUndidOrRedid: 'undid',
      })
    })
    describe('and we recently undid', () => {
      it('should do the undo and also indicate that the undo/redo popup should be visible', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          history: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
          recentlyUndidOrRedid: 'undid',
        }
        const currentState = { zzz: 5 }
        expect(
          handleUndo(initialState, {
            type: UNDO,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual({
          ...initialState,
          history: [
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
          future: [
            {
              state: currentState,
              actionLabel: 'Do Something Amazing',
              actionType: 'DO_SOMETHING_AMAZING',
              count: 0,
              batchDepth: 0,
            },
          ],
          generation: 1,
          changeId: 10,
          recentlyUndidOrRedid: 'undid',
          showUndoRedo: true,
        })
      })
    })
    describe('but there is no history', () => {
      const state = { zzz: 5 }
      it('should leave the state as-is', () => {
        expect(handleUndo(INITIAL_STATE, { type: UNDO, _shadow: state })).toEqual(INITIAL_STATE)
      })
    })
  })
})

describe('handleRedo', () => {
  describe('if there is no shadow state', () => {
    it('should produce the current state', () => {
      const state = { a: 1 }
      const batchState = { b: 1 }
      const initialState = {
        ...INITIAL_STATE,
        future: [
          {
            state: batchState,
            actionType: FORCED_BATCH_START,
            count: 0,
            batchDepth: 0,
            batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
          },
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
      }
      expect(handleRedo(initialState, { type: REDO })).toEqual(initialState)
    })
  })
  describe('if there is a shadow state', () => {
    it('should push the current state into the history and pop from the future', () => {
      const state = { a: 1 }
      const batchState = { b: 1 }
      const initialState = {
        ...INITIAL_STATE,
        future: [
          {
            state: batchState,
            actionType: FORCED_BATCH_START,
            count: 0,
            batchDepth: 0,
            batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
          },
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
      }
      const currentState = { zzz: 5 }
      expect(
        handleRedo(initialState, {
          type: REDO,
          _shadow: currentState,
          id: 22,
          oldLabel: 'Do Something Good',
          oldType: 'DO_SOMETHING_GOOD',
        })
      ).toEqual({
        ...initialState,
        future: [
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
        history: [
          {
            state: currentState,
            actionLabel: 'Do Something Good',
            actionType: 'DO_SOMETHING_GOOD',
            count: 0,
            batchDepth: 0,
          },
        ],
        generation: 1,
        changeId: 22,
        recentlyUndidOrRedid: 'redid',
      })
    })
    describe('but there is no history', () => {
      const state = { zzz: 5 }
      it('should leave the state as-is', () => {
        expect(handleRedo(INITIAL_STATE, { type: REDO, _shadow: state })).toEqual(INITIAL_STATE)
      })
    })
  })
})

describe('handleUndoNTimes', () => {
  describe('if there is no shadow state', () => {
    it('shoudl produce the current state', () => {
      const state = { a: 1 }
      const batchState = { b: 1 }
      const initialState = {
        ...INITIAL_STATE,
        history: [
          {
            state: batchState,
            actionType: FORCED_BATCH_START,
            count: 0,
            batchDepth: 0,
            batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
          },
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
      }
      expect(handleUndoNTimes(initialState, { type: UNDO_N_TIMES })).toEqual(initialState)
    })
  })
  describe('if there is a shadow state', () => {
    describe('and the number of undos requested less than 0', () => {
      it('should be equivelant to handleUndo', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          history: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        const currentState = { zzz: 5 }
        expect(
          handleUndoNTimes(initialState, {
            type: UNDO,
            n: -1,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual(initialState)
      })
    })
    describe('and the number of undos requested is 0', () => {
      it('should be equivelant to handleUndo', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          history: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        const currentState = { zzz: 5 }
        expect(
          handleUndoNTimes(initialState, {
            type: UNDO,
            n: 0,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual(
          handleUndo(initialState, {
            type: UNDO,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        )
      })
    })
    describe('and the number of undos requested greater than 0', () => {
      it('should move n-1 history elements into future, reverse it, insert the current state after that and remove the next history element (it becomes the current state)', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          history: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        const currentState = { zzz: 5 }
        expect(
          handleUndoNTimes(initialState, {
            type: UNDO,
            n: 1,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual({
          ...INITIAL_STATE,
          history: [
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
          future: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state: currentState,
              actionType: 'DO_SOMETHING_AMAZING',
              actionLabel: 'Do Something Amazing',
              count: 0,
              batchDepth: 0,
            },
          ],
          changeId: 10,
          recentlyUndidOrRedid: 'undid',
          generation: 1,
        })
      })
    })
  })
})

describe('handleRedoNTimes', () => {
  describe('if there is no shadow state', () => {
    it('shoudl produce the current state', () => {
      const state = { a: 1 }
      const batchState = { b: 1 }
      const initialState = {
        ...INITIAL_STATE,
        future: [
          {
            state: batchState,
            actionType: FORCED_BATCH_START,
            count: 0,
            batchDepth: 0,
            batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
          },
          {
            state,
            actionType: 'DO_OTHER_THINGS',
            count: 0,
            batchDepth: 0,
          },
          {
            state,
            actionType: 'DO_THINGS',
            count: 0,
            batchDepth: 0,
          },
        ],
      }
      expect(handleRedoNTimes(initialState, { type: REDO_N_TIMES })).toEqual(initialState)
    })
  })
  describe('if there is a shadow state', () => {
    describe('and the number of redos requested less than 0', () => {
      it('should be equivelant to handleRedo', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          future: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        const currentState = { zzz: 5 }
        expect(
          handleRedoNTimes(initialState, {
            type: REDO,
            n: -1,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual(initialState)
      })
    })
    describe('and the number of redos requested is 0', () => {
      it('should be equivelant to handleRedo', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          future: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        const currentState = { zzz: 5 }
        expect(
          handleRedoNTimes(initialState, {
            type: REDO,
            n: 0,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual(
          handleRedo(initialState, {
            type: REDO,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        )
      })
    })
    describe('and the number of redos requested greater than 0', () => {
      it('should move n-1 future elements into history, reverse it, insert the current state after that and remove the next future element (it becomes the current state)', () => {
        const state = { a: 1 }
        const batchState = { b: 1 }
        const initialState = {
          ...INITIAL_STATE,
          future: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state,
              actionType: 'DO_OTHER_THINGS',
              count: 0,
              batchDepth: 0,
            },
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
        }
        const currentState = { zzz: 5 }
        expect(
          handleRedoNTimes(initialState, {
            type: REDO,
            n: 1,
            _shadow: currentState,
            id: 10,
            oldLabel: 'Do Something Amazing',
            oldType: 'DO_SOMETHING_AMAZING',
          })
        ).toEqual({
          ...INITIAL_STATE,
          future: [
            {
              state,
              actionType: 'DO_THINGS',
              count: 0,
              batchDepth: 0,
            },
          ],
          history: [
            {
              state: batchState,
              actionType: FORCED_BATCH_START,
              count: 0,
              batchDepth: 0,
              batchedActionTypes: ['DO_A_FOURTH_THING', 'DO_A_THIRD_THING'],
            },
            {
              state: currentState,
              actionType: 'DO_SOMETHING_AMAZING',
              actionLabel: 'Do Something Amazing',
              count: 0,
              batchDepth: 0,
            },
          ],
          changeId: 10,
          recentlyUndidOrRedid: 'redid',
          generation: 1,
        })
      })
    })
  })
})

describe('advanceHistory', () => {
  describe('given an action without a shadow state', () => {
    it('should produce the given state', () => {
      expect(advanceHistory(INITIAL_STATE, { type: 'DO_SOME_STUFF' })).toEqual(INITIAL_STATE)
    })
  })
  describe('given an action with a shadow state', () => {
    describe('when there is no history', () => {
      describe('and there is a future stack', () => {
        it('should push the new state into the history and pop off the future state', () => {
          const state = { a: 1 }
          const currentState = { zzz: 5 }
          const initialState = {
            ...INITIAL_STATE,
            future: [
              {
                state,
                actionType: 'DO_OTHER_THINGS',
                count: 0,
                batchDepth: 0,
              },
              {
                state,
                actionType: 'DO_THINGS',
                count: 0,
                batchDepth: 0,
              },
            ],
            history: [],
            generation: 1,
          }
          expect(
            advanceHistory(initialState, { type: 'DO_AMAZING_STUFF', _shadow: currentState })
          ).toEqual({
            ...initialState,
            future: [],
            history: [
              {
                state: currentState,
                actionLabel: 'Do Amazing Stuff',
                actionType: 'DO_AMAZING_STUFF',
                count: 0,
                batchDepth: 0,
              },
            ],
            generation: 1,
          })
        })
      })
    })
    describe('when there is a history stack', () => {
      describe('and the action type differs from the first history entry', () => {
        it('should push a new entry into the history', () => {
          const state = { a: 1 }
          const currentState = { zzz: 5 }
          const initialState = {
            ...INITIAL_STATE,
            future: [],
            history: [
              {
                state,
                actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                count: 0,
                batchDepth: 0,
              },
              {
                state,
                actionType: EDIT_CARD_CUSTOM_ATTRIBUTE,
                count: 0,
                batchDepth: 0,
              },
            ],
            generation: 1,
          }
          expect(
            advanceHistory(initialState, {
              type: EDIT_PLACE_TEMPLATE_ATTRIBUTE,
              name: 'Disposition',
              _shadow: currentState,
            })
          ).toEqual({
            ...initialState,
            future: [],
            history: [
              {
                state: currentState,
                actionLabel: 'Place Template Attribute: Disposition',
                actionType: EDIT_PLACE_TEMPLATE_ATTRIBUTE,
                count: 0,
                batchDepth: 0,
              },
              {
                state,
                actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                count: 0,
                batchDepth: 0,
              },
              {
                state,
                actionType: EDIT_CARD_CUSTOM_ATTRIBUTE,
                count: 0,
                batchDepth: 0,
              },
            ],
            generation: 1,
          })
        })
      })
      describe('and the action matches the previous action', () => {
        describe('and the action is one that ought to be batched', () => {
          describe('and the batch count is lower than the batch threshold', () => {
            describe('and the attribute has a different name', () => {
              it('should insert a new batch', () => {
                const state = { a: 1 }
                const currentState = { zzz: 5 }
                const initialState = {
                  ...INITIAL_STATE,
                  future: [],
                  history: [
                    {
                      state,
                      actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                      count: 0,
                      batchDepth: 0,
                    },
                    {
                      state,
                      actionType: 'DO_THINGS',
                      count: 0,
                      batchDepth: 0,
                    },
                  ],
                  generation: 1,
                }
                expect(
                  advanceHistory(initialState, {
                    type: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                    name: 'Blah',
                    _shadow: currentState,
                  })
                ).toEqual({
                  ...initialState,
                  future: [],
                  history: [
                    {
                      state: currentState,
                      actionLabel: 'Card Template Attribute: Blah',
                      actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                      count: 0,
                      batchDepth: 0,
                    },
                    {
                      state,
                      actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                      count: 0,
                      batchDepth: 0,
                    },
                    {
                      state,
                      actionType: 'DO_THINGS',
                      count: 0,
                      batchDepth: 0,
                    },
                  ],
                  generation: 1,
                })
              })
            })
            describe('and the attribute has the same name', () => {
              it('should increment the batch counter on the latest history element', () => {
                const state = { a: 1 }
                const currentState = { zzz: 5 }
                const initialState = {
                  ...INITIAL_STATE,
                  future: [],
                  history: [
                    {
                      state,
                      actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                      actionLabel: 'Card Template Attribute: Blah',
                      count: 0,
                      batchDepth: 0,
                    },
                    {
                      state,
                      actionType: 'DO_THINGS',
                      count: 0,
                      batchDepth: 0,
                    },
                  ],
                  generation: 1,
                }
                expect(
                  advanceHistory(initialState, {
                    type: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                    name: 'Blah',
                    _shadow: currentState,
                  })
                ).toEqual({
                  ...initialState,
                  future: [],
                  history: [
                    {
                      state,
                      actionLabel: 'Card Template Attribute: Blah',
                      actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                      count: 1,
                      batchDepth: 0,
                    },
                    {
                      state,
                      actionType: 'DO_THINGS',
                      count: 0,
                      batchDepth: 0,
                    },
                  ],
                  generation: 1,
                })
              })
            })
          })
          describe('and the batch count is equal to the batch threshold', () => {
            it('should push a new batch onto the history', () => {
              const state = { a: 1 }
              const initialState = {
                ...INITIAL_STATE,
                future: [],
                history: [
                  {
                    state,
                    actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                    count: 15,
                    batchDepth: 0,
                  },
                  {
                    state,
                    actionType: EDIT_CARD_CUSTOM_ATTRIBUTE,
                    count: 0,
                    batchDepth: 0,
                  },
                ],
                generation: 1,
              }
              const newState = { c: 5 }
              expect(
                advanceHistory(initialState, {
                  type: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                  name: 'Blah',
                  _shadow: newState,
                })
              ).toEqual({
                ...initialState,
                future: [],
                history: [
                  {
                    state: newState,
                    actionLabel: 'Card Template Attribute: Blah',
                    actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                    count: 0,
                    batchDepth: 0,
                  },
                  {
                    state,
                    actionType: EDIT_CARD_TEMPLATE_ATTRIBUTE,
                    count: 15,
                    batchDepth: 0,
                  },
                  {
                    state,
                    actionType: EDIT_CARD_CUSTOM_ATTRIBUTE,
                    count: 0,
                    batchDepth: 0,
                  },
                ],
                generation: 1,
              })
            })
          })
        })
        describe('and the action ought not to be batched', () => {
          it('should increment the batch counter on the latest history element', () => {
            const state = { a: 1 }
            const currentState = { zzz: 5 }
            const initialState = {
              ...INITIAL_STATE,
              future: [],
              history: [
                {
                  state,
                  actionType: 'WOOHOO',
                  count: 0,
                  batchDepth: 0,
                },
                {
                  state,
                  actionType: 'DO_THINGS',
                  count: 0,
                  batchDepth: 0,
                },
              ],
              generation: 1,
            }
            expect(
              advanceHistory(initialState, {
                type: 'WOOHOO',
                _shadow: currentState,
              })
            ).toEqual({
              ...initialState,
              future: [],
              history: [
                {
                  state: currentState,
                  actionLabel: 'Woohoo',
                  actionType: 'WOOHOO',
                  count: 0,
                  batchDepth: 0,
                },
                {
                  state,
                  actionType: 'WOOHOO',
                  count: 0,
                  batchDepth: 0,
                },
                {
                  state,
                  actionType: 'DO_THINGS',
                  count: 0,
                  batchDepth: 0,
                },
              ],
              generation: 1,
            })
          })
        })
      })
    })
  })
})
