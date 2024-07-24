import { isPlainObject, mapValues, omit } from 'lodash'

import selectors from '../../selectors'
import { emptyFile } from '../../store/newFileState'
import { configureStore, pltrAdaptor } from './fixtures/testStore'
import actions from '../'
import { hamlet_with_attribute_mix } from './fixtures'
import { uiState } from '../../store/initialState'

const {
  allBookIdsSelector,
  allBooksSelector,
  allCharactersSelector,
  bookDialogBookIdSelector,
  bookNumberSelector,
  cardDialogBeatIdSelector,
  cardDialogCardIdSelector,
  cardDialogLineIdSelector,
  isBookDialogVisibleSelector,
  isCardDialogVisibleSelector,
  allCardsSelector,
  cardDialogSelector,
  bookDialogSelector,
  visibleSortedCharactersByCategorySelector,
  displayedSingleCharacterSelector,
  isCharactersManuallySortedSelector,
  sortedCharacterCategoriesSelector,
  characterAttributsForBookByIdSelector,
  fullSystemStateSelector,
  importPltrDataSelector,
  importPltrModalSelector,
  importModalBookDataSelector,
  allNotesSelector,
  allPlacesSelector,
  allTagsSelector,
  allBooksAsArraySelector,
  isImportModalOpenSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)

const { addBeat } = wiredUpActions.beat
const { reorderCharacter } = wiredUpActions.character
const { addBook, editBook } = wiredUpActions.book
const { addCard, changeBeat, changeLine } = wiredUpActions.card
const { addLine } = wiredUpActions.line
const { saveImportPltrData } = wiredUpActions.project
const {
  loadFile,
  openNewBookDialog,
  openEditBookDialog,
  setCardDialogClose,
  setCardDialogOpen,
  closeBookDialog,
  setCharacterSort,
  showImportDataPicker,
  closeImportPltrModal,
  toggleBookToImport,
  toggleAllSectionMarkedToImport,
  toggleIdMarkedToImport,
} = wiredUpActions.ui

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
  store.dispatch(addBeat(1, null))
  return store
}

const initialCardDialogState = {
  isOpen: false,
  cardId: null,
  lineId: null,
  beatId: null,
}

const initialBookDialogState = {
  isOpen: false,
  bookId: null,
}

const exampleCard1 = {
  title: 'Card 1',
  description: 'Card 1 description',
  lineId: 1,
  beatId: 2,
}

const exampleBookAttributes = {
  title: 'Example book',
  premise: 'book description',
  genre: 'fiction',
  theme: 'test',
}

function isAnObject(val) {
  if (val && val instanceof Object && !Array.isArray(val)) {
    return true
  } else {
    return false
  }
}

const getCharacterAbsolutePositionFromGroupedCategory = (groupedCategory, characterId) => {
  const flattenedGroups = Object.values(groupedCategory).flat()
  return flattenedGroups.findIndex((obj) => obj.id === characterId)
}

describe('cardDialog', () => {
  describe('given the initial state store', () => {
    const store = initialStore()
    const cardId = cardDialogCardIdSelector(store.getState())
    const beatId = cardDialogBeatIdSelector(store.getState())
    const lineId = cardDialogLineIdSelector(store.getState())
    const isOpen = isCardDialogVisibleSelector(store.getState())
    it('should produce initial state store', () => {
      const cardDialog = cardDialogSelector(store.getState())
      expect(cardDialog).toMatchObject(initialCardDialogState)
    })

    it('should have `null` as initial values for cardId lineId and beatId', () => {
      expect(cardId).toBeNull()
      expect(beatId).toBeNull()
      expect(lineId).toBeNull()
    })

    it('should have false as initial value for isOpen', () => {
      expect(isOpen).toBeFalsy()
    })
  })

  describe('given cardDialog actions are dispatched', () => {
    describe('and setCardDialogOpen is dispatched', () => {
      const store = initialStore()
      const cardId = 1
      const beatId = 1
      const lineId = 1
      store.dispatch(setCardDialogOpen(cardId, beatId, lineId))
      const presentState = store.getState()

      const cardDialogCardId = cardDialogCardIdSelector(presentState)
      const cardDialogBeatId = cardDialogBeatIdSelector(presentState)
      const cardDialogLineId = cardDialogLineIdSelector(presentState)
      const isOpen = isCardDialogVisibleSelector(presentState)

      it('should not allow to open non existing card', () => {
        expect(isOpen).toBeFalsy()
      })

      it('should not change the cardDialog state', () => {
        expect(cardDialogCardId).toBeNull()
        expect(cardDialogBeatId).toBeNull()
        expect(cardDialogLineId).toBeNull()
      })

      describe('when the user creates a new card', () => {
        describe('and the cardId exists', () => {
          store.dispatch(addCard(exampleCard1))
          const cardId = 1
          const beatId = 2
          const lineId = 1
          store.dispatch(setCardDialogOpen(cardId, beatId, lineId))
          const presentState = store.getState()

          const cardDialogCardId = cardDialogCardIdSelector(presentState)
          const cardDialogBeatId = cardDialogBeatIdSelector(presentState)
          const cardDialogLineId = cardDialogLineIdSelector(presentState)
          const isOpen = isCardDialogVisibleSelector(presentState)

          it('should have no null values for cardDialog state', () => {
            expect(cardDialogCardId).not.toBeNull()
            expect(cardDialogLineId).not.toBeNull()
            expect(cardDialogBeatId).not.toBeNull()
          })
          it('should have "1" as a value for cardId, lineId and beatId', () => {
            expect(cardDialogCardId).toEqual(cardId)
            expect(cardDialogBeatId).toBe(beatId)
            expect(cardDialogLineId).toBe(lineId)
          })

          it('should open the matched CardDialog id', () => {
            expect(isOpen).toBeTruthy()
          })
          describe('when no another cardDialog action is dispatched', () => {
            const presentState = store.getState()

            const cardId = cardDialogCardIdSelector(presentState)
            const beatId = cardDialogBeatIdSelector(presentState)
            const lineId = cardDialogLineIdSelector(presentState)
            const isOpen = isCardDialogVisibleSelector(presentState)

            it('should not change the values for cardId, lineId, beatId and isOpen', () => {
              expect(cardId).toEqual(1)
              expect(lineId).toEqual(1)
              expect(beatId).toEqual(2)
              expect(isOpen).toBeTruthy()
            })
            describe('and setCardDialogClose is dispatched', () => {
              const store = initialStore()
              store.dispatch(setCardDialogClose())
              const presentState = store.getState()

              const cardId = cardDialogCardIdSelector(presentState)
              const beatId = cardDialogBeatIdSelector(presentState)
              const lineId = cardDialogLineIdSelector(presentState)
              const isOpen = isCardDialogVisibleSelector(presentState)

              it('should have null values for cardId, lineId, beatId', () => {
                expect(cardId).toBeNull()
                expect(lineId).toBeNull()
                expect(beatId).toBeNull()
              })

              it('should be false for isOpen prop', () => {
                expect(isOpen).toBeFalsy()
              })

              it('should match the object from the initial state store', () => {
                const cardDialog = cardDialogSelector(presentState)
                expect(cardDialog).toMatchObject(initialCardDialogState)
              })
            })
          })
        })
      })
    })
  })

  describe('changeBeat', () => {
    describe('given user add a card and beats, and then opened a card', () => {
      const store = initialStore()
      const currentBookId = 1
      store.dispatch(addBeat(currentBookId))
      store.dispatch(addCard(exampleCard1))
      const cardId = 1
      const beatId = 2
      const lineId = 1
      store.dispatch(setCardDialogOpen(cardId, beatId, lineId))

      describe('and given changeBeat is dispatched', () => {
        const newBeatId = 2
        const previousState = store.getState()
        const cardId = cardDialogCardIdSelector(previousState)
        store.dispatch(changeBeat(cardId, newBeatId, currentBookId))

        const presentState = store.getState()

        it('should change the beatId of the current card equal to the newBeatId', () => {
          const presentCards = allCardsSelector(presentState)
          const changedCard = presentCards.find((card) => card.id == cardId)
          expect(changedCard.beatId).toEqual(newBeatId)
        })

        it('should also change the cardDialog beatId to be equal to the newBeatId', () => {
          const cardDialogState = cardDialogSelector(presentState)
          expect(cardDialogState.beatId).toEqual(newBeatId)
        })
      })
    })
  })

  describe('changeLine', () => {
    describe('given user add a card and lines, and then opened a card', () => {
      const store = initialStore()
      const currentBookId = 1
      store.dispatch(addLine(currentBookId))
      store.dispatch(addLine(currentBookId))
      store.dispatch(addCard(exampleCard1))
      const cardId = 1
      const beatId = 2
      const lineId = 1
      store.dispatch(setCardDialogOpen(cardId, beatId, lineId))

      describe('and given changeLine is dispatched', () => {
        const newLineId = 2
        const previousState = store.getState()
        const cardId = cardDialogCardIdSelector(previousState)
        store.dispatch(changeLine(cardId, newLineId, currentBookId))

        const presentState = store.getState()

        it('should change the lineId of the current card equal to the newLineId', () => {
          const presentCards = allCardsSelector(presentState)
          const changedCard = presentCards.find((card) => card.id == cardId)
          expect(changedCard.lineId).toEqual(newLineId)
        })

        it('should also change the cardDialog lineId to be equal to the newLineId', () => {
          const cardDialog = cardDialogSelector(presentState)
          expect(cardDialog.lineId).toEqual(newLineId)
        })
      })
    })
  })
})

