import { configureStore, pltrAdaptor } from './fixtures/testStore'
import selectors from '../'
import actions from '../../actions'
import { hamlet_with_attribute_mix } from '../../actions/__tests__/fixtures'

const wiredUpActions = actions(pltrAdaptor)

const { reorderCharacter } = wiredUpActions.character
const { reorderNotes, editNote } = wiredUpActions.note
const { reorderPlaces, editPlace } = wiredUpActions.place
const { loadFile, setCharacterSort, setNoteSort, setPlaceSort } = wiredUpActions.ui
const { addNoteCategory, addPlaceCategory } = wiredUpActions.category

const {
  allCharactersSelector,
  allNotesSelector,
  allPlacesSelector,
  isCharactersManuallySortedSelector,
  isNotesManuallySortedSelector,
  isPlacesManuallySortedSelector,
  visibleSortedCharactersByCategorySelector,
  visibleSortedNotesByCategorySelector,
  visibleSortedPlacesByCategorySelector,
  characterAttributsForBookByIdSelector,
  displayedSingleCharacterSelector,
  sortedNoteCategoriesSelector,
  sortedPlaceCategoriesSelector,
} = selectors(pltrAdaptor)

const getCharacterAbsolutePositionFromGroupedCategory = (groupedCategory, characterId) => {
  const flattenedGroups = Object.values(groupedCategory).flat()
  return flattenedGroups.findIndex((obj) => obj.id === characterId)
}

