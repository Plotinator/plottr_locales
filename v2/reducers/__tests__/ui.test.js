import { omit } from 'lodash'

import { configureStore, pltrAdaptor } from './fixtures/testStore'
import {
  goldilocks,
  hamlet,
  hamlet_with_attribute_mix,
  hamlet_with_partial_attr_ordering,
} from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { uiState } from '../../store/initialState'
import selectors from '../../selectors'
import actions from '../../actions'

const wiredUpActions = actions(pltrAdaptor)

const {
  changeOrientation,
  loadFile,
  setCharacterFilter,
  changeCurrentTimeline,
  setCardDialogOpen,
} = wiredUpActions.ui
const { addBook } = wiredUpActions.book
const { setUserId } = wiredUpActions.client
const { addLineWithTitle, reorderLines, togglePinPlotline } = wiredUpActions.line
const { deleteCharacterAttribute, editCharacterAttributeMetadata } = wiredUpActions.attributes
const { addCard, moveCardToBook } = wiredUpActions.card
const addCharacterToCard = wiredUpActions.card.addCharacter
const { addCharacter, editCharacterAttributeValue } = wiredUpActions.character
const { setAppSettings } = wiredUpActions.settings
const { setPermission } = wiredUpActions.permission

const {
  permissionSelector,
  currentTimelineSelector,
  isCardDialogVisibleSelector,
  stickyHeaderCountSelector,
  stickyLeftColumnCountSelector,
  sortedLinesByBookSelector,
  pinnedPlotlinesSelector,
  customAttributeOrderSelector,
  characterFilterSelector,
  appSettingsSelector,
  rootUiSelector,
  uiCollaboratorsSelector,
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

describe('loadFile', () => {
  describe('given the empty file state', () => {
    it('should include an empty attribute ordering', () => {
      const store = initialStore()
      expect(customAttributeOrderSelector(store.getState())).toEqual({
        characters: [],
      })
    })
  })
  describe('given a file with one legacy attribute', () => {
    describe('and no ordering for that attribute', () => {
      it('should add a singleton ordering', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Goldilocks',
            false,
            goldilocks,
            goldilocks.file.version,
            'device://tmp/dummy-goldilocks.pltr'
          )
        )
        expect(customAttributeOrderSelector(store.getState())).toEqual({
          characters: [
            {
              type: 'customAttributes',
              name: 'Species',
            },
          ],
        })
      })
    })
  })
  describe('given a file with multiple legacy character custom attributes', () => {
    describe('and no ordering for those attributes', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device://tmp/dummy-hamlet.pltr')
        )
        expect(customAttributeOrderSelector(store.getState())).toEqual({
          characters: [
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              name: 'Royal Family Member',
              type: 'customAttributes',
            },
            {
              name: 'Characters That Die',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
  describe('given a file with a mix of legacy and new character custom attributes', () => {
    describe('and no ordering for those attributes', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_attribute_mix,
            hamlet_with_attribute_mix.file.version,
            'device://tmp/dummy-hamlet.pltr'
          )
        )
        expect(customAttributeOrderSelector(store.getState())).toEqual({
          characters: [
            {
              id: 1,
              type: 'attributes',
            },
            {
              id: 2,
              type: 'attributes',
            },
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
    describe('and a partial ordering for those attributes (i.e. the ordering lacks some attributes)', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_partial_attr_ordering,
            hamlet_with_partial_attr_ordering.file.version,
            'device://tmp/dummy-hamlet.pltr'
          )
        )
        expect(customAttributeOrderSelector(store.getState())).toEqual({
          characters: [
            {
              id: 1,
              type: 'attributes',
            },
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              id: 2,
              type: 'attributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
})

describe('editAttributeMetadata', () => {
  describe('given a state with legacy attributes', () => {
    describe('when editing the name of a legacy attribute', () => {
      it('should update the order entry to reflect the name change', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device://tmp/dummy-hamlet.pltr')
        )
        store.dispatch(editCharacterAttributeMetadata(null, 'New Name', 'paragraph', 'Role'))
        expect(customAttributeOrderSelector(store.getState())).toEqual({
          characters: [
            {
              name: 'New Name',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              name: 'Royal Family Member',
              type: 'customAttributes',
            },
            {
              name: 'Characters That Die',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
})

describe('deleteCharacterAttribute', () => {
  describe('given a state with a character', () => {
    describe('and a custom attribute with a value', () => {
      describe('and a ui filter for the value of that atribute', () => {
        it('should remove the ui filter', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addCharacterToCard(1, 1))
          store.dispatch(editCharacterAttributeValue(1, 1, 'blah'))
          store.dispatch(
            setCharacterFilter({
              1: ['blah'],
            })
          )
          expect(characterFilterSelector(store.getState())).toEqual({
            1: ['blah'],
          })
          store.dispatch(deleteCharacterAttribute(1))
          expect(characterFilterSelector(store.getState())).toEqual({})
        })
      })
    })
  })
})

// TODO:
// - Changes to different uids happen to different records.
describe('ui-per-user', () => {
  describe('given a state in which a user should *not* be logged in to Pro', () => {
    describe('despite what permission is noted', () => {
      it('should write into the root of the ui object', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: null,
            },
          })
        )
        store.dispatch(setPermission('owner'))
        expect(permissionSelector(store.getState())).toEqual('owner')
        const initialCollaborators = uiCollaboratorsSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState())).toEqual(initialCollaborators)
      })
    })
  })
  describe('given a state in which a user *should* be logged in to Pro (and is not)', () => {
    describe('and no permission is noted', () => {
      it(`should not write into the ui key (because we're waiting for permissions)`, () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission(null))
        expect(permissionSelector(store.getState())).toEqual(null)
        const initialUI = rootUiSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).toEqual(initialTimeline)
        expect(rootUiSelector(store.getState())).toEqual(initialUI)
      })
    })
    describe('and the permission is "owner"', () => {
      it('should write into the root of the ui key', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission('owner'))
        expect(permissionSelector(store.getState())).toEqual('owner')
        const initialCollaborators = uiCollaboratorsSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState())).toEqual(initialCollaborators)
      })
    })
    describe('and the permission is "collaborator"', () => {
      it(`should not write into the ui key (because we don' have a uid yet)`, () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission('collaborator'))
        expect(permissionSelector(store.getState())).toEqual('collaborator')
        const initialCollaborators = uiCollaboratorsSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).toEqual(initialTimeline)
        expect(uiCollaboratorsSelector(store.getState())).toEqual(initialCollaborators)
      })
    })
    describe('and the permission is "viewer"', () => {
      it('should not write into the ui key', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission('viewer'))
        expect(permissionSelector(store.getState())).toEqual('viewer')
        const initialCollaborators = uiCollaboratorsSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).toEqual(initialTimeline)
        expect(uiCollaboratorsSelector(store.getState())).toEqual(initialCollaborators)
      })
    })
  })
  describe('given a state in which a user is logged in to Pro', () => {
    describe('and no permission is noted', () => {
      it(`should not write into the ui key (because we're waiting for permissions)`, () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission(null))
        expect(permissionSelector(store.getState())).toEqual(null)
        const initialUI = rootUiSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).toEqual(initialTimeline)
        expect(rootUiSelector(store.getState())).toEqual(initialUI)
      })
    })
    describe('and the permission is "owner"', () => {
      it('should write into the root of the ui key', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('owner'))
        expect(permissionSelector(store.getState())).toEqual('owner')
        const initialCollaborators = uiCollaboratorsSelector(store.getState())
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState())).toEqual(initialCollaborators)
      })
    })
    describe('and the permission is "collaborator"', () => {
      it('should write into an entry inside of ui.collaborators.collaborators keyed by the logged-in uid', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('collaborator'))
        expect(permissionSelector(store.getState())).toEqual('collaborator')
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState()).collaborators).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
      })
      it('should write subsequent changes into the same entry', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('collaborator'))
        expect(permissionSelector(store.getState())).toEqual('collaborator')
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState()).collaborators).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
        store.dispatch(changeCurrentTimeline(2))
        const finalTimeline = currentTimelineSelector(store.getState())
        expect(finalTimeline).toEqual(2)
        expect(uiCollaboratorsSelector(store.getState()).collaborators).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 2,
          },
        ])
      })
      describe('when the logged-in uid changes', () => {
        it('should write to a new record corresponding to the new uid', () => {
          const store = initialStore()
          const appSettings = appSettingsSelector(store.getState())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(
            setAppSettings({
              ...appSettings,
              user: {
                ...appSettings.user,
                frbId: 'dummy-id',
              },
            })
          )
          store.dispatch(setUserId('dummy-user-id'))
          store.dispatch(setPermission('collaborator'))
          expect(permissionSelector(store.getState())).toEqual('collaborator')
          const initialTimeline = currentTimelineSelector(store.getState())
          store.dispatch(changeCurrentTimeline(3))
          const nextTimeline = currentTimelineSelector(store.getState())
          expect(nextTimeline).not.toEqual(initialTimeline)
          expect(nextTimeline).toEqual(3)
          expect(uiCollaboratorsSelector(store.getState()).collaborators).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
          ])
          store.dispatch(setUserId('dummy-user-id-2'))
          store.dispatch(changeCurrentTimeline(2))
          const finalTimeline = currentTimelineSelector(store.getState())
          expect(finalTimeline).toEqual(2)
          expect(uiCollaboratorsSelector(store.getState()).collaborators).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id-2',
              currentTimeline: 2,
            },
          ])
        })
      })
      describe('when the permission changes to viewer', () => {
        it('should write to a new record in viewer', () => {
          const store = initialStore()
          const appSettings = appSettingsSelector(store.getState())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(
            setAppSettings({
              ...appSettings,
              user: {
                ...appSettings.user,
                frbId: 'dummy-id',
              },
            })
          )
          store.dispatch(setUserId('dummy-user-id'))
          store.dispatch(setPermission('collaborator'))
          expect(permissionSelector(store.getState())).toEqual('collaborator')
          const initialTimeline = currentTimelineSelector(store.getState())
          store.dispatch(changeCurrentTimeline(3))
          const nextTimeline = currentTimelineSelector(store.getState())
          expect(nextTimeline).not.toEqual(initialTimeline)
          expect(nextTimeline).toEqual(3)
          expect(uiCollaboratorsSelector(store.getState()).collaborators).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
          ])
          store.dispatch(setPermission('viewer'))
          store.dispatch(changeCurrentTimeline(2))
          const finalTimeline = currentTimelineSelector(store.getState())
          expect(finalTimeline).toEqual(2)
          expect(uiCollaboratorsSelector(store.getState())).toEqual({
            collaborators: [
              {
                ...omit(uiState, 'collaborators'),
                id: 'dummy-user-id',
                currentTimeline: 3,
              },
            ],
            viewers: [
              {
                ...omit(uiState, 'collaborators'),
                id: 'dummy-user-id',
                currentTimeline: 2,
              },
            ],
          })
        })
      })
    })
    describe('and the permission is "viewer"', () => {
      it('should write into an entry inside of ui.collaborators.viewers keyed by the logged-in uid', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('viewer'))
        expect(permissionSelector(store.getState())).toEqual('viewer')
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState()).viewers).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
      })
      it('should write subsequent changes into the same entry', () => {
        const store = initialStore()
        const appSettings = appSettingsSelector(store.getState())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('viewer'))
        expect(permissionSelector(store.getState())).toEqual('viewer')
        const initialTimeline = currentTimelineSelector(store.getState())
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState())
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(uiCollaboratorsSelector(store.getState()).viewers).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
        store.dispatch(changeCurrentTimeline(2))
        const finalTimeline = currentTimelineSelector(store.getState())
        expect(finalTimeline).toEqual(2)
        expect(uiCollaboratorsSelector(store.getState()).viewers).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 2,
          },
        ])
      })
      describe('when the logged-in uid changes', () => {
        it('should write to a new record corresponding to the new uid', () => {
          const store = initialStore()
          const appSettings = appSettingsSelector(store.getState())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(
            setAppSettings({
              ...appSettings,
              user: {
                ...appSettings.user,
                frbId: 'dummy-id',
              },
            })
          )
          store.dispatch(setUserId('dummy-user-id'))
          store.dispatch(setPermission('viewer'))
          expect(permissionSelector(store.getState())).toEqual('viewer')
          const initialTimeline = currentTimelineSelector(store.getState())
          store.dispatch(changeCurrentTimeline(3))
          const nextTimeline = currentTimelineSelector(store.getState())
          expect(nextTimeline).not.toEqual(initialTimeline)
          expect(nextTimeline).toEqual(3)
          expect(uiCollaboratorsSelector(store.getState()).viewers).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
          ])
          store.dispatch(setUserId('dummy-user-id-2'))
          store.dispatch(changeCurrentTimeline(2))
          const finalTimeline = currentTimelineSelector(store.getState())
          expect(finalTimeline).toEqual(2)
          expect(uiCollaboratorsSelector(store.getState()).viewers).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id-2',
              currentTimeline: 2,
            },
          ])
        })
      })
    })
  })
})

