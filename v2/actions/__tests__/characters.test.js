import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { removeSystemKeys } from '../../reducers/systemReducers'
import { goldilocks, hamlet_with_attribute_mix } from './fixtures'
import selectors from '../../selectors'
import actions from '../'

const {
  fullFileStateSelector,
  characterCustomAttributesSelector,
  allCharacterAttributesSelector,
  characterAttributesSelector,
  singleCharacterSelector,
  allBookIdsSelector,
  allCharactersSelector,
  allBooksWithCharactersInThemSortedByPositionInAllBookIdsSelector,
  characterAttributeTabSelector,
  visibleSortedCharactersByCategorySelector,
  currentTimelineSelector,
  displayedSingleCharacterSelector,
  characterAttributsForBookByIdSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile, selectCharacterAttributeBookTab, changeCurrentTimeline } = wiredUpActions.ui
const { editCharacterAttributeValue, addCharacter, reorderCharacter } = wiredUpActions.character
const { addBook } = wiredUpActions.book
const removeBookFromCharacter = wiredUpActions.character.removeBook
const addBookToCharacter = wiredUpActions.character.addBook

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

const exampleBook1 = {
  title: 'Book',
  premise: 'First book',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook5 = {
  title: 'Last Book',
  premise: 'Last Sequel',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook2 = {
  title: 'Second Book',
  premise: 'Sequel 1',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook3 = {
  title: 'Third Book',
  premise: 'Sequel 2',
  genre: 'Suspense',
  theme: 'Sequel',
}
const exampleBook4 = {
  title: 'Fourth Book',
  premise: 'Sequel 3',
  genre: 'Suspense',
  theme: 'Sequel',
}

const ignoringChangesWeDontCareAbout = (state) => {
  return {
    ...state,
    file: {
      ...state.file,
      dirty: null,
      versionStamp: null,
    },
  }
}

describe('editCharacterAttributeValue', () => {
  describe('given the initial state store', () => {
    it('should produce the initial state store', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(fullFileStateSelector(store.getState()))
      store.dispatch(editCharacterAttributeValue(1, 1, 'test'))
      const finalState = removeSystemKeys(fullFileStateSelector(store.getState()))
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(finalState)
      )
    })
  })
  describe('given a state with a legacy attribute', () => {
    describe('and an id that does not match that attribute', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Goldilocks', false, goldilocks, '2020.7.30', 'device:///tmp.dummy.pltr')
        )
        const initialState = removeSystemKeys(fullFileStateSelector(store.getState()))
        store.dispatch(editCharacterAttributeValue(1, 1, 'test'))
        const finalState = removeSystemKeys(fullFileStateSelector(store.getState()))
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(finalState)
        )
      })
    })
    describe('and the name of that attribute', () => {
      it('should add a new custom attribute and alter its value', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Goldilocks', false, goldilocks, '2020.7.30', 'device:///tmp.dummy.pltr')
        )
        const otherCharacterBefore = singleCharacterSelector(store.getState(), 2)
        expect(otherCharacterBefore.Species).toEqual('Bear')
        store.dispatch(editCharacterAttributeValue(1, 'Species', 'Borg'))
        const legacyAttributes = characterCustomAttributesSelector(store.getState())
        expect(legacyAttributes).toEqual([])
        const otherCharacterAfter = singleCharacterSelector(store.getState(), 2)
        expect(otherCharacterAfter.Species).toBeUndefined()
        expect(otherCharacterAfter.attributes).toEqual([
          {
            id: 1,
            bookId: 'all',
            value: 'Bear',
          },
        ])
        const character = singleCharacterSelector(store.getState(), 1)
        expect(character.Species).toBeUndefined()
        const characterAttributes = characterAttributesSelector(store.getState(), 1)
        expect(characterAttributes).toEqual([
          {
            id: 1,
            bookId: 'all',
            value: 'Borg',
            name: 'Species',
            type: 'text',
          },
        ])
        const attributes = allCharacterAttributesSelector(store.getState())
        expect(attributes).toEqual([
          {
            id: 1,
            type: 'text',
            name: 'Species',
          },
        ])
      })
    })
  })
})

