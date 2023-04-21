import { emptyFile } from '../../store/newFileState'
import selectors from '../../selectors'
import actions from '../../actions'
import { configureStore, pltrAdaptor } from './fixtures/testStore'

const wiredUpActions = actions(pltrAdaptor)

const { addCharacter, editCategory } = wiredUpActions.character
const { addNoteWithValues, editNote } = wiredUpActions.note
const { changeCurrentView, loadFile } = wiredUpActions.ui

const {
  noteCategoriesSelector,
  sortedCharacterCategoriesSelector,
  sortedNoteCategoriesSelector,
  categoriesFilterItemsSelector,
  charactersSortedInBookSelector,
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

const uncategorized = {
  id: null,
  name: 'Uncategorized',
  position: -1,
  type: 'text',
}

describe('categoriesFilterItemsSelector', () => {
  const store = initialStore()
  const initialState = store.getState()
  describe('given a new file', () => {
    it('should produce the empty array', () => {
      expect(categoriesFilterItemsSelector(initialState)).toEqual([])
    })
  })

  describe('move to tab with categories on filter (Notes)', () => {
    store.dispatch(changeCurrentView('notes'))
    const stateAfterChangingView = store.getState()
    describe('given the view has no contents', () => {
      it('should produce the empty array', () => {
        expect(categoriesFilterItemsSelector(stateAfterChangingView)).toEqual([])
      })
    })
    describe('add notes', () => {
      store.dispatch(addNoteWithValues('note 1', 'note 1 description'))
      const stateAfterAddingNote = store.getState()
      it('should have 1 filter item', () => {
        const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingNote)
        expect(currentFilterItems.length).toBe(1)
      })
      it('should have the uncategorized filter item', () => {
        const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingNote)
        expect(currentFilterItems).toEqual([uncategorized])
      })

      describe('change category', () => {
        const allNotes = sortedNoteCategoriesSelector(store.getState())
        const noteCategories = noteCategoriesSelector(store.getState())
        const firstNote = allNotes[0]
        const mainCategory = noteCategories.find((cat) => cat.name === 'Main')
        store.dispatch(editNote(firstNote.id, { categoryId: mainCategory?.id.toString() }))
        const currentFilterItems = categoriesFilterItemsSelector(store.getState())

        it('should remove the category that is not tag to any note', () => {
          expect(currentFilterItems).toEqual(expect.not.arrayContaining([uncategorized]))
        })

        it('should have the category tagged with one of the notes', () => {
          expect(currentFilterItems).toEqual(expect.arrayContaining([mainCategory]))
        })
      })

      describe('add another note', () => {
        store.dispatch(addNoteWithValues('note 2', 'note 2 description'))
        const stateAfterAddingAnotherNote = store.getState()

        it('should have 2 filter items', () => {
          const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingAnotherNote)
          expect(currentFilterItems.length).toBe(2)
        })
        const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingAnotherNote)
        const noteCategories = noteCategoriesSelector(store.getState())
        const mainCategory = noteCategories.find((cat) => cat.name === 'Main')

        it('should have the uncategorized filter item', () => {
          expect(currentFilterItems).toEqual(expect.arrayContaining([uncategorized]))
        })
        it('should have the category tagged with one of the notes', () => {
          expect(currentFilterItems).toEqual(expect.arrayContaining([mainCategory]))
        })
      })
    })
  })

  describe('move to tab with categories on filter (Characters)', () => {
    store.dispatch(changeCurrentView('characters'))
    const stateAfterChangingView = store.getState()
    describe('given the view has no contents', () => {
      it('should produce the empty array', () => {
        expect(categoriesFilterItemsSelector(stateAfterChangingView)).toEqual([])
      })
    })
    describe('add character', () => {
      store.dispatch(addCharacter('char 1'))
      const stateAfterAddingCharacter = store.getState()
      it('should have 1 filter item', () => {
        const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingCharacter)
        expect(currentFilterItems.length).toBe(1)
      })
      it('should have the uncategorized filter item', () => {
        const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingCharacter)
        expect(currentFilterItems).toEqual([uncategorized])
      })

      describe('change category', () => {
        const allCharacters = charactersSortedInBookSelector(store.getState())
        const characterCategories = sortedCharacterCategoriesSelector(store.getState())
        const firstCharacter = allCharacters[0]
        const mainCategory = characterCategories.find((cat) => cat.name === 'Main')
        store.dispatch(editCategory(firstCharacter.id, mainCategory?.id.toString()))
        const currentFilterItems = categoriesFilterItemsSelector(store.getState())

        it('should remove the category that is not tag to any character', () => {
          expect(currentFilterItems).toEqual(expect.not.arrayContaining([uncategorized]))
        })

        it('should have the category tagged with one of the characters', () => {
          expect(currentFilterItems).toEqual(expect.arrayContaining([mainCategory]))
        })
      })

      describe('add another character', () => {
        store.dispatch(addCharacter('char 2'))
        const stateAfterAddingAnotherCharacter = store.getState()

        it('should have 2 filter items', () => {
          const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingAnotherCharacter)
          expect(currentFilterItems.length).toBe(2)
        })
        const currentFilterItems = categoriesFilterItemsSelector(stateAfterAddingAnotherCharacter)
        const characterCategories = sortedCharacterCategoriesSelector(store.getState())
        const mainCategory = characterCategories.find((cat) => cat.name === 'Main')

        it('should have the uncategorized filter item', () => {
          expect(currentFilterItems).toEqual(expect.arrayContaining([uncategorized]))
        })
        it('should have the category tagged with one of the characters', () => {
          expect(currentFilterItems).toEqual(expect.arrayContaining([mainCategory]))
        })
      })
    })
  })
})