const exampleCard1 = {
  title: 'Card 1',
  description: 'Card 1 description',
  lineId: 1,
  beatId: 1,
}

describe('moveCardToBook', () => {
  describe('when a card dialog is open', () => {
    it('should close the card dialog', () => {
      const store = initialStore()
      store.dispatch(addCard(exampleCard1))
      store.dispatch(setCardDialogOpen(1, 1, 1))
      const cardIsOpen = isCardDialogVisibleSelector(store.getState())
      expect(cardIsOpen).toBeTruthy()
      store.dispatch(moveCardToBook('series', 1))
      const cardIsOpenAfter = isCardDialogVisibleSelector(store.getState())
      expect(cardIsOpenAfter).toBeFalsy()
    })
  })
})

describe('togglePinPlotline horizontal-orientation', () => {
  describe('when there is no plotline pinned yet', () => {
    const store = initialStore()
    const currentBook = 1
    store.dispatch(addLineWithTitle('second line', currentBook))
    store.dispatch(addLineWithTitle('third line', currentBook))
    store.dispatch(addLineWithTitle('fourth line', currentBook))
    const initialState = store.getState()
    const allLines = sortedLinesByBookSelector(initialState)

    it('should have only have 1 sticky header', () => {
      const stickyHeaderCount = stickyHeaderCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    it('should have only have 1 sticky left column', () => {
      const stickyHeaderCount = stickyLeftColumnCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    describe('pin plotline', () => {
      const exampleLine1 = allLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine1))
      const updatedStateAfterFirstPin = store.getState()
      it('should add 1 more sticky header', () => {
        const newStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterFirstPin)
        expect(newStickyHeaderCount).toEqual(2)
      })
      it('should not increase sticky left column count', () => {
        const leftStickyColumnCount = stickyLeftColumnCountSelector(updatedStateAfterFirstPin)
        expect(leftStickyColumnCount).toEqual(1)
      })
      const updatedLines = sortedLinesByBookSelector(updatedStateAfterFirstPin)
      const pinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      it('should position the pinned plotline to top', () => {
        expect(pinnedPlotline.position).toEqual(0)
      })
      it('should have isPinned property', () => {
        expect(pinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('pin more plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState())
      const exampleLine2 = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine2))
      const updatedStateAfterSecondPin = store.getState()
      it('should add 1 more sticky header', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterSecondPin)
        expect(updatedStickyHeaderCount).toEqual(3)
      })
      it('should not increase/decrease the sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(updatedStateAfterSecondPin)
        expect(newStickyLeftColumnCount).toEqual(1)
      })

      const updatedLines = sortedLinesByBookSelector(updatedStateAfterSecondPin)
      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should position the new pinned plotline under the older pinned plotlines', () => {
        expect(fourthPinnedPlotline.position).toEqual(1)
        expect(mainPinnedPlotline.position).toEqual(0)
      })
      it('should have isPinned property for 2 pinned plotlines', () => {
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
        expect(fourthPinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('unpin a pinned plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState())
      const exampleLineToUnpin = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLineToUnpin))
      const stateAfterTogglingAPinnedPlotline = store.getState()
      const updatedLines = sortedLinesByBookSelector(stateAfterTogglingAPinnedPlotline)

      it('should reduce 1 to sticky header count', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(updatedStickyHeaderCount).toEqual(2)
      })
      it('should not increase/decrease the sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(newStickyLeftColumnCount).toEqual(1)
      })

      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should unpin if line is currently pinned', () => {
        expect(fourthPinnedPlotline.isPinned).toBeFalsy()
      })

      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )

      it('should position the remaining pinned plotline to top', () => {
        expect(mainPinnedPlotline.position).toEqual(0)
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
      })

      it('should move the newly unpinned plotline to the position next after the last pinned plotline', () => {
        const pinnedPlotlines = updatedLines.filter((line) => line?.isPinned)
        const lastPinned = pinnedPlotlines.reduce((acc, current) =>
          acc.position > current.position ? acc : current
        )
        expect(fourthPinnedPlotline.position).toBe(Number(lastPinned.position) + 1)
      })
    })
  })
})