describe('characterDeleteBook', () => {
  describe('given the state with emptyFile', () => {
    const store = initialStore()
    store.dispatch(addCharacter('character 1'))
    store.dispatch(addCharacter('character 2'))
    describe('and add 3 books', () => {
      store.dispatch(
        addBook(exampleBook1.title, exampleBook1.premise, exampleBook1.genre, exampleBook1.theme)
      )
      store.dispatch(
        addBook(exampleBook2.title, exampleBook2.premise, exampleBook2.genre, exampleBook2.theme)
      )
      store.dispatch(
        addBook(exampleBook3.title, exampleBook3.premise, exampleBook3.genre, exampleBook3.theme)
      )
      store.dispatch(
        addBook(exampleBook4.title, exampleBook4.premise, exampleBook4.genre, exampleBook4.theme)
      )
      store.dispatch(
        addBook(exampleBook5.title, exampleBook5.premise, exampleBook5.genre, exampleBook5.theme)
      )
      describe('and add books to characters', () => {
        const bookIdToRemove = 3
        store.dispatch(addBookToCharacter(1, 2))
        store.dispatch(addBookToCharacter(1, 6))
        store.dispatch(addBookToCharacter(1, bookIdToRemove))
        store.dispatch(addBookToCharacter(1, 4))
        store.dispatch(addBookToCharacter(1, 5))
        store.dispatch(addBookToCharacter(2, 2))
        store.dispatch(addBookToCharacter(2, 6))
        store.dispatch(addBookToCharacter(2, bookIdToRemove))
        store.dispatch(addBookToCharacter(2, 4))
        store.dispatch(addBookToCharacter(2, 5))
        const stateAfterAddingBooks = store.getState()
        const character1 = singleCharacterSelector(stateAfterAddingBooks, 1)
        const character2 = singleCharacterSelector(stateAfterAddingBooks, 2)
        const allBookIds = allBookIdsSelector(stateAfterAddingBooks)
        const allBooksWithCharactersOrdered =
          allBooksWithCharactersInThemSortedByPositionInAllBookIdsSelector(stateAfterAddingBooks)
        const stateAfterCharactersAndBooksAdd = store.getState()
        it('should have all the characters added', () => {
          const allCharacters = allCharactersSelector(stateAfterCharactersAndBooksAdd)
          expect(allCharacters).toHaveLength(2)
        })

        it('should have all books attach to each character', () => {
          expect(character1.bookIds).toHaveLength(5)
          expect(character2.bookIds).toHaveLength(5)
        })

        it('character bookIds should have same order as the book bookIds', () => {
          const stringifiedAllBookIds = allBookIds.map((id) => String(id))
          const allBooksWithCharactersIdsOrdered = allBooksWithCharactersOrdered.map(({ id }) =>
            String(id)
          )
          const filteredBookIds = stringifiedAllBookIds.filter((id) =>
            allBooksWithCharactersIdsOrdered.includes(id)
          )
          expect(filteredBookIds).toEqual(allBooksWithCharactersIdsOrdered)
        })

        const stateAfterBooksRemove = store.getState()
        describe('given the user move to specific book tab', () => {
          describe('and removes from the character the book', () => {
            store.dispatch(selectCharacterAttributeBookTab())
            store.dispatch(removeBookFromCharacter(character1.id, bookIdToRemove))
            store.dispatch(removeBookFromCharacter(character2.id, bookIdToRemove))

            it('should select the "Series" tab if the book has no characters', () => {
              const currentTab = characterAttributeTabSelector(stateAfterBooksRemove)
              expect(currentTab).toBe('all')
            })
          })
        })
      })
    })
  })
})

const getCharacterAbsolutePositionFromGroupedCategory = (groupedCategory, characterId) => {
  const flattenedGroups = Object.values(groupedCategory).flat()
  return flattenedGroups.findIndex((obj) => obj.id === characterId)
}

