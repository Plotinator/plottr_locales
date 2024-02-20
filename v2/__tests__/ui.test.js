import { omit } from 'lodash'

import { storeWithZelda, pltrAdaptor, character_template } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'
import { EDITING, SEARCHING } from '../constants/editStates'

const {
  ui: {
    openSearch,
    closeSearch,
    openReplace,
    setSearchTerm,
    selectOutlineCard,
    selectNote,
    selectPlace,
    selectTag,
    startDeletingCardFromCardDialog,
    stopDeletingCardFromCardDialog,
    showCardDialogColorPicker,
    hideCardDialogColorPicker,
    showCardDialogTemplatePicker,
    hideCardDialogTemplatePicker,
    startRemovingTemplateFromCardDialog,
    stopRemovingTemplateFromCardDialog,
    setActiveTabOnCardDialog,
    showPlaceAttributeDialog,
    hidePlaceAttributeDialog,
    startEditingSelectedPlace,
    finishEditingSelectedPlace,
    showPlaceCategoryModal,
    hidePlaceCategoryModal,
    showPlaceFilterList,
    hidePlaceFilterList,
    showPlaceSort,
    hidePlaceSort,
    startEditingSelectedNote,
    finishEditingSelectedNote,
    showNotesCategoryDialog,
    hideNotesCategoryDialog,
    showNotesAttributesDialog,
    hideNotesAttributesDialog,
    showNotesFilterList,
    hideNotesFilterList,
    showNotesSort,
    hideNotesSort,
    showCharactersAttributesDialog,
    hideCharactersAttributesDialog,
    showCharactersCategoryDialog,
    hideCharactersCategoryDialog,
    finishEditingSelectedCharacter,
    startEditingSelectedCharacter,
    showCharactersTemplatePicker,
    hideCharactersTemplatePicker,
    startCreatingCharacter,
    finishCreatingCharacter,
    setCharacterTemplateData,
    showCharacterFilter,
    hideCharacterFilter,
    showCharacterSort,
    hideCharacterSort,
    showCharacterDetails,
    hideCharacterDetails,
    startDeletingCharacter,
    finishDeletingCharacter,
    startRemovingTemplateFromCharacter,
    finishRemovingTemplateFromCharacter,
    setTemplateToRemoveFromCharacter,
    setActiveCharacterTab,
    showCharacterEditorTemplatePicker,
    hideCharacterEditorTemplatePicker,
    startEditingOutlineCard,
    finishEditingOutlineCard,
    editSelectedTag,
    finishEditingSelectedTag,
    toggleReplaceSearch,
    setReplacementText,
    toggleHitMarkedForReplacement,
    jumpToHit,
    nextSearchHit,
    previousSearchHit,
    startScanningSearch,
    pushFocus,
    replaceMarkedHits,
    resetTimeline,
    changeCurrentTimeline,
    setReplaceWord,
    setTimelineView,
  },
  applicationState: { startEditing },
  hierarchyLevels: { setHierarchyLevels },
} = actions(pltrAdaptor)
const {
  searchDialogIsOpenSelector,
  editStateSelector,
  searchDialogIsReplacingSelector,
  searchDialogSearchTermSelector,
  searchHitsSelector,
  flatSearchHitsSelector,
  selectedOutlineCardSelector,
  selectedNoteSelector,
  selectedPlaceSelector,
  selectedTagSelector,
  isCardDialogDeletingSelector,
  isCardDialogColorPickerOpenSelector,
  isCardDialogTemplatePickerOpenSelector,
  whichTemplateIsBeingRemovedViaCardDialogSelector,
  cardDialogTabSelector,
  placeAttributeDialogIsOpenSelector,
  editingSelectedPlaceSelector,
  placesCategoriesOpenSelector,
  placesFilterIsVisibleSelector,
  placesSortIsVisibleSelector,
  editingSelectedNoteSelector,
  noteCategoriesDialogOpenSelector,
  noteAttributesDialogOpenSelector,
  noteFilterVisibleSelector,
  noteSortVisibleSelector,
  characterAttributesDialogOpenSelector,
  characterCategoriesDialogOpenSelector,
  editingSelectedCharacterSelector,
  characterTemplatePickerVisibleSelector,
  creatingCharacterSelector,
  characterTemplateDataSelector,
  characterFilterVisibleSelector,
  characterSortVisibleSelector,
  characterDetailsVisible,
  characterEditorIsDeletingSelector,
  characterEditorIsRemovingTemplateSelector,
  characterEditorTemplateBeingRemovedSelector,
  characterEditorActiveTabSelector,
  characterEditorShowTemplatePickerSelector,
  editingOutlineCardSelector,
  isEditingTagSelector,
  searchReplacementTextSelector,
  hitsMarkedForReplacementSelector,
  fullFileStateSelector,
  allCardsSelector,
  searchDialogCurrentHitIndexSelector,
  singleBookSelector,
  seriesSelector,
  singleCardSelector,
  templateAttributeValueSelector,
  singleNoteSelector,
  singlePlaceSelector,
  singleTagSelector,
  singleCharacterSelector,
  displayedSingleCharacterSelector,
  characterTemplateAttributeValueSelector,
  singleLineSelector,
  allBeatsSelector,
  allLinesSelector,
  selectedTimelineViewSelector,
} = selectors(pltrAdaptor)

// TODO: test that marked candidates recomputes on openSearch, closeSearch
describe('openSearch/closeSearch', () => {
  describe('given an initial file', () => {
    describe('when calling open search', () => {
      const store = storeWithZelda()
      const originallyOpen = searchDialogIsOpenSelector(store.getState())
      const originalEditState = editStateSelector(store.getState())
      store.dispatch(openSearch())
      it('should transition from the editing state into the searching state', () => {
        const newEditState = editStateSelector(store.getState())
        expect(newEditState).not.toEqual(originalEditState)
        expect(originalEditState).toEqual(EDITING)
        expect(newEditState).toEqual(SEARCHING)
      })
      it('should open the search bar', () => {
        const newOpen = searchDialogIsOpenSelector(store.getState())
        expect(originallyOpen).toBeFalsy()
        expect(newOpen).toBeTruthy()
      })
      describe('and then we invoke `startEditing`', () => {
        const store = storeWithZelda()
        const originallyOpen = searchDialogIsOpenSelector(store.getState())
        const originalEditState = editStateSelector(store.getState())
        store.dispatch(openSearch())
        const newEditingState = editStateSelector(store.getState())
        store.dispatch(startEditing())
        const finalEditingState = editStateSelector(store.getState())
        it('should set the edit state to EDITING', () => {
          expect(originallyOpen).toBeFalsy()
          expect(originalEditState).toBe(EDITING)
          expect(newEditingState).toBe(SEARCHING)
          expect(finalEditingState).toBe(EDITING)
        })
      })
      describe('and then openReplace is invoked', () => {
        const store = storeWithZelda()
        const originallyOpen = searchDialogIsOpenSelector(store.getState())
        const originallyReplacing = searchDialogIsReplacingSelector(store.getState())
        const originalEditState = editStateSelector(store.getState())

        store.dispatch(openSearch())
        const isOpenAfterOpen = searchDialogIsOpenSelector(store.getState())
        const isReplacingAfterOpen = searchDialogIsReplacingSelector(store.getState())
        const editStateAfterOpen = editStateSelector(store.getState())

        store.dispatch(openReplace())
        const finalOpen = searchDialogIsOpenSelector(store.getState())
        const finalReplace = searchDialogIsReplacingSelector(store.getState())
        const editStateAfterReplace = editStateSelector(store.getState())

        store.dispatch(closeSearch())
        const isOpenAfterClosing = searchDialogIsOpenSelector(store.getState())
        const isReplacingAfterClosing = searchDialogIsReplacingSelector(store.getState())
        const editStateAfterClosing = editStateSelector(store.getState())
        it('should keep the dialog open, remaining in searching and enable replacing', () => {
          expect(originallyOpen).toBeFalsy()
          expect(originallyReplacing).toBeFalsy()
          expect(originalEditState).toBe(EDITING)

          expect(isOpenAfterOpen).toBeTruthy()
          expect(isReplacingAfterOpen).toBeFalsy()
          expect(editStateAfterOpen).toBe(SEARCHING)

          expect(finalOpen).toBeTruthy()
          expect(finalReplace).toBeTruthy()
          expect(editStateAfterReplace).toBe(SEARCHING)

          expect(isOpenAfterClosing).toBeFalsy()
          expect(isReplacingAfterClosing).toBeFalsy()
          expect(editStateAfterClosing).toBe(SEARCHING)
        })
      })
    })
    describe('when opening and subsequently closing the search', () => {
      const store = storeWithZelda()
      const originallyOpen = searchDialogIsOpenSelector(store.getState())
      const originalEditState = editStateSelector(store.getState())
      store.dispatch(openSearch())
      it('should open the search bar then close it', () => {
        const newOpen = searchDialogIsOpenSelector(store.getState())
        const newEditState = editStateSelector(store.getState())
        expect(originallyOpen).toBeFalsy()
        expect(originalEditState).toEqual(EDITING)
        expect(newEditState).toEqual(SEARCHING)
        expect(newOpen).toBeTruthy()
        store.dispatch(closeSearch())
        const finalOpen = searchDialogIsOpenSelector(store.getState())
        const finalEditState = editStateSelector(store.getState())
        expect(finalEditState).toEqual(SEARCHING)
        expect(finalOpen).toBeFalsy()
      })
    })
  })
})

// TODO: test that marked candidates recomputes on openSearch, closeSearch
describe('openReplace/closeSearch', () => {
  describe('given an initial file', () => {
    describe('when calling open search', () => {
      const store = storeWithZelda()
      const originallyOpen = searchDialogIsOpenSelector(store.getState())
      const originalEditState = editStateSelector(store.getState())
      store.dispatch(openReplace())
      it('should transition from the editing state into the searching state', () => {
        const newEditState = editStateSelector(store.getState())
        expect(newEditState).not.toEqual(originalEditState)
        expect(originalEditState).toEqual(EDITING)
        expect(newEditState).toEqual(SEARCHING)
      })
      it('should open the search bar', () => {
        const newOpen = searchDialogIsOpenSelector(store.getState())
        expect(originallyOpen).toBeFalsy()
        expect(newOpen).toBeTruthy()
      })
      describe('and then we invoke `startEditing`', () => {
        const store = storeWithZelda()
        const originallyOpen = searchDialogIsOpenSelector(store.getState())
        const originalEditState = editStateSelector(store.getState())
        store.dispatch(openReplace())
        const newEditingState = editStateSelector(store.getState())
        store.dispatch(startEditing())
        const finalEditingState = editStateSelector(store.getState())
        it('should set the edit state to EDITING', () => {
          expect(originallyOpen).toBeFalsy()
          expect(originalEditState).toBe(EDITING)
          expect(newEditingState).toBe(SEARCHING)
          expect(finalEditingState).toBe(EDITING)
        })
      })
      describe('and then openSearch is invoked', () => {
        const store = storeWithZelda()
        const originallyOpen = searchDialogIsOpenSelector(store.getState())
        const originallyReplacing = searchDialogIsReplacingSelector(store.getState())
        const originalEditState = editStateSelector(store.getState())

        store.dispatch(openReplace())
        const isOpenAfterOpen = searchDialogIsOpenSelector(store.getState())
        const isReplacingAfterOpen = searchDialogIsReplacingSelector(store.getState())
        const editStateAfterOpen = editStateSelector(store.getState())

        store.dispatch(openSearch())
        const finalOpen = searchDialogIsOpenSelector(store.getState())
        const finalReplace = searchDialogIsReplacingSelector(store.getState())
        const editStateAfterReplace = editStateSelector(store.getState())

        store.dispatch(closeSearch())
        const isOpenAfterClosing = searchDialogIsOpenSelector(store.getState())
        const isReplacingAfterClosing = searchDialogIsReplacingSelector(store.getState())
        const editStateAfterClosing = editStateSelector(store.getState())
        it('should keep the dialog open, remaining in searching and enable replacing', () => {
          expect(originallyOpen).toBeFalsy()
          expect(originallyReplacing).toBeFalsy()
          expect(originalEditState).toBe(EDITING)

          expect(isOpenAfterOpen).toBeTruthy()
          expect(isReplacingAfterOpen).toBeTruthy()
          expect(editStateAfterOpen).toBe(SEARCHING)

          expect(finalOpen).toBeTruthy()
          expect(finalReplace).toBeFalsy()
          expect(editStateAfterReplace).toBe(SEARCHING)

          expect(isOpenAfterClosing).toBeFalsy()
          expect(isReplacingAfterClosing).toBeFalsy()
          expect(editStateAfterClosing).toBe(SEARCHING)
        })
      })
    })
    describe('when opening and subsequently closing the search', () => {
      const store = storeWithZelda()
      const originallyOpen = searchDialogIsOpenSelector(store.getState())
      const originalEditState = editStateSelector(store.getState())
      store.dispatch(openReplace())
      it('should open the search bar then close it', () => {
        const newOpen = searchDialogIsOpenSelector(store.getState())
        const newEditState = editStateSelector(store.getState())
        expect(originallyOpen).toBeFalsy()
        expect(originalEditState).toEqual(EDITING)
        expect(newEditState).toEqual(SEARCHING)
        expect(newOpen).toBeTruthy()
        store.dispatch(closeSearch())
        const finalOpen = searchDialogIsOpenSelector(store.getState())
        const finalEditState = editStateSelector(store.getState())
        expect(finalEditState).toEqual(SEARCHING)
        expect(finalOpen).toBeFalsy()
      })
    })
  })
})