describe('togglePinPlotline vertical-orientation', () => {
  describe('when there is no plotline pinned yet', () => {
    const store = initialStore()
    const currentBook = 1
    store.dispatch(changeOrientation('vertical'))
    store.dispatch(addLineWithTitle('second line', currentBook))
    store.dispatch(addLineWithTitle('third line', currentBook))
    store.dispatch(addLineWithTitle('fourth line', currentBook))
    const initialState = store.getState()
    const allLines = sortedLinesByBookSelector(initialState)

    it('should have only have 1 sticky header', () => {
      const stickyHeaderCount = stickyHeaderCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    it('should have only have 1 sticky left column', () => {
      const stickyHeaderCount = stickyLeftColumnCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    describe('pin plotline', () => {
      const exampleLine1 = allLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine1))
      const updatedStateAfterFirstPin = store.getState()
      it('should not increase/decrease sticky header count', () => {
        const newStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterFirstPin)
        expect(newStickyHeaderCount).toEqual(1)
      })
      it('should add 1 more sticky left column count', () => {
        const leftStickyColumnCount = stickyLeftColumnCountSelector(updatedStateAfterFirstPin)
        expect(leftStickyColumnCount).toEqual(2)
      })
      const updatedLines = sortedLinesByBookSelector(updatedStateAfterFirstPin)
      const pinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      it('should position the pinned plotline to left most', () => {
        expect(pinnedPlotline.position).toEqual(0)
      })
      it('should have isPinned property', () => {
        expect(pinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('pin more plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState())
      const exampleLine2 = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine2))
      const updatedStateAfterSecondPin = store.getState()
      it('should not increase/decrease sticky header count', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterSecondPin)
        expect(updatedStickyHeaderCount).toEqual(1)
      })
      it('should add 1 more sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(updatedStateAfterSecondPin)
        expect(newStickyLeftColumnCount).toEqual(3)
      })

      const updatedLines = sortedLinesByBookSelector(updatedStateAfterSecondPin)
      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should position the new pinned plotline right next to the older pinned plotlines', () => {
        expect(fourthPinnedPlotline.position).toEqual(1)
        expect(mainPinnedPlotline.position).toEqual(0)
      })
      it('should have isPinned property for 2 pinned plotlines', () => {
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
        expect(fourthPinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('unpin a pinned plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState())
      const exampleLineToUnpin = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLineToUnpin))
      const stateAfterTogglingAPinnedPlotline = store.getState()
      const updatedLines = sortedLinesByBookSelector(stateAfterTogglingAPinnedPlotline)

      it('should not increase/decrease sticky header count', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(updatedStickyHeaderCount).toEqual(1)
      })
      it('should reduce 1 to sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(newStickyLeftColumnCount).toEqual(2)
      })

      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should unpin if line is currently pinned', () => {
        expect(fourthPinnedPlotline.isPinned).toBeFalsy()
      })

      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )

      it('should position the remaining pinned plotline to the left most', () => {
        expect(mainPinnedPlotline.position).toEqual(0)
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
      })

      it('should move the newly unpinned plotline to the position next after the last pinned plotline', () => {
        const pinnedPlotlines = updatedLines.filter((line) => line?.isPinned)
        const lastPinned = pinnedPlotlines.reduce((acc, current) =>
          acc.position > current.position ? acc : current
        )
        expect(fourthPinnedPlotline.position).toBe(Number(lastPinned.position) + 1)
      })
    })
  })
})