describe('reorderCharacter', () => {
  describe('given the new empty file', () => {
    describe('and loads hamlet file', () => {
      const store = configureStore()
      store.dispatch(
        loadFile(
          'Hamlet',
          false,
          hamlet_with_attribute_mix,
          '2020.7.30',
          'device:///tmp.dummy.pltr'
        )
      )

      const initialState = store.getState()
      const allCharacters = allCharactersSelector(initialState)
      const visibleSortedCharactersByCategory =
        visibleSortedCharactersByCategorySelector(initialState)

      it('should have loaded all 19 characters', () => {
        expect(allCharacters).toHaveLength(19)
      })

      const character1State = displayedSingleCharacterSelector(
        initialState,
        allCharacters.find(({ id }) => id == 1).id
      )
      const character2State = displayedSingleCharacterSelector(
        initialState,
        allCharacters.find(({ id }) => id == 2).id
      )
      const character3State = displayedSingleCharacterSelector(
        initialState,
        allCharacters.find(({ id }) => id == 3).id
      )
      const character4State = displayedSingleCharacterSelector(
        initialState,
        allCharacters.find(({ id }) => id == 4).id
      )
      const character8State = displayedSingleCharacterSelector(
        initialState,
        allCharacters.find(({ id }) => id == 8).id
      )

      describe('given the user rearrange characters in default book', () => {
        const character1AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
          visibleSortedCharactersByCategory,
          character1State.id
        )
        const character2AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
          visibleSortedCharactersByCategory,
          character2State.id
        )
        const character3AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
          visibleSortedCharactersByCategory,
          character3State.id
        )
        const character4AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
          visibleSortedCharactersByCategory,
          character4State.id
        )

        describe('given the user rearrange the characters in the same category', () => {
          store.dispatch(
            reorderCharacter(
              character1State.id,
              character3AbsolutePosition,
              character3State.categoryId,
              'up'
            )
          )
          const afterFirstMove = store.getState()
          const charactersAfterFirstMove = allCharactersSelector(afterFirstMove)
          const newVisibleSortedCharactersByCategory =
            visibleSortedCharactersByCategorySelector(afterFirstMove)
          const newCharacter1State = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 1).id
          )
          const newCharacter2State = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 2).id
          )
          const newCharacter3State = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 3).id
          )

          const newCharacter1AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            newVisibleSortedCharactersByCategory,
            newCharacter1State.id
          )
          const newCharacter2AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            newVisibleSortedCharactersByCategory,
            newCharacter2State.id
          )
          const newCharacter3AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            newVisibleSortedCharactersByCategory,
            newCharacter3State.id
          )
          it(`should move character1 to character3's position`, () => {
            expect(newCharacter1AbsolutePosition).toBe(character3AbsolutePosition)
          })
          it(`should move character3 to character1's position`, () => {
            expect(newCharacter3AbsolutePosition).toBe(character1AbsolutePosition)
          })
          it(`character2 should have the same position`, () => {
            expect(newCharacter2AbsolutePosition).toBe(character2AbsolutePosition)
          })
          it(`should have not move characters to another category`, () => {
            expect(newCharacter1State.categoryId).toEqual(character1State.categoryId)
            expect(newCharacter1State.categoryId).toEqual(character2State.categoryId)
            expect(newCharacter2State.categoryId).toEqual(character2State.categoryId)
            expect(newCharacter2State.categoryId).toEqual(character3State.categoryId)
            expect(newCharacter3State.categoryId).toEqual(character3State.categoryId)
            expect(newCharacter3State.categoryId).toEqual(character1State.categoryId)
          })
        })

        describe('given the user move a character to a new category and new position', () => {
          store.dispatch(
            reorderCharacter(
              character1State.id,
              character4AbsolutePosition,
              character4State.categoryId
            )
          )
          const afterFirstMove = store.getState()
          const charactersAfterFirstMove = allCharactersSelector(afterFirstMove)
          const newVisibleSortedCharactersByCategory =
            visibleSortedCharactersByCategorySelector(afterFirstMove)
          const newCharacter1State = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 1).id
          )
          const newCharacter4State = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 4).id
          )

          const newCharacter1AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            newVisibleSortedCharactersByCategory,
            newCharacter1State.id
          )
          it(`should move character1 to character4's position`, () => {
            expect(newCharacter1AbsolutePosition).toBe(character4AbsolutePosition)
          })
          it(`should have moved character1 to another category`, () => {
            expect(newCharacter1State.categoryId).toEqual(character4State.categoryId)
          })
          it(`should have not moved character4 to another category`, () => {
            expect(newCharacter4State.categoryId).toEqual(character4State.categoryId)
          })
        })

        describe('given the user is manually reordering and moving characters to new position or category', () => {
          store.dispatch(
            reorderCharacter(
              character1State.id,
              character4AbsolutePosition,
              character4State.categoryId
            )
          )
          const afterFirstMove = store.getState()
          const charactersAfterFirstMove = allCharactersSelector(afterFirstMove)
          const visibleSortedCharactersByCategoryAfterFirstMove =
            visibleSortedCharactersByCategorySelector(afterFirstMove)
          const character1StateAfterFirstMove = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 1).id
          )
          const character4StateAfterFirstMove = displayedSingleCharacterSelector(
            afterFirstMove,
            charactersAfterFirstMove.find(({ id }) => id == 4).id
          )

          const newCharacter1AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            visibleSortedCharactersByCategoryAfterFirstMove,
            character1StateAfterFirstMove.id
          )
          const newCharacter4AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            visibleSortedCharactersByCategoryAfterFirstMove,
            character1StateAfterFirstMove.id
          )
          it(`should move character1 to character4's position`, () => {
            expect(newCharacter1AbsolutePosition).toBe(character4AbsolutePosition)
          })
          it(`should have moved character1 to another category`, () => {
            expect(character1StateAfterFirstMove.categoryId).toEqual(character4State.categoryId)
          })
          it(`should have not moved character4 to another category`, () => {
            expect(character4StateAfterFirstMove.categoryId).toEqual(character4State.categoryId)
          })

          store.dispatch(
            reorderCharacter(
              character2State.id,
              character4AbsolutePosition,
              character4State.categoryId
            )
          )
          const afterSecondMove = store.getState()
          const charactersAfterSecondMove = allCharactersSelector(afterSecondMove)
          const visibleSortedCharactersByCategoryAfterSecondMove =
            visibleSortedCharactersByCategorySelector(afterSecondMove)
          const character1StateAfterSecondMove = displayedSingleCharacterSelector(
            afterSecondMove,
            charactersAfterSecondMove.find(({ id }) => id == 1).id
          )
          const character2StateAfterSecondMove = displayedSingleCharacterSelector(
            afterSecondMove,
            charactersAfterSecondMove.find(({ id }) => id == 2).id
          )
          const character3StateAfterSecondMove = displayedSingleCharacterSelector(
            afterSecondMove,
            charactersAfterSecondMove.find(({ id }) => id == 3).id
          )
          const character4StateAfterSecondMove = displayedSingleCharacterSelector(
            afterSecondMove,
            charactersAfterSecondMove.find(({ id }) => id == 4).id
          )

          const character2StateAfterSecondMoveAbsolutePosition =
            getCharacterAbsolutePositionFromGroupedCategory(
              visibleSortedCharactersByCategoryAfterSecondMove,
              character2StateAfterSecondMove.id
            )
          const character3StateAfterSecondMoveAbsolutePosition =
            getCharacterAbsolutePositionFromGroupedCategory(
              visibleSortedCharactersByCategoryAfterSecondMove,
              character3StateAfterSecondMove.id
            )

          it(`should move character2 to character4's position`, () => {
            expect(character2StateAfterSecondMoveAbsolutePosition).toBe(
              newCharacter4AbsolutePosition
            )
          })
          it(`should have moved character2 to character1 and character4's category`, () => {
            expect(character2StateAfterSecondMove.categoryId).toEqual(
              character4StateAfterSecondMove.categoryId
            )
            expect(character2StateAfterSecondMove.categoryId).toEqual(
              character1StateAfterSecondMove.categoryId
            )
          })

          describe('given user move character to a modified character position', () => {
            store.dispatch(
              reorderCharacter(
                character8State.id,
                character3StateAfterSecondMoveAbsolutePosition,
                character3StateAfterSecondMove.categoryId,
                'down'
              )
            )
            const afterThirdMove = store.getState()
            const charactersAfterThirdMove = allCharactersSelector(afterThirdMove)
            const visibleSortedCharactersByCategoryAfterThirdMove =
              visibleSortedCharactersByCategorySelector(afterThirdMove)
            const character3StateAfterThirdMove = displayedSingleCharacterSelector(
              afterThirdMove,
              charactersAfterThirdMove.find(({ id }) => id == 3).id
            )
            const character8StateAfterThirdMove = displayedSingleCharacterSelector(
              afterThirdMove,
              charactersAfterThirdMove.find(({ id }) => id == 8).id
            )

            const character3StateAfterThirdMoveAbsolutePosition =
              getCharacterAbsolutePositionFromGroupedCategory(
                visibleSortedCharactersByCategoryAfterThirdMove,
                character3StateAfterThirdMove.id
              )
            const character8StateAfterThirdMoveAbsolutePosition =
              getCharacterAbsolutePositionFromGroupedCategory(
                visibleSortedCharactersByCategoryAfterThirdMove,
                character8StateAfterThirdMove.id
              )

            it(`should move character8 below character3's position`, () => {
              expect(character8StateAfterThirdMoveAbsolutePosition).toBe(
                character3StateAfterSecondMoveAbsolutePosition + 1
              )
            })
            it(`should have moved character8 to modified character3 category`, () => {
              expect(character8StateAfterThirdMove.categoryId).toEqual(
                character3StateAfterSecondMove.categoryId
              )
            })
            it('should have not move character3 to a new position', () => {
              expect(character3StateAfterThirdMoveAbsolutePosition).toEqual(
                character3StateAfterSecondMoveAbsolutePosition
              )
            })
          })
        })
      })

      describe('given the user create new book', () => {
        store.dispatch(
          addBook(exampleBook1.title, exampleBook1.premise, exampleBook1.genre, exampleBook1.theme)
        )
        describe('given the user add book2 to characters', () => {
          store.dispatch(addBookToCharacter(1, 2))
          store.dispatch(addBookToCharacter(2, 2))
          store.dispatch(addBookToCharacter(4, 2))
          store.dispatch(addBookToCharacter(8, 2))
          store.dispatch(changeCurrentTimeline(2))

          const afterAddingCharactersToBook = store.getState()
          const availableAttributes = characterAttributsForBookByIdSelector(
            afterAddingCharactersToBook
          )
          const book2 = currentTimelineSelector(afterAddingCharactersToBook)
          const positionAttributeId = Object.values(availableAttributes).find(
            ({ name }) => name === 'position'
          )
          const visibleSortedCharactersInBook2 = visibleSortedCharactersByCategorySelector(
            afterAddingCharactersToBook
          )

          const character1InBook2 = displayedSingleCharacterSelector(
            afterAddingCharactersToBook,
            allCharacters.find(({ id }) => id == 1).id
          )

          const character2InBook2 = displayedSingleCharacterSelector(
            afterAddingCharactersToBook,
            allCharacters.find(({ id }) => id == 2).id
          )
          const character3InBook2 = displayedSingleCharacterSelector(
            afterAddingCharactersToBook,
            allCharacters.find(({ id }) => id == 3).id
          )
          const character4InBook2 = displayedSingleCharacterSelector(
            afterAddingCharactersToBook,
            allCharacters.find(({ id }) => id == 4).id
          )
          const character8InBook2 = displayedSingleCharacterSelector(
            afterAddingCharactersToBook,
            allCharacters.find(({ id }) => id == 8).id
          )
          const character4InBook2AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            visibleSortedCharactersInBook2,
            character4InBook2.id
          )
          const character3InBook2AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            visibleSortedCharactersInBook2,
            character3InBook2.id
          )
          const character8InBook2AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
            visibleSortedCharactersInBook2,
            character8InBook2.id
          )

          it('should not necessarily mean they will have equal attributes from other books', () => {
            const character1InBook2PositionAttribute = character1InBook2.attributes.find(
              (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
            )
            const character2InBook2PositionAttribute = character2InBook2.attributes.find(
              (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
            )
            const character4InBook2PositionAttribute = character4InBook2.attributes.find(
              (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
            )
            const character8InBook2PositionAttribute = character8InBook2.attributes.find(
              (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
            )
            store.dispatch(changeCurrentTimeline(1))
            const stateInBook1 = store.getState()
            const availableAttributes = characterAttributsForBookByIdSelector(stateInBook1)
            const positionAttributeIdAfterSwitchingBooks = Object.values(availableAttributes).find(
              ({ name }) => name === 'position'
            )
            const charactersInBook1 = allCharactersSelector(stateInBook1)
            const character1InBook1 = displayedSingleCharacterSelector(
              stateInBook1,
              charactersInBook1.find(({ id }) => id == 1).id
            )

            const character2InBook1 = displayedSingleCharacterSelector(
              afterAddingCharactersToBook,
              charactersInBook1.find(({ id }) => id == 2).id
            )
            const character4InBook1 = displayedSingleCharacterSelector(
              afterAddingCharactersToBook,
              charactersInBook1.find(({ id }) => id == 4).id
            )
            const character8InBook1 = displayedSingleCharacterSelector(
              afterAddingCharactersToBook,
              charactersInBook1.find(({ id }) => id == 8).id
            )
            const character1InBook1PositionAttribute = character1InBook1.attributes?.find(
              (attr) => attr.id == positionAttributeIdAfterSwitchingBooks.id && attr.bookId == 'all'
            )
            const character2InBook1PositionAttribute = character2InBook1.attributes?.find(
              (attr) => attr.id == positionAttributeIdAfterSwitchingBooks.id && attr.bookId == 'all'
            )
            const character4InBook1PositionAttribute = character4InBook1.attributes?.find(
              (attr) => attr.id == positionAttributeIdAfterSwitchingBooks.id && attr.bookId == 'all'
            )
            const character8InBook1PositionAttribute = character8InBook1.attributes?.find(
              (attr) => attr.id == positionAttributeIdAfterSwitchingBooks.id && attr.bookId == 'all'
            )

            expect(character1InBook1PositionAttribute).not.toEqual(
              character1InBook2PositionAttribute
            )
            expect(character2InBook1PositionAttribute).not.toEqual(
              character2InBook2PositionAttribute
            )
            expect(character4InBook1PositionAttribute).not.toEqual(
              character4InBook2PositionAttribute
            )
            expect(character8InBook1PositionAttribute).not.toEqual(
              character8InBook2PositionAttribute
            )
          })

          describe('given the user reorder a character to another position in the same category', () => {
            store.dispatch(
              reorderCharacter(
                character2InBook2.id,
                character4InBook2AbsolutePosition,
                character4InBook2.categoryId,
                'down'
              )
            )

            const afterFirstMove = store.getState()
            const charactersAfterFirstMove = allCharactersSelector(afterFirstMove)
            const visibleSortedCharactersByCategoryAfterFistMove =
              visibleSortedCharactersByCategorySelector(afterFirstMove)
            const character1AfterFirstMove = displayedSingleCharacterSelector(
              afterFirstMove,
              charactersAfterFirstMove.find(({ id }) => id == 1).id
            )
            const character2AfterFirstMove = displayedSingleCharacterSelector(
              afterFirstMove,
              charactersAfterFirstMove.find(({ id }) => id == 2).id
            )
            const character2AbsolutePositionAfterFirstMove =
              getCharacterAbsolutePositionFromGroupedCategory(
                visibleSortedCharactersByCategoryAfterFistMove,
                character2AfterFirstMove.id
              )
            const character1AbsolutePositionAfterFirstMove =
              getCharacterAbsolutePositionFromGroupedCategory(
                visibleSortedCharactersByCategoryAfterFistMove,
                character1AfterFirstMove.id
              )

            it(`should move character2InBook2 below character4InBook2's position`, () => {
              expect(character4InBook2AbsolutePosition + 1).toBe(
                character2AbsolutePositionAfterFirstMove
              )
            })
            it(`should not change the attributes of the character from other books`, () => {
              store.dispatch(changeCurrentTimeline(1))
              const stateInBook1 = store.getState()
              const charactersInBook1 = allCharactersSelector(stateInBook1)
              const character2InBook1 = displayedSingleCharacterSelector(
                stateInBook1,
                charactersInBook1.find(({ id }) => id == 2).id
              )
              const character4InBook1 = displayedSingleCharacterSelector(
                stateInBook1,
                charactersInBook1.find(({ id }) => id == 4).id
              )
              const character2InBook1PositionAttribute = character2InBook1.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
              )
              const character4InBook1PositionAttribute = character4InBook1.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
              )

              store.dispatch(changeCurrentTimeline(2))
              const stateInBook2 = store.getState()
              const book2 = currentTimelineSelector(stateInBook2)
              const character2InBook2 = displayedSingleCharacterSelector(
                stateInBook2,
                charactersInBook1.find(({ id }) => id == 2).id
              )
              const character4InBook2 = displayedSingleCharacterSelector(
                stateInBook2,
                charactersInBook1.find(({ id }) => id == 4).id
              )
              const character2InBook2PositionAttribute = character2InBook2.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
              )
              const character4InBook2PositionAttribute = character4InBook2.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
              )

              expect(character2InBook1PositionAttribute).not.toEqual(
                character2InBook2PositionAttribute
              )
              expect(character4InBook1PositionAttribute).not.toEqual(
                character4InBook2PositionAttribute
              )
            })

            describe('given the user move another character to the newly changed position character', () => {
              store.dispatch(
                reorderCharacter(
                  character1AfterFirstMove.id,
                  character2AbsolutePositionAfterFirstMove,
                  character2AfterFirstMove.categoryId,
                  'up'
                )
              )

              const afterSecondMove = store.getState()
              const charactersAfterSecondafterSecondMove = allCharactersSelector(afterSecondMove)
              const visibleSortedCharactersByCategoryAfterSecondMove =
                visibleSortedCharactersByCategorySelector(afterSecondMove)
              const character2AfterSecondMove = displayedSingleCharacterSelector(
                afterSecondMove,
                charactersAfterSecondafterSecondMove.find(({ id }) => id == 2).id
              )
              const character1AfterSecondMove = displayedSingleCharacterSelector(
                afterSecondMove,
                charactersAfterSecondafterSecondMove.find(({ id }) => id == 1).id
              )

              const character2AfterSecondMovePositionAttributeInBook2 =
                character2AfterSecondMove.attributes.find(
                  (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
                )
              const character1AfterSecondMovePositionAttributeInBook2 =
                character1AfterSecondMove.attributes.find(
                  (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
                )

              const character2AfterSecondMoveAbsolutePosition =
                getCharacterAbsolutePositionFromGroupedCategory(
                  visibleSortedCharactersByCategoryAfterSecondMove,
                  character2AfterFirstMove.id
                )
              const character1AfterSecondMoveAbsolutePosition =
                getCharacterAbsolutePositionFromGroupedCategory(
                  visibleSortedCharactersByCategoryAfterSecondMove,
                  character1AfterFirstMove.id
                )

              it(`should move character1 to character2's position`, () => {
                expect(character1AfterSecondMoveAbsolutePosition).toBe(
                  character2AbsolutePositionAfterFirstMove
                )
              })
              it(`should move character2 to a new position`, () => {
                expect(character2AfterSecondMoveAbsolutePosition).not.toEqual(
                  character2AbsolutePositionAfterFirstMove
                )
              })
              it(`should move character2 to character1's position`, () => {
                expect(character2AfterSecondMoveAbsolutePosition).toBe(
                  character1AbsolutePositionAfterFirstMove
                )
              })

              it(`should not change the attributes of the characters from other books`, () => {
                store.dispatch(changeCurrentTimeline(1))
                const stateInBook1 = store.getState()
                const charactersInBook1 = allCharactersSelector(stateInBook1)
                const character2InBook1 = displayedSingleCharacterSelector(
                  stateInBook1,
                  charactersInBook1.find(({ id }) => id == 2).id
                )
                const character1InBook1 = displayedSingleCharacterSelector(
                  stateInBook1,
                  charactersInBook1.find(({ id }) => id == 1).id
                )
                const character2InBook1PositionAttribute = character2InBook1.attributes.find(
                  (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
                )
                const character1InBook1PositionAttribute = character1InBook1.attributes.find(
                  (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
                )

                expect(character2InBook1PositionAttribute).not.toEqual(
                  character2AfterSecondMovePositionAttributeInBook2
                )
                expect(character1InBook1PositionAttribute).not.toEqual(
                  character1AfterSecondMovePositionAttributeInBook2
                )
              })
            })
          })

          describe('given the user reorder another character to same category', () => {
            store.dispatch(
              reorderCharacter(
                character3InBook2.id,
                character8InBook2AbsolutePosition,
                character8InBook2.categoryId,
                'down'
              )
            )

            const afterFirstMove = store.getState()
            const charactersAfterFirstMove = allCharactersSelector(afterFirstMove)
            const visibleSortedCharactersByCategoryAfterFistMove =
              visibleSortedCharactersByCategorySelector(afterFirstMove)
            const character3AfterFirstMove = displayedSingleCharacterSelector(
              afterFirstMove,
              charactersAfterFirstMove.find(({ id }) => id == 3).id
            )
            const character8AfterFirstMove = displayedSingleCharacterSelector(
              afterFirstMove,
              charactersAfterFirstMove.find(({ id }) => id == 8).id
            )
            const character11AfterFirstMove = displayedSingleCharacterSelector(
              afterFirstMove,
              charactersAfterFirstMove.find(({ id }) => id == 11).id
            )
            const character3AbsolutePositionAfterFirstMove =
              getCharacterAbsolutePositionFromGroupedCategory(
                visibleSortedCharactersByCategoryAfterFistMove,
                character3AfterFirstMove.id
              )
            const character8AbsolutePositionAfterFirstMove =
              getCharacterAbsolutePositionFromGroupedCategory(
                visibleSortedCharactersByCategoryAfterFistMove,
                character8AfterFirstMove.id
              )

            it(`should move character3InBook2 to character8InBook2's position`, () => {
              expect(character8AbsolutePositionAfterFirstMove).toBe(
                character3InBook2AbsolutePosition
              )
            })
            it(`should not change the attributes of the character from other books`, () => {
              store.dispatch(changeCurrentTimeline(1))
              const stateInBook1 = store.getState()
              const charactersInBook1 = allCharactersSelector(stateInBook1)
              const character3InBook1 = displayedSingleCharacterSelector(
                stateInBook1,
                charactersInBook1.find(({ id }) => id == 3).id
              )
              const character8InBook1 = displayedSingleCharacterSelector(
                stateInBook1,
                charactersInBook1.find(({ id }) => id == 8).id
              )
              const character3InBook1PositionAttribute = character3InBook1.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
              )
              const character8InBook1PositionAttribute = character8InBook1.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
              )

              store.dispatch(changeCurrentTimeline(2))
              const stateInBook2 = store.getState()
              const book2 = currentTimelineSelector(stateInBook2)
              const character3InBook2 = displayedSingleCharacterSelector(
                stateInBook2,
                charactersInBook1.find(({ id }) => id == 3).id
              )
              const character8InBook2 = displayedSingleCharacterSelector(
                stateInBook2,
                charactersInBook1.find(({ id }) => id == 8).id
              )
              const character3InBook2PositionAttribute = character3InBook2.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
              )
              const character8InBook2PositionAttribute = character8InBook2.attributes.find(
                (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
              )

              expect(character3InBook1PositionAttribute).not.toEqual(
                character3InBook2PositionAttribute
              )
              expect(character8InBook1PositionAttribute).not.toEqual(
                character8InBook2PositionAttribute
              )
            })

            describe('given the user move another character to the newly changed position character', () => {
              store.dispatch(
                reorderCharacter(
                  character11AfterFirstMove.id,
                  character3AbsolutePositionAfterFirstMove,
                  character3AfterFirstMove.categoryId,
                  'up'
                )
              )

              const afterSecondMove = store.getState()
              const charactersAfterSecondafterSecondMove = allCharactersSelector(afterSecondMove)
              const visibleSortedCharactersByCategoryAfterSecondMove =
                visibleSortedCharactersByCategorySelector(afterSecondMove)
              const character3AfterSecondMove = displayedSingleCharacterSelector(
                afterSecondMove,
                charactersAfterSecondafterSecondMove.find(({ id }) => id == 3).id
              )
              const character11AfterSecondMove = displayedSingleCharacterSelector(
                afterSecondMove,
                charactersAfterSecondafterSecondMove.find(({ id }) => id == 11).id
              )

              const character3AfterSecondMovePositionAttributeInBook2 =
                character3AfterSecondMove.attributes.find(
                  (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
                )
              const character11AfterSecondMovePositionAttributeInBook2 =
                character11AfterSecondMove.attributes.find(
                  (attr) => attr.id == positionAttributeId?.id && attr.bookId == book2
                )

              const character3AfterSecondMoveAbsolutePosition =
                getCharacterAbsolutePositionFromGroupedCategory(
                  visibleSortedCharactersByCategoryAfterSecondMove,
                  character3AfterFirstMove.id
                )
              const character11AfterSecondMoveAbsolutePosition =
                getCharacterAbsolutePositionFromGroupedCategory(
                  visibleSortedCharactersByCategoryAfterSecondMove,
                  character11AfterFirstMove.id
                )

              it(`should move character11 to character3's position`, () => {
                expect(character11AfterSecondMoveAbsolutePosition).toBe(
                  character3AbsolutePositionAfterFirstMove
                )
              })
              it(`should move character3 to a new position`, () => {
                expect(character3AfterSecondMoveAbsolutePosition).not.toEqual(
                  character3AbsolutePositionAfterFirstMove
                )
              })

              store.dispatch(changeCurrentTimeline(1))
              const stateAfterChangeBook = store.getState()
              const charactersAfterChangeBook = allCharactersSelector(stateAfterChangeBook)

              it(`should not change the attributes of the characters from other books`, () => {
                const character3AfterChangeBook = displayedSingleCharacterSelector(
                  stateAfterChangeBook,
                  charactersAfterChangeBook.find(({ id }) => id == 3).id
                )
                const character11AfterChangeBook = displayedSingleCharacterSelector(
                  stateAfterChangeBook,
                  charactersAfterChangeBook.find(({ id }) => id == 11).id
                )
                const character3AfterChangeBookPositionAttribute =
                  character3AfterChangeBook.attributes.find(
                    (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
                  )
                const character11AfterChangeBookPositionAttribute =
                  character11AfterChangeBook.attributes.find(
                    (attr) => attr.id == positionAttributeId?.id && attr.bookId == 'all'
                  )

                expect(character3AfterChangeBookPositionAttribute).not.toEqual(
                  character3AfterSecondMovePositionAttributeInBook2
                )
                expect(character11AfterChangeBookPositionAttribute).not.toEqual(
                  character11AfterSecondMovePositionAttributeInBook2
                )
              })

              it('should have all characters as the first time the file loaded', () => {
                expect(charactersAfterChangeBook.length).toEqual(allCharacters.length)
              })
            })
          })
        })
      })
    })
  })
})