// TODO: test that the marked hits are recomputed with each update
describe('setSearchTerm', () => {
  describe('given an initial file', () => {
    it('should initially have a blank search term', () => {
      const store = storeWithZelda()
      const searchTerm = searchDialogSearchTermSelector(store.getState())
      expect(searchTerm).toEqual('')
    })
  })
  describe('when changing the search term', () => {
    const store = storeWithZelda()
    const searchTerm = searchDialogSearchTermSelector(store.getState())
    store.dispatch(setSearchTerm('builder'))
    const newSearchTerm = searchDialogSearchTermSelector(store.getState())
    it('should edit the search term', () => {
      expect(newSearchTerm).not.toEqual(searchTerm)
      expect(newSearchTerm).toEqual('builder')
    })
    it('should list all relevant hits', () => {
      const hits = searchHitsSelector(store.getState())
      expect(hits).toEqual({
        characters: [
          { hit: 'Builder', path: '/characters/3/name/8' },
          { hit: 'Builder', path: '/characters/3/customAttribute/1/all/51' },
        ],
        notes: [
          { hit: 'Builder', path: '/notes/2/title/8' },
          { hit: 'Builder', path: '/notes/2/content/26' },
        ],
        outline: [
          { hit: 'Builder', path: '/outline/7/card/23/description/54' },
          { hit: 'Builder', path: '/outline/8/card/19/description/68' },
        ],
        places: [{ hit: 'Builder', path: '/places/2/name/8' }],
        project: [
          { hit: 'Builder', path: '/project/series/name/22' },
          { hit: 'Builder', path: '/project/book/8/title/22' },
        ],
        tags: [],
        timeline: [
          { hit: 'Builder', path: '/timeline/7/card/23/description/54' },
          { hit: 'Builder', path: '/timeline/8/card/19/description/68' },
          { hit: 'Builder', path: '/timeline/8/card/19/customAttribute/attr 1/36' },
          { hit: 'Builder', path: '/timeline/8/card/19/customAttribute/att 3/34' },
          { hit: 'Builder', path: '/timeline/8/card/19/customAttribute/att 3/95' },
        ],
        lines: [
          {
            hit: 'Builder',
            path: '/lines/15/title/10',
          },
        ],
        beats: [
          {
            hit: 'Builder',
            path: '/beats/series/1/title/0',
          },
        ],
      })
    })
    describe('when the search term is shorter than three characters', () => {
      const store = storeWithZelda()
      const searchTerm = searchDialogSearchTermSelector(store.getState())
      store.dispatch(setSearchTerm('bu'))
      const newSearchTerm = searchDialogSearchTermSelector(store.getState())
      it('should change the search term', () => {
        expect(searchTerm).not.toEqual(newSearchTerm)
      })
      it('should not search', () => {
        const hits = searchHitsSelector(store.getState())
        for (const value of Object.values(hits)) {
          expect(value.length).toEqual(0)
        }
      })
    })
    describe('when the dialog is closed and opened again', () => {
      it('should remember the search term', () => {
        const store = storeWithZelda()
        store.dispatch(openSearch())
        store.dispatch(setSearchTerm('builder'))
        const searchTerm = searchDialogSearchTermSelector(store.getState())
        store.dispatch(closeSearch)
        const finalSearchTerm = searchDialogSearchTermSelector(store.getState())
        expect(finalSearchTerm).not.toEqual('')
        expect(finalSearchTerm).toEqual(searchTerm)
      })
    })
  })
  describe('when the search term matches a legacy character "description"', () => {
    const store = storeWithZelda()
    store.dispatch(setSearchTerm('he princess'))
    it("should list that character's hit", () => {
      const hits = searchHitsSelector(store.getState())
      expect(hits.characters).toEqual([
        { hit: 'he princess', path: '/characters/1/customAttribute/notes/all/13' },
        { hit: 'he princess', path: '/characters/3/customAttribute/1/all/63' },
      ])
    })
  })
  describe('when the search term matches new character "notes" and legacy "notes"', () => {
    const store = storeWithZelda()
    store.dispatch(setSearchTerm('a lot less helpless'))
    it('should list only the new character "notes" hit', () => {
      const hits = searchHitsSelector(store.getState())
      expect(hits.characters).toEqual([
        { hit: 'a lot less helpless', path: '/characters/3/customAttribute/1/all/10' },
      ])
    })
  })
  describe("when the search term matches a legacy attribute that's not shadowed", () => {
    const store = storeWithZelda()
    store.dispatch(setSearchTerm("she's got lazer eyes(!)"))
    it('should list the legacy character attribute hit', () => {
      const hits = searchHitsSelector(store.getState())
      expect(hits.characters).toEqual([
        {
          hit: "she's got lazer eyes(!)",
          path: '/characters/3/customAttribute/Special Sauce/all/26',
        },
      ])
    })
  })
  describe("when the search term matches a legacy attribute that's shadowed", () => {
    const store = storeWithZelda()
    store.dispatch(setSearchTerm('aaayy ooooo'))
    it('should not list the hit for the old attribute', () => {
      const hits = searchHitsSelector(store.getState())
      expect(hits.characters).toEqual([])
    })
    const store2 = storeWithZelda()
    store2.dispatch(setSearchTerm('How are you?'))
    it('should list the hit for the new attribute', () => {
      const hits = searchHitsSelector(store2.getState())
      expect(hits.characters).toEqual([
        {
          hit: 'How are you?',
          path: '/characters/3/customAttribute/2/all/5',
        },
      ])
    })
  })
  describe('given a search term that contains a word with mixed case and punctuation', () => {
    const store = storeWithZelda()
    describe('when the search term contains an upper case character', () => {
      store.dispatch(setSearchTerm('Builder;'))
      const hits = searchHitsSelector(store.getState())
      it('should produce the relevant hit', () => {
        expect(hits).toEqual({
          beats: [],
          characters: [],
          lines: [],
          notes: [],
          outline: [{ hit: 'Builder;', path: '/outline/7/card/23/description/54' }],
          places: [],
          project: [],
          tags: [],
          timeline: [{ hit: 'Builder;', path: '/timeline/7/card/23/description/54' }],
        })
      })
    })
    describe('when the wrong character is upper case', () => {
      store.dispatch(setSearchTerm('buIlder;'))
      const hits = searchHitsSelector(store.getState())
      it('should not produce the same result', () => {
        expect(hits).toEqual({
          beats: [],
          characters: [],
          lines: [],
          notes: [],
          outline: [],
          places: [],
          project: [],
          tags: [],
          timeline: [],
        })
      })
    })
    describe('when the search term contains no upper case character', () => {
      store.dispatch(setSearchTerm('builder;'))
      const hits = searchHitsSelector(store.getState())
      it('should produce the relevant hit', () => {
        expect(hits).toEqual({
          beats: [],
          characters: [],
          lines: [],
          notes: [],
          outline: [{ hit: 'Builder;', path: '/outline/7/card/23/description/54' }],
          places: [],
          project: [],
          tags: [],
          timeline: [{ hit: 'Builder;', path: '/timeline/7/card/23/description/54' }],
        })
      })
    })
  })
  describe('given the term "the"', () => {
    describe('when the search is full-word', () => {
      const store = storeWithZelda()
      store.dispatch(setSearchTerm('the'))
      const anyHits = searchHitsSelector(store.getState())
      store.dispatch(setReplaceWord(true))
      const fullWordHits = searchHitsSelector(store.getState())
      it('should not produce hits inside of words that contain "the"', () => {
        expect(anyHits).not.toEqual(fullWordHits)
        expect(Object.values(fullWordHits).flat().length).toBeLessThan(
          Object.values(anyHits).flat().length
        )
        expect(fullWordHits).toEqual({
          beats: [],
          characters: [
            { hit: 'the', path: '/characters/1/customAttribute/notes/all/12' },
            { hit: 'the', path: '/characters/2/customAttribute/notes/all/26' },
            { hit: 'the', path: '/characters/3/name/4' },
            { hit: 'the', path: '/characters/3/customAttribute/1/all/47' },
            { hit: 'the', path: '/characters/3/customAttribute/1/all/62' },
            { hit: 'the', path: '/characters/3/customAttribute/1/all/82' },
            { hit: 'the', path: '/characters/3/customAttribute/1/all/116' },
            { hit: 'the', path: '/characters/3/templateAttribute/ch3/Description/5/15' },
          ],
          lines: [],
          notes: [
            { hit: 'the', path: '/notes/2/title/4' },
            { hit: 'the', path: '/notes/2/content/22' },
          ],
          outline: [
            { hit: 'the', path: '/outline/7/card/31/title/7' },
            { hit: 'the', path: '/outline/7/card/26/title/8' },
            { hit: 'the', path: '/outline/7/card/23/description/50' },
            { hit: 'the', path: '/outline/7/card/23/description/63' },
            { hit: 'the', path: '/outline/7/card/23/description/79' },
            { hit: 'The', path: '/outline/8/card/19/description/0' },
            { hit: 'the', path: '/outline/8/card/19/description/64' },
            { hit: 'the', path: '/outline/undefined/card/10/description/10' },
            { hit: 'The', path: '/outline/series/card/50/title/0' },
          ],
          places: [
            { hit: 'The', path: '/places/1/notes/0' },
            { hit: 'the', path: '/places/2/name/4' },
          ],
          project: [
            { hit: 'The', path: '/project/series/name/0' },
            { hit: 'the', path: '/project/series/name/18' },
            { hit: 'the', path: '/project/book/1/title/10' },
            { hit: 'The', path: '/project/book/6/title/0' },
            { hit: 'the', path: '/project/book/7/title/10' },
            { hit: 'The', path: '/project/book/8/title/0' },
            { hit: 'the', path: '/project/book/8/title/18' },
            { hit: 'the', path: '/project/book/8/premise/5' },
            { hit: 'the', path: '/project/book/9/premise/5' },
          ],
          tags: [],
          timeline: [
            { hit: 'the', path: '/timeline/7/card/31/title/7' },
            { hit: 'the', path: '/timeline/7/card/26/title/8' },
            { hit: 'the', path: '/timeline/7/card/23/description/50' },
            { hit: 'the', path: '/timeline/7/card/23/description/63' },
            { hit: 'the', path: '/timeline/7/card/23/description/79' },
            { hit: 'The', path: '/timeline/8/card/19/description/0' },
            { hit: 'the', path: '/timeline/8/card/19/description/64' },
            { hit: 'the', path: '/timeline/8/card/19/customAttribute/attr 1/32' },
            { hit: 'the', path: '/timeline/8/card/19/customAttribute/att 3/30' },
            { hit: 'the', path: '/timeline/8/card/19/customAttribute/att 3/45' },
            { hit: 'the', path: '/timeline/8/card/19/customAttribute/att 3/63' },
            { hit: 'The', path: '/timeline/8/card/19/customAttribute/att 3/73' },
            { hit: 'the', path: '/timeline/8/card/19/customAttribute/att 3/91' },
            { hit: 'the', path: '/timeline/8/card/19/templateAttribute/sc4/Motivation/3' },
            { hit: 'the', path: '/timeline/undefined/card/10/description/10' },
            { hit: 'The', path: '/timeline/series/card/50/title/0' },
          ],
        })
      })
    })
  })
  describe('given search terms that occur at the start or end of input', () => {
    describe('when full-word matching is enabled', () => {
      const store = storeWithZelda()
      store.dispatch(setSearchTerm('xeno'))
      store.dispatch(setReplaceWord(true))
      const hits = searchHitsSelector(store.getState())
      it('should nevertheless match the word at the start', () => {
        expect(hits).toEqual({
          beats: [],
          characters: [],
          lines: [],
          notes: [],
          outline: [{ hit: 'Xeno', path: '/outline/undefined/card/3/title/0' }],
          places: [],
          project: [],
          tags: [],
          timeline: [{ hit: 'Xeno', path: '/timeline/undefined/card/3/title/0' }],
        })
      })
      store.dispatch(setSearchTerm('morph'))
      store.dispatch(setReplaceWord(true))
      const hits2 = searchHitsSelector(store.getState())
      it('and should nevertheless match the word at the end', () => {
        expect(hits2).toEqual({
          beats: [],
          characters: [],
          lines: [],
          notes: [],
          outline: [{ hit: 'Morph', path: '/outline/undefined/card/3/title/5' }],
          places: [],
          project: [],
          tags: [],
          timeline: [{ hit: 'Morph', path: '/timeline/undefined/card/3/title/5' }],
        })
      })
    })
  })
  describe('given a search term that matches attribute names with slashes', () => {
    const store = storeWithZelda()
    store.dispatch(setSearchTerm('slashedy-slashed'))
    store.dispatch(setReplaceWord(true))
    const hits = searchHitsSelector(store.getState())
    it('should produce matches with the slashes escaped', () => {
      expect(hits).toEqual({
        beats: [],
        characters: [
          {
            hit: 'slashedy-slashed',
            path: '/characters/1/customAttribute/Character Name%2FWith Slashes/all/0',
          },
        ],
        lines: [],
        notes: [
          { hit: 'slashedy-slashed', path: '/notes/1/customAttribute/Note Name%2FWith Slashes/0' },
        ],
        outline: [],
        places: [
          {
            hit: 'slashedy-slashed',
            path: '/places/1/customAttribute/Place Name%2FWith Slashes/0',
          },
        ],
        project: [],
        tags: [],
        timeline: [
          {
            hit: 'slashedy-slashed',
            path: '/timeline/7/card/35/customAttribute/Scene Name%2FWith Slashes/0',
          },
        ],
      })
    })
  })
})

describe('selectOutlineCard', () => {
  describe('given an initial file', () => {
    describe('given a card id of 35', () => {
      const store = storeWithZelda()
      const initialSelectedOutlineCard = selectedOutlineCardSelector(store.getState())
      store.dispatch(selectOutlineCard(35))
      it('should change the selected card on the outline to 35', () => {
        const newSelectedOutlineCard = selectedOutlineCardSelector(store.getState())
        expect(newSelectedOutlineCard).not.toEqual(initialSelectedOutlineCard)
        expect(newSelectedOutlineCard).toEqual(35)
      })
    })
  })
})

describe('selectNote', () => {
  describe('given an initial file', () => {
    describe('and a note id of 1', () => {
      const store = storeWithZelda()
      const initialSelectedNote = selectedNoteSelector(store.getState())
      store.dispatch(selectNote(1))
      it('should select the note with id 1', () => {
        const newSelectedNote = selectedNoteSelector(store.getState())
        expect(newSelectedNote).not.toEqual(initialSelectedNote)
        expect(newSelectedNote).toEqual(1)
      })
    })
  })
})

describe('selectPlace', () => {
  describe('given an initial file', () => {
    describe('and a place id of 1', () => {
      const store = storeWithZelda()
      const initialSelectedPlace = selectedPlaceSelector(store.getState())
      store.dispatch(selectPlace(1))
      it('should select the place with id 1', () => {
        const newSelectedPlace = selectedPlaceSelector(store.getState())
        expect(newSelectedPlace).not.toEqual(initialSelectedPlace)
        expect(newSelectedPlace).toEqual(1)
      })
    })
  })
})

describe('selectTag', () => {
  describe('given an initial file', () => {
    describe('and a tag id of 1', () => {
      const store = storeWithZelda()
      const initialSelectedTag = selectedTagSelector(store.getState())
      store.dispatch(selectTag(1))
      it('should select the tag with id 1', () => {
        const newSelectedTag = selectedTagSelector(store.getState())
        expect(newSelectedTag).not.toEqual(initialSelectedTag)
        expect(newSelectedTag).toEqual(1)
      })
    })
  })
})

describe('startDeletingCardFromCardDialog', () => {
  describe('given the initial file', () => {
    describe('when invoking `startDeletingCardFromCardDialog` and then `stopDeletingCardFromCardDialog`', () => {
      const store = storeWithZelda()
      const isDeletingCard = isCardDialogDeletingSelector(store.getState())
      store.dispatch(startDeletingCardFromCardDialog())
      const isDeletingCardAfterStarting = isCardDialogDeletingSelector(store.getState())
      store.dispatch(stopDeletingCardFromCardDialog())
      it('should transition from false to true and then false', () => {
        const finalIsDeletingCard = isCardDialogDeletingSelector(store.getState())
        expect(isDeletingCard).toBeFalsy()
        expect(isDeletingCardAfterStarting).toBeTruthy()
        expect(finalIsDeletingCard).toBeFalsy()
      })
    })
  })
})

describe('showCardDialogColorPicker', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCardDialogColorPicker` and then `hideCardDialogColorPicker`', () => {
      const store = storeWithZelda()
      const isShowingColorPickerOnCard = isCardDialogColorPickerOpenSelector(store.getState())
      store.dispatch(showCardDialogColorPicker())
      const isShowingColorPickerOnCardAfterStarting = isCardDialogColorPickerOpenSelector(
        store.getState()
      )
      store.dispatch(hideCardDialogColorPicker())
      it('should transition from false to true to false', () => {
        const finalIsShowingColorPickerOnCard = isCardDialogColorPickerOpenSelector(
          store.getState()
        )
        expect(isShowingColorPickerOnCard).toBeFalsy()
        expect(isShowingColorPickerOnCardAfterStarting).toBeTruthy()
        expect(finalIsShowingColorPickerOnCard).toBeFalsy()
      })
    })
  })
})

describe('showCardDialogTemplatePicker', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCardDialogTemplatePicker` and then `hideCardDialogTemplatePicker`', () => {
      const store = storeWithZelda()
      const isShowingTemplatePickerOnCard = isCardDialogTemplatePickerOpenSelector(store.getState())
      store.dispatch(showCardDialogTemplatePicker())
      const isShowingTemplatePickerOnCardAfterStarting = isCardDialogTemplatePickerOpenSelector(
        store.getState()
      )
      store.dispatch(hideCardDialogTemplatePicker())
      it('should tarnsition from false to true to false', () => {
        const finalIsShowingTemplatePickerOnCard = isCardDialogTemplatePickerOpenSelector(
          store.getState()
        )
        expect(isShowingTemplatePickerOnCard).toBeFalsy()
        expect(isShowingTemplatePickerOnCardAfterStarting).toBeTruthy()
        expect(finalIsShowingTemplatePickerOnCard).toBeFalsy()
      })
    })
  })
})

describe('startRemovingTemplateFromCardDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `startRemovingTemplateFromCardDialog` and then `stopRemovingTemplateFromCardDialog`', () => {
      const store = storeWithZelda()
      const isRemovingTemplateOnCard = whichTemplateIsBeingRemovedViaCardDialogSelector(
        store.getState()
      )
      store.dispatch(startRemovingTemplateFromCardDialog(5))
      const isRemovingTemplateOnCardAfterStarting =
        whichTemplateIsBeingRemovedViaCardDialogSelector(store.getState())
      store.dispatch(stopRemovingTemplateFromCardDialog())
      it('it should transition from null to 5 to null', () => {
        const finalIsRemovingTemplateOnCard = whichTemplateIsBeingRemovedViaCardDialogSelector(
          store.getState()
        )
        expect(isRemovingTemplateOnCard).toBeNull()
        expect(isRemovingTemplateOnCardAfterStarting).toBe(5)
        expect(finalIsRemovingTemplateOnCard).toBeNull()
      })
    })
  })
})

describe('setActiveTabOnCardDialog', () => {
  describe('given an initial file', () => {
    describe('when setting the active tab on the card dialog', () => {
      const store = storeWithZelda()
      const initialTab = cardDialogTabSelector(store.getState())
      store.dispatch(setActiveTabOnCardDialog(4))
      it('should update the active tab on the card dialog', () => {
        const finalTab = cardDialogTabSelector(store.getState())
        expect(finalTab).not.toEqual(initialTab)
        expect(finalTab).toEqual(4)
      })
    })
  })
})

describe('showPlaceAttributeDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `showPlaceAttributeDialog`', () => {
      const store = storeWithZelda()
      const initiallyShown = placeAttributeDialogIsOpenSelector(store.getState())
      store.dispatch(showPlaceAttributeDialog())
      const shownAfterShowing = hidePlaceAttributeDialog(store.getState())
      store.dispatch(hidePlaceAttributeDialog())
      it('should set it to true', () => {
        const shownAtEnd = placeAttributeDialogIsOpenSelector(store.getState())
        expect(initiallyShown).toBeFalsy()
        expect(shownAfterShowing).toBeTruthy()
        expect(shownAtEnd).toBeFalsy()
      })
    })
  })
})