describe('reorderLines', () => {
  describe('when there is no plotline pinned yet', () => {
    const store = initialStore()
    const currentBook = 1
    store.dispatch(addLineWithTitle('second line', currentBook))
    store.dispatch(addLineWithTitle('third line', currentBook))
    store.dispatch(addLineWithTitle('fourth line', currentBook))
    const initialState = store.getState()
    let allSortedLines = sortedLinesByBookSelector(initialState)

    let mainPlotline = allSortedLines.find(
      (line) => line.title === 'Main Plot' && line.bookId === currentBook
    )
    let secondLine = allSortedLines.find(
      (line) => line.title === 'second line' && line.bookId === currentBook
    )
    let thirdLine = allSortedLines.find(
      (line) => line.title === 'third line' && line.bookId === currentBook
    )
    let fourthLine = allSortedLines.find(
      (line) => line.title === 'fourth line' && line.bookId === currentBook
    )

    store.dispatch(reorderLines(thirdLine.position, mainPlotline.position))

    const allSortedLinesAfterFirstReorder = sortedLinesByBookSelector(store.getState())

    mainPlotline = allSortedLinesAfterFirstReorder.find(
      (line) => line.title === 'Main Plot' && line.bookId === currentBook
    )
    secondLine = allSortedLinesAfterFirstReorder.find(
      (line) => line.title === 'second line' && line.bookId === currentBook
    )
    thirdLine = allSortedLinesAfterFirstReorder.find(
      (line) => line.title === 'third line' && line.bookId === currentBook
    )
    fourthLine = allSortedLinesAfterFirstReorder.find(
      (line) => line.title === 'fourth line' && line.bookId === currentBook
    )
    it('should move the line position to its destination position', () => {
      expect(mainPlotline.position).toBe(2)
    })

    it('and pull line position -1 if dropped position is greater than the position of the line', () => {
      expect(secondLine.position).toBe(0)
      expect(thirdLine.position).toBe(1)
    })

    it('should not change the line if dropped position is less than the position of the line', () => {
      expect(fourthLine.position).toBe(3)
    })
  })

  describe('when there is a pinned plotline', () => {
    const store = initialStore()
    const currentBook = 1
    store.dispatch(addLineWithTitle('second line', currentBook))
    store.dispatch(addLineWithTitle('third line', currentBook))
    store.dispatch(addLineWithTitle('fourth line', currentBook))
    const initialState = store.getState()
    let allSortedLines = sortedLinesByBookSelector(initialState)

    let mainPlotline = allSortedLines.find(
      (line) => line.title === 'Main Plot' && line.bookId === currentBook
    )
    let secondLine = allSortedLines.find(
      (line) => line.title === 'second line' && line.bookId === currentBook
    )
    let thirdLine = allSortedLines.find(
      (line) => line.title === 'third line' && line.bookId === currentBook
    )
    let fourthLine = allSortedLines.find(
      (line) => line.title === 'fourth line' && line.bookId === currentBook
    )

    store.dispatch(togglePinPlotline(mainPlotline))

    describe('move the pinned plotline to non-pinned plotline', () => {
      store.dispatch(reorderLines(thirdLine.position, mainPlotline.position))
      const linesAfterReorderAttempt = sortedLinesByBookSelector(store.getState())
      mainPlotline = linesAfterReorderAttempt.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      secondLine = allSortedLines.find(
        (line) => line.title === 'second line' && line.bookId === currentBook
      )
      thirdLine = allSortedLines.find(
        (line) => line.title === 'third line' && line.bookId === currentBook
      )
      fourthLine = allSortedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )

      it(`should not move to the line if the destination line 'isPinned' attribute is not the same with the selected line to move`, () => {
        expect(mainPlotline.position).toBe(0)
        expect(thirdLine.position).toBe(2)
        expect(secondLine.position).toBe(1)
        expect(fourthLine.position).toBe(3)
      })
    })

    describe('add pinned plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState())
      const secondPlotlineToPin = allLines.find((line) => line.title === 'third line')
      store.dispatch(togglePinPlotline(secondPlotlineToPin))
      const pinnedPlotlines = pinnedPlotlinesSelector(store.getState())
      const linesAfterSecondPlotlinePinned = sortedLinesByBookSelector(store.getState())

      const mainPlotline = linesAfterSecondPlotlinePinned.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      const secondLine = linesAfterSecondPlotlinePinned.find(
        (line) => line.title === 'second line' && line.bookId === currentBook
      )
      const thirdLine = linesAfterSecondPlotlinePinned.find(
        (line) => line.title === 'third line' && line.bookId === currentBook
      )
      const fourthLine = linesAfterSecondPlotlinePinned.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )

      it('should move the newest pinned plotline to under the older pinned plotlines', () => {
        expect(thirdLine.position).toBe(1)
        expect(mainPlotline.position).toBe(0)
      })

      it('should move the newly unpinned plotline to the position next after the last pinned plotline', () => {
        const pinnedPlotlines = linesAfterSecondPlotlinePinned.filter((line) => line?.isPinned)
        const lastPinned = pinnedPlotlines.reduce((acc, current) =>
          acc.position > current.position ? acc : current
        )
        expect(secondLine.position).toBe(lastPinned.position + 1)
        expect(secondLine.position).toBeGreaterThan(mainPlotline.position)
        expect(secondLine.position).toBeGreaterThan(thirdLine.position)
        expect(fourthLine.position).toBeGreaterThan(mainPlotline.position)
        expect(fourthLine.position).toBeGreaterThan(thirdLine.position)
      })

      it('should have 2 pinned plotlines', () => {
        expect(pinnedPlotlines).toBe(2)
      })

      describe('move the pinned plotline to another pinned plotline', () => {
        const plotlineToReorder1 = linesAfterSecondPlotlinePinned.find(
          (line) => line.title === 'third line'
        )
        const plotlineToReorder2 = linesAfterSecondPlotlinePinned.find(
          (line) => line.title === 'Main Plot'
        )
        store.dispatch(reorderLines(plotlineToReorder1.position, plotlineToReorder2.position))
        const sortedLinesAfterReorder = sortedLinesByBookSelector(store.getState())

        const mainPlotline = sortedLinesAfterReorder.find(
          (line) => line.title === 'Main Plot' && line.bookId === currentBook
        )
        const secondLine = sortedLinesAfterReorder.find(
          (line) => line.title === 'second line' && line.bookId === currentBook
        )
        const thirdLine = sortedLinesAfterReorder.find(
          (line) => line.title === 'third line' && line.bookId === currentBook
        )
        const fourthLine = sortedLinesAfterReorder.find(
          (line) => line.title === 'fourth line' && line.bookId === currentBook
        )
        it('should have 2 pinned plotlines', () => {
          expect(pinnedPlotlines).toBe(2)
        })

        it('should move the line to the destination position', () => {
          expect(thirdLine.position).toBe(0)
          expect(mainPlotline.position).toBe(1)
        })

        it('should affect the unpinned plotlines position', () => {
          expect(secondLine.position).toBe(2)
          expect(fourthLine.position).toBe(3)
        })
      })
    })
  })
})
