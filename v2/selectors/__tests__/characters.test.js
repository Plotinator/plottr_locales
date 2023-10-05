import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import selectors from '../index'
import actions from '../../actions'
import goldilocksTestFile from './fixtures/goldilocks.json'
import hamlet_with_attribute_mix from './fixtures/hamlet-with-attribute-mix.json'

const wiredUpActions = actions(pltrAdaptor)
const { loadFile, setCharacterSort } = wiredUpActions.ui
const { addCharacter, reorderCharacter } = wiredUpActions.character
const { addBook } = wiredUpActions.book
const addBookToCharacter = wiredUpActions.character.addBook

const {
  allBooksWithCharactersInThemSelector,
  characterBookCategoriesSelector,
  displayedSingleCharacterSelector,
  allCharactersSelector,
  visibleSortedCharactersByCategorySelector,
  isCharactersManuallySortedSelector,
  characterPositionAttributeIdSelector,
  characterCategoryAttributeIdSelector,
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

const getCharacterAbsolutePositionFromGroupedCategory = (groupedCategory, characterId) => {
  const flattenedGroups = Object.values(groupedCategory).flat()
  return flattenedGroups.findIndex((obj) => obj.id === characterId)
}

describe('characterBookCategoriesSelector', () => {
  describe('given a store with no characters', () => {
    it('should produce the empty array', () => {
      const store = initialStore()
      const initialState = store.getState()
      expect(characterBookCategoriesSelector(initialState)).toEqual([])
    })
  })
  describe('given a store with a character', () => {
    describe('and a single book', () => {
      it('should produce an array with a single category called "Not in Book" with the book id in an array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        expect(characterBookCategoriesSelector(initialState)).toEqual([
          {
            glyph: 'plus',
            lineAbove: true,
            displayHeading: true,
            key: 'Not in Book',
            'Not in Book': [1],
          },
        ])
      })
      describe('and that character is associated with that book', () => {
        it('should produce an array with a single category, called "Characters In Book" with the book id in an array as the value', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          const initialState = store.getState()
          expect(characterBookCategoriesSelector(initialState)).toEqual([
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': [1],
            },
          ])
        })
      })
    })
    describe('and two books', () => {
      it('should produce an array with a single category, called "Not in Book" with the book ids in the array as the value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBook())
        const initialState = store.getState()
        expect(characterBookCategoriesSelector(initialState)).toEqual([
          {
            glyph: 'plus',
            lineAbove: true,
            displayHeading: true,
            key: 'Not in Book',
            'Not in Book': [1],
          },
        ])
      })
      describe('and that character is associated with the first book', () => {
        it('should produce an array with two categories, called "Characters In Book" & "Not in Book" with the corresponding book ids', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBook())
          store.dispatch(addBookToCharacter(1, 1))
          const initialState = store.getState()
          expect(characterBookCategoriesSelector(initialState)).toEqual([
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': [1],
            },
          ])
        })
      })
      describe('and two characters', () => {
        describe('and the first character is associated with the first book', () => {
          it('should produce an array with two categories, called "Characters In Book" & "Not in Book" with the corresponding book ids', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addCharacter('Jane Doe'))
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            const initialState = store.getState()
            expect(characterBookCategoriesSelector(initialState)).toEqual([
              {
                displayHeading: false,
                key: 'Characters In Book',
                'Characters In Book': [1],
              },
              {
                glyph: 'plus',
                lineAbove: true,
                displayHeading: true,
                key: 'Not in Book',
                'Not in Book': [2],
              },
            ])
          })
        })
      })
    })
  })
})