describe('startEditingSelectedPlace', () => {
  describe('given an initial file', () => {
    describe('when invoking `startEditingSelectedPlace` and then `finishEditingSelectedPlace`', () => {
      const store = storeWithZelda()
      const initiallyEditing = editingSelectedPlaceSelector(store.getState())
      store.dispatch(startEditingSelectedPlace())
      const editingAfterEditing = editingSelectedPlaceSelector(store.getState())
      store.dispatch(finishEditingSelectedPlace())
      it('should change editing from false to true to false', () => {
        const editingAtEnd = editingSelectedPlaceSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showPlaceCategoryModal', () => {
  describe('given an initial file', () => {
    describe('when invoking `showPlaceCategoryModal` and then `hidePlaceCategoryModal`', () => {
      const store = storeWithZelda()
      const initiallyEditing = placesCategoriesOpenSelector(store.getState())
      store.dispatch(showPlaceCategoryModal())
      const editingAfterEditing = placesCategoriesOpenSelector(store.getState())
      store.dispatch(hidePlaceCategoryModal())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = placesCategoriesOpenSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showPlaceFilterList', () => {
  describe('given an initial file', () => {
    describe('when invoking `showPlaceFilterList` and then `hidePlaceFilterList`', () => {
      const store = storeWithZelda()
      const initiallyEditing = placesFilterIsVisibleSelector(store.getState())
      store.dispatch(showPlaceFilterList())
      const editingAfterEditing = placesFilterIsVisibleSelector(store.getState())
      store.dispatch(hidePlaceFilterList())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = placesFilterIsVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showPlaceSort', () => {
  describe('given an initial file', () => {
    describe('when invoking `showPlaceSort` and then `hidePlaceSort`', () => {
      const store = storeWithZelda()
      const initiallyEditing = placesSortIsVisibleSelector(store.getState())
      store.dispatch(showPlaceSort())
      const editingAfterEditing = placesSortIsVisibleSelector(store.getState())
      store.dispatch(hidePlaceSort())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = placesSortIsVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showPlaceSort', () => {
  describe('given an initial file', () => {
    describe('when invoking `showPlaceSort` and then `hidePlaceSort`', () => {
      const store = storeWithZelda()
      const initiallyEditing = placesSortIsVisibleSelector(store.getState())
      store.dispatch(showPlaceSort())
      const editingAfterEditing = placesSortIsVisibleSelector(store.getState())
      store.dispatch(hidePlaceSort())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = placesSortIsVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('startEditingSelectedNote', () => {
  describe('given an initial file', () => {
    describe('when invoking `startEditingSelectedNote` and then `finishEditingSelectedNote`', () => {
      const store = storeWithZelda()
      const initiallyEditing = editingSelectedNoteSelector(store.getState())
      store.dispatch(startEditingSelectedNote())
      const editingAfterEditing = editingSelectedNoteSelector(store.getState())
      store.dispatch(finishEditingSelectedNote())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = editingSelectedNoteSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showNotesCategoryDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `showNotesCategoryDialog` and then `hideNotesCategoryDialog`', () => {
      const store = storeWithZelda()
      const initiallyEditing = noteCategoriesDialogOpenSelector(store.getState())
      store.dispatch(showNotesCategoryDialog())
      const editingAfterEditing = noteCategoriesDialogOpenSelector(store.getState())
      store.dispatch(hideNotesCategoryDialog())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = noteCategoriesDialogOpenSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showNotesCategoryDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `showNotesCategoryDialog` and then `hideNotesCategoryDialog`', () => {
      const store = storeWithZelda()
      const initiallyEditing = noteCategoriesDialogOpenSelector(store.getState())
      store.dispatch(showNotesCategoryDialog())
      const editingAfterEditing = noteCategoriesDialogOpenSelector(store.getState())
      store.dispatch(hideNotesCategoryDialog())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = noteCategoriesDialogOpenSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showNotesAttributesDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `showNotesAttributesDialog` and then `hideNotesAttributesDialog`', () => {
      const store = storeWithZelda()
      const initiallyEditing = noteAttributesDialogOpenSelector(store.getState())
      store.dispatch(showNotesAttributesDialog())
      const editingAfterEditing = noteAttributesDialogOpenSelector(store.getState())
      store.dispatch(hideNotesAttributesDialog())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = noteAttributesDialogOpenSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showNotesFilterList', () => {
  describe('given an initial file', () => {
    describe('when invoking `showNotesFilterList` and then `hideNotesFilterList`', () => {
      const store = storeWithZelda()
      const initiallyEditing = noteFilterVisibleSelector(store.getState())
      store.dispatch(showNotesFilterList())
      const editingAfterEditing = noteFilterVisibleSelector(store.getState())
      store.dispatch(hideNotesFilterList())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = noteFilterVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showNotesSort', () => {
  describe('given an initial file', () => {
    describe('when invoking `showNotesSort` and then `hideNotesSort`', () => {
      const store = storeWithZelda()
      const initiallyEditing = noteSortVisibleSelector(store.getState())
      store.dispatch(showNotesSort())
      const editingAfterEditing = noteSortVisibleSelector(store.getState())
      store.dispatch(hideNotesSort())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = noteSortVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showCharactersAttributesDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharactersAttributesDialog` and then `hideCharactersAttributesDialog`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterAttributesDialogOpenSelector(store.getState())
      store.dispatch(showCharactersAttributesDialog())
      const editingAfterEditing = characterAttributesDialogOpenSelector(store.getState())
      store.dispatch(hideCharactersAttributesDialog())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterAttributesDialogOpenSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showCharactersCategoryDialog', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharactersCategoryDialog` and then `hideCharactersCategoryDialog`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterCategoriesDialogOpenSelector(store.getState())
      store.dispatch(showCharactersCategoryDialog())
      const editingAfterEditing = characterCategoriesDialogOpenSelector(store.getState())
      store.dispatch(hideCharactersCategoryDialog())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterCategoriesDialogOpenSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('startEditingSelectedCharacter', () => {
  describe('given an initial file', () => {
    describe('when invoking `startEditingSelectedCharacter` and then `finishEditingSelectedCharacter`', () => {
      const store = storeWithZelda()
      const initiallyEditing = editingSelectedCharacterSelector(store.getState())
      store.dispatch(startEditingSelectedCharacter())
      const editingAfterEditing = editingSelectedCharacterSelector(store.getState())
      store.dispatch(finishEditingSelectedCharacter())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = editingSelectedCharacterSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showCharactersTemplatePicker', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharactersTemplatePicker` and then `hideCharactersTemplatePicker`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterTemplatePickerVisibleSelector(store.getState())
      store.dispatch(showCharactersTemplatePicker())
      const editingAfterEditing = characterTemplatePickerVisibleSelector(store.getState())
      store.dispatch(hideCharactersTemplatePicker())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterTemplatePickerVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('startCreatingCharacter', () => {
  describe('given an initial file', () => {
    describe('when invoking `startCreatingCharacter` and then `finishCreatingCharacter`', () => {
      const store = storeWithZelda()
      const initiallyEditing = creatingCharacterSelector(store.getState())
      store.dispatch(startCreatingCharacter())
      const editingAfterEditing = creatingCharacterSelector(store.getState())
      store.dispatch(finishCreatingCharacter())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = creatingCharacterSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('setCharacterTemplateData', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const initialCharacterTemplateData = characterTemplateDataSelector(store.getState())
    store.dispatch(setCharacterTemplateData(character_template))
    it('should set the character template data', () => {
      const finalCharacterTemplateData = characterTemplateDataSelector(store.getState())
      expect(finalCharacterTemplateData).not.toEqual(initialCharacterTemplateData)
      expect(finalCharacterTemplateData).toEqual(character_template)
    })
  })
})

describe('showCharacterFilter', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharacterFilter` and then `hideCharacterFilter`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterFilterVisibleSelector(store.getState())
      store.dispatch(showCharacterFilter())
      const editingAfterEditing = characterFilterVisibleSelector(store.getState())
      store.dispatch(hideCharacterFilter())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterFilterVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showCharacterSort', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharacterSort` and then `hideCharacterSort`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterSortVisibleSelector(store.getState())
      store.dispatch(showCharacterSort())
      const editingAfterEditing = characterSortVisibleSelector(store.getState())
      store.dispatch(hideCharacterSort())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterSortVisibleSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('showCharacterDetails', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharacterDetails` and then `hideCharacterDetails`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterDetailsVisible(store.getState())
      store.dispatch(hideCharacterDetails())
      const editingAfterEditing = characterDetailsVisible(store.getState())
      store.dispatch(showCharacterDetails())
      it('should change from showing to not showing and then showing', () => {
        const editingAtEnd = characterDetailsVisible(store.getState())
        expect(initiallyEditing).toBeTruthy()
        expect(editingAfterEditing).toBeFalsy()
        expect(editingAtEnd).toBeTruthy()
      })
    })
  })
})

describe('startDeletingCharacter', () => {
  describe('given an initial file', () => {
    describe('when invoking `startDeletingCharacter` and then `finishDeletingCharacter`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterEditorIsDeletingSelector(store.getState())
      store.dispatch(startDeletingCharacter())
      const editingAfterEditing = characterEditorIsDeletingSelector(store.getState())
      store.dispatch(finishDeletingCharacter())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterEditorIsDeletingSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('startRemovingTemplateFromCharacter', () => {
  describe('given an initial file', () => {
    describe('when invoking `startRemovingTemplateFromCharacter` and then `finishRemovingTemplateFromCharacter`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterEditorIsRemovingTemplateSelector(store.getState())
      store.dispatch(startRemovingTemplateFromCharacter())
      const editingAfterEditing = characterEditorIsRemovingTemplateSelector(store.getState())
      store.dispatch(finishRemovingTemplateFromCharacter())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterEditorIsRemovingTemplateSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('setTemplateToRemoveFromCharacter', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const initialIdToRemove = characterEditorTemplateBeingRemovedSelector(store.getState())
    store.dispatch(setTemplateToRemoveFromCharacter('ch5'))
    it('should set the id of the template to remove', () => {
      const finalIdToRemove = characterEditorTemplateBeingRemovedSelector(store.getState())
      expect(finalIdToRemove).not.toEqual(initialIdToRemove)
      expect(finalIdToRemove).toEqual('ch5')
    })
  })
})

describe('setActiveCharacterTab', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const selectedAttributeTab = characterEditorActiveTabSelector(store.getState())
    store.dispatch(setActiveCharacterTab(1))
    it('should set the active character tab', () => {
      const finalAttributeTab = characterEditorActiveTabSelector(store.getState())
      expect(finalAttributeTab).not.toEqual(selectedAttributeTab)
      expect(finalAttributeTab).toEqual(1)
    })
  })
})

describe('showCharacterEditorTemplatePicker', () => {
  describe('given an initial file', () => {
    describe('when invoking `showCharacterEditorTemplatePicker` and then `hideCharacterEditorTemplatePicker`', () => {
      const store = storeWithZelda()
      const initiallyEditing = characterEditorShowTemplatePickerSelector(store.getState())
      store.dispatch(showCharacterEditorTemplatePicker())
      const editingAfterEditing = characterEditorShowTemplatePickerSelector(store.getState())
      store.dispatch(hideCharacterEditorTemplatePicker())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = characterEditorShowTemplatePickerSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBeTruthy()
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('startEditingOutlineCard', () => {
  describe('given an initial file', () => {
    describe('when invoking `startEditingOutlineCard` and then `finishEditingOutlineCard`', () => {
      const store = storeWithZelda()
      const initiallyEditing = editingOutlineCardSelector(store.getState())
      store.dispatch(startEditingOutlineCard(5))
      const editingAfterEditing = editingOutlineCardSelector(store.getState())
      store.dispatch(finishEditingOutlineCard())
      it('should change from not showing to showing and then not showing', () => {
        const editingAtEnd = editingOutlineCardSelector(store.getState())
        expect(initiallyEditing).toBeFalsy()
        expect(editingAfterEditing).toBe(5)
        expect(editingAtEnd).toBeFalsy()
      })
    })
  })
})

describe('editSelectedTag', () => {
  describe('given an initial file', () => {
    describe('when invoking `editSelectedTag` and then `finishEditingSelectedTag`', () => {
      describe('when no tag is selected', () => {
        const store = storeWithZelda()
        const initiallyEditing = isEditingTagSelector(store.getState())
        store.dispatch(editSelectedTag())
        const editingAfterEditing = isEditingTagSelector(store.getState())
        store.dispatch(finishEditingSelectedTag())
        it('should indicate that it is not editing', () => {
          const editingAtEnd = isEditingTagSelector(store.getState())
          expect(initiallyEditing).toBeFalsy()
          expect(editingAfterEditing).toBeFalsy()
          expect(editingAtEnd).toBeFalsy()
        })
      })
      describe('when a tag is selected', () => {
        const store = storeWithZelda()
        const initiallyEditing = isEditingTagSelector(store.getState(), 1)
        store.dispatch(selectTag(1))
        store.dispatch(editSelectedTag())
        const editingAfterEditing = isEditingTagSelector(store.getState(), 1)
        store.dispatch(finishEditingSelectedTag())
        it('should indicate that it is editing', () => {
          const editingAtEnd = isEditingTagSelector(store.getState(), 1)
          expect(initiallyEditing).toBeFalsy()
          expect(editingAfterEditing).toBeTruthy()
          expect(editingAtEnd).toBeFalsy()
        })
      })
    })
  })
})

describe('toggleReplaceSearch', () => {
  describe('given an initial file', () => {
    describe('when invoking toggleReplaceSearch twice', () => {
      const store = storeWithZelda()
      const isReplacingSearch = searchDialogIsReplacingSelector(store.getState())
      store.dispatch(toggleReplaceSearch())
      const replacingAfterToggling = searchDialogIsReplacingSelector(store.getState())
      store.dispatch(toggleReplaceSearch())
      it('should transition from not replacing, to replacing, to not replacing', () => {
        const finalReplacing = searchDialogIsReplacingSelector(store.getState())
        expect(isReplacingSearch).toBeFalsy()
        expect(replacingAfterToggling).toBeTruthy()
        expect(finalReplacing).toBeFalsy()
      })
    })
  })
})

describe('setReplacementText', () => {
  describe('given an initial file', () => {
    describe('when setting the replacement text', () => {
      const store = storeWithZelda()
      const initialReplacementText = searchReplacementTextSelector(store.getState())
      store.dispatch(setReplacementText('Hi there!'))
      it('should set the replacement text', () => {
        const finalReplacementText = searchReplacementTextSelector(store.getState())
        expect(finalReplacementText).not.toEqual(initialReplacementText)
        expect(finalReplacementText).toEqual('Hi there!')
      })
    })
  })
})

describe('toggleHitMarkedForReplacement', () => {
  describe('given an initial file', () => {
    describe('when marking any hit for replacement', () => {
      const store = storeWithZelda()
      const initialHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
      store.dispatch(
        toggleHitMarkedForReplacement({ hit: 'Builder', path: '/characters/3/name/8' })
      )
      it('should not change the state (because there is no search term yet)', () => {
        const finalHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
        expect(finalHitsMarkedForReplacement).toBe(initialHitsMarkedForReplacement)
      })
    })
    describe('and a search term of "builder" is set', () => {
      describe('and a matching hit is supplied', () => {
        const store = storeWithZelda()
        const initialHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
        const hitToMark = {
          hit: 'Build',
          path: '/characters/3/name/8',
        }
        store.dispatch(setSearchTerm('build'))
        store.dispatch(toggleHitMarkedForReplacement(hitToMark))
        it('should include that hit in the list of hits marked for replacement', () => {
          const finalHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
          expect(finalHitsMarkedForReplacement).not.toEqual(initialHitsMarkedForReplacement)
          expect(finalHitsMarkedForReplacement).toEqual([hitToMark])
        })
        describe('and the search term changes to match more', () => {
          const store = storeWithZelda()
          const initialHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
          const hitToMark = {
            hit: 'Build',
            path: '/characters/3/name/8',
          }
          store.dispatch(setSearchTerm('build'))
          store.dispatch(toggleHitMarkedForReplacement(hitToMark))
          store.dispatch(setSearchTerm('builder'))
          it('should update the marked hit', () => {
            const finalHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
            expect(finalHitsMarkedForReplacement).not.toEqual(initialHitsMarkedForReplacement)
            expect(finalHitsMarkedForReplacement).toEqual([
              {
                hit: 'Builder',
                path: '/characters/3/name/8',
              },
            ])
          })
        })
        describe('and the search term changes to no longer match', () => {
          const store = storeWithZelda()
          const initialHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
          const hitToMark = {
            hit: 'Build',
            path: '/characters/3/name/8',
          }
          store.dispatch(setSearchTerm('build'))
          store.dispatch(toggleHitMarkedForReplacement(hitToMark))
          store.dispatch(setSearchTerm('buildzo'))
          it('should unmark the marked hit', () => {
            const finalHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
            expect(finalHitsMarkedForReplacement).toEqual(initialHitsMarkedForReplacement)
          })
        })
      })
      describe('and a non-matching hit is supplied', () => {
        const store = storeWithZelda()
        const initialHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
        store.dispatch(setSearchTerm('builder, yo!'))
        store.dispatch(
          toggleHitMarkedForReplacement({ hit: 'Builder', path: '/characters/3/name/8' })
        )
        it('should not change the hit list', () => {
          const finalHitsMarkedForReplacement = hitsMarkedForReplacementSelector(store.getState())
          expect(finalHitsMarkedForReplacement).toEqual(initialHitsMarkedForReplacement)
        })
      })
    })
  })
})

const withoutChangesWeDontCareAbout = (state) => {
  return omit(state, ['file.dirty', 'file.versionStamp', 'project.unsavedChanges'])
}

const withoutChangesWeDontCareAboutNorUIAndApplicationState = (state) => {
  return omit(withoutChangesWeDontCareAbout(state), ['ui', 'applicationState'])
}

// Consider: testing that jumping to a hit that starts outside the
// length of the field does nothing.
describe('jumpToHit', () => {
  describe('given an initial file', () => {
    describe('considering the project tab', () => {
      describe('and a project hit with an invalid series path', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('legend'))
        store.dispatch(
          jumpToHit(cards, 'project', { hit: 'Legend', path: '/project/series/yarg/0' })
        )
        it('should not navigate to the project or push the relevant focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('and a project hit in the series "name" of the project', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('legend'))
        store.dispatch(
          jumpToHit(cards, 'project', { hit: 'Legend', path: '/project/series/name/0' })
        )
        it('should navigate to the project tab and push the relevant focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
            withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
          )
          expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
          expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
          expect(omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView'])).toEqual(
            omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView'])
          )
          expect(finalFileState.ui.projectTab.focus[0]).toEqual({
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 6,
              start: 0,
            },
          })
          expect(finalFileState.ui.searchDialog.term).toEqual('legend')
          expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
          expect(finalFileState.ui.currentView).toEqual('project')
        })
      })
      describe('and a project hit in the series "premise" of the project', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('hings'))
        store.dispatch(
          jumpToHit(cards, 'project', { hit: 'hings', path: '/project/series/premise/1' })
        )
        it('should navigate to the project tab and push the relevant focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
            withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
          )
          expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
          expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
          expect(omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView'])).toEqual(
            omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView'])
          )
          expect(finalFileState.ui.projectTab.focus[0]).toEqual({
            path: ['premise'],
            selection: {
              direction: 'forward',
              end: 6,
              start: 1,
            },
          })
          expect(finalFileState.ui.searchDialog.term).toEqual('hings')
          expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
          expect(finalFileState.ui.currentView).toEqual('project')
        })
      })
      describe('and a project hit in the series "genre" of the project', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('ff'))
        store.dispatch(jumpToHit(cards, 'project', { hit: 'ff', path: '/project/series/genre/3' }))
        it('should navigate to the project tab and push the relevant focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
            withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
          )
          expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
          expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
          expect(omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView'])).toEqual(
            omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView'])
          )
          expect(finalFileState.ui.projectTab.focus[0]).toEqual({
            path: ['genre'],
            selection: {
              direction: 'forward',
              end: 5,
              start: 3,
            },
          })
          expect(finalFileState.ui.searchDialog.term).toEqual('ff')
          expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
          expect(finalFileState.ui.currentView).toEqual('project')
        })
      })
      describe('and a project hit in the series "theme" of the project', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('Wha'))
        store.dispatch(jumpToHit(cards, 'project', { hit: 'Wha', path: '/project/series/theme/0' }))
        it('should navigate to the project tab and push the relevant focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
            withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
          )
          expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
          expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
          expect(omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView'])).toEqual(
            omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView'])
          )
          expect(finalFileState.ui.projectTab.focus[0]).toEqual({
            path: ['theme'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          })
          expect(finalFileState.ui.searchDialog.term).toEqual('Wha')
          expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
          expect(finalFileState.ui.currentView).toEqual('project')
        })
      })
      describe('considering the tabs books', () => {
        describe('and a book id that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Link'))
          store.dispatch(
            jumpToHit(cards, 'project', { hit: 'Wha', path: '/project/book/88/title/0' })
          )
          it('should not navigate nor push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('and a book id that exists', () => {
          describe('and a book attribute that does not exist"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('of time'))
            store.dispatch(
              jumpToHit(cards, 'project', { hit: 'of Time', path: '/project/book/5/projecting/8' })
            )
            it('should not navigate nor push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(
                omit(withoutChangesWeDontCareAbout(finalFileState), [
                  'ui.searchDialog.currentHitIndex',
                  'ui.searchDialog.term',
                ])
              ).toEqual(
                omit(withoutChangesWeDontCareAbout(fileState), [
                  'ui.searchDialog.currentHitIndex',
                  'ui.searchDialog.term',
                ])
              )
            })
          })
          describe('and a book hit in the book "title"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('of time'))
            store.dispatch(
              jumpToHit(cards, 'project', { hit: 'of Time', path: '/project/book/5/title/8' })
            )
            it('should navigate to the project tab, open the book dialog and push the relevant focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              ).toEqual(
                omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              )
              expect(finalFileState.ui.projectTab.focus[0]).toEqual({
                path: ['book', 5, 'title'],
                selection: {
                  direction: 'forward',
                  end: 15,
                  start: 8,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('of time')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.currentView).toEqual('project')
              expect(finalFileState.ui.bookDialog).toEqual({
                bookId: 5,
                isOpen: true,
              })
            })
          })
          describe('and a book hit in the book "premise"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('same as'))
            store.dispatch(
              jumpToHit(cards, 'project', { hit: 'of Time', path: '/project/book/5/premise/0' })
            )
            it('should navigate to the project tab, open the book dialog and push the relevant focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              ).toEqual(
                omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              )
              expect(finalFileState.ui.projectTab.focus[0]).toEqual({
                path: ['book', 5, 'premise'],
                selection: {
                  direction: 'forward',
                  end: 7,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('same as')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.currentView).toEqual('project')
              expect(finalFileState.ui.bookDialog).toEqual({
                bookId: 5,
                isOpen: true,
              })
            })
          })
          describe('and a book hit in the book "genre"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('adventure'))
            store.dispatch(
              jumpToHit(cards, 'project', { hit: 'adventure', path: '/project/book/5/genre/0' })
            )
            it('should navigate to the project tab, open the book dialog and push the relevant focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              ).toEqual(
                omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              )
              expect(finalFileState.ui.projectTab.focus[0]).toEqual({
                path: ['book', 5, 'genre'],
                selection: {
                  direction: 'forward',
                  end: 9,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('adventure')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.currentView).toEqual('project')
              expect(finalFileState.ui.bookDialog).toEqual({
                bookId: 5,
                isOpen: true,
              })
            })
          })
          describe('and a book hit in the book "theme"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('n64'))
            store.dispatch(
              jumpToHit(cards, 'project', { hit: 'n64', path: '/project/book/5/theme/0' })
            )
            it('should navigate to the project tab, open the book dialog and push the relevant focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              ).toEqual(
                omit(fileState.ui, ['projectTab', 'searchDialog', 'currentView', 'bookDialog'])
              )
              expect(finalFileState.ui.projectTab.focus[0]).toEqual({
                path: ['book', 5, 'theme'],
                selection: {
                  direction: 'forward',
                  end: 3,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('n64')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.currentView).toEqual('project')
              expect(finalFileState.ui.bookDialog).toEqual({
                bookId: 5,
                isOpen: true,
              })
            })
          })
        })
      })
    })
    describe('considering the timeline tab', () => {
      describe('given a book id that does not exist', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('of time'))
        store.dispatch(
          jumpToHit(cards, 'timeline', {
            hit: 'Intro- awake',
            path: '/timeline/23/card/19/title/0',
          })
        )
        it('should not navigate nor should it push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a card id that does not exist', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('of time'))
        store.dispatch(
          jumpToHit(cards, 'timeline', { hit: 'Intro- awake', path: '/timeline/8/card/822/title' })
        )
        it('should not navigate nor should it push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a card id that exists', () => {
        describe('given a card hit base attribute that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('of time'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'Intro- awake',
              path: '/timeline/8/card/19/bestThing/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a custom attribute that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('of time'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'Intro- awake',
              path: '/timeline/8/card/19/customAttribute/blarg/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a template attribute for a template that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('a value'))
          // NOTE: The correct template id is sc4(!)
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'Intro- awake',
              path: '/timeline/8/card/19/templateAttribute/sc5/Goal/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a template attribute that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('a value'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'Intro- awake',
              path: '/timeline/8/card/19/templateAttribute/sc4/Goal-yay!/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a card title hit', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Intro- awake'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'Intro- awake',
              path: '/timeline/8/card/19/title/0',
            })
          )
          it('should navigate to the timeline card dialog & push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.timeline.focus[0]).toEqual({
              path: ['card', 19, 'title'],
              selection: {
                direction: 'forward',
                end: 12,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('Intro- awake')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('timeline')
            expect(finalFileState.ui.currentTimeline).toEqual(8)
            expect(finalFileState.ui.cardDialog).toEqual({
              activeTab: 1,
              beatId: 21,
              cardId: 19,
              isOpen: true,
              lineId: 14,
              deleting: false,
              removeWhichTemplate: null,
              removing: false,
              showColorPicker: false,
              showTemplatePicker: false,
            })
          })
        })
        describe('given a hit on the series timeline', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('The target'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'The target',
              path: '/timeline/series/card/50/title/0',
            })
          )
          it('should navigate to the timeline card dialog & push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.timeline.focus[0]).toEqual({
              path: ['card', 50, 'title'],
              selection: {
                direction: 'forward',
                end: 10,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('The target')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('timeline')
            expect(finalFileState.ui.currentTimeline).toEqual('series')
            expect(finalFileState.ui.cardDialog).toEqual({
              activeTab: 1,
              beatId: 1,
              cardId: 50,
              isOpen: true,
              lineId: 2,
              deleting: false,
              removeWhichTemplate: null,
              removing: false,
              showColorPicker: false,
              showTemplatePicker: false,
            })
          })
        })
        describe('given a card description hit', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('The old man'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'The old man',
              path: '/timeline/8/card/19/description/0',
            })
          )
          it('should navigate to the timeline card dialog & push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.timeline.focus[0]).toEqual({
              path: ['card', 19, 'description'],
              selection: {
                direction: 'forward',
                end: 11,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('The old man')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('timeline')
            expect(finalFileState.ui.currentTimeline).toEqual(8)
            expect(finalFileState.ui.cardDialog).toEqual({
              activeTab: 1,
              beatId: 21,
              cardId: 19,
              isOpen: true,
              lineId: 14,
              deleting: false,
              removeWhichTemplate: null,
              removing: false,
              showColorPicker: false,
              showTemplatePicker: false,
            })
          })
        })
        describe('given a hit on a custom attribute', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('another reference'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'another reference',
              path: '/timeline/8/card/19/customAttribute/attr 1/7',
            })
          )
          it('should navigate to the timeline card dialog, open the attributes tab and push focus for that attribute', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.timeline.focus[0]).toEqual({
              path: ['card', 19, 'attr 1'],
              selection: {
                direction: 'forward',
                end: 24,
                start: 7,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('another reference')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('timeline')
            expect(finalFileState.ui.currentTimeline).toEqual(8)
            expect(finalFileState.ui.cardDialog).toEqual({
              activeTab: 2,
              beatId: 21,
              cardId: 19,
              isOpen: true,
              lineId: 14,
              deleting: false,
              removeWhichTemplate: null,
              removing: false,
              showColorPicker: false,
              showTemplatePicker: false,
            })
          })
        })
        describe('given a hit on a template attribute', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('A value'))
          store.dispatch(
            jumpToHit(cards, 'timeline', {
              hit: 'A value',
              path: '/timeline/8/card/19/templateAttribute/sc4/Goal/0',
            })
          )
          it('should navigate to the timeline card dialog, open the correct template tab and push the focus for that attribute', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.timeline.focus[0]).toEqual({
              path: ['card', 19, 'template', 'sc4', 'Goal'],
              selection: {
                direction: 'forward',
                end: 7,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('A value')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('timeline')
            expect(finalFileState.ui.currentTimeline).toEqual(8)
            expect(finalFileState.ui.cardDialog).toEqual({
              activeTab: 3,
              beatId: 21,
              cardId: 19,
              isOpen: true,
              lineId: 14,
              deleting: false,
              removeWhichTemplate: null,
              removing: false,
              showColorPicker: false,
              showTemplatePicker: false,
            })
          })
        })
      })
    })
    describe('considering the outline tab', () => {
      describe('given a book id that does not exist', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('of time'))
        store.dispatch(
          jumpToHit(cards, 'outline', { hit: 'Intro- awake', path: '/outline/23/card/19/title/0' })
        )
        it('should not navigate nor should it push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a card id that does not exist', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('Intro- awake'))
        store.dispatch(
          jumpToHit(cards, 'outline', { hit: 'Intro- awake', path: '/outline/8/card/91/title/0' })
        )
        it('should not navigate nor should it push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a card id that exists', () => {
        describe('given a card hit base attribute that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Intro- awake'))
          store.dispatch(
            jumpToHit(cards, 'outline', {
              hit: 'Intro- awake',
              path: '/outline/8/card/19/titlezzz/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a hit on a card title', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Intro- awake'))
          store.dispatch(
            jumpToHit(cards, 'outline', { hit: 'Intro- awake', path: '/outline/8/card/19/title/0' })
          )
          it('should navigate to the outline tab edit the card and push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'outlineTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'outlineTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.outlineTab.focus[0]).toEqual({
              path: ['card', 19, 'title'],
              selection: {
                direction: 'forward',
                end: 12,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('Intro- awake')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('outline')
            expect(finalFileState.ui.currentTimeline).toEqual(8)
            expect(finalFileState.ui.outlineTab).toEqual({
              cardEditor: {
                editing: 19,
              },
              focus: [
                {
                  path: ['card', 19, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 12,
                    start: 0,
                  },
                },
                {
                  path: ['card', 10, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 13,
                    start: 10,
                  },
                },
                {
                  path: ['card', 13, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 3,
                  },
                },
                {
                  path: ['card', 19, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 67,
                    start: 64,
                  },
                },
                {
                  path: ['card', 23, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 82,
                    start: 79,
                  },
                },
                {
                  path: ['card', 26, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 11,
                    start: 8,
                  },
                },
                {
                  path: ['card', 31, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 10,
                    start: 7,
                  },
                },
              ],
              selectedCard: 19,
            })
          })
        })
        describe('given a hit on a card description', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('The old man'))
          store.dispatch(
            jumpToHit(cards, 'outline', {
              hit: 'The old man',
              path: '/outline/8/card/19/description/0',
            })
          )
          it('should navigate to the outline tab edit the card and push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'outlineTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'outlineTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.outlineTab.focus[0]).toEqual({
              path: ['card', 19, 'description'],
              selection: {
                direction: 'forward',
                end: 11,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('The old man')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('outline')
            expect(finalFileState.ui.currentTimeline).toEqual(8)
            expect(finalFileState.ui.outlineTab).toEqual({
              cardEditor: {
                editing: 19,
              },
              focus: [
                {
                  path: ['card', 19, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 11,
                    start: 0,
                  },
                },
                {
                  path: ['card', 10, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 13,
                    start: 10,
                  },
                },
                {
                  path: ['card', 13, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 3,
                  },
                },
                {
                  path: ['card', 23, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 82,
                    start: 79,
                  },
                },
                {
                  path: ['card', 26, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 11,
                    start: 8,
                  },
                },
                {
                  path: ['card', 31, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 10,
                    start: 7,
                  },
                },
              ],
              selectedCard: 19,
            })
          })
        })
      })
    })
    describe('considering the notes tab', () => {
      describe('given an id for a non-existent note', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('hey yo'))
        store.dispatch(jumpToHit(cards, 'notes', { hit: 'hey yo', path: '/notes/8/content/0' }))
        it('should not navigate nor should it push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a note id that exists', () => {
        describe('given a base attribute that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Yo, this is'))
          store.dispatch(
            jumpToHit(cards, 'notes', { hit: 'Yo, this is', path: '/notes/1/titlezzz/0' })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('and a custom attribute name that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('here'))
          store.dispatch(
            jumpToHit(cards, 'notes', {
              hit: 'Yo, this is',
              path: '/notes/2/customAttribute/firstzz/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a hit for the title', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Yo, this is'))
          store.dispatch(
            jumpToHit(cards, 'notes', { hit: 'Yo, this is', path: '/notes/1/title/0' })
          )
          it('should navigate to the notes tab, edit the note and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'noteTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'noteTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.noteTab.focus[0]).toEqual({
              path: ['note', 1, 'title'],
              selection: {
                direction: 'forward',
                end: 11,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('Yo, this is')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('notes')
            expect(finalFileState.ui.noteTab).toEqual({
              attributesDialogOpen: false,
              categoriesDialogOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['note', 1, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 11,
                    start: 0,
                  },
                },
                {
                  path: ['note', 2, 'third'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['note', 2, 'second'],
                  selection: {
                    direction: 'none',
                    end: 2,
                    start: 2,
                  },
                },
                {
                  path: ['note', 2, 'first'],
                  selection: {
                    direction: 'none',
                    end: 4,
                    start: 4,
                  },
                },
                {
                  path: ['note', 2, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 25,
                    start: 22,
                  },
                },
                {
                  path: ['note', 2, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
              ],
              selectedNote: 1,
              sortVisible: false,
            })
          })
        })
        describe('given a hit for the content', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('heres a note'))
          store.dispatch(
            jumpToHit(cards, 'notes', { hit: 'heres a note', path: '/notes/1/content/0' })
          )
          it('should navigate to the content tab, edit the note and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'noteTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'noteTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.noteTab.focus[0]).toEqual({
              path: ['note', 1, 'content'],
              selection: {
                direction: 'forward',
                end: 12,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('heres a note')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('notes')
            expect(finalFileState.ui.noteTab).toEqual({
              attributesDialogOpen: false,
              categoriesDialogOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['note', 1, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 12,
                    start: 0,
                  },
                },
                {
                  path: ['note', 2, 'third'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['note', 2, 'second'],
                  selection: {
                    direction: 'none',
                    end: 2,
                    start: 2,
                  },
                },
                {
                  path: ['note', 2, 'first'],
                  selection: {
                    direction: 'none',
                    end: 4,
                    start: 4,
                  },
                },
                {
                  path: ['note', 2, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 25,
                    start: 22,
                  },
                },
                {
                  path: ['note', 2, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
              ],
              selectedNote: 1,
              sortVisible: false,
            })
          })
        })
        describe('given a hit for a custom attribute', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('here'))
          store.dispatch(
            jumpToHit(cards, 'notes', { hit: 'here', path: '/notes/2/customAttribute/first/0' })
          )
          it('should navigate to the content tab, edit the note and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'noteTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'noteTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.noteTab.focus[0]).toEqual({
              path: ['note', 2, 'first'],
              selection: {
                direction: 'forward',
                end: 4,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('here')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('notes')
            expect(finalFileState.ui.noteTab).toEqual({
              attributesDialogOpen: false,
              categoriesDialogOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['note', 2, 'first'],
                  selection: {
                    direction: 'forward',
                    end: 4,
                    start: 0,
                  },
                },
                {
                  path: ['note', 2, 'third'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['note', 2, 'second'],
                  selection: {
                    direction: 'none',
                    end: 2,
                    start: 2,
                  },
                },
                {
                  path: ['note', 2, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 25,
                    start: 22,
                  },
                },
                {
                  path: ['note', 2, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
              ],
              selectedNote: 2,
              sortVisible: false,
            })
          })
        })
      })
    })
    describe('considering the character tab', () => {
      describe('and a character id that does not exist', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        // Correct character id is 3.  i.e. '/characters/3/name/8'
        store.dispatch(
          jumpToHit(cards, 'characters', { hit: 'Builder', path: '/characters/9/name/8' })
        )
        it('should not navigate nor push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('and a character id that exists', () => {
        describe('and a characters hit in the name of the character', () => {
          describe('and the path exists', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('builder'))
            store.dispatch(
              jumpToHit(cards, 'characters', { hit: 'Builder', path: '/characters/3/name/8' })
            )
            it('should navigate ta the characters tab, display the character in the appropriate book and push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['characterTab', 'searchDialog', 'currentView'])
              ).toEqual(omit(fileState.ui, ['characterTab', 'searchDialog', 'currentView']))
              expect(finalFileState.ui.characterTab.focus[0]).toEqual({
                path: ['character', 3, 'name'],
                selection: {
                  direction: 'forward',
                  end: 15,
                  start: 8,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('builder')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.characterTab.editingSelected).toBeTruthy()
              expect(finalFileState.ui.currentView).toEqual('characters')
            })
          })
        })
        describe('for a book that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Yo'))
          store.dispatch(
            jumpToHit(cards, 'characters', {
              hit: 'Yo',
              path: '/characters/3/customAttribute/2/88/0',
            })
          )
          it('should not navigate nor push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('for a book that does exist', () => {
          describe('and the id of the description attribute', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm("I'm some"))
            store.dispatch(
              jumpToHit(cards, 'characters', {
                hit: "I'm some",
                path: '/characters/1/customAttribute/1/5/0',
              })
            )
            it('should navigate to the character in the appropriate book with the description tab open and push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['characterTab', 'searchDialog', 'currentView'])
              ).toEqual(omit(fileState.ui, ['characterTab', 'searchDialog', 'currentView']))
              expect(finalFileState.ui.characterTab.focus[0]).toEqual({
                path: ['character', 1, 'customAttribute', 1, 5],
                selection: {
                  direction: 'forward',
                  end: 8,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual("I'm some")
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.characterTab.editingSelected).toBeTruthy()
              expect(finalFileState.ui.currentView).toEqual('characters')
              expect(finalFileState.ui.characterTab).toEqual({
                attributesDialogOpen: false,
                categoriesDialogOpen: false,
                characterEditor: {
                  activeTab: 1,
                  deleting: false,
                  removeWhichTemplate: null,
                  removing: false,
                  showTemplatePicker: false,
                },
                creating: false,
                detailsVisible: true,
                editingSelected: true,
                filterVisible: false,
                focus: [
                  {
                    path: ['character', 1, 'customAttribute', 1, 5],
                    selection: {
                      direction: 'forward',
                      end: 8,
                      start: 0,
                    },
                  },
                  {
                    path: ['character', 3, 4, 5],
                    selection: {
                      direction: 'none',
                      end: 4,
                      start: 4,
                    },
                  },
                  {
                    path: ['character', 3, 3, 5],
                    selection: {
                      direction: 'none',
                      end: 5,
                      start: 5,
                    },
                  },
                  {
                    path: ['character', 3, 2, 5],
                    selection: {
                      direction: 'none',
                      end: 2,
                      start: 2,
                    },
                  },
                  {
                    path: ['character', 3, 'template', 'ch3', 'Description', 5],
                    selection: {
                      anchor: {
                        offset: 31,
                        path: [0, 0],
                      },
                      focus: {
                        offset: 31,
                        path: [0, 0],
                      },
                    },
                  },
                  {
                    path: ['character', 3, 'template', 'ch3', 'Birth Order', 5],
                    selection: {
                      direction: 'none',
                      end: 4,
                      start: 4,
                    },
                  },
                  {
                    path: ['character', 3, 'customAttribute', 1, 'all'],
                    selection: {
                      direction: 'forward',
                      end: 119,
                      start: 116,
                    },
                  },
                  {
                    path: ['character', 3, 'name'],
                    selection: {
                      direction: 'forward',
                      end: 7,
                      start: 4,
                    },
                  },
                  {
                    path: ['character', 3, 'description', 1, 'all'],
                    selection: {
                      anchor: {
                        offset: 72,
                        path: [1, 0],
                      },
                      focus: {
                        offset: 72,
                        path: [1, 0],
                      },
                    },
                  },
                ],
                selectedCharacter: 1,
                showTemplatePicker: false,
                sortVisible: false,
                templateData: null,
              })
            })
          })
          describe('and the id of the short description attribute', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('Hi there'))
            store.dispatch(
              jumpToHit(cards, 'characters', {
                hit: 'Hi there',
                path: '/characters/1/customAttribute/5/5/0',
              })
            )
            it('should navigate to the character in the appropriate book with the description tab open and push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, ['characterTab', 'searchDialog', 'currentView'])
              ).toEqual(omit(fileState.ui, ['characterTab', 'searchDialog', 'currentView']))
              expect(finalFileState.ui.characterTab.focus[0]).toEqual({
                path: ['character', 1, 'customAttribute', 5, 5],
                selection: {
                  direction: 'forward',
                  end: 8,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('Hi there')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.characterTab.editingSelected).toBeTruthy()
              expect(finalFileState.ui.currentView).toEqual('characters')
              expect(finalFileState.ui.characterTab).toEqual({
                attributesDialogOpen: false,
                categoriesDialogOpen: false,
                characterEditor: {
                  activeTab: 1,
                  deleting: false,
                  removeWhichTemplate: null,
                  removing: false,
                  showTemplatePicker: false,
                },
                creating: false,
                detailsVisible: true,
                editingSelected: true,
                filterVisible: false,
                focus: [
                  {
                    path: ['character', 1, 'customAttribute', 5, 5],
                    selection: {
                      direction: 'forward',
                      end: 8,
                      start: 0,
                    },
                  },
                  {
                    path: ['character', 3, 4, 5],
                    selection: {
                      direction: 'none',
                      end: 4,
                      start: 4,
                    },
                  },
                  {
                    path: ['character', 3, 3, 5],
                    selection: {
                      direction: 'none',
                      end: 5,
                      start: 5,
                    },
                  },
                  {
                    path: ['character', 3, 2, 5],
                    selection: {
                      direction: 'none',
                      end: 2,
                      start: 2,
                    },
                  },
                  {
                    path: ['character', 3, 'template', 'ch3', 'Description', 5],
                    selection: {
                      anchor: {
                        offset: 31,
                        path: [0, 0],
                      },
                      focus: {
                        offset: 31,
                        path: [0, 0],
                      },
                    },
                  },
                  {
                    path: ['character', 3, 'template', 'ch3', 'Birth Order', 5],
                    selection: {
                      direction: 'none',
                      end: 4,
                      start: 4,
                    },
                  },
                  {
                    path: ['character', 3, 'customAttribute', 1, 'all'],
                    selection: {
                      direction: 'forward',
                      end: 119,
                      start: 116,
                    },
                  },
                  {
                    path: ['character', 3, 'name'],
                    selection: {
                      direction: 'forward',
                      end: 7,
                      start: 4,
                    },
                  },
                  {
                    path: ['character', 3, 'description', 1, 'all'],
                    selection: {
                      anchor: {
                        offset: 72,
                        path: [1, 0],
                      },
                      focus: {
                        offset: 72,
                        path: [1, 0],
                      },
                    },
                  },
                ],
                selectedCharacter: 1,
                showTemplatePicker: false,
                sortVisible: false,
                templateData: null,
              })
            })
          })
          describe('and the id of a custom attribute', () => {
            describe('that does not exist', () => {
              const store = storeWithZelda()
              const fileState = fullFileStateSelector(store.getState())
              const cards = allCardsSelector(store.getState())
              store.dispatch(setSearchTerm('Hi there'))
              store.dispatch(
                jumpToHit(cards, 'characters', {
                  hit: 'Hi there',
                  path: '/characters/1/customAttribute/99/5/0',
                })
              )
              it('should not navigate nor push the focus', async () => {
                // Insert a delay because navigation is scheduled async.
                await new Promise((resolve) => {
                  setTimeout(resolve, 100)
                })
                const finalFileState = fullFileStateSelector(store.getState())
                expect(
                  omit(withoutChangesWeDontCareAbout(finalFileState), [
                    'ui.searchDialog.currentHitIndex',
                    'ui.searchDialog.term',
                  ])
                ).toEqual(
                  omit(withoutChangesWeDontCareAbout(fileState), [
                    'ui.searchDialog.currentHitIndex',
                    'ui.searchDialog.term',
                  ])
                )
              })
            })
            describe('that exists', () => {
              const store = storeWithZelda()
              const fileState = fullFileStateSelector(store.getState())
              const cards = allCardsSelector(store.getState())
              store.dispatch(setSearchTerm('hi'))
              store.dispatch(
                jumpToHit(cards, 'characters', {
                  hit: 'hi',
                  path: '/characters/3/customAttribute/2/5/0',
                })
              )
              it('should navigate to the character, the correct book tab and the custom attribute tab, then push the focus', async () => {
                // Insert a delay because navigation is scheduled async.
                await new Promise((resolve) => {
                  setTimeout(resolve, 100)
                })
                const finalFileState = fullFileStateSelector(store.getState())
                expect(
                  withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)
                ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState))
                expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
                expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
                expect(
                  omit(finalFileState.ui, ['characterTab', 'searchDialog', 'currentView'])
                ).toEqual(omit(fileState.ui, ['characterTab', 'searchDialog', 'currentView']))
                expect(finalFileState.ui.characterTab.focus[0]).toEqual({
                  path: ['character', 3, 'customAttribute', 2, 5],
                  selection: {
                    direction: 'forward',
                    end: 2,
                    start: 0,
                  },
                })
                expect(finalFileState.ui.searchDialog.term).toEqual('hi')
                expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
                expect(finalFileState.ui.characterTab.editingSelected).toBeTruthy()
                expect(finalFileState.ui.currentView).toEqual('characters')
                expect(finalFileState.ui.characterTab).toEqual({
                  attributesDialogOpen: false,
                  categoriesDialogOpen: false,
                  characterEditor: {
                    activeTab: 2,
                    deleting: false,
                    removeWhichTemplate: null,
                    removing: false,
                    showTemplatePicker: false,
                  },
                  creating: false,
                  detailsVisible: true,
                  editingSelected: true,
                  filterVisible: false,
                  focus: [
                    {
                      path: ['character', 3, 'customAttribute', 2, 5],
                      selection: {
                        direction: 'forward',
                        end: 2,
                        start: 0,
                      },
                    },
                    {
                      path: ['character', 3, 4, 5],
                      selection: {
                        direction: 'none',
                        end: 4,
                        start: 4,
                      },
                    },
                    {
                      path: ['character', 3, 3, 5],
                      selection: {
                        direction: 'none',
                        end: 5,
                        start: 5,
                      },
                    },
                    {
                      path: ['character', 3, 2, 5],
                      selection: {
                        direction: 'none',
                        end: 2,
                        start: 2,
                      },
                    },
                    {
                      path: ['character', 3, 'template', 'ch3', 'Description', 5],
                      selection: {
                        anchor: {
                          offset: 31,
                          path: [0, 0],
                        },
                        focus: {
                          offset: 31,
                          path: [0, 0],
                        },
                      },
                    },
                    {
                      path: ['character', 3, 'template', 'ch3', 'Birth Order', 5],
                      selection: {
                        direction: 'none',
                        end: 4,
                        start: 4,
                      },
                    },
                    {
                      path: ['character', 3, 'customAttribute', 1, 'all'],
                      selection: {
                        direction: 'forward',
                        end: 119,
                        start: 116,
                      },
                    },
                    {
                      path: ['character', 3, 'name'],
                      selection: {
                        direction: 'forward',
                        end: 7,
                        start: 4,
                      },
                    },
                    {
                      path: ['character', 3, 'description', 1, 'all'],
                      selection: {
                        anchor: {
                          offset: 72,
                          path: [1, 0],
                        },
                        focus: {
                          offset: 72,
                          path: [1, 0],
                        },
                      },
                    },
                  ],
                  selectedCharacter: 3,
                  showTemplatePicker: false,
                  sortVisible: false,
                  templateData: null,
                })
              })
            })
          })
          describe('and a template', () => {
            describe('that does not exist', () => {
              const store = storeWithZelda()
              const fileState = fullFileStateSelector(store.getState())
              const cards = allCardsSelector(store.getState())
              store.dispatch(setSearchTerm('hi'))
              store.dispatch(
                jumpToHit(cards, 'characters', {
                  hit: 'hi',
                  path: '/characters/3/templateAttribute/ch10/Birth Order/5/0',
                })
              )
              it('should not navigate nor push the focus', async () => {
                // Insert a delay because navigation is scheduled async.
                await new Promise((resolve) => {
                  setTimeout(resolve, 100)
                })
                const finalFileState = fullFileStateSelector(store.getState())
                expect(
                  omit(withoutChangesWeDontCareAbout(finalFileState), [
                    'ui.searchDialog.currentHitIndex',
                    'ui.searchDialog.term',
                  ])
                ).toEqual(
                  omit(withoutChangesWeDontCareAbout(fileState), [
                    'ui.searchDialog.currentHitIndex',
                    'ui.searchDialog.term',
                  ])
                )
              })
            })
            describe('that does exist', () => {
              describe('and an attribute name', () => {
                describe('that does not exist on the template', () => {
                  const store = storeWithZelda()
                  const fileState = fullFileStateSelector(store.getState())
                  const cards = allCardsSelector(store.getState())
                  store.dispatch(setSearchTerm('hi'))
                  store.dispatch(
                    jumpToHit(cards, 'characters', {
                      hit: 'hi',
                      path: '/characters/3/templateAttribute/ch3/Birth Orderzz/5/0',
                    })
                  )
                  it('should not navigate nor push the focus', async () => {
                    // Insert a delay because navigation is scheduled async.
                    await new Promise((resolve) => {
                      setTimeout(resolve, 100)
                    })
                    const finalFileState = fullFileStateSelector(store.getState())
                    expect(
                      omit(withoutChangesWeDontCareAbout(finalFileState), [
                        'ui.searchDialog.currentHitIndex',
                        'ui.searchDialog.term',
                      ])
                    ).toEqual(
                      omit(withoutChangesWeDontCareAbout(fileState), [
                        'ui.searchDialog.currentHitIndex',
                        'ui.searchDialog.term',
                      ])
                    )
                  })
                })
                describe('that does exist on the template', () => {
                  const store = storeWithZelda()
                  const fileState = fullFileStateSelector(store.getState())
                  const cards = allCardsSelector(store.getState())
                  store.dispatch(setSearchTerm('Last'))
                  store.dispatch(
                    jumpToHit(cards, 'characters', {
                      hit: 'Last',
                      path: '/characters/3/templateAttribute/ch3/Birth Order/5/0',
                    })
                  )
                  it('should navigate to the character, book tab and correct template tab, then push the focus', async () => {
                    // Insert a delay because navigation is scheduled async.
                    await new Promise((resolve) => {
                      setTimeout(resolve, 100)
                    })
                    const finalFileState = fullFileStateSelector(store.getState())
                    expect(
                      withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)
                    ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState))
                    expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
                    expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
                    expect(
                      omit(finalFileState.ui, ['characterTab', 'searchDialog', 'currentView'])
                    ).toEqual(omit(fileState.ui, ['characterTab', 'searchDialog', 'currentView']))
                    expect(finalFileState.ui.characterTab.focus[0]).toEqual({
                      path: ['character', 3, 'template', 'ch3', 'Birth Order', 5],
                      selection: {
                        direction: 'forward',
                        end: 4,
                        start: 0,
                      },
                    })
                    expect(finalFileState.ui.searchDialog.term).toEqual('Last')
                    expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
                    expect(finalFileState.ui.characterTab.editingSelected).toBeTruthy()
                    expect(finalFileState.ui.currentView).toEqual('characters')
                    expect(finalFileState.ui.characterTab).toEqual({
                      attributesDialogOpen: false,
                      categoriesDialogOpen: false,
                      characterEditor: {
                        activeTab: 3,
                        deleting: false,
                        removeWhichTemplate: null,
                        removing: false,
                        showTemplatePicker: false,
                      },
                      creating: false,
                      detailsVisible: true,
                      editingSelected: true,
                      filterVisible: false,
                      focus: [
                        {
                          path: ['character', 3, 'template', 'ch3', 'Birth Order', 5],
                          selection: {
                            direction: 'forward',
                            end: 4,
                            start: 0,
                          },
                        },
                        {
                          path: ['character', 3, 4, 5],
                          selection: {
                            direction: 'none',
                            end: 4,
                            start: 4,
                          },
                        },
                        {
                          path: ['character', 3, 3, 5],
                          selection: {
                            direction: 'none',
                            end: 5,
                            start: 5,
                          },
                        },
                        {
                          path: ['character', 3, 2, 5],
                          selection: {
                            direction: 'none',
                            end: 2,
                            start: 2,
                          },
                        },
                        {
                          path: ['character', 3, 'template', 'ch3', 'Description', 5],
                          selection: {
                            anchor: {
                              offset: 31,
                              path: [0, 0],
                            },
                            focus: {
                              offset: 31,
                              path: [0, 0],
                            },
                          },
                        },
                        {
                          path: ['character', 3, 'customAttribute', 1, 'all'],
                          selection: {
                            direction: 'forward',
                            end: 119,
                            start: 116,
                          },
                        },
                        {
                          path: ['character', 3, 'name'],
                          selection: {
                            direction: 'forward',
                            end: 7,
                            start: 4,
                          },
                        },
                        {
                          path: ['character', 3, 'description', 1, 'all'],
                          selection: {
                            anchor: {
                              offset: 72,
                              path: [1, 0],
                            },
                            focus: {
                              offset: 72,
                              path: [1, 0],
                            },
                          },
                        },
                      ],
                      selectedCharacter: 3,
                      showTemplatePicker: false,
                      sortVisible: false,
                      templateData: null,
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
    describe('considering the places tab', () => {
      describe('given an id for a non-existent place', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('Hyrule'))
        store.dispatch(jumpToHit(cards, 'places', { hit: 'hey yo', path: '/places/8/content/0' }))
        it('should not navigate nor should it push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a place id that exists', () => {
        describe('given a base attribute that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Hyrule'))
          store.dispatch(
            jumpToHit(cards, 'places', { hit: 'Yo, this is', path: '/places/1/namezzz/0' })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('and a custom attribute name that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Hyrule'))
          store.dispatch(
            jumpToHit(cards, 'places', {
              hit: 'Yo, this is',
              path: '/places/2/customAttribute/firstzz/0',
            })
          )
          it('should not navigate nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('given a hit for the name', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Hyrule'))
          store.dispatch(jumpToHit(cards, 'places', { hit: 'Hyrule', path: '/places/1/name/0' }))
          it('should navigate to the places tab, edit the place and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.placeTab.focus[0]).toEqual({
              path: ['place', 1, 'name'],
              selection: {
                direction: 'forward',
                end: 6,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('Hyrule')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('places')
            expect(finalFileState.ui.placeTab).toEqual({
              attributeDialogOpen: false,
              categoriesOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['place', 1, 'name'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 0,
                  },
                },
                {
                  path: ['place', 2, 'three'],
                  selection: {
                    direction: 'none',
                    end: 1,
                    start: 1,
                  },
                },
                {
                  path: ['place', 2, 'two'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['place', 2, 'one'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['place', 2, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 23,
                    start: 20,
                  },
                },
                {
                  path: ['place', 2, 'name'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
                {
                  path: ['place', 1, 'notes'],
                  selection: {
                    direction: 'forward',
                    end: 3,
                    start: 0,
                  },
                },
              ],
              selectedPlace: 1,
              sortVisible: false,
            })
          })
        })
        describe('given a hit for the description', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('likes to hide there'))
          store.dispatch(
            jumpToHit(cards, 'places', {
              hit: 'likes to hide there',
              path: '/places/2/description/6',
            })
          )
          it('should navigate to the places tab, edit the place and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.placeTab.focus[0]).toEqual({
              path: ['place', 2, 'description'],
              selection: {
                direction: 'forward',
                end: 25,
                start: 6,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('likes to hide there')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('places')
            expect(finalFileState.ui.placeTab).toEqual({
              attributeDialogOpen: false,
              categoriesOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['place', 2, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 25,
                    start: 6,
                  },
                },
                {
                  path: ['place', 2, 'three'],
                  selection: {
                    direction: 'none',
                    end: 1,
                    start: 1,
                  },
                },
                {
                  path: ['place', 2, 'two'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['place', 2, 'one'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['place', 2, 'name'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
                {
                  path: ['place', 1, 'notes'],
                  selection: {
                    direction: 'forward',
                    end: 3,
                    start: 0,
                  },
                },
              ],
              selectedPlace: 2,
              sortVisible: false,
            })
          })
        })
        describe('given a hit for the notes', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('The castle'))
          store.dispatch(
            jumpToHit(cards, 'places', { hit: 'The castle', path: '/places/1/notes/0' })
          )
          it('should navigate to the places tab, edit the place and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.placeTab.focus[0]).toEqual({
              path: ['place', 1, 'notes'],
              selection: {
                direction: 'forward',
                end: 10,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('The castle')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('places')
            expect(finalFileState.ui.noteTab).toEqual({
              attributesDialogOpen: false,
              categoriesDialogOpen: false,
              editingSelected: false,
              filterVisible: false,
              focus: [
                {
                  path: ['note', 2, 'third'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['note', 2, 'second'],
                  selection: {
                    direction: 'none',
                    end: 2,
                    start: 2,
                  },
                },
                {
                  path: ['note', 2, 'first'],
                  selection: {
                    direction: 'none',
                    end: 4,
                    start: 4,
                  },
                },
                {
                  path: ['note', 2, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 25,
                    start: 22,
                  },
                },
                {
                  path: ['note', 2, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
              ],
              selectedNote: 2,
              sortVisible: false,
            })
          })
        })
        describe('given a hit for a custom attribute', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('believe'))
          store.dispatch(
            jumpToHit(cards, 'places', { hit: 'believe', path: '/places/2/customAttribute/one/8' })
          )
          it('should navigate to the content tab, edit the place and push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'placeTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.placeTab.focus[0]).toEqual({
              path: ['place', 2, 'one'],
              selection: {
                direction: 'forward',
                end: 15,
                start: 8,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('believe')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('places')
            expect(finalFileState.ui.placeTab).toEqual({
              attributeDialogOpen: false,
              categoriesOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['place', 2, 'one'],
                  selection: {
                    direction: 'forward',
                    end: 15,
                    start: 8,
                  },
                },
                {
                  path: ['place', 2, 'three'],
                  selection: {
                    direction: 'none',
                    end: 1,
                    start: 1,
                  },
                },
                {
                  path: ['place', 2, 'two'],
                  selection: {
                    direction: 'none',
                    end: 15,
                    start: 15,
                  },
                },
                {
                  path: ['place', 2, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 23,
                    start: 20,
                  },
                },
                {
                  path: ['place', 2, 'name'],
                  selection: {
                    direction: 'forward',
                    end: 7,
                    start: 4,
                  },
                },
                {
                  path: ['place', 1, 'notes'],
                  selection: {
                    direction: 'forward',
                    end: 3,
                    start: 0,
                  },
                },
              ],
              selectedPlace: 2,
              sortVisible: false,
            })
          })
        })
      })
    })
    describe('considering the tags tab', () => {
      describe('given the id of a non-existent tag', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('its a tag'))
        store.dispatch(jumpToHit(cards, 'tags', { hit: 'its a tag', path: '/tags/22/title/0' }))
        it('should not navigate, nor should it push focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given a tag id that does exist', () => {
        describe('given a tag attribute that is not "title"', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('its a tag'))
          store.dispatch(
            jumpToHit(cards, 'tags', { hit: 'its a tag', path: '/tags/1/description/0' })
          )
          it('should not navigate, nor should it push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('and a tag attribute of "title"', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('its a tag'))
          store.dispatch(jumpToHit(cards, 'tags', { hit: 'its a tag', path: '/tags/1/title/0' }))
          it('should navigate to the tag and push focus for that tag title', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'tagTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'tagTab',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.tagTab.focus[0]).toEqual({
              path: ['tag', 1, 'title'],
              selection: {
                direction: 'forward',
                end: 9,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('its a tag')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('tags')
            expect(finalFileState.ui.tagTab).toEqual({
              editingSelectedTab: true,
              focus: [
                {
                  path: ['tag', 1, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 9,
                    start: 0,
                  },
                },
              ],
              selectedTag: 1,
            })
          })
        })
      })
    })
    describe('considering plotline titles', () => {
      describe('given the id of a non-existent line', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('its a tag'))
        store.dispatch(jumpToHit(cards, 'lines', { hit: 'Memories', path: '/lines/77/title/0' }))
        it('should not navigate, nor should it push focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given the id of a line that does exist', () => {
        describe('and a line attribute that is not "title"', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('its a tag'))
          store.dispatch(
            jumpToHit(cards, 'lines', { hit: 'Memories', path: '/lines/77/titlezz/0' })
          )
          it('should not navigate, nor should it push focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('and a line attribute of "title"', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Memories'))
          store.dispatch(jumpToHit(cards, 'lines', { hit: 'Memories', path: '/lines/16/title/0' }))
          it('should navigate to the line and push focus for that line title', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
              withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
            )
            expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
            expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
            expect(
              omit(finalFileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            ).toEqual(
              omit(fileState.ui, [
                'timeline',
                'searchDialog',
                'currentView',
                'cardDialog',
                'currentTimeline',
              ])
            )
            expect(finalFileState.ui.timeline.focus[0]).toEqual({
              path: ['line', 16, 'title'],
              selection: {
                direction: 'forward',
                end: 8,
                start: 0,
              },
            })
            expect(finalFileState.ui.searchDialog.term).toEqual('Memories')
            expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
            expect(finalFileState.ui.currentView).toEqual('timeline')
          })
        })
      })
    })
    describe('considering beat heading titles', () => {
      describe('given the id of a non-existent book', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        const cards = allCardsSelector(store.getState())
        store.dispatch(setSearchTerm('Replace me'))
        store.dispatch(
          jumpToHit(cards, 'beats', { hit: 'Replace me', path: '/beats/901/25/title/0' })
        )
        it('should not navigate, nor should push the focus', async () => {
          // Insert a delay because navigation is scheduled async.
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
          const finalFileState = fullFileStateSelector(store.getState())
          expect(
            omit(withoutChangesWeDontCareAbout(finalFileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          ).toEqual(
            omit(withoutChangesWeDontCareAbout(fileState), [
              'ui.searchDialog.currentHitIndex',
              'ui.searchDialog.term',
            ])
          )
        })
      })
      describe('given the id of a book that does exist', () => {
        describe('and a beat id that does not exist', () => {
          const store = storeWithZelda()
          const fileState = fullFileStateSelector(store.getState())
          const cards = allCardsSelector(store.getState())
          store.dispatch(setSearchTerm('Replace me'))
          store.dispatch(
            jumpToHit(cards, 'beats', { hit: 'Replace me', path: '/beats/9/250/title/0' })
          )
          it('should not navigate, nor should it push the focus', async () => {
            // Insert a delay because navigation is scheduled async.
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
            })
            const finalFileState = fullFileStateSelector(store.getState())
            expect(
              omit(withoutChangesWeDontCareAbout(finalFileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            ).toEqual(
              omit(withoutChangesWeDontCareAbout(fileState), [
                'ui.searchDialog.currentHitIndex',
                'ui.searchDialog.term',
              ])
            )
          })
        })
        describe('and a beat id that does exist', () => {
          describe('and an attribute type that is not "title"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('Replace me'))
            store.dispatch(
              jumpToHit(cards, 'beats', { hit: 'Replace me', path: '/beats/9/25/titlezz/0' })
            )
            it('should not navigate, nor should it push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(
                omit(withoutChangesWeDontCareAbout(finalFileState), [
                  'ui.searchDialog.currentHitIndex',
                  'ui.searchDialog.term',
                ])
              ).toEqual(
                omit(withoutChangesWeDontCareAbout(fileState), [
                  'ui.searchDialog.currentHitIndex',
                  'ui.searchDialog.term',
                ])
              )
            })
          })
          describe('and an attribute type that is "title"', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('Replace me'))
            store.dispatch(
              jumpToHit(cards, 'beats', { hit: 'Replace me', path: '/beats/9/25/title/0' })
            )
            it('should navigate to the timeline and push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, [
                  'timeline',
                  'searchDialog',
                  'currentView',
                  'cardDialog',
                  'currentTimeline',
                ])
              ).toEqual(
                omit(fileState.ui, [
                  'timeline',
                  'searchDialog',
                  'currentView',
                  'cardDialog',
                  'currentTimeline',
                ])
              )
              expect(finalFileState.ui.timeline.focus[0]).toEqual({
                path: ['beat', 9, 25, 'title'],
                selection: {
                  direction: 'forward',
                  end: 10,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('Replace me')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.currentView).toEqual('timeline')
            })
          })
          describe('and the beat is on the series tab', () => {
            const store = storeWithZelda()
            const fileState = fullFileStateSelector(store.getState())
            const cards = allCardsSelector(store.getState())
            store.dispatch(setSearchTerm('Builder beat'))
            store.dispatch(
              jumpToHit(cards, 'beats', { hit: 'Builder beat', path: '/beats/series/1/title/0' })
            )
            it('should navigate to the timeline and push the focus', async () => {
              // Insert a delay because navigation is scheduled async.
              await new Promise((resolve) => {
                setTimeout(resolve, 100)
              })
              const finalFileState = fullFileStateSelector(store.getState())
              expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(finalFileState)).toEqual(
                withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
              )
              expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
              expect(finalFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
              expect(
                omit(finalFileState.ui, [
                  'timeline',
                  'searchDialog',
                  'currentView',
                  'cardDialog',
                  'currentTimeline',
                ])
              ).toEqual(
                omit(fileState.ui, [
                  'timeline',
                  'searchDialog',
                  'currentView',
                  'cardDialog',
                  'currentTimeline',
                ])
              )
              expect(finalFileState.ui.timeline.focus[0]).toEqual({
                path: ['beat', 'series', 1, 'title'],
                selection: {
                  direction: 'forward',
                  end: 12,
                  start: 0,
                },
              })
              expect(finalFileState.ui.searchDialog.term).toEqual('Builder beat')
              expect(finalFileState.ui.searchDialog.currentHitIndex).toBe(0)
              expect(finalFileState.ui.currentView).toEqual('timeline')
            })
          })
        })
      })
    })
  })
})

describe('nextSearchHit', () => {
  describe('given an initial file', () => {
    describe('when setting the search term to "builder"', () => {
      it('should scan through the hits to the end and not roll over', async () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        store.dispatch(setSearchTerm('builder'))
        store.dispatch(startScanningSearch())
        const searchHits = flatSearchHitsSelector(store.getState())
        expect(searchHits).toEqual([
          {
            hit: 'Builder',
            path: '/project/series/name/22',
          },
          {
            hit: 'Builder',
            path: '/project/book/8/title/22',
          },
          {
            hit: 'Builder',
            path: '/timeline/7/card/23/description/54',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/description/68',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/customAttribute/attr 1/36',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/customAttribute/att 3/34',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/customAttribute/att 3/95',
          },
          {
            hit: 'Builder',
            path: '/outline/7/card/23/description/54',
          },
          {
            hit: 'Builder',
            path: '/outline/8/card/19/description/68',
          },
          {
            hit: 'Builder',
            path: '/notes/2/title/8',
          },
          {
            hit: 'Builder',
            path: '/notes/2/content/26',
          },
          {
            hit: 'Builder',
            path: '/characters/3/name/8',
          },
          {
            hit: 'Builder',
            path: '/characters/3/customAttribute/1/all/51',
          },
          {
            hit: 'Builder',
            path: '/places/2/name/8',
          },
          {
            hit: 'Builder',
            path: '/lines/15/title/10',
          },
          {
            hit: 'Builder',
            path: '/beats/series/1/title/0',
          },
        ])
        const currentHitIndex = searchDialogCurrentHitIndexSelector(store.getState())
        expect(currentHitIndex).toEqual(0)
        store.dispatch(nextSearchHit())
        await new Promise((resolve) => setTimeout(resolve, 500))
        const secondHitIndex = searchDialogCurrentHitIndexSelector(store.getState())
        expect(secondHitIndex).toEqual(1)
        const secondFileState = fullFileStateSelector(store.getState())
        expect(withoutChangesWeDontCareAboutNorUIAndApplicationState(secondFileState)).toEqual(
          withoutChangesWeDontCareAboutNorUIAndApplicationState(fileState)
        )
        expect(fileState.applicationState.userInteractions.jumpCounter).toEqual(0)
        expect(secondFileState.applicationState.userInteractions.jumpCounter).toEqual(1)
        expect(
          omit(secondFileState.ui, ['projectTab', 'bookDialog', 'searchDialog', 'currentView'])
        ).toEqual(omit(fileState.ui, ['projectTab', 'bookDialog', 'searchDialog', 'currentView']))
        expect(secondFileState.ui.projectTab.focus[0]).toEqual({
          path: ['book', 8, 'title'],
          selection: {
            direction: 'forward',
            end: 29,
            start: 22,
          },
        })
        expect(secondFileState.ui.projectTab).toEqual({
          focus: [
            {
              path: ['book', 8, 'title'],
              selection: {
                direction: 'forward',
                end: 29,
                start: 22,
              },
            },
            {
              path: ['book', 9, 'premise'],
              selection: {
                direction: 'forward',
                end: 8,
                start: 5,
              },
            },
            {
              path: ['book', 8, 'premise'],
              selection: {
                direction: 'forward',
                end: 8,
                start: 5,
              },
            },
            {
              path: ['book', 7, 'title'],
              selection: {
                direction: 'forward',
                end: 13,
                start: 10,
              },
            },
            {
              path: ['book', 6, 'title'],
              selection: {
                direction: 'forward',
                end: 3,
                start: 0,
              },
            },
            {
              path: ['book', 1, 'title'],
              selection: {
                direction: 'forward',
                end: 13,
                start: 10,
              },
            },
            {
              path: ['name'],
              selection: {
                direction: 'forward',
                end: 21,
                start: 18,
              },
            },
            {
              path: ['theme'],
              selection: {
                direction: 'none',
                end: 8,
                start: 8,
              },
            },
            {
              path: ['premise'],
              selection: {
                direction: 'none',
                end: 6,
                start: 6,
              },
            },
            {
              path: ['genre'],
              selection: {
                direction: 'none',
                end: 5,
                start: 5,
              },
            },
          ],
        })
        expect(secondFileState.ui.bookDialog).toEqual({
          bookId: 8,
          isOpen: true,
        })
        expect(secondFileState.ui.searchDialog.term).toEqual('builder')
        expect(secondFileState.ui.searchDialog.currentHitIndex).toBe(1)
        expect(secondFileState.ui.currentView).toEqual('project')
        for (let i = 0; i < 17; ++i) {
          store.dispatch(nextSearchHit())
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        const thirdHitIndex = searchDialogCurrentHitIndexSelector(store.getState())
        const thirdFileState = fullFileStateSelector(store.getState())
        expect(thirdHitIndex).toEqual(15)
        expect(thirdFileState.ui.placeTab.focus[0]).toEqual({
          path: ['place', 2, 'name'],
          selection: {
            direction: 'forward',
            end: 15,
            start: 8,
          },
        })
        for (let i = 0; i < 17; ++i) {
          store.dispatch(nextSearchHit())
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        expect(thirdHitIndex).toEqual(15)
        expect(thirdFileState.ui.placeTab.focus[0]).toEqual({
          path: ['place', 2, 'name'],
          selection: {
            direction: 'forward',
            end: 15,
            start: 8,
          },
        })
      }, 20000)
    })
  })
})

describe('pushFocus', () => {
  describe('given an invalid section', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    store.dispatch(
      pushFocus('projectzz', ['project', 'book', 3, 'title'], {
        start: 3,
        end: 5,
        direction: 'forward',
      })
    )
    store.dispatch(
      pushFocus(null, ['project', 'book', 3, 'title'], {
        start: 3,
        end: 5,
        direction: 'forward',
      })
    )
    store.dispatch(
      pushFocus(undefined, ['project', 'book', 3, 'title'], {
        start: 3,
        end: 5,
        direction: 'forward',
      })
    )
    it('should not change the state', () => {
      const finalFileState = fullFileStateSelector(store.getState())
      expect(finalFileState).toEqual(fileState)
    })
  })
  describe('given a valid section', () => {
    describe('and an invalid path', () => {
      const store = storeWithZelda()
      const fileState = fullFileStateSelector(store.getState())
      store.dispatch(pushFocus('project', undefined, { start: 3, end: 5, direction: 'forward' }))
      store.dispatch(pushFocus('project', null, { start: 3, end: 5, direction: 'forward' }))
      store.dispatch(pushFocus('project', ['unknown'], { start: 3, end: 5, direction: 'forward' }))
      store.dispatch(
        pushFocus('place', '/place/3/name', { start: 3, end: 5, direction: 'forward' })
      )
      it('should not change the state', () => {
        const finalFileState = fullFileStateSelector(store.getState())
        expect(finalFileState).toEqual(fileState)
      })
    })
    describe('and a valid path', () => {
      describe('and an invalid selection', () => {
        const store = storeWithZelda()
        const fileState = fullFileStateSelector(store.getState())
        store.dispatch(pushFocus('project', ['project', 'book', 3, 'title'], null))
        store.dispatch(pushFocus('project', ['project', 'book', 3, 'title'], undefined))
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            end: 5,
            direction: 'forward',
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            start: 3,
            end: 5,
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            start: 3,
            direction: 'forward',
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            anchor: {
              path: [1, 0],
            },
            focus: {
              path: [1, 0],
              offset: 72,
            },
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            anchor: {
              offset: 72,
            },
            focus: {
              path: [1, 0],
              offset: 72,
            },
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            anchor: {
              path: [1, 0],
            },
            focus: {
              path: [1, 0],
              offset: 72,
            },
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            anchor: {
              path: [1, 0],
              offset: 72,
            },
            focus: {
              offset: 72,
            },
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            anchor: {
              path: [1, 0],
              offset: 72,
            },
          })
        )
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            focus: {
              path: [1, 0],
              offset: 72,
            },
          })
        )
        it('should not change the state', () => {
          const finalFileState = fullFileStateSelector(store.getState())
          expect(finalFileState).toEqual(fileState)
        })
      })
      describe('and a valid HTML selection', () => {
        const store = storeWithZelda()
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            start: 2,
            end: 5,
            direction: 'forward',
          })
        )
        it('should update the appropriate focus', () => {
          const finalFileState = fullFileStateSelector(store.getState())
          expect(finalFileState.ui.projectTab.focus[0]).toEqual({
            path: ['project', 'book', 3, 'title'],
            selection: {
              direction: 'forward',
              end: 5,
              start: 2,
            },
          })
        })
      })
      describe('and a valid Slate selection', () => {
        const store = storeWithZelda()
        store.dispatch(
          pushFocus('project', ['project', 'book', 3, 'title'], {
            focus: {
              path: [1, 0],
              offset: 72,
            },
            anchor: {
              path: [1, 0],
              offset: 72,
            },
          })
        )
        it('should update the appropriate focus', () => {
          const finalFileState = fullFileStateSelector(store.getState())
          expect(finalFileState.ui.projectTab.focus[0]).toEqual({
            path: ['project', 'book', 3, 'title'],
            selection: {
              focus: {
                path: [1, 0],
                offset: 72,
              },
              anchor: {
                path: [1, 0],
                offset: 72,
              },
            },
          })
        })
      })
    })
  })
})

describe('previousSearchHit', () => {
  describe('given an initial file', () => {
    describe('when setting the search term to "builder"', () => {
      it('should scan through the hits from the end to the start without rolling under zero', async () => {
        const store = storeWithZelda()
        store.dispatch(setSearchTerm('builder'))
        store.dispatch(startScanningSearch())
        const searchHits = flatSearchHitsSelector(store.getState())
        expect(searchHits).toEqual([
          {
            hit: 'Builder',
            path: '/project/series/name/22',
          },
          {
            hit: 'Builder',
            path: '/project/book/8/title/22',
          },
          {
            hit: 'Builder',
            path: '/timeline/7/card/23/description/54',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/description/68',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/customAttribute/attr 1/36',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/customAttribute/att 3/34',
          },
          {
            hit: 'Builder',
            path: '/timeline/8/card/19/customAttribute/att 3/95',
          },
          {
            hit: 'Builder',
            path: '/outline/7/card/23/description/54',
          },
          {
            hit: 'Builder',
            path: '/outline/8/card/19/description/68',
          },
          {
            hit: 'Builder',
            path: '/notes/2/title/8',
          },
          {
            hit: 'Builder',
            path: '/notes/2/content/26',
          },
          {
            hit: 'Builder',
            path: '/characters/3/name/8',
          },
          {
            hit: 'Builder',
            path: '/characters/3/customAttribute/1/all/51',
          },
          {
            hit: 'Builder',
            path: '/places/2/name/8',
          },
          {
            hit: 'Builder',
            path: '/lines/15/title/10',
          },
          {
            hit: 'Builder',
            path: '/beats/series/1/title/0',
          },
        ])
        for (let i = 0; i < 17; ++i) {
          store.dispatch(nextSearchHit())
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        const secondHitIndex = searchDialogCurrentHitIndexSelector(store.getState())
        const secondFileState = fullFileStateSelector(store.getState())
        expect(secondHitIndex).toEqual(15)
        expect(secondFileState.ui.placeTab.focus[0]).toEqual({
          path: ['place', 2, 'name'],
          selection: {
            direction: 'forward',
            end: 15,
            start: 8,
          },
        })
        for (let i = 0; i < 17; ++i) {
          store.dispatch(previousSearchHit())
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        const thirdHitIndex = searchDialogCurrentHitIndexSelector(store.getState())
        const thirdFileState = fullFileStateSelector(store.getState())
        expect(thirdHitIndex).toEqual(0)
        expect(thirdFileState.ui.projectTab.focus[0]).toEqual({
          path: ['name'],
          selection: {
            direction: 'forward',
            end: 29,
            start: 22,
          },
        })
      }, 20000)
    })
  })
})

describe('replaceMarkedHits', () => {
  describe('given a file with no marked hits', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    store.dispatch(openSearch())
    const searchIsOpenInitially = searchDialogIsOpenSelector(store.getState())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(replaceMarkedHits())
    it('should not change the file, but it should close the search', () => {
      const finalState = fullFileStateSelector(store.getState())
      const searchIsOpen = searchDialogIsOpenSelector(store.getState())
      expect(
        omit(withoutChangesWeDontCareAbout(finalState), 'applicationState.userInteractions')
      ).toEqual(omit(withoutChangesWeDontCareAbout(fileState), 'applicationState.userInteractions'))
      expect(searchIsOpenInitially).toBeTruthy()
      expect(searchIsOpen).toBeFalsy()
    })
  })
  describe('given a state with hits in the title of a book and the series', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialBook8 = singleBookSelector(store.getState(), 8)
    const initialSeries = seriesSelector(store.getState())
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('builder'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Builder',
        path: '/project/series/name/22',
      })
    )
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Builder',
        path: '/project/book/8/title/22',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace those hits', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(
          omit(finalState, ['books.8', 'series'])
        )
      ).toEqual(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(
          omit(fileState, ['books.8', 'series'])
        )
      )
      const finalBook8 = singleBookSelector(store.getState(), 8)
      const finalSeries = seriesSelector(store.getState())
      expect(finalBook8.title).not.toEqual(initialBook8.title)
      expect(finalBook8.title).toEqual('The Legend of Bob the Bob the Builder')
      expect(finalSeries.name).not.toEqual(initialSeries.name)
      expect(finalSeries.name).toEqual('The Legend of Bob the Bob the Builder')
    })
  })
  describe('given a state with a hit in the premise of the series', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialSeries = seriesSelector(store.getState())
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setReplacementText('Woah!'))
    store.dispatch(setSearchTerm('things'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Things',
        path: '/project/series/premise/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'series'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(fileState, 'series')))
      const finalSeries = seriesSelector(store.getState())
      expect(finalSeries.premise).not.toEqual(initialSeries.premise)
      expect(finalSeries.premise).toEqual('Woah!')
    })
  })
  describe('given a state with a hit in the premise of the series', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialSeries = seriesSelector(store.getState())
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setReplacementText('Woah!'))
    store.dispatch(setSearchTerm('stuff'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Stuff',
        path: '/project/series/genre/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'series'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(fileState, 'series')))
      const finalSeries = seriesSelector(store.getState())
      expect(finalSeries.genre).not.toEqual(initialSeries.genre)
      expect(finalSeries.genre).toEqual('Woah!')
    })
  })
  describe('given a state with a hit in the theme of the series', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialSeries = seriesSelector(store.getState())
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setReplacementText('Woah!'))
    store.dispatch(setSearchTerm('Whatever'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Whatever',
        path: '/project/series/theme/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'series'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(fileState, 'series')))
      const finalSeries = seriesSelector(store.getState())
      expect(finalSeries.theme).not.toEqual(initialSeries.theme)
      expect(finalSeries.theme).toEqual('Woah!')
    })
  })
  describe('given a state with a hit in the premise of a book', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialBook8 = singleBookSelector(store.getState(), 8)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setReplacementText('escape reality'))
    store.dispatch(setSearchTerm('save the princess'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'save the princess',
        path: '/project/book/8/premise/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'books.8'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(fileState, 'books.8')))
      const finalBook8 = singleBookSelector(store.getState(), 8)
      expect(finalBook8.premise).not.toEqual(initialBook8.premise)
      expect(finalBook8.premise).toEqual('escape reality')
    })
  })
  describe('given a state with a hit in the genre of a book', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialBook8 = singleBookSelector(store.getState(), 8)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setReplacementText('escape reality'))
    store.dispatch(setSearchTerm('adventure'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'adventure',
        path: '/project/book/8/genre/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'books.8'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(fileState, 'books.8')))
      const finalBook8 = singleBookSelector(store.getState(), 8)
      expect(finalBook8.genre).not.toEqual(initialBook8.genre)
      expect(finalBook8.genre).toEqual('escape reality')
    })
  })
  describe('given a state with a hit in the theme of a book', () => {
    const store = storeWithZelda()
    const fileState = fullFileStateSelector(store.getState())
    const initialBook8 = singleBookSelector(store.getState(), 8)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setReplacementText('escape reality'))
    store.dispatch(setSearchTerm('NES'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'NES',
        path: '/project/book/8/theme/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'books.8'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(fileState, 'books.8')))
      const finalBook8 = singleBookSelector(store.getState(), 8)
      expect(finalBook8.theme).not.toEqual(initialBook8.theme)
      expect(finalBook8.theme).toEqual('escape reality')
    })
  })
  describe('given a state with a hit on a timeline card title', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCard = singleCardSelector(store.getState(), 19)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Intro-'))
    store.dispatch(setReplacementText('Heee yaaa'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Intro-',
        path: '/timeline/8/card/19/title/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCard = singleCardSelector(store.getState(), 19)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'cards'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'cards')))
      expect(finalCard.title).not.toEqual(initialCard.title)
      expect(finalCard.title).toEqual('Heee yaaa awake in a field and go in a cave')
    })
  })
  describe('given a state with a hit on a timeline card description', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCard = singleCardSelector(store.getState(), 19)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('The old'))
    store.dispatch(setReplacementText('Heee yaaa'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'The old',
        path: '/timeline/8/card/19/description/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCard = singleCardSelector(store.getState(), 19)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'cards'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'cards')))
      expect(finalCard.description).not.toEqual(initialCard.description)
      expect(finalCard.description).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Heee yaaa man hands Link a wooden sword',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: "Here's a reference to Bob the Builder.",
            },
          ],
        },
      ])
    })
  })
  describe('given a state with a hit on a timeline card custom attribute', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCard = singleCardSelector(store.getState(), 19)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm("Here's"))
    store.dispatch(setReplacementText('Heee yaaa'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: "Here's",
        path: '/timeline/8/card/19/customAttribute/attr 1/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCard = singleCardSelector(store.getState(), 19)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'cards'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'cards')))
      expect(finalCard['attr 1']).not.toEqual(initialCard['attr 1'])
      expect(finalCard['attr 1']).toEqual('Heee yaaa another reference to Bob the Builder.')
    })
  })
  describe('given a state with a hit on a timeline card template attribute', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialValue = templateAttributeValueSelector(19, 'sc4', 'Goal')(store.getState())
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('A value'))
    store.dispatch(setReplacementText('Heee yaaa'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'A value',
        path: '/timeline/8/card/19/templateAttribute/sc4/Goal/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalValue = templateAttributeValueSelector(19, 'sc4', 'Goal')(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'cards'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'cards')))
      expect(finalValue).not.toEqual(initialValue)
      expect(finalValue).toEqual('Heee yaaa')
    })
  })
  describe('given a state with hits on the outline tab', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCard = singleCardSelector(store.getState(), 19)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Intro-'))
    store.dispatch(setReplacementText('Heee yaaa'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Intro-',
        path: '/outline/8/card/19/title/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCard = singleCardSelector(store.getState(), 19)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'cards'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'cards')))
      expect(finalCard.title).not.toEqual(initialCard.title)
      expect(finalCard.title).toEqual('Heee yaaa awake in a field and go in a cave')
    })
  })
  describe('given a state with a hit on a outline card description', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCard = singleCardSelector(store.getState(), 19)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('The old'))
    store.dispatch(setReplacementText('Heee yaaa'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'The old',
        path: '/outline/8/card/19/description/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCard = singleCardSelector(store.getState(), 19)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'cards'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'cards')))
      expect(finalCard.description).not.toEqual(initialCard.description)
      expect(finalCard.description).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Heee yaaa man hands Link a wooden sword',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: "Here's a reference to Bob the Builder.",
            },
          ],
        },
      ])
    })
  })
  describe('given a state with hits on a note title', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialNote = singleNoteSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Yo, this'))
    store.dispatch(setReplacementText('Nerdy'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Yo, this',
        path: '/notes/1/title/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalNote = singleNoteSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'notes'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'notes')))
      expect(finalNote.title).not.toEqual(initialNote.title)
      expect(finalNote.title).toEqual('Nerdy is a note')
    })
  })
  describe('given a state with hits on a note description', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialNote = singleNoteSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('heres a note'))
    store.dispatch(setReplacementText('Nerdy'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'heres a note',
        path: '/notes/1/content/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalNote = singleNoteSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'notes'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'notes')))
      expect(finalNote.content).not.toEqual(initialNote.content)
      expect(finalNote.content).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Nerdy',
            },
          ],
        },
      ])
    })
  })
  describe('given a state with hits on a place title', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialPlace = singlePlaceSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Hyrule Castle'))
    store.dispatch(setReplacementText('Jumping Castle'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Hyrule Castle',
        path: '/places/1/name/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalPlace = singlePlaceSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'places'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'places')))
      expect(finalPlace.name).not.toEqual(initialPlace.name)
      expect(finalPlace.name).toEqual('Jumping Castle')
    })
  })
  describe('given a state with hits on a place notes', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialPlace = singlePlaceSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('The castle'))
    store.dispatch(setReplacementText('The cave'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'The castle',
        path: '/places/1/notes/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalPlace = singlePlaceSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'places'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'places')))
      expect(finalPlace.notes).not.toEqual(initialPlace.notes)
      expect(finalPlace.notes).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'The cave',
            },
          ],
        },
      ])
    })
  })
  describe('given a state with hits on a place description', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialPlace = singlePlaceSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('A cool place'))
    store.dispatch(setReplacementText('Caves are nice'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'A cool place',
        path: '/places/1/description/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalPlace = singlePlaceSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'places'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'places')))
      expect(finalPlace.description).not.toEqual(initialPlace.description)
      expect(finalPlace.description).toEqual('Caves are nice')
    })
  })
  describe('given a state with hits in a tag title', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialPlace = singleTagSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('its a tag'))
    store.dispatch(setReplacementText('The best thing!'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'its a tag',
        path: '/tags/1/title/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalPlace = singleTagSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'tags'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'tags')))
      expect(finalPlace.title).not.toEqual(initialPlace.title)
      expect(finalPlace.title).toEqual('The best thing!')
    })
  })
  describe('given a state with hits on a character name', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCharacter = singleCharacterSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Link'))
    store.dispatch(setReplacementText('Segment'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Link',
        path: '/characters/1/name/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCharacter = singleCharacterSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'characters'))
      ).toEqual(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'characters'))
      )
      expect(finalCharacter.name).not.toEqual(initialCharacter.name)
      expect(finalCharacter.name).toEqual('Segment')
    })
  })
  describe('given a state with hits on a character description', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCharacter = displayedSingleCharacterSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Hi there'))
    store.dispatch(setReplacementText('MVP'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Hi there',
        path: '/characters/1/customAttribute/5/5/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCharacter = displayedSingleCharacterSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'characters'))
      ).toEqual(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'characters'))
      )
      expect(finalCharacter.description).not.toEqual(initialCharacter.description)
      expect(finalCharacter.description).toEqual('MVP')
    })
  })
  describe('given a state with hits on a character legacy attribute', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialCharacter = displayedSingleCharacterSelector(store.getState(), 3)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm("she's got lazer eyes(!)"))
    store.dispatch(setReplacementText("she's got rocket boots(!)"))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: "she's got lazer eyes(!)",
        path: '/characters/3/customAttribute/Special Sauce/all/26',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCharacter = displayedSingleCharacterSelector(store.getState(), 3)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'characters'))
      ).toEqual(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'characters'))
      )
      expect(finalCharacter['Special Sauce']).not.toEqual(initialCharacter['Special Sauce'])
      expect(finalCharacter['Special Sauce']).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: "Her special sauce is that she's got rocket boots(!)",
            },
          ],
        },
      ])
    })
  })
  describe('given a state with hits on a character notes', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    store.dispatch(setActiveCharacterTab(5))
    const initialCharacter = displayedSingleCharacterSelector(store.getState(), 1)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm("I'm some notes"))
    store.dispatch(setReplacementText('MVP'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: "I'm some notes",
        path: '/characters/1/customAttribute/1/5/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalCharacter = displayedSingleCharacterSelector(store.getState(), 1)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'characters'))
      ).toEqual(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'characters'))
      )
      expect(finalCharacter.notes).not.toEqual(initialCharacter.notes)
      expect(finalCharacter.notes).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'MVP.',
            },
          ],
        },
      ])
    })
  })
  describe('given a state with hits on a character template attribute', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    store.dispatch(setActiveCharacterTab(5))
    const initialValue = characterTemplateAttributeValueSelector(
      store.getState(),
      3,
      'ch3',
      'Birth Order'
    )
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Last'))
    store.dispatch(setReplacementText('MVP'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Last',
        path: '/characters/3/templateAttribute/ch3/Birth Order/5/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalValue = characterTemplateAttributeValueSelector(
        store.getState(),
        3,
        'ch3',
        'Birth Order'
      )
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'characters'))
      ).toEqual(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'characters'))
      )
      expect(finalValue).not.toEqual(initialValue)
      expect(finalValue).toEqual('MVP')
    })
  })
  describe('given a state with a hit in a line title', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialValue = singleLineSelector(store.getState(), 16)
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Memories'))
    store.dispatch(setReplacementText('New Memories'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Memories',
        path: '/lines/16/title/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalValue = singleLineSelector(store.getState(), 16)
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'lines'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'lines')))
      expect(finalValue).not.toEqual(initialValue)
      expect(finalValue.title).toEqual('New Memories')
    })
  })
  describe('given a state with a hit in a beat title', () => {
    const store = storeWithZelda()
    const initialState = fullFileStateSelector(store.getState())
    const initialValue = allBeatsSelector(store.getState())
    store.dispatch(openSearch())
    store.dispatch(toggleReplaceSearch())
    store.dispatch(setSearchTerm('Replace me'))
    store.dispatch(setReplacementText('Replaced!'))
    store.dispatch(
      toggleHitMarkedForReplacement({
        hit: 'Replace me',
        path: '/beats/9/25/title/0',
      })
    )
    store.dispatch(replaceMarkedHits())
    it('should replace that hit', () => {
      const finalState = fullFileStateSelector(store.getState())
      const finalValue = allBeatsSelector(store.getState())
      expect(
        withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(initialState, 'beats'))
      ).toEqual(withoutChangesWeDontCareAboutNorUIAndApplicationState(omit(finalState, 'beats')))
      expect(finalValue).not.toEqual(initialValue)
      expect(finalValue['9'].index['25'].title).toEqual('Replaced!')
    })
  })
})

describe('resetTimeline', () => {
  describe('given the zelda book', () => {
    describe('when we are in a book that does not exist', () => {
      const store = storeWithZelda()
      const initialState = fullFileStateSelector(store.getState())
      store.dispatch(changeCurrentTimeline(2))
      store.dispatch(resetTimeline(2))
      it('should do nothing', () => {
        const withoutUnimportantDetails = (state) => {
          return omit(state, [
            'file.versionStamp',
            'file.dirty',
            'project.unsavedChanges',
            'ui.currentTimeline',
          ])
        }
        expect(withoutUnimportantDetails(fullFileStateSelector(store.getState()))).toEqual(
          withoutUnimportantDetails(initialState)
        )
      })
    })
    describe('when we are in book 1', () => {
      const store = storeWithZelda()
      const initialLines = allLinesSelector(store.getState())
      const initialCards = allCardsSelector(store.getState())
      const initialBeats = allBeatsSelector(store.getState())
      store.dispatch(changeCurrentTimeline(1))
      store.dispatch(resetTimeline(1))
      it('should delete beats, lines and cards for book 1', () => {
        const finalLines = allLinesSelector(store.getState())
        const finalCards = allCardsSelector(store.getState())
        const finalBeats = allBeatsSelector(store.getState())
        expect(finalLines).not.toEqual(initialLines)
        expect(finalCards).not.toEqual(initialCards)
        expect(finalBeats).not.toEqual(initialBeats)
        expect(finalLines).toEqual([
          {
            bookId: 1,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 17,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 7,
            characterId: null,
            color: '#78be20',
            expanded: null,
            fromTemplateId: null,
            id: 16,
            position: 1,
            title: 'Memories',
          },
          {
            bookId: 9,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 15,
            position: 0,
            title: 'Main Plot Builder',
          },
          {
            bookId: 8,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 14,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 7,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 13,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 6,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 12,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 5,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 11,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 'series',
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 2,
            position: 0,
            title: 'Main Plot',
          },
        ])
        expect(finalBeats['1']).toEqual({
          children: {
            34: [],
            null: [34],
          },
          heap: {
            34: null,
          },
          index: {
            34: {
              autoOutlineSort: true,
              bookId: 1,
              fromTemplateId: null,
              id: 34,
              position: 0,
              time: 0,
              title: 'auto',
            },
          },
        })
        expect(omit(finalBeats, '1')).toEqual(omit(initialBeats, '1'))
        const originalBook1BeatIds = new Set(Object.values(initialBeats['1'].index))
        const isFromBookOne = (card) => {
          return originalBook1BeatIds.has(card.beatId)
        }
        expect(finalCards.some(isFromBookOne)).toBeFalsy()
        const originalCardIds = new Set(initialCards.map(({ id }) => id))
        const isNewCard = ({ id }) => {
          return !originalCardIds.has(id)
        }
        expect(finalCards.filter(isNewCard)).toEqual([])
        const originalOtherBooksBeatIds = new Set(
          Object.values(omit(initialBeats, '1')).flatMap((beatTree) => {
            return Object.values(beatTree.index).map(({ id }) => id)
          })
        )
        expect(finalCards.filter((card) => !isNewCard(card))).toEqual(
          initialCards.filter((card) => originalOtherBooksBeatIds.has(card.beatId))
        )
      })
    })
    describe('when we are in book 5', () => {
      const store = storeWithZelda()
      const initialLines = allLinesSelector(store.getState())
      const initialCards = allCardsSelector(store.getState())
      const initialBeats = allBeatsSelector(store.getState())
      store.dispatch(changeCurrentTimeline(5))
      store.dispatch(resetTimeline(5))
      it('should delete beats, lines and cards for book 5', () => {
        const finalLines = allLinesSelector(store.getState())
        const finalCards = allCardsSelector(store.getState())
        const finalBeats = allBeatsSelector(store.getState())
        expect(finalLines).not.toEqual(initialLines)
        expect(finalCards).not.toEqual(initialCards)
        expect(finalBeats).not.toEqual(initialBeats)
        expect(finalLines).toEqual([
          {
            bookId: 5,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 17,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 7,
            characterId: null,
            color: '#78be20',
            expanded: null,
            fromTemplateId: null,
            id: 16,
            position: 1,
            title: 'Memories',
          },
          {
            bookId: 9,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 15,
            position: 0,
            title: 'Main Plot Builder',
          },
          {
            bookId: 8,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 14,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 7,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 13,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 6,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 12,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 1,
            characterId: null,
            color: '#78be20',
            expanded: null,
            fromTemplateId: null,
            id: 9,
            position: 1,
            title: 'subplot',
          },
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            position: 0,
            title: 'Main Plot',
          },
          {
            bookId: 'series',
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 2,
            position: 0,
            title: 'Main Plot',
          },
        ])
        expect(finalBeats['5']).toEqual({
          children: {
            34: [],
            null: [34],
          },
          heap: {
            34: null,
          },
          index: {
            34: {
              autoOutlineSort: true,
              bookId: 5,
              fromTemplateId: null,
              id: 34,
              position: 0,
              time: 0,
              title: 'auto',
            },
          },
        })
        expect(omit(finalBeats, '5')).toEqual(omit(initialBeats, '5'))
        const originalBook1BeatIds = new Set(Object.values(initialBeats['5'].index))
        const isFromBookOne = (card) => {
          return originalBook1BeatIds.has(card.beatId)
        }
        expect(finalCards.some(isFromBookOne)).toBeFalsy()
        const originalCardIds = new Set(initialCards.map(({ id }) => id))
        const isNewCard = ({ id }) => {
          return !originalCardIds.has(id)
        }
        expect(finalCards.filter(isNewCard)).toEqual([])
        const originalOtherBooksBeatIds = new Set(
          Object.values(omit(initialBeats, '5')).flatMap((beatTree) => {
            return Object.values(beatTree.index).map(({ id }) => id)
          })
        )
        expect(finalCards.filter((card) => !isNewCard(card))).toEqual(
          initialCards.filter((card) => originalOtherBooksBeatIds.has(card.beatId))
        )
      })
    })
  })
})

describe('changeCurrentTimeline', () => {
  describe('given the zelda book', () => {
    describe('when we are in book 1', () => {
      describe('and then we add a level of hierarchy', () => {
        describe('and then we view that timeline as stacked', () => {
          describe('and then we switch to a single-level timeline', () => {
            const store = storeWithZelda()
            store.dispatch(changeCurrentTimeline(1))
            store.dispatch(
              setHierarchyLevels([
                {
                  name: 'Chapter',
                  level: 0,
                  autoNumber: true,
                  textSize: 24,
                  borderStyle: 'DASHED',
                  backgroundColor: 'none',
                  textColor: '#78be20',
                  borderColor: '#78be20',
                  dark: {
                    textColor: '#baed79',
                    borderColor: '#baed79',
                  },
                  light: {
                    textColor: '#78be20',
                    borderColor: '#78be20',
                  },
                },
                {
                  textColor: '#0b1117',
                  borderStyle: 'NONE',
                  name: 'Scene',
                  autoNumber: true,
                  dark: {
                    borderColor: '#c9e6ff',
                    textColor: '#c9e6ff',
                  },
                  backgroundColor: 'none',
                  textSize: 24,
                  level: 1,
                  light: {
                    borderColor: '#6cace4',
                    textColor: '#0b1117',
                  },
                  borderColor: '#6cace4',
                },
              ])
            )
            store.dispatch(setTimelineView('stacked'))
            const originalView = selectedTimelineViewSelector(store.getState())
            store.dispatch(changeCurrentTimeline(5))
            const newView = selectedTimelineViewSelector(store.getState())
            it('should switch to the "default" view', () => {
              expect(originalView).toEqual('stacked')
              expect(newView).toEqual('default')
            })
          })
        })
      })
    })
  })
})