describe('bookDialog', () => {
  describe('given the initial state store', () => {
    const store = initialStore()
    const initialState = store.getState()
    const bookId = bookDialogBookIdSelector(initialState)
    const isOpen = isBookDialogVisibleSelector(initialState)
    it('should produce initial state store', () => {
      const bookDialog = bookDialogSelector(initialState)
      expect(bookDialog).toMatchObject(initialBookDialogState)
    })

    it('should have `null` as initial values for cardId lineId and beatId', () => {
      expect(bookId).toBeNull()
    })

    it('should have false as initial value for isOpen', () => {
      expect(isOpen).toBeFalsy()
    })
  })

  describe('given bookDialog actions are dispatched', () => {
    describe('and openNewBookDialog is dispatched', () => {
      const store = initialStore()
      const initialState = store.getState()
      const nextBookNumber = allBookIdsSelector(initialState).length + 1
      store.dispatch(openNewBookDialog())
      const previousState = store.getState()
      const bookDialogBookId = bookDialogBookIdSelector(previousState)
      const bookNumber = bookNumberSelector(previousState)
      const isOpen = isBookDialogVisibleSelector(previousState)
      const initialTotalNumberOfBooks = allBookIdsSelector(previousState).length

      it('should open the bookDialog', () => {
        expect(isOpen).toBeTruthy()
      })

      it('should not have a bookId', () => {
        expect(bookDialogBookId).toBeNull()
      })

      it('should change the bookNumber equal to the param passed', () => {
        expect(bookNumber).toEqual(nextBookNumber)
      })

      describe('given addBook is dispatched with completely blank fields', () => {
        store.dispatch(addBook())
        const presentState = store.getState()
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should work as before and save the book without passing any params', () => {
          expect(totalBooks).toBeGreaterThan(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, _key, _obj) => {
            if (isAnObject(value) && !value.title) {
              return value
            }
            return undefined
          })
          const filteredBook = Object.values(book).filter(Boolean)
          expect(filteredBook[0].id).not.toBeNull()
          expect(filteredBook[0].title).toEqual('')
          expect(filteredBook[0].theme).toEqual('')
          expect(filteredBook[0].genre).toEqual('')
          expect(filteredBook[0].premise).toEqual('')
        })
      })

      describe('given addBook is dispatched with id and attributes', () => {
        store.dispatch(
          addBook(
            exampleBookAttributes.title,
            exampleBookAttributes.premise,
            exampleBookAttributes.genre,
            exampleBookAttributes.theme
          )
        )
        const presentState = store.getState()
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should save the book with its attributes', () => {
          expect(totalBooks).toBeGreaterThan(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, _key) => {
            if (typeof value == 'object' && value.title == exampleBookAttributes.title) {
              return value
            }
            return undefined
          })
          const filteredBook = Object.values(book).filter((val) => {
            return val
          })

          expect(filteredBook[0].title).toEqual(exampleBookAttributes.title)
          expect(filteredBook[0].theme).toEqual(exampleBookAttributes.theme)
          expect(filteredBook[0].genre).toEqual(exampleBookAttributes.genre)
          expect(filteredBook[0].premise).toEqual(exampleBookAttributes.premise)
        })
      })

      describe('given closeBookDialog is dispatched', () => {
        store.dispatch(closeBookDialog())
        const presentState = store.getState()
        const bookDialog = bookDialogSelector(presentState)
        it('should be back to its initialState', () => {
          expect(bookDialog).toMatchObject(initialBookDialogState)
        })
      })
    })

    describe('given openEditBookDialog is dispatched', () => {
      const store = initialStore()
      const bookId = 1
      store.dispatch(openEditBookDialog(bookId))
      const previousState = store.getState()
      const currentBook = allBooksSelector(previousState)[bookId]
      const initialTotalNumberOfBooks = allBookIdsSelector(previousState).length
      const bookDialogBookId = bookDialogBookIdSelector(previousState)
      const bookNumber = bookNumberSelector(previousState)
      const isOpen = isBookDialogVisibleSelector(previousState)

      it('should open the bookDialog', () => {
        expect(isOpen).toBeTruthy()
      })

      it('should have a bookId', () => {
        expect(bookDialogBookId).not.toBeNull()
      })

      it('should have a bookNumber', () => {
        expect(bookNumber).not.toBeNull()
      })

      describe('given editBook is dispatched with id and attributes', () => {
        const newTitle = 'newBook title'
        store.dispatch(
          editBook(
            currentBook.id,
            newTitle,
            exampleBookAttributes.premise,
            exampleBookAttributes.genre,
            exampleBookAttributes.theme
          )
        )
        const presentState = store.getState()
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should edit the book with the new values', () => {
          expect(totalBooks).toEqual(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, _key) => {
            if (typeof value == 'object' && value.title == newTitle) {
              return value
            }
            return undefined
          })
          const filteredBook = Object.values(book).filter((val) => {
            return val
          })

          expect(filteredBook[0].title).toEqual(newTitle)
          expect(filteredBook[0].theme).toEqual(exampleBookAttributes.theme)
          expect(filteredBook[0].genre).toEqual(exampleBookAttributes.genre)
          expect(filteredBook[0].premise).toEqual(exampleBookAttributes.premise)
        })
      })

      describe('given closeBookDialog is dispatched', () => {
        store.dispatch(closeBookDialog())
        const presentState = store.getState()
        it('should be back to its initialState', () => {
          const bookDialog = bookDialogSelector(presentState)
          expect(bookDialog).toMatchObject(initialBookDialogState)
        })
      })
    })
  })
})

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
      const sortedCharacterCategories = sortedCharacterCategoriesSelector(initialState)
      const visibleSortedCharactersByCategory =
        visibleSortedCharactersByCategorySelector(initialState)
      const initialIsManuallySortedState = isCharactersManuallySortedSelector(initialState)

      it('should have loaded all 19 characters', () => {
        expect(allCharacters).toHaveLength(19)
      })
      it('should not be manually sorted by default', () => {
        expect(initialIsManuallySortedState).toBeFalsy()
      })

      it('should be alphabetically sorted by category', () => {
        Object.entries(visibleSortedCharactersByCategory).forEach(
          ([categoryId, characters], index) => {
            const sortedCategoryId = sortedCharacterCategories[index].id

            expect(String(sortedCategoryId)).toEqual(String(categoryId))

            characters.forEach((character, position) => {
              if (characters[position - 1]) {
                expect(character.name.localeCompare(characters[position - 1].name)).toBeGreaterThan(
                  0
                )
              }
            })
          }
        )
      })

      describe('given the user reorder the characters manually', () => {
        const character1InitialState = displayedSingleCharacterSelector(
          initialState,

          // @ts-ignore
          allCharacters.find(({ id }) => id == 1).id
        )
        const character3InitialState = displayedSingleCharacterSelector(
          initialState,

          // @ts-ignore
          allCharacters.find(({ id }) => id == 3).id
        )
        const character3AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
          visibleSortedCharactersByCategory,
          character3InitialState.id
        )
        describe(`given the user move character1 to character3's position`, () => {
          store.dispatch(
            reorderCharacter(
              character1InitialState.id,
              character3AbsolutePosition,
              character3InitialState.categoryId
            )
          )

          const afterFirstReorderState = store.getState()
          const sortedCharacterCategoriesAfterFirstReorder =
            sortedCharacterCategoriesSelector(afterFirstReorderState)
          const visibleSortedCharactersByCategoryAfterFirstReorder =
            visibleSortedCharactersByCategorySelector(afterFirstReorderState)
          const isManuallySortedStateAfterFirstReorder =
            isCharactersManuallySortedSelector(afterFirstReorderState)
          const availableAttributesFirstReorder =
            characterAttributsForBookByIdSelector(afterFirstReorderState)

          const positionAttributeIdAfterFirstReorder = Object.values(
            availableAttributesFirstReorder
          ).find(({ name }) => name === 'position')

          it('should have change isManuallySorted to true', () => {
            expect(isManuallySortedStateAfterFirstReorder).toBeTruthy()
          })

          it('should have character attributes property', () => {
            Object.values(visibleSortedCharactersByCategoryAfterFirstReorder).forEach(
              (characters) => {
                characters.forEach((character) => {
                  expect(character.attributes).toBeDefined()
                })
              }
            )
          })

          it(`should be sorted by position from character's attributes property`, () => {
            Object.entries(visibleSortedCharactersByCategoryAfterFirstReorder).forEach(
              ([categoryId, characters], index) => {
                const sortedCategoryId = sortedCharacterCategoriesAfterFirstReorder[index].id

                expect(String(sortedCategoryId)).toEqual(String(categoryId))
                characters.forEach((character, position) => {
                  if (characters[position - 1]) {
                    const characterPositionAttribute = character.attributes.find(
                      ({ id }) => id == positionAttributeIdAfterFirstReorder.id
                    )
                    const previousCharacterPositionAttribute = characters[
                      position - 1
                    ].attributes.find(({ id }) => id == positionAttributeIdAfterFirstReorder.id)

                    expect(characterPositionAttribute.value).toBeGreaterThan(
                      previousCharacterPositionAttribute.value
                    )
                  }
                })
              }
            )
          })

          describe('given the user change the sort order by name alphabetically', () => {
            store.dispatch(setCharacterSort('name', 'asc'))

            const afterChangeSortState = store.getState()
            const visibleSortedCharactersByCategoryAfterChangeSort =
              visibleSortedCharactersByCategorySelector(afterChangeSortState)
            const isManuallySortedStateAfterChangeSort =
              isCharactersManuallySortedSelector(afterChangeSortState)

            it('should not be manually sorted', () => {
              expect(isManuallySortedStateAfterChangeSort).toBeFalsy()
            })

            it('should be alphabetically sorted by category', () => {
              Object.values(visibleSortedCharactersByCategoryAfterChangeSort).forEach(
                (characters) => {
                  characters.forEach((character, position) => {
                    if (characters[position - 1]) {
                      expect(
                        character.name.localeCompare(characters[position - 1].name)
                      ).toBeGreaterThan(0)
                    }
                  })
                }
              )
            })

            describe('given the user reorder characters manually again', () => {
              describe(`given the user move character2 to character8's position`, () => {
                const character2AfterChangeSortState = displayedSingleCharacterSelector(
                  afterChangeSortState,

                  // @ts-ignore
                  allCharacters.find(({ id }) => id == 2).id
                )
                const character8AfterChangeSortState = displayedSingleCharacterSelector(
                  afterChangeSortState,

                  // @ts-ignore
                  allCharacters.find(({ id }) => id == 8).id
                )
                const character8AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
                  visibleSortedCharactersByCategory,
                  character8AfterChangeSortState.id
                )
                store.dispatch(
                  reorderCharacter(
                    character2AfterChangeSortState.id,
                    character8AbsolutePosition,
                    character8AfterChangeSortState.categoryId
                  )
                )

                const afterSecondReorderState = store.getState()
                const sortedCharacterCategoriesAfterSecondReorder =
                  sortedCharacterCategoriesSelector(afterSecondReorderState)
                const visibleSortedCharactersByCategoryAfterSecondReorder =
                  visibleSortedCharactersByCategorySelector(afterSecondReorderState)
                const isManuallySortedStateAfterSecondReorder =
                  isCharactersManuallySortedSelector(afterSecondReorderState)
                const availableAttributesSecondReorder =
                  characterAttributsForBookByIdSelector(afterSecondReorderState)
                const positionAttributeIdAfterSecondReorder = Object.values(
                  availableAttributesSecondReorder
                ).find(({ name }) => name === 'position')

                it('should have change isManuallySorted to true', () => {
                  expect(isManuallySortedStateAfterSecondReorder).toBeTruthy()
                })

                it('should have character attributes property', () => {
                  Object.values(visibleSortedCharactersByCategoryAfterSecondReorder).forEach(
                    (characters) => {
                      characters.forEach((character) => {
                        expect(character.attributes).toBeDefined()
                      })
                    }
                  )
                })

                it(`should be sorted by position from character's attributes property again`, () => {
                  Object.entries(visibleSortedCharactersByCategoryAfterSecondReorder).forEach(
                    ([categoryId, characters], index) => {
                      const sortedCategoryId = sortedCharacterCategoriesAfterSecondReorder[index].id

                      expect(String(sortedCategoryId)).toEqual(String(categoryId))
                      characters.forEach((character, position) => {
                        if (characters[position - 1]) {
                          const characterPositionAttribute = character.attributes.find(
                            ({ id }) => id == positionAttributeIdAfterSecondReorder.id
                          )
                          const previousCharacterPositionAttribute = characters[
                            position - 1
                          ].attributes.find(
                            ({ id }) => id == positionAttributeIdAfterSecondReorder.id
                          )

                          expect(characterPositionAttribute.value).toBeGreaterThan(
                            previousCharacterPositionAttribute.value
                          )
                        }
                      })
                    }
                  )
                })

                describe(`given the user move character10 to character2's position`, () => {
                  const character2AfterSecondReorderState = displayedSingleCharacterSelector(
                    afterSecondReorderState,

                    // @ts-ignore
                    allCharacters.find(({ id }) => id == 2).id
                  )
                  const character10AfterSecondReorderState = displayedSingleCharacterSelector(
                    afterSecondReorderState,

                    // @ts-ignore
                    allCharacters.find(({ id }) => id == 10).id
                  )
                  const character2AbsolutePosition =
                    getCharacterAbsolutePositionFromGroupedCategory(
                      visibleSortedCharactersByCategoryAfterSecondReorder,
                      character2AfterSecondReorderState.id
                    )
                  store.dispatch(
                    reorderCharacter(
                      character10AfterSecondReorderState.id,
                      character2AbsolutePosition,
                      character2AfterSecondReorderState.categoryId
                    )
                  )

                  const afterThirdReorderState = store.getState()
                  const sortedCharacterCategoriesAfterThirdReorder =
                    sortedCharacterCategoriesSelector(afterThirdReorderState)
                  const visibleSortedCharactersByCategoryAfterThirdReorder =
                    visibleSortedCharactersByCategorySelector(afterThirdReorderState)
                  const isManuallySortedStateAfterThirdReorder =
                    isCharactersManuallySortedSelector(afterThirdReorderState)
                  const availableAttributesThirdReorder =
                    characterAttributsForBookByIdSelector(afterThirdReorderState)
                  const positionAttributeIdAfterThirdReorder = Object.values(
                    availableAttributesThirdReorder
                  ).find(({ name }) => name === 'position')

                  const character10AbsolutePositionAfterThirdReorder =
                    getCharacterAbsolutePositionFromGroupedCategory(
                      visibleSortedCharactersByCategoryAfterSecondReorder,
                      character2AfterSecondReorderState.id
                    )

                  it('should still have isManuallySorted value as true', () => {
                    expect(isManuallySortedStateAfterThirdReorder).toBeTruthy()
                  })

                  it('should still have character attributes property', () => {
                    Object.values(visibleSortedCharactersByCategoryAfterThirdReorder).forEach(
                      (characters) => {
                        characters.forEach((character) => {
                          expect(character.attributes).toBeDefined()
                        })
                      }
                    )
                  })

                  it(`should move character10 to character2's position`, () => {
                    expect(character10AbsolutePositionAfterThirdReorder).toBe(
                      character2AbsolutePosition
                    )
                  })

                  it(`should still be sorted by position from character's attributes`, () => {
                    Object.entries(visibleSortedCharactersByCategoryAfterThirdReorder).forEach(
                      ([categoryId, characters], index) => {
                        const sortedCategoryId =
                          sortedCharacterCategoriesAfterThirdReorder[index].id

                        expect(String(sortedCategoryId)).toEqual(String(categoryId))
                        characters.forEach((character, position) => {
                          if (characters[position - 1]) {
                            const characterPositionAttribute = character.attributes.find(
                              ({ id }) => id == positionAttributeIdAfterThirdReorder.id
                            )
                            const previousCharacterPositionAttribute = characters[
                              position - 1
                            ].attributes.find(
                              ({ id }) => id == positionAttributeIdAfterThirdReorder.id
                            )

                            expect(characterPositionAttribute.value).toBeGreaterThan(
                              previousCharacterPositionAttribute.value
                            )
                          }
                        })
                      }
                    )
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

const propsThatHaveBeenModified = [
  'attributes',
  'cards',
  'categoryId',
  'isChecked',
  'places',
  'notes',
  'characters',
  'tags',
  'lastEdited',
  'imageId',
  'bookIds',
  'noteIds',
]

describe('showImportDataPicker', () => {
  describe('given the initial state store', () => {
    const store = initialStore()
    const initialState = store.getState()
    describe('given the user loads an empty project', () => {
      it('should produce an initial importModal state', () => {
        const importModalData = importPltrModalSelector(initialState)
        expect(importModalData).toEqual(uiState.importModal)
      })
      const allCharacters = allCharactersSelector(initialState)
      const allPlaces = allPlacesSelector(initialState)
      const allNotes = allNotesSelector(initialState)
      const allTags = allTagsSelector(initialState)

      it('should have no characters, notes, places and tags', () => {
        expect(allCharacters).toHaveLength(0)
        expect(allPlaces).toHaveLength(0)
        expect(allNotes).toHaveLength(0)
        expect(allTags).toHaveLength(0)
      })

      describe('given the user performs import from project tab', () => {
        describe('and choose an existing pltr project', () => {
          describe('and import', () => {
            const fullSystemState = fullSystemStateSelector(initialState)
            store.dispatch(showImportDataPicker(hamlet_with_attribute_mix, fullSystemState))
            const stateAfterSecondImport = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSecondImport)
            const bookData = importModalBookDataSelector(stateAfterSecondImport)
            const importData = importPltrDataSelector(stateAfterSecondImport)
            const allCharacters = allCharactersSelector(stateAfterSecondImport)
            const allPlaces = allPlacesSelector(stateAfterSecondImport)
            const allNotes = allNotesSelector(stateAfterSecondImport)
            const allTags = allTagsSelector(stateAfterSecondImport)

            it('should change the import modal state to open', () => {
              const isImportModalOpen = isImportModalOpenSelector(stateAfterSecondImport)
              expect(isImportModalOpen).toBeTruthy()
            })

            it('should have `data` and `bookData` object', () => {
              expect(importData).toBeDefined()
              expect(bookData).toBeDefined()
              expect(importModalData.data).toEqual(importData)
              expect(importModalData.bookData).toEqual(bookData)
            })

            it('should still have the same number of characters, notes, places, and tags after the first import', () => {
              expect(allCharacters).toHaveLength(0)
              expect(allPlaces).toHaveLength(0)
              expect(allNotes).toHaveLength(0)
              expect(allTags).toHaveLength(0)
            })

            it('should have characters, notes, places, tags, images and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importImages = importData['images']
              const importBooks = importData['books']
              expect(importCharacters).toBeDefined()
              expect(importNotes).toBeDefined()
              expect(importPlaces).toBeDefined()
              expect(importTags).toBeDefined()
              expect(importImages).toBeDefined()
              expect(importBooks).toBeDefined()
            })

            it('should have `isChecked` prop for each characters, notes, places, tags and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importBooks = importData['books']
              importCharacters.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importNotes.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importPlaces.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importTags.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              Object.values(importBooks).forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
            })
          })

          describe('given the user cancelled the import', () => {
            store.dispatch(closeImportPltrModal())
            const stateAfterSecondImportFileSaved = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSecondImportFileSaved)

            it('should not have saved anything from the import file', () => {
              expect(allCharacters).toHaveLength(0)
              expect(allPlaces).toHaveLength(0)
              expect(allNotes).toHaveLength(0)
              expect(allTags).toHaveLength(0)
            })

            it('should revert the importModal to its initial state', () => {
              expect(importModalData).toEqual(uiState.importModal)
            })
          })
        })
      })
    })
  })
})

describe('toggleBookToImport', () => {
  describe('given the initial state store', () => {
    const store = initialStore()
    const initialState = store.getState()
    describe('given the user loads an empty project', () => {
      it('should produce an initial importModal state', () => {
        const importModalData = importPltrModalSelector(initialState)
        expect(importModalData).toEqual(uiState.importModal)
      })

      describe('given the user performs import from project tab', () => {
        describe('and choose an existing pltr project', () => {
          describe('and import', () => {
            const fullSystemState = fullSystemStateSelector(initialState)
            store.dispatch(showImportDataPicker(hamlet_with_attribute_mix, fullSystemState))
            const stateAfterSecondImport = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSecondImport)
            const bookData = importModalBookDataSelector(stateAfterSecondImport)
            const importData = importPltrDataSelector(stateAfterSecondImport)
            const allCharacters = allCharactersSelector(stateAfterSecondImport)
            const allPlaces = allPlacesSelector(stateAfterSecondImport)
            const allNotes = allNotesSelector(stateAfterSecondImport)
            const allTags = allTagsSelector(stateAfterSecondImport)
            const BOOKID_TO_TOGGLE = 1

            it('should change the import modal state to open', () => {
              const isImportModalOpen = isImportModalOpenSelector(stateAfterSecondImport)
              expect(isImportModalOpen).toBeTruthy()
            })

            it('should have `data` and `bookData` object', () => {
              expect(importData).toBeDefined()
              expect(bookData).toBeDefined()
              expect(importModalData.data).toEqual(importData)
              expect(importModalData.bookData).toEqual(bookData)
            })

            it('should still have the same number of characters, notes, places, and tags after the first import', () => {
              expect(allCharacters).toHaveLength(0)
              expect(allPlaces).toHaveLength(0)
              expect(allNotes).toHaveLength(0)
              expect(allTags).toHaveLength(0)
            })

            it('should have characters, notes, places, tags, images and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importImages = importData['images']
              const importBooks = importData['books']
              expect(importCharacters).toBeDefined()
              expect(importNotes).toBeDefined()
              expect(importPlaces).toBeDefined()
              expect(importTags).toBeDefined()
              expect(importImages).toBeDefined()
              expect(importBooks).toBeDefined()
            })

            it('should have `isChecked` prop for each characters, notes, places, tags and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importBooks = importData['books']
              importCharacters.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importNotes.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importPlaces.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importTags.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              Object.values(importBooks).forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
            })

            describe('given the user deselect a section (a book in this case)', () => {
              const isChecked = true
              store.dispatch(toggleBookToImport(BOOKID_TO_TOGGLE, !isChecked))
              const stateAfterFirstToggle = store.getState()
              const importDataAfterFirstToggle = importPltrDataSelector(stateAfterFirstToggle)

              it('should change the `isChecked` prop to false for the selected book', () => {
                const importBooks = importDataAfterFirstToggle['books']
                Object.values(importBooks).forEach((i) => {
                  if (i.id == BOOKID_TO_TOGGLE) {
                    expect(i.isChecked).toBeFalsy()
                  } else {
                    expect(i.isChecked).toBeTruthy()
                  }
                })
              })

              describe('given the user saved the import file ', () => {
                store.dispatch(saveImportPltrData())
                const stateAfterSaving = store.getState()
                const importModalData = importPltrModalSelector(stateAfterSaving)
                const allBooksAfterImport = allBooksAsArraySelector(stateAfterSaving)

                it('should revert the import modal state to its initialState', () => {
                  expect(importModalData).toEqual(uiState.importModal)
                })

                it('should still save characters, places, notes, and tags from the imported file', () => {
                  const allCharacters = allCharactersSelector(stateAfterSaving)
                  const allPlaces = allPlacesSelector(stateAfterSaving)
                  const allNotes = allNotesSelector(stateAfterSaving)
                  const allTags = allTagsSelector(stateAfterSaving)

                  expect(allCharacters.length).toEqual(hamlet_with_attribute_mix.characters.length)
                  expect(allPlaces.length).toEqual(hamlet_with_attribute_mix.places.length)
                  expect(allNotes.length).toEqual(hamlet_with_attribute_mix.notes.length)
                  expect(allTags.length).toEqual(hamlet_with_attribute_mix.tags.length)
                  expect(allBooksAfterImport.length).toEqual(1)

                  allCharacters.forEach((char) => {
                    const currentCharacter = hamlet_with_attribute_mix.characters.find(
                      (i) => i.name === char.name
                    )
                    if (currentCharacter) {
                      expect(
                        omit(
                          {
                            ...currentCharacter,
                            id: char.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(char, propsThatHaveBeenModified))
                    }
                  })
                  allPlaces.forEach((place) => {
                    const curentPlace = hamlet_with_attribute_mix.places.find(
                      (i) => i.name === place.name
                    )
                    if (curentPlace) {
                      expect(
                        omit(
                          {
                            ...curentPlace,
                            id: place.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(place, propsThatHaveBeenModified))
                    }
                  })
                  allNotes.forEach((note) => {
                    const currentNote = hamlet_with_attribute_mix.notes.find(
                      (i) => i.title === note.title
                    )
                    if (currentNote) {
                      expect(
                        omit(
                          {
                            ...currentNote,
                            id: note.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(note, propsThatHaveBeenModified))
                    }
                  })
                  allTags.forEach((tag) => {
                    const currentTag = hamlet_with_attribute_mix.tags.find(
                      (i) => i.title === tag.title
                    )
                    if (currentTag) {
                      expect(
                        omit(
                          {
                            ...currentTag,
                            id: tag.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(tag, propsThatHaveBeenModified))
                    }
                  })
                })

                it('should not have saved the deselected book', () => {
                  expect(
                    allBooksAfterImport.some(
                      (book) =>
                        book.title === hamlet_with_attribute_mix.books[BOOKID_TO_TOGGLE].title
                    )
                  ).toBeFalsy()
                })
              })
            })
          })
        })
      })
    })
  })
})

describe('toggleAllSectionMarkedToImport', () => {
  describe('given the initial state store', () => {
    const store = initialStore()
    const initialState = store.getState()
    describe('given the user loads an empty project', () => {
      it('should produce an initial importModal state', () => {
        const importModalData = importPltrModalSelector(initialState)
        expect(importModalData).toEqual(uiState.importModal)
      })

      describe('given the user performs import from project tab', () => {
        describe('and choose an existing pltr project', () => {
          describe('and import', () => {
            const fullSystemState = fullSystemStateSelector(initialState)
            store.dispatch(showImportDataPicker(hamlet_with_attribute_mix, fullSystemState))
            const stateAfterSecondImport = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSecondImport)
            const bookData = importModalBookDataSelector(stateAfterSecondImport)
            const importData = importPltrDataSelector(stateAfterSecondImport)
            const allCharacters = allCharactersSelector(stateAfterSecondImport)
            const allPlaces = allPlacesSelector(stateAfterSecondImport)
            const allNotes = allNotesSelector(stateAfterSecondImport)
            const allTags = allTagsSelector(stateAfterSecondImport)
            const SECTION_TO_TOGGLE_1 = 'places'
            const SECTION_TO_TOGGLE_2 = 'tags'
            const SECTION_TO_TOGGLE_3 = 'customAttributes'

            it('should change the import modal state to open', () => {
              const isImportModalOpen = isImportModalOpenSelector(stateAfterSecondImport)
              expect(isImportModalOpen).toBeTruthy()
            })

            it('should have `data` and `bookData` object', () => {
              expect(importData).toBeDefined()
              expect(bookData).toBeDefined()
              expect(importModalData.data).toEqual(importData)
              expect(importModalData.bookData).toEqual(bookData)
            })

            it('should still have the same number of characters, notes, places, and tags after the first import', () => {
              expect(allCharacters).toHaveLength(0)
              expect(allPlaces).toHaveLength(0)
              expect(allNotes).toHaveLength(0)
              expect(allTags).toHaveLength(0)
            })

            it('should have characters, notes, places, tags, images and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importImages = importData['images']
              const importBooks = importData['books']
              expect(importCharacters).toBeDefined()
              expect(importNotes).toBeDefined()
              expect(importPlaces).toBeDefined()
              expect(importTags).toBeDefined()
              expect(importImages).toBeDefined()
              expect(importBooks).toBeDefined()
            })

            it('should have `isChecked` prop for each characters, notes, places, tags and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importBooks = importData['books']
              importCharacters.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importNotes.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importPlaces.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importTags.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              Object.values(importBooks).forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
            })

            describe('given the user deselect a section', () => {
              const isChecked = true
              store.dispatch(toggleAllSectionMarkedToImport(SECTION_TO_TOGGLE_1, !isChecked))
              const stateAfterFirstToggle = store.getState()
              const importDataAfterFirstToggle = importPltrDataSelector(stateAfterFirstToggle)

              it('should change the `isChecked` prop to false for all the items on the section', () => {
                const deselectedSection = importDataAfterFirstToggle[SECTION_TO_TOGGLE_1]
                deselectedSection.forEach((i) => {
                  expect(i.isChecked).toBe(!isChecked)
                })
              })

              it('should not change the `isChecked` prop for other sections', () => {
                Object.values(
                  omit(importDataAfterFirstToggle, ['images', SECTION_TO_TOGGLE_1])
                ).forEach((section) => {
                  if (Array.isArray(section)) {
                    expect(section.every((i) => i.isChecked)).toBeTruthy()
                  } else if (isPlainObject(section)) {
                    expect(Object.values(section).every((i) => i.isChecked)).toBeTruthy()
                  }
                })
              })
            })

            describe('given the user deselect another section', () => {
              const isChecked = true
              store.dispatch(toggleAllSectionMarkedToImport(SECTION_TO_TOGGLE_2, !isChecked))
              const stateAfterFirstToggle = store.getState()
              const importDataAfterFirstToggle = importPltrDataSelector(stateAfterFirstToggle)

              it('should change the `isChecked` prop to false for all the items on the section', () => {
                const deselectedSection = importDataAfterFirstToggle[SECTION_TO_TOGGLE_2]
                deselectedSection.forEach((i) => {
                  expect(i.isChecked).toBe(!isChecked)
                })
              })

              it('should not change the `isChecked` prop for other sections', () => {
                Object.values(
                  omit(importDataAfterFirstToggle, [
                    'images',
                    SECTION_TO_TOGGLE_1,
                    SECTION_TO_TOGGLE_2,
                  ])
                ).forEach((section) => {
                  if (Array.isArray(section)) {
                    expect(section.every((i) => i.isChecked)).toBeTruthy()
                  } else if (isPlainObject(section)) {
                    expect(Object.values(section).every((i) => i.isChecked)).toBeTruthy()
                  }
                })
              })
            })

            describe('given the user deselect 1 more section', () => {
              const isChecked = true
              store.dispatch(toggleAllSectionMarkedToImport(SECTION_TO_TOGGLE_3, !isChecked))
              const stateAfterSecondToggle = store.getState()
              const importDataAfterSecondToggle = importPltrDataSelector(stateAfterSecondToggle)

              it('should change the `isChecked` prop to false for all the items on the section', () => {
                const deselectedSection3 = importDataAfterSecondToggle[SECTION_TO_TOGGLE_3]
                if (isPlainObject(deselectedSection3)) {
                  Object.values(deselectedSection3).forEach((i) => {
                    expect(i.isChecked).toBe(!isChecked)
                  })
                } else {
                  deselectedSection3.forEach((i) => {
                    expect(i.isChecked).toBe(!isChecked)
                  })
                }
              })

              it('should not change the `isChecked` prop for other sections', () => {
                Object.values(
                  omit(importDataAfterSecondToggle, [
                    'images',
                    SECTION_TO_TOGGLE_1,
                    SECTION_TO_TOGGLE_2,
                    SECTION_TO_TOGGLE_3,
                  ])
                ).forEach((section) => {
                  if (Array.isArray(section)) {
                    expect(section.every((i) => i.isChecked)).toBeTruthy()
                  } else if (isPlainObject(section)) {
                    expect(Object.values(section).every((i) => i.isChecked)).toBeTruthy()
                  }
                })
              })

              describe('given the user saved the import file ', () => {
                store.dispatch(saveImportPltrData())
                const stateAfterSaving = store.getState()
                const importModalData = importPltrModalSelector(stateAfterSaving)
                const allBooksAfterImport = allBooksAsArraySelector(stateAfterSaving)

                it('should revert the import modal state to its initialState', () => {
                  expect(importModalData).toEqual(uiState.importModal)
                })

                it('should save the selected sections from the imported file', () => {
                  const allCharacters = allCharactersSelector(stateAfterSaving)
                  const allBooksAsArray = allBooksAsArraySelector(stateAfterSaving)
                  const allNotes = allNotesSelector(stateAfterSaving)

                  expect(allCharacters.length).toEqual(hamlet_with_attribute_mix.characters.length)
                  expect(allNotes.length).toEqual(hamlet_with_attribute_mix.notes.length)
                  expect(allBooksAfterImport.length).toEqual(2)

                  allCharacters.forEach((char) => {
                    const currentCharacter = hamlet_with_attribute_mix.characters.find(
                      (i) => i.name === char.name
                    )
                    if (currentCharacter) {
                      expect(
                        omit(
                          {
                            ...currentCharacter,
                            id: char.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(char, propsThatHaveBeenModified))
                    }
                  })
                  allNotes.forEach((note) => {
                    const currentNote = hamlet_with_attribute_mix.notes.find(
                      (i) => i.title === note.title
                    )
                    if (currentNote) {
                      expect(
                        omit(
                          {
                            ...currentNote,
                            id: note.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(note, propsThatHaveBeenModified))
                    }
                  })
                  allBooksAsArray.forEach((book) => {
                    const currentBook = Object.values(hamlet_with_attribute_mix.books).find(
                      // @ts-ignore
                      (i) => i.title === book.title
                    )
                    if (currentBook) {
                      expect(
                        omit(
                          {
                            ...currentBook,
                            id: book.id,
                          },
                          propsThatHaveBeenModified
                        )
                      ).toEqual(omit(book, propsThatHaveBeenModified))
                    }
                  })
                })

                it('should not saved the deselected sections', () => {
                  const allTags = allTagsSelector(stateAfterSaving)
                  const allPlaces = allPlacesSelector(stateAfterSaving)

                  expect(allTags.length).toBe(0)
                  expect(allPlaces.length).toBe(0)
                })
              })
            })
          })
        })
      })
    })
  })
})

describe('toggleIdMarkedToImport', () => {
  describe('given the initial state store', () => {
    const store = initialStore()
    const initialState = store.getState()

    describe('given the user loads an empty project', () => {
      it('should produce an initial importModal state', () => {
        const importModalData = importPltrModalSelector(initialState)
        expect(importModalData).toEqual(uiState.importModal)
      })

      describe('given the user performs import from project tab', () => {
        describe('and choose an existing pltr project', () => {
          describe('and import', () => {
            const fullSystemState = fullSystemStateSelector(initialState)
            store.dispatch(showImportDataPicker(hamlet_with_attribute_mix, fullSystemState))
            const stateAfterSecondImport = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSecondImport)
            const bookData = importModalBookDataSelector(stateAfterSecondImport)
            const importData = importPltrDataSelector(stateAfterSecondImport)
            const allCharacters = allCharactersSelector(stateAfterSecondImport)
            const allPlaces = allPlacesSelector(stateAfterSecondImport)
            const allNotes = allNotesSelector(stateAfterSecondImport)
            const allTags = allTagsSelector(stateAfterSecondImport)
            const SECTION_TO_TOGGLE_1 = 'characters'
            const SECTION_TO_TOGGLE_2 = 'notes'
            const SECTION_1_ID_TO_TOGGLE_1 = 2
            const SECTION_1_ID_TO_TOGGLE_2 = 5
            const SECTION_2_ID_TO_TOGGLE_1 = 3

            it('should change the import modal state to open', () => {
              const isImportModalOpen = isImportModalOpenSelector(stateAfterSecondImport)
              expect(isImportModalOpen).toBeTruthy()
            })

            it('should have `data` and `bookData` object', () => {
              expect(importData).toBeDefined()
              expect(bookData).toBeDefined()
              expect(importModalData.data).toEqual(importData)
              expect(importModalData.bookData).toEqual(bookData)
            })

            it('should still have the same number of characters, notes, places, and tags after the first import', () => {
              expect(allCharacters).toHaveLength(0)
              expect(allPlaces).toHaveLength(0)
              expect(allNotes).toHaveLength(0)
              expect(allTags).toHaveLength(0)
            })

            it('should have characters, notes, places, tags, images and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importImages = importData['images']
              const importBooks = importData['books']
              expect(importCharacters).toBeDefined()
              expect(importNotes).toBeDefined()
              expect(importPlaces).toBeDefined()
              expect(importTags).toBeDefined()
              expect(importImages).toBeDefined()
              expect(importBooks).toBeDefined()
            })

            it('should have `isChecked` prop for each characters, notes, places, tags and books from importModal state', () => {
              const importCharacters = importData['characters']
              const importNotes = importData['notes']
              const importPlaces = importData['places']
              const importTags = importData['tags']
              const importBooks = importData['books']
              importCharacters.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importNotes.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importPlaces.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              importTags.forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
              Object.values(importBooks).forEach((i) => {
                expect(i.isChecked).toBeDefined()
              })
            })

            describe('given the user deselect another section', () => {
              const isChecked = true
              store.dispatch(
                toggleIdMarkedToImport(SECTION_TO_TOGGLE_1, SECTION_1_ID_TO_TOGGLE_1, !isChecked)
              )
              store.dispatch(
                toggleIdMarkedToImport(SECTION_TO_TOGGLE_1, SECTION_1_ID_TO_TOGGLE_2, !isChecked)
              )
              store.dispatch(
                toggleIdMarkedToImport(SECTION_TO_TOGGLE_2, SECTION_2_ID_TO_TOGGLE_1, !isChecked)
              )
              const stateAfterConsecutiveDeselect = store.getState()
              const importDataAfterConsecutiveDeselect = importPltrDataSelector(
                stateAfterConsecutiveDeselect
              )

              it('should change the `isChecked` prop to false for only for items on the sections with items deselected', () => {
                mapValues(
                  omit(importDataAfterConsecutiveDeselect, ['images']),
                  (section, sectionName) => {
                    if ([SECTION_TO_TOGGLE_1, SECTION_TO_TOGGLE_2].includes(sectionName)) {
                      if (sectionName === SECTION_TO_TOGGLE_1) {
                        section.forEach((char) => {
                          if (
                            [SECTION_1_ID_TO_TOGGLE_1, SECTION_1_ID_TO_TOGGLE_2].includes(char.id)
                          ) {
                            expect(char.isChecked).toBeFalsy()
                          } else {
                            expect(char.isChecked).toBeTruthy()
                          }
                        })
                      } else if (sectionName === SECTION_TO_TOGGLE_2) {
                        section.forEach((char) => {
                          if ([SECTION_2_ID_TO_TOGGLE_1].includes(char.id)) {
                            expect(char.isChecked).toBeFalsy()
                          } else {
                            expect(char.isChecked).toBeTruthy()
                          }
                        })
                      }
                    } else if (Array.isArray(section)) {
                      expect(section.every((i) => i.isChecked)).toBeTruthy()
                    } else if (isPlainObject(section)) {
                      expect(Object.values(section).every((i) => i.isChecked)).toBeTruthy()
                    }
                  }
                )
              })
            })

            describe('given the user saved the import file ', () => {
              store.dispatch(saveImportPltrData())
              const stateAfterSaving = store.getState()
              const importModalData = importPltrModalSelector(stateAfterSaving)

              it('should revert the import modal state to its initialState', () => {
                expect(importModalData).toEqual(uiState.importModal)
              })

              it('should save the selected items for each section from the imported file', () => {
                const allCharacters = allCharactersSelector(stateAfterSaving)
                const allNotes = allNotesSelector(stateAfterSaving)
                const allImportFileCharacters = hamlet_with_attribute_mix.characters
                const allImportFileNotes = hamlet_with_attribute_mix.notes
                const deselectedChar1FromImportFile = allImportFileCharacters.find(
                  (ch) => ch.id == SECTION_1_ID_TO_TOGGLE_1
                )
                const deselectedChar2FromImportFile = allImportFileCharacters.find(
                  (ch) => ch.id == SECTION_1_ID_TO_TOGGLE_2
                )
                const deselectedNote1FromFile = allImportFileNotes.find(
                  (ch) => ch.id == SECTION_1_ID_TO_TOGGLE_1
                )

                expect(allCharacters.length).toEqual(
                  hamlet_with_attribute_mix.characters.length - 2
                )
                expect(allNotes.length).toEqual(hamlet_with_attribute_mix.notes.length - 1)

                const theDeselected1 = allCharacters.findIndex(
                  (char) => char.name == deselectedChar1FromImportFile?.name
                )
                const theDeselected2 = allCharacters.findIndex(
                  (char) => char.name == deselectedChar2FromImportFile?.name
                )
                const theDeselectedNote = allNotes.findIndex(
                  (note) => note.title == deselectedNote1FromFile?.title
                )
                expect(theDeselected1).toBeLessThan(0)
                expect(theDeselected2).toBeLessThan(0)
                expect(theDeselectedNote).toBeLessThan(0)

                allCharacters.forEach((ch) => {
                  expect(
                    allImportFileCharacters.some((importedCh) => importedCh.name === ch.name)
                  ).toBeTruthy()
                })
                allNotes.forEach((note) => {
                  expect(
                    allImportFileNotes.some((importedNote) => importedNote.title === note.title)
                  ).toBeTruthy()
                })
              })
            })
          })
        })
      })
    })
  })
})