describe('allBooksWithCharactersInThemSelector', () => {
  describe('given the empty file state', () => {
    it('should produce an object containing only the untitled book', () => {
      const store = initialStore()
      const state = store.getState()
      expect(allBooksWithCharactersInThemSelector(state)).toEqual({
        1: {
          id: 1,
          title: 'Test file',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
      })
    })
  })
  describe('given a file with two books', () => {
    it('should produce an object containing both books', () => {
      const store = initialStore()
      store.dispatch(addBook('', '', '', ''))
      const state = store.getState()
      expect(allBooksWithCharactersInThemSelector(state)).toEqual({
        1: {
          id: 1,
          title: 'Test file',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
        2: {
          id: 2,
          title: '',
          premise: '',
          genre: '',
          theme: '',
          templates: [],
          timelineTemplates: [],
          imageId: null,
        },
      })
    })
    describe('and one of the books is associated with the first character', () => {
      it('should only produce the first book', () => {
        const store = initialStore()
        store.dispatch(addBook())
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        const state = store.getState()
        expect(allBooksWithCharactersInThemSelector(state)).toEqual({
          1: {
            id: 1,
            title: 'Test file',
            premise: '',
            genre: '',
            theme: '',
            templates: [],
            timelineTemplates: [],
            imageId: null,
          },
        })
      })
    })
  })
})

describe('displayedSingleCharacterSelector', () => {
  describe('given the new empty file', () => {
    describe('and loads goldilocks file', () => {
      const store = configureStore()
      store.dispatch(
        loadFile('Goldilocks', false, goldilocksTestFile, '2020.7.30', 'device:///tmp.dummy.pltr')
      )

      const state = store.getState()
      const allCharacters = allCharactersSelector(state)

      it('should have loaded all 4 characters', () => {
        expect(allCharacters).toHaveLength(4)
      })

      const goldilocks = allCharacters.find((character) => character.name === 'Goldilocks')
      const goldilocksProperties = displayedSingleCharacterSelector(state, goldilocks.id)
      it('should have a character named Goldilocks', () => {
        expect(goldilocks).toBeDefined()
        expect(goldilocks.id).toBe(1)
      })

      it('should have 2 legacy tags', () => {
        expect(goldilocks.tags).toHaveLength(2)
      })

      it('should have 3 tags attached to it', () => {
        expect(goldilocksProperties.tags).toHaveLength(3)
      })
    })
  })
})

describe('visibleSortedCharactersByCategorySelector', () => {
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
      const initialPositionAttributeId = characterPositionAttributeIdSelector(initialState)
      const initialCateogryAttributeId = characterCategoryAttributeIdSelector(initialState)

      it('should have loaded all 19 characters', () => {
        expect(allCharacters).toHaveLength(19)
      })
      it('should not be manually sorted by default', () => {
        expect(initialIsManuallySortedState).toBeFalsy()
      })
      it('should not have positionAttribute', () => {
        expect(initialPositionAttributeId).toBeFalsy()
      })
      it('should not have categoryAttribute', () => {
        expect(initialCateogryAttributeId).toBeFalsy()
      })

      it('should be alphabetically sorted by category', () => {
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
              character3InitialState.categoryId
            )
          )

          const afterFirstReorderState = store.getState()
          const visibleSortedCharactersByCategoryAfterFirstReorder =
            visibleSortedCharactersByCategorySelector(afterFirstReorderState)
          const isManuallySortedStateAfterFirstReorder =
            isCharactersManuallySortedSelector(afterFirstReorderState)
          const positionAttributeIdAfterFirstReorder =
            characterPositionAttributeIdSelector(afterFirstReorderState)
          const categoryAttributeIdAfterFirstReorder =
            characterCategoryAttributeIdSelector(afterFirstReorderState)

          it('should have character attributes property', () => {
            Object.values(visibleSortedCharactersByCategoryAfterFirstReorder).forEach(
              (characters) => {
                characters.forEach((character) => {
                  expect(character.attributes).toBeDefined()
                })
              }
            )
          })
          it('should have change isManuallySorted to true', () => {
            expect(isManuallySortedStateAfterFirstReorder).toBeTruthy()
          })
          it('should have positionAttribute ID', () => {
            expect(positionAttributeIdAfterFirstReorder).toBeTruthy()
          })
          it('should have categoryAttribute ID', () => {
            expect(categoryAttributeIdAfterFirstReorder).toBeTruthy()
          })

          it(`should be sorted by position from character's attributes property`, () => {
            Object.values(visibleSortedCharactersByCategoryAfterFirstReorder).forEach(
              (characters) => {
                characters.forEach((character, position) => {
                  if (characters[position - 1]) {
                    const characterPositionAttribute = character.attributes.find(
                      ({ id }) => id == positionAttributeIdAfterFirstReorder
                    )
                    const previousCharacterPositionAttribute = characters[
                      position - 1
                    ].attributes.find(({ id }) => id == positionAttributeIdAfterFirstReorder)

                    expect(characterPositionAttribute.value).toBeGreaterThan(
                      previousCharacterPositionAttribute?.value
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
            const positionAttributeIdAfterChangeSort =
              characterPositionAttributeIdSelector(afterChangeSortState)
            const categoryAttributeIdAfterChangeSort =
              characterCategoryAttributeIdSelector(afterChangeSortState)

            it('should not be manually sorted', () => {
              expect(isManuallySortedStateAfterChangeSort).toBeFalsy()
            })

            it('should still have positionAttribute ID', () => {
              expect(positionAttributeIdAfterChangeSort).toBeTruthy()
            })
            it('should still have categoryAttribute ID', () => {
              expect(categoryAttributeIdAfterChangeSort).toBeTruthy()
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
                const isManuallySortedStateAfterSecondReorder =
                  isCharactersManuallySortedSelector(afterSecondReorderState)
                const positionAttributeIdAfterSecondReorder =
                  characterPositionAttributeIdSelector(afterSecondReorderState)
                const categoryAttributeIdAfterSecondReorder =
                  characterCategoryAttributeIdSelector(afterSecondReorderState)

                it('should have change isManuallySorted to true', () => {
                  expect(isManuallySortedStateAfterSecondReorder).toBeTruthy()
                })

                it('should not create new positionAttribute ID', () => {
                  expect(positionAttributeIdAfterChangeSort).toEqual(
                    positionAttributeIdAfterSecondReorder
                  )
                })
                it('should not create new categoryAttribute ID', () => {
                  expect(categoryAttributeIdAfterChangeSort).toEqual(
                    categoryAttributeIdAfterSecondReorder
                  )
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
                  Object.values(visibleSortedCharactersByCategoryAfterSecondReorder).forEach(
                    (characters) => {
                      characters.forEach((character, position) => {
                        if (characters[position - 1]) {
                          const characterPositionAttribute = character.attributes.find(
                            ({ id }) => id == positionAttributeIdAfterSecondReorder
                          )
                          const previousCharacterPositionAttribute = characters[
                            position - 1
                          ].attributes.find(({ id }) => id == positionAttributeIdAfterSecondReorder)

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
                  const isManuallySortedStateAfterThirdReorder =
                    isCharactersManuallySortedSelector(afterThirdReorderState)
                  const positionAttributeIdAfterThirdReorder =
                    characterPositionAttributeIdSelector(afterThirdReorderState)
                  const categoryAttributeIdAfterThirdReorder =
                    characterCategoryAttributeIdSelector(afterThirdReorderState)

                  const character10AbsolutePositionAfterThirdReorder =
                    getCharacterAbsolutePositionFromGroupedCategory(
                      visibleSortedCharactersByCategoryAfterSecondReorder,
                      character2AfterSecondReorderState.id
                    )

                  it('should still have isManuallySorted value as true', () => {
                    expect(isManuallySortedStateAfterThirdReorder).toBeTruthy()
                  })

                  it('should get the same positionAttribute ID', () => {
                    expect(positionAttributeIdAfterChangeSort).toEqual(
                      positionAttributeIdAfterFirstReorder
                    )
                    expect(positionAttributeIdAfterChangeSort).toEqual(
                      positionAttributeIdAfterSecondReorder
                    )
                    expect(positionAttributeIdAfterChangeSort).toEqual(
                      positionAttributeIdAfterThirdReorder
                    )
                  })
                  it('should get the same categoryAttribute ID', () => {
                    expect(categoryAttributeIdAfterChangeSort).toEqual(
                      categoryAttributeIdAfterFirstReorder
                    )
                    expect(categoryAttributeIdAfterChangeSort).toEqual(
                      categoryAttributeIdAfterSecondReorder
                    )
                    expect(categoryAttributeIdAfterChangeSort).toEqual(
                      categoryAttributeIdAfterThirdReorder
                    )
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
                    Object.values(visibleSortedCharactersByCategoryAfterThirdReorder).forEach(
                      (characters) => {
                        characters.forEach((character, position) => {
                          if (characters[position - 1]) {
                            const characterPositionAttribute = character.attributes.find(
                              ({ id }) => id == positionAttributeIdAfterThirdReorder
                            )
                            const previousCharacterPositionAttribute = characters[
                              position - 1
                            ].attributes.find(
                              ({ id }) => id == positionAttributeIdAfterThirdReorder
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
