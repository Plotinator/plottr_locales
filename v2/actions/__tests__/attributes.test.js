import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { hamlet_with_attribute_mix } from './fixtures'
import selectors from '../../selectors'
import actions from '../'

const {
  allCharactersSelector,
  visibleSortedCharactersByCategorySelector,
  displayedSingleCharacterSelector,
  characterAttributsForBookByIdSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile } = wiredUpActions.ui
const { reorderCharacter } = wiredUpActions.character

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
      const initialAvailableAttributes = characterAttributsForBookByIdSelector(initialState)
      const initialPositionAttributeId = Object.values(initialAvailableAttributes).find(
        ({ name }) => name === 'position'
      )
      const initialCategoryAttributeId = Object.values(initialAvailableAttributes).find(
        ({ name }) => name === 'category'
      )

      it('should have loaded all 19 characters', () => {
        expect(allCharacters).toHaveLength(19)
      })
      it('should have no attributes property', () => {
        allCharacters.every((character) => expect(character.attributes).toBeUndefined())
      })
      it('should not have  characterPositionAttributeId yet', () => {
        expect(initialPositionAttributeId).toBeUndefined()
      })
      it('should not have categoryAttributeId yet', () => {
        expect(initialCategoryAttributeId).toBeUndefined()
      })

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
      const character4InitialState = displayedSingleCharacterSelector(
        initialState,

        // @ts-ignore
        allCharacters.find(({ id }) => id == 4).id
      )
      const character7InitialState = displayedSingleCharacterSelector(
        initialState,

        // @ts-ignore
        allCharacters.find(({ id }) => id == 7).id
      )
      const character8InitialState = displayedSingleCharacterSelector(
        initialState,

        // @ts-ignore
        allCharacters.find(({ id }) => id == 8).id
      )
      const character3AbsolutePosition = getCharacterAbsolutePositionFromGroupedCategory(
        visibleSortedCharactersByCategory,
        character3InitialState.id
      )

      describe(`given the user move characters to another character's position`, () => {
        describe(`given the user move character1 to character3's position`, () => {
          store.dispatch(
            reorderCharacter(
              character1InitialState.id,
              character3AbsolutePosition,
              character3InitialState.categoryId
            )
          )
          const afterFirstMoveState = store.getState()
          const allCharactersAfterFirstMove = allCharactersSelector(afterFirstMoveState)
          const availableAttributesFirstMove =
            characterAttributsForBookByIdSelector(afterFirstMoveState)

          const positionAttributeIdAfterFirstMove = Object.values(
            availableAttributesFirstMove
          ).find(({ name }) => name === 'position')
          const categoryAttributeIdAfterFirstMove = Object.values(
            availableAttributesFirstMove
          ).find(({ name }) => name === 'category')

          it('should have create attributes property', () => {
            allCharactersAfterFirstMove.forEach((character) => {
              expect(character.attributes).toBeDefined()
              expect(typeof character.attributes).toBe('object')
              expect(Array.isArray(character.attributes)).toBeTruthy()
            })
          })
          it('should have positionAttribute', () => {
            expect(positionAttributeIdAfterFirstMove).not.toBeNull()
          })
          it('should have categoryAttribute', () => {
            expect(categoryAttributeIdAfterFirstMove).not.toBeNull()
          })

          describe(`given the user manually reorder the characters`, () => {
            store.dispatch(
              reorderCharacter(
                character7InitialState.id,
                character3AbsolutePosition,
                character3InitialState.categoryId
              )
            )
            const afterSecondMoveState = store.getState()
            const availableAttributesAfterSecondMove =
              characterAttributsForBookByIdSelector(afterSecondMoveState)
            const positionAttributeIdAfterSecondMove = Object.values(
              availableAttributesAfterSecondMove
            ).find(({ name }) => name === 'position')
            const categoryAttributeIdAfterSecondMove = Object.values(
              availableAttributesAfterSecondMove
            ).find(({ name }) => name === 'category')

            describe(`given the user character7 to character3's position`, () => {
              it('should not create another positionAttribute', () => {
                expect(positionAttributeIdAfterFirstMove).toEqual(
                  positionAttributeIdAfterSecondMove
                )
              })
              it('should not create another categoryAttributeId', () => {
                expect(categoryAttributeIdAfterFirstMove).toEqual(
                  categoryAttributeIdAfterSecondMove
                )
              })

              describe(`given the user move another character to another category`, () => {
                describe(`given the user character4 to character8's position`, () => {
                  store.dispatch(
                    reorderCharacter(
                      character4InitialState.id,
                      character3AbsolutePosition,
                      character8InitialState.categoryId
                    )
                  )
                  const afterThirdMoveState = store.getState()
                  const availableAttributesAfterThirdMove =
                    characterAttributsForBookByIdSelector(afterThirdMoveState)

                  const positionAttributeIdAfterThirdMove = Object.values(
                    availableAttributesAfterThirdMove
                  ).find(({ name }) => name === 'position')
                  const categoryAttributeIdAfterThirdMove = Object.values(
                    availableAttributesAfterThirdMove
                  ).find(({ name }) => name === 'category')

                  it('should not create another positionAttribute', () => {
                    expect(positionAttributeIdAfterThirdMove).toEqual(
                      positionAttributeIdAfterSecondMove
                    )
                  })
                  it('should not create another categoryAttributeId', () => {
                    expect(categoryAttributeIdAfterThirdMove).toEqual(
                      categoryAttributeIdAfterSecondMove
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