describe('isCharactersManuallySorted', () => {
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
      const initialIsManuallySortedState = isCharactersManuallySortedSelector(initialState)

      it('should have loaded all 19 characters', () => {
        expect(allCharacters).toHaveLength(19)
      })
      it('should not be manually sorted by default', () => {
        expect(initialIsManuallySortedState).toBeFalsy()
      })

      it('should be alphabetically sorted by category by default', () => {
        Object.values(visibleSortedCharactersByCategory).forEach((characters) => {
          characters.forEach((character, position) => {
            if (characters[position - 1]) {
              expect(character.name.localeCompare(characters[position - 1].name)).toBeGreaterThan(0)
            }
          })
        })
      })

      describe('given the user reorder the characters manually', () => {
        const character1InitialState = displayedSingleCharacterSelector(
          initialState,
          allCharacters.find(({ id }) => id == 1).id
        )
        const character3InitialState = displayedSingleCharacterSelector(
          initialState,
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
              character3InitialState.categoryId,
              'up'
            )
          )

          const afterFirstReorderState = store.getState()
          const visibleSortedCharactersByCategoryAfterFirstReorder =
            visibleSortedCharactersByCategorySelector(afterFirstReorderState)
          const isCharactersManuallySortedStateAfterFirstReorder =
            isCharactersManuallySortedSelector(afterFirstReorderState)
          const isNotesManuallySorted = isNotesManuallySortedSelector(afterFirstReorderState)
          const isPlacesManuallySorted = isPlacesManuallySortedSelector(afterFirstReorderState)
          const availableAttributesFirstReorder =
            characterAttributsForBookByIdSelector(afterFirstReorderState)

          const positionAttributeIdAfterFirstReorder = Object.values(
            availableAttributesFirstReorder
          ).find(({ name }) => name === 'position')

          it('should have change isManuallySorted to true', () => {
            expect(isCharactersManuallySortedStateAfterFirstReorder).toBeTruthy()
          })

          it('should not change notes sort order', () => {
            expect(isNotesManuallySorted).toBeFalsy()
          })

          it('should not change places sort order', () => {
            expect(isPlacesManuallySorted).toBeFalsy()
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
            Object.values(visibleSortedCharactersByCategoryAfterFirstReorder).forEach(
              (characters) => {
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
            const isCharactersManuallySortedStateAfterChangeSort =
              isCharactersManuallySortedSelector(afterChangeSortState)

            it('should not be manually sorted', () => {
              expect(isCharactersManuallySortedStateAfterChangeSort).toBeFalsy()
            })

            it('should not affect notes sort order', () => {
              expect(isNotesManuallySorted).toBeFalsy()
            })

            it('should not affect places sort order', () => {
              expect(isPlacesManuallySorted).toBeFalsy()
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
                  allCharacters.find(({ id }) => id == 2).id
                )
                const character8AfterChangeSortState = displayedSingleCharacterSelector(
                  afterChangeSortState,
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
                const visibleSortedCharactersByCategoryAfterSecondReorder =
                  visibleSortedCharactersByCategorySelector(afterSecondReorderState)
                const isCharactersManuallySortedStateAfterSecondReorder =
                  isCharactersManuallySortedSelector(afterSecondReorderState)
                const availableAttributesSecondReorder =
                  characterAttributsForBookByIdSelector(afterSecondReorderState)
                const positionAttributeIdAfterSecondReorder = Object.values(
                  availableAttributesSecondReorder
                ).find(({ name }) => name === 'position')

                it('should have change isManuallySorted to true', () => {
                  expect(isCharactersManuallySortedStateAfterSecondReorder).toBeTruthy()
                })

                it('should not affect notes sort order', () => {
                  expect(isNotesManuallySorted).toBeFalsy()
                })

                it('should not affect places sort order', () => {
                  expect(isPlacesManuallySorted).toBeFalsy()
                })

                it(`should be sorted by position from character's attributes property again`, () => {
                  Object.values(visibleSortedCharactersByCategoryAfterSecondReorder).forEach(
                    (characters) => {
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
                    allCharacters.find(({ id }) => id == 2).id
                  )
                  const character10AfterSecondReorderState = displayedSingleCharacterSelector(
                    afterSecondReorderState,
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
                  const visibleSortedCharactersByCategoryAfterThirdReorder =
                    visibleSortedCharactersByCategorySelector(afterThirdReorderState)
                  const isCharactersManuallySortedStateAfterThirdReorder =
                    isCharactersManuallySortedSelector(afterThirdReorderState)
                  const availableAttributesThirdReorder =
                    characterAttributsForBookByIdSelector(afterThirdReorderState)
                  const positionAttributeIdAfterThirdReorder = Object.values(
                    availableAttributesThirdReorder
                  ).find(({ name }) => name === 'position')

                  it('should still have isManuallySorted value as true', () => {
                    expect(isCharactersManuallySortedStateAfterThirdReorder).toBeTruthy()
                  })

                  it('should not affect notes sort order', () => {
                    expect(isNotesManuallySorted).toBeFalsy()
                  })

                  it('should not affect places sort order', () => {
                    expect(isPlacesManuallySorted).toBeFalsy()
                  })

                  it(`should still be sorted by position from character's attributes`, () => {
                    Object.values(visibleSortedCharactersByCategoryAfterThirdReorder).forEach(
                      (characters) => {
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

const getCategoryPosition = (visibleSortedItemsByCategory, id, categoryId = null) => {
  const items =
    categoryId === null
      ? [
          ...(visibleSortedItemsByCategory[null] || []),
          ...(visibleSortedItemsByCategory[undefined] || []),
        ]
      : visibleSortedItemsByCategory[categoryId]
  const match = items.find((item) => item.id == id)
  return match.position
}

describe('isNotesManuallySorted', () => {
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
      const allNotes = allNotesSelector(initialState)
      const visibleSortedNotesByCategory = visibleSortedNotesByCategorySelector(initialState)
      const isNotesManuallySorted = isNotesManuallySortedSelector(initialState)

      it('should have loaded all 4 notes', () => {
        expect(allNotes).toHaveLength(4)
      })

      it('should not be manually sorted by default', () => {
        expect(isNotesManuallySorted).toBeFalsy()
      })

      it('should be alphabetically sorted by category by default', () => {
        Object.values(visibleSortedNotesByCategory).forEach((notes) => {
          notes.forEach((note, position) => {
            if (notes[position - 1]) {
              expect(note.title.localeCompare(notes[position - 1].title)).toBeGreaterThan(0)
            }
          })
        })
      })

      describe('given the user reorder the notes manually', () => {
        const note3InitialState = allNotes.find(({ id }) => id == 3)
        const note5InitialState = allNotes.find(({ id }) => id == 5)
        const note3InitialPosition = getCategoryPosition(
          visibleSortedNotesByCategory,
          note3InitialState.id,
          note3InitialState.categoryId
        )
        const note5InitialPosition = getCategoryPosition(
          visibleSortedNotesByCategory,
          note5InitialState.id,
          note5InitialState.categoryId
        )

        describe(`given the user move note1 to note3's position`, () => {
          store.dispatch(
            reorderNotes(
              note3InitialState.id,
              note3InitialPosition,
              note5InitialPosition,
              note5InitialState.categoryId || null,
              'down'
            )
          )

          const afterFirstReorderState = store.getState()
          const allNotesAfterFirstReorder = allNotesSelector(afterFirstReorderState)
          const visibleSortedNotesByCategoryAfterFirstReorder =
            visibleSortedNotesByCategorySelector(afterFirstReorderState)
          const isNotesManuallySortedAfterFirstReorder =
            isNotesManuallySortedSelector(afterFirstReorderState)
          const note3AfterFirstReorder = allNotesAfterFirstReorder.find(({ id }) => id == 3)
          const note5AfterFirstReorder = allNotesAfterFirstReorder.find(({ id }) => id == 5)

          const note3PositionAfterFirstReorder = getCategoryPosition(
            visibleSortedNotesByCategoryAfterFirstReorder,
            note3AfterFirstReorder.id,
            note3AfterFirstReorder.categoryId || null
          )
          const note5PositionAfterFirstReorder = getCategoryPosition(
            visibleSortedNotesByCategoryAfterFirstReorder,
            note5AfterFirstReorder.id,
            note5AfterFirstReorder.categoryId || null
          )

          it('should have change isManuallySorted to true', () => {
            expect(isNotesManuallySortedAfterFirstReorder).toBeTruthy()
          })

          it(`should have move note3 below note5's position`, () => {
            expect(note3PositionAfterFirstReorder).toBe(note5PositionAfterFirstReorder + 1)
          })

          it(`should have note5 to new position`, () => {
            expect(note5PositionAfterFirstReorder).not.toBe(note5InitialPosition)
          })

          describe('given the user change the sort order by title alphabetically', () => {
            store.dispatch(setNoteSort('title', 'asc'))

            const afterChangeSortState = store.getState()
            const visibleSortedNotesByCategoryAfterChangeSort =
              visibleSortedNotesByCategorySelector(afterChangeSortState)
            const isNotesManuallySortedStateAfterChangeSort =
              isNotesManuallySortedSelector(afterChangeSortState)

            it('should not be manually sorted', () => {
              expect(isNotesManuallySortedStateAfterChangeSort).toBeFalsy()
            })

            it('should be alphabetically sorted by category', () => {
              Object.values(visibleSortedNotesByCategoryAfterChangeSort).forEach((notes) => {
                notes.forEach((note, position) => {
                  if (notes[position - 1]) {
                    expect(note.title.localeCompare(notes[position - 1].title)).toBeGreaterThan(0)
                  }
                })
              })
            })

            describe('given the user reorder places manually again', () => {
              describe('given the user create new note category', () => {
                store.dispatch(addNoteCategory('Main'))
                const afterAddNoteCategory = store.getState()
                const allNotesAfterAddNoteCategory = allNotesSelector(afterAddNoteCategory)
                const allSortedNoteCategories = sortedNoteCategoriesSelector(afterAddNoteCategory)
                const note4afterAddNewCategory = allNotesAfterAddNoteCategory.find(
                  ({ id }) => id == 4
                )
                const newCategory = allSortedNoteCategories.find(({ name }) => name == 'Main')

                it('should have 1 note category', () => {
                  expect(allSortedNoteCategories).toHaveLength(1)
                })

                describe('and user move note4 to newly created category', () => {
                  store.dispatch(
                    editNote(note4afterAddNewCategory.id, { categoryId: newCategory.id })
                  )

                  const afterMoveCategory = store.getState()
                  const allNotesAfterMoveCategory = allNotesSelector(afterMoveCategory)
                  const visibleSortedNotesByCategoryAfterMoveCategory =
                    visibleSortedNotesByCategorySelector(afterMoveCategory)
                  const note4afterMoveCategory = allNotesAfterMoveCategory.find(({ id }) => id == 4)

                  it('should move note 4 to new category', () => {
                    expect(note4afterMoveCategory.categoryId).toBe(newCategory.id)
                  })

                  describe(`given the user move note6 to note4's position`, () => {
                    const note6AfterMoveCategory = allNotesAfterMoveCategory.find(
                      ({ id }) => id == 6
                    )
                    const note6PositionAfterMoveCategory = getCategoryPosition(
                      visibleSortedNotesByCategoryAfterMoveCategory,
                      note6AfterMoveCategory.id,
                      note6AfterMoveCategory.categoryId || null
                    )
                    const note4PositionAfterMoveCategory = getCategoryPosition(
                      visibleSortedNotesByCategoryAfterMoveCategory,
                      note4afterMoveCategory.id,
                      note4afterMoveCategory.categoryId || null
                    )

                    store.dispatch(
                      reorderNotes(
                        note6AfterMoveCategory.id,
                        note6PositionAfterMoveCategory,
                        note4PositionAfterMoveCategory,
                        note4afterMoveCategory.categoryId,
                        'down'
                      )
                    )

                    const afterSecondMove = store.getState()
                    const visibleSortedNotesByCategoryAfterSecondMove =
                      visibleSortedNotesByCategorySelector(afterSecondMove)
                    const allNotesAfterSecondMove = allNotesSelector(afterSecondMove)
                    const isNotesManuallySortedStateAfterSecondMove =
                      isNotesManuallySortedSelector(afterSecondMove)
                    const notesInNewCategory =
                      visibleSortedNotesByCategoryAfterSecondMove[newCategory.id]
                    const note6AfterSecondMove = allNotesAfterSecondMove.find(({ id }) => id == 6)
                    const note4AfterSecondMove = allNotesAfterSecondMove.find(({ id }) => id == 4)

                    it('should not change isManuallySorted value', () => {
                      expect(isNotesManuallySortedStateAfterSecondMove).toBeTruthy()
                    })

                    it('should have 2 notes on the new category', () => {
                      expect(notesInNewCategory).toHaveLength(2)
                    })

                    it(`should have move note6 below note4's position`, () => {
                      expect(note6AfterSecondMove.position).toBe(note4PositionAfterMoveCategory + 1)
                    })

                    it(`should not have change note4's position`, () => {
                      expect(note4AfterSecondMove.position).toBe(note4PositionAfterMoveCategory)
                    })

                    it('should have the same category with note4 on new category', () => {
                      const note4 = notesInNewCategory.find(({ id }) => id == 4)

                      const note6 = notesInNewCategory.find(({ id }) => id == 6)

                      expect(note4).toBeDefined()
                      expect(note6).toBeDefined()
                      expect(note6.categoryId).toEqual(note4.categoryId)
                    })

                    it('should not create duplicates of notes', () => {
                      const note4Count = notesInNewCategory.reduce((accumulator, note) => {
                        return accumulator + (note.id == 4 ? 1 : 0)
                      }, 0)
                      const note6Count = notesInNewCategory.reduce((accumulator, note) => {
                        return accumulator + (note.id == 6 ? 1 : 0)
                      }, 0)

                      expect(note4Count).toBe(1)
                      expect(note6Count).toBe(1)
                    })

                    it(`should have sorted by category by position`, () => {
                      Object.values(visibleSortedNotesByCategoryAfterSecondMove).forEach(
                        (notes) => {
                          notes.forEach((note, position) => {
                            if (notes[position - 1]) {
                              expect(note.position).toBeGreaterThan(
                                notesInNewCategory[position - 1].position
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
})

describe('isPlacesManuallySorted', () => {
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
      const allPlaces = allPlacesSelector(initialState)
      const visibleSortedPlacesByCategory = visibleSortedPlacesByCategorySelector(initialState)
      const isPlacesManuallySorted = isPlacesManuallySortedSelector(initialState)

      it('should have loaded all 5 places', () => {
        expect(allPlaces).toHaveLength(5)
      })

      it('should not be manually sorted by default', () => {
        expect(isPlacesManuallySorted).toBeFalsy()
      })

      it('should be alphabetically sorted by category by default', () => {
        Object.values(visibleSortedPlacesByCategory).forEach((places) => {
          places.forEach((place, position) => {
            if (places[position - 1]) {
              expect(place.name.localeCompare(places[position - 1].name)).toBeGreaterThan(0)
            }
          })
        })
      })

      describe('given the user reorder the places manually', () => {
        const place3InitialState = allPlaces.find(({ id }) => id == 3)
        const place5InitialState = allPlaces.find(({ id }) => id == 5)
        const place3InitialPosition = getCategoryPosition(
          visibleSortedPlacesByCategory,
          place3InitialState.id,
          place3InitialState.categoryId
        )
        const place5InitialPosition = getCategoryPosition(
          visibleSortedPlacesByCategory,
          place5InitialState.id,
          place5InitialState.categoryId
        )

        describe(`given the user move place1 to place3's position`, () => {
          store.dispatch(
            reorderPlaces(
              place3InitialState.id,
              place3InitialPosition,
              place5InitialPosition,
              place5InitialState.categoryId || null,
              'down'
            )
          )

          const afterFirstReorderState = store.getState()
          const allPlacesAfterFirstReorder = allPlacesSelector(afterFirstReorderState)
          const visibleSortedPlacesByCategoryAfterFirstReorder =
            visibleSortedPlacesByCategorySelector(afterFirstReorderState)
          const isPlacesManuallySortedAfterFirstReorder =
            isPlacesManuallySortedSelector(afterFirstReorderState)
          const place3AfterFirstReorder = allPlacesAfterFirstReorder.find(({ id }) => id == 3)
          const place5AfterFirstReorder = allPlacesAfterFirstReorder.find(({ id }) => id == 5)

          const place3PositionAfterFirstReorder = getCategoryPosition(
            visibleSortedPlacesByCategoryAfterFirstReorder,
            place3AfterFirstReorder.id,
            place3AfterFirstReorder.categoryId || null
          )
          const place5PositionAfterFirstReorder = getCategoryPosition(
            visibleSortedPlacesByCategoryAfterFirstReorder,
            place5AfterFirstReorder.id,
            place5AfterFirstReorder.categoryId || null
          )

          it('should have change isManuallySorted to true', () => {
            expect(isPlacesManuallySortedAfterFirstReorder).toBeTruthy()
          })

          it(`should have move place3 to place5's position`, () => {
            expect(place3PositionAfterFirstReorder).toBe(place5InitialPosition)
          })

          it(`should have place5 to new position`, () => {
            expect(place5PositionAfterFirstReorder).not.toBe(place5InitialPosition)
          })

          describe('given the user change the sort order by name alphabetically', () => {
            store.dispatch(setPlaceSort('name', 'asc'))

            const afterChangeSortState = store.getState()
            const visibleSortedPlacesByCategoryAfterChangeSort =
              visibleSortedPlacesByCategorySelector(afterChangeSortState)
            const isPlacesManuallySortedStateAfterChangeSort =
              isPlacesManuallySortedSelector(afterChangeSortState)

            it('should not be manually sorted', () => {
              expect(isPlacesManuallySortedStateAfterChangeSort).toBeFalsy()
            })

            it('should be alphabetically sorted by category', () => {
              Object.values(visibleSortedPlacesByCategoryAfterChangeSort).forEach((places) => {
                places.forEach((place, position) => {
                  if (places[position - 1]) {
                    expect(place.name.localeCompare(places[position - 1].name)).toBeGreaterThan(0)
                  }
                })
              })
            })

            describe('given the user reorder places manually again', () => {
              describe('given the user create new place category', () => {
                store.dispatch(addPlaceCategory('Main'))
                const afterAddPlaceCategory = store.getState()
                const allPlacesAfterAddPlaceCategory = allPlacesSelector(afterAddPlaceCategory)
                const allSortedPlaceCategories =
                  sortedPlaceCategoriesSelector(afterAddPlaceCategory)
                const place4afterAddNewCategory = allPlacesAfterAddPlaceCategory.find(
                  ({ id }) => id == 4
                )
                const newCategory = allSortedPlaceCategories.find(({ name }) => name == 'Main')

                it('should have 1 place category', () => {
                  expect(allSortedPlaceCategories).toHaveLength(1)
                })

                describe('and user move place4 to newly created category', () => {
                  store.dispatch(
                    editPlace(place4afterAddNewCategory.id, { categoryId: newCategory.id })
                  )

                  const afterMoveCategory = store.getState()
                  const allPlacesAfterMoveCategory = allPlacesSelector(afterMoveCategory)
                  const visibleSortedPlacesByCategoryAfterMoveCategory =
                    visibleSortedPlacesByCategorySelector(afterMoveCategory)
                  const place4afterMoveCategory = allPlacesAfterMoveCategory.find(
                    ({ id }) => id == 4
                  )

                  it('should move place 4 to new category', () => {
                    expect(place4afterMoveCategory.categoryId).toBe(newCategory.id)
                  })

                  describe(`given the user move place1 to place4's position`, () => {
                    const place1AfterMoveCategory = allPlacesAfterMoveCategory.find(
                      ({ id }) => id == 1
                    )
                    const place1PositionAfterMoveCategory = getCategoryPosition(
                      visibleSortedPlacesByCategoryAfterMoveCategory,
                      place1AfterMoveCategory.id,
                      place1AfterMoveCategory.categoryId || null
                    )
                    const place4PositionAfterMoveCategory = getCategoryPosition(
                      visibleSortedPlacesByCategoryAfterMoveCategory,
                      place4afterMoveCategory.id,
                      place4afterMoveCategory.categoryId || null
                    )

                    store.dispatch(
                      reorderPlaces(
                        place1AfterMoveCategory.id,
                        place1PositionAfterMoveCategory,
                        place4PositionAfterMoveCategory,
                        place4afterMoveCategory.categoryId,
                        'down'
                      )
                    )

                    const afterSecondMove = store.getState()
                    const visibleSortedPlacesByCategoryAfterSecondMove =
                      visibleSortedPlacesByCategorySelector(afterSecondMove)
                    const isPlacesManuallySortedStateAfterSecondMove =
                      isPlacesManuallySortedSelector(afterSecondMove)
                    const placesInNewCategory =
                      visibleSortedPlacesByCategoryAfterSecondMove[newCategory.id]

                    it('should not change isManuallySorted value', () => {
                      expect(isPlacesManuallySortedStateAfterSecondMove).toBeTruthy()
                    })

                    it('should have 2 places on the new category', () => {
                      expect(placesInNewCategory).toHaveLength(2)
                    })

                    it('should have place4 and 1 on new category', () => {
                      const place4 = placesInNewCategory.find(({ id }) => id == 4)

                      const place1 = placesInNewCategory.find(({ id }) => id == 1)

                      expect(place4).toBeDefined()
                      expect(place1).toBeDefined()
                    })

                    it('should not create duplicates of places', () => {
                      const place4Count = placesInNewCategory.reduce((accumulator, place) => {
                        return accumulator + (place.id == 4 ? 1 : 0)
                      }, 0)
                      const place1Count = placesInNewCategory.reduce((accumulator, place) => {
                        return accumulator + (place.id == 1 ? 1 : 0)
                      }, 0)

                      expect(place4Count).toBe(1)
                      expect(place1Count).toBe(1)
                    })

                    it(`should have sorted by category by position`, () => {
                      Object.values(visibleSortedPlacesByCategoryAfterSecondMove).forEach(
                        (places) => {
                          places.forEach((place, position) => {
                            if (places[position - 1]) {
                              expect(place.position).toBeGreaterThan(
                                placesInNewCategory[position - 1].position
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
})
