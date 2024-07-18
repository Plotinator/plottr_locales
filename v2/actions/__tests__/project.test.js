import { loadFile } from '../ui'
import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import selectors from '../../selectors'
import { uiState } from '../../store/initialState'
import { goldilocks, hamlet_with_attribute_mix, pride_and_prejudice } from './fixtures'
import actions from '..'
import { isEmpty, omit, uniqBy, isPlainObject, shuffle } from 'lodash'
import fc from 'fast-check'
import validateFullFileAfterChange, { allValidations } from '../changeAssertions'

const {
  importPltrModalSelector,
  fullSystemStateSelector,
  isImportModalOpenSelector,
  importModalBookDataSelector,
  importPltrDataSelector,
  allCharactersSelector,
  allPlacesSelector,
  allNotesSelector,
  allTagsSelector,
  allBooksAsArraySelector,
  fullFileStateSelector,
  allCardsSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const {
  showImportDataPicker,
  toggleBookToImport,
  toggleCustomAttributeToImport,
  toggleIdMarkedToImport,
  toggleAllSectionMarkedToImport,
} = wiredUpActions.ui
const { saveImportPltrData } = wiredUpActions.project

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

describe('saveImportPltrData', () => {
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

      describe('given the user choose an existing project', () => {
        describe('and import', () => {
          const fullSystemState = fullSystemStateSelector(initialState)
          store.dispatch(showImportDataPicker(goldilocks, fullSystemState))
          const stateAfterImport = store.getState()
          const importModalData = importPltrModalSelector(stateAfterImport)
          const bookData = importModalBookDataSelector(stateAfterImport)
          const importData = importPltrDataSelector(stateAfterImport)

          it('should change the import modal state to open', () => {
            const isImportModalOpen = isImportModalOpenSelector(stateAfterImport)
            expect(isImportModalOpen).toBeTruthy()
          })

          it('should have `data` and `bookData` object', () => {
            expect(importData).toBeDefined()
            expect(bookData).toBeDefined()
            expect(importModalData.data).toEqual(importData)
            expect(importModalData.bookData).toEqual(bookData)
          })

          it('should still have no characters, notes, places, and tags', () => {
            expect(allCharacters).toHaveLength(0)
            expect(allPlaces).toHaveLength(0)
            expect(allNotes).toHaveLength(0)
            expect(allTags).toHaveLength(0)
          })
        })

        describe('given the user leave everything checked', () => {
          describe('and saved', () => {
            store.dispatch(saveImportPltrData())
            const stateAfterSaving = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSaving)

            it('should revert the import modal state to its initialState', () => {
              expect(importModalData).toEqual(uiState.importModal)
            })

            it('should have now the characters, places, notes, and tags from the imported file', () => {
              const allCharactersImported = allCharactersSelector(stateAfterSaving)
              const allPlacesImported = allPlacesSelector(stateAfterSaving)
              const allNotesImported = allNotesSelector(stateAfterSaving)
              const allTagsImported = allTagsSelector(stateAfterSaving)
              const allBooksAfterImport = allBooksAsArraySelector(stateAfterSaving)

              expect(allCharactersImported.length).toEqual(goldilocks.characters.length)
              expect(allPlacesImported.length).toEqual(goldilocks.places.length)
              expect(allNotesImported.length).toEqual(goldilocks.notes.length)
              expect(allTagsImported.length).toEqual(goldilocks.tags.length)
              expect(allBooksAfterImport.length).toEqual(2)

              allCharactersImported.forEach((char) => {
                const currentCharacter = goldilocks.characters.find((i) => i.name === char.name)
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
                } else {
                  throw new Error('Could not find corresponding new character for ' + char.name)
                }
              })
              expect(allCharacters.length).toEqual(uniqBy(allCharacters, 'id').length)
              allPlaces.forEach((place) => {
                const currentPlace = goldilocks.places.find((i) => i.name === place.name)
                if (currentPlace) {
                  expect(
                    omit(
                      {
                        ...currentPlace,
                        id: place.id,
                      },
                      propsThatHaveBeenModified
                    )
                  ).toEqual(omit(place, propsThatHaveBeenModified))
                } else {
                  throw new Error('Could not find corresponding new place for ' + place.name)
                }
              })
              expect(allPlaces.length).toEqual(uniqBy(allPlaces, 'id').length)
              allNotes.forEach((note) => {
                const currentNote = goldilocks.notes.find((i) => i.title === note.title)
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
                } else {
                  throw new Error('Could not find corresponding new note for ' + note.title)
                }
              })
              expect(allNotes.length).toEqual(uniqBy(allNotes, 'id').length)
              allTags.forEach((tag) => {
                const currentTag = goldilocks.tags.find((i) => i.title === tag.title)
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
                } else {
                  throw new Error('Could not find corresponding new tag for ' + tag.title)
                }
              })
              expect(allTags.length).toEqual(uniqBy(allTags, 'id').length)

              allBooksAfterImport.forEach((book) => {
                const arrayedBooks = Object.values(omit(goldilocks.books, ['allIds']))
                const currentBook = arrayedBooks.find((i) => i.title === book.title)
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
              expect(allBooksAfterImport.length).toEqual(uniqBy(allBooksAfterImport, 'id').length)
            })

            it('should have not have categoryIds for characters, places, and tags imported', () => {
              const allCharactersImported = allCharactersSelector(stateAfterSaving)
              const allPlacesImported = allPlacesSelector(stateAfterSaving)
              const allTagsImported = allTagsSelector(stateAfterSaving)

              allCharactersImported.forEach((char) => {
                const currentCharacter = goldilocks.characters.find((i) => i.name === char.name)
                if (currentCharacter) {
                  // null or undefined
                  expect(char.categoryId).toBeFalsy()
                } else {
                  throw new Error('Could not find corresponding new character for ' + char.name)
                }
              })
              allPlacesImported.forEach((place) => {
                const currentPlace = goldilocks.places.find((i) => i.name === place.name)
                if (currentPlace) {
                  // null or undefined
                  expect(place.categoryId).toBeFalsy()
                } else {
                  throw new Error('Could not find corresponding new place for ' + place.name)
                }
              })
              allTagsImported.forEach((tag) => {
                const currentTag = goldilocks.tags.find((i) => i.title === tag.title)
                if (currentTag) {
                  // null or undefined
                  expect(tag.categoryId).toBeFalsy()
                } else {
                  throw new Error('Could not find corresponding new character for ' + tag.title)
                }
              })
            })

            it('should have the correct associations of characters, places and tags to cards imported', () => {
              const allCharactersAfterImport = allCharactersSelector(stateAfterSaving)
              const allPlacesAfterImport = allPlacesSelector(stateAfterSaving)
              const allTagsAfterImport = allTagsSelector(stateAfterSaving)
              const allCardsAfterImport = allCardsSelector(stateAfterSaving)

              allCardsAfterImport.forEach((card) => {
                card.characters.forEach((cardCharacter) => {
                  const matchedCharacterFromCard = allCharactersAfterImport.find(
                    (ch) => cardCharacter == ch.id
                  )
                  const matchedCharacterFromImport = goldilocks.characters.find(
                    (i) => i.name === matchedCharacterFromCard.name
                  )
                  if (matchedCharacterFromCard && matchedCharacterFromImport) {
                    expect(matchedCharacterFromImport.name).toEqual(matchedCharacterFromCard.name)
                  } else {
                    throw new Error('Could not find the corresponding character')
                  }
                })

                card.places.forEach((cardPlace) => {
                  const matchedPlaceFromCard = allPlacesAfterImport.find((pl) => cardPlace == pl.id)
                  const matchedPlaceFromImport = goldilocks.places.find(
                    (i) => i.name === matchedPlaceFromCard.name
                  )
                  if (matchedPlaceFromCard && matchedPlaceFromImport) {
                    expect(matchedPlaceFromImport.name).toEqual(matchedPlaceFromCard.name)
                  } else {
                    throw new Error('Could not find the corresponding character')
                  }
                })

                card.tags.forEach((cardTag) => {
                  const matchedTagFromCard = allTagsAfterImport.find((tag) => cardTag == tag.id)
                  const matchedTagFromImport = goldilocks.tags.find(
                    (i) => i.title === matchedTagFromCard.title
                  )
                  if (matchedTagFromCard && matchedTagFromImport) {
                    expect(matchedTagFromImport.title).toEqual(matchedTagFromCard.title)
                  } else {
                    throw new Error('Could not find the corresponding character')
                  }
                })
              })
            })
          })
        })
      })

      describe('given the user performs another import from project tab', () => {
        describe('and choose another existing pltr project', () => {
          describe('and import', () => {
            const fullSystemState = fullSystemStateSelector(initialState)
            store.dispatch(showImportDataPicker(hamlet_with_attribute_mix, fullSystemState))
            const stateAfterSecondImport = store.getState()
            const importModalData = importPltrModalSelector(stateAfterSecondImport)
            const bookData = importModalBookDataSelector(stateAfterSecondImport)
            const importData = importPltrDataSelector(stateAfterSecondImport)
            const allCharactersBeforeSecondImport = allCharactersSelector(stateAfterSecondImport)
            const allPlacesBeforeSecondImport = allPlacesSelector(stateAfterSecondImport)
            const allNotesBeforeSecondImport = allNotesSelector(stateAfterSecondImport)
            const allTagsBeforeSecondImport = allTagsSelector(stateAfterSecondImport)
            const booksAfterSecondImport = allBooksAsArraySelector(stateAfterSecondImport)

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
              expect(allCharactersBeforeSecondImport).toHaveLength(4)
              expect(allPlacesBeforeSecondImport).toHaveLength(2)
              expect(allNotesBeforeSecondImport).toHaveLength(5)
              expect(allTagsBeforeSecondImport).toHaveLength(8)
              expect(booksAfterSecondImport).toHaveLength(2)
            })
          })

          describe('given the user leave everything checked', () => {
            describe('and saved', () => {
              store.dispatch(saveImportPltrData())
              const stateAfterSecondImportFileSaved = store.getState()
              const importModalDataAfterSecondImport = importPltrModalSelector(
                stateAfterSecondImportFileSaved
              )
              const allCharactersAfterSecondImport = allCharactersSelector(
                stateAfterSecondImportFileSaved
              )
              const allPlacesAfterSecondImport = allPlacesSelector(stateAfterSecondImportFileSaved)
              const allNotesAfterSecondImport = allNotesSelector(stateAfterSecondImportFileSaved)
              const allTagsAfterSecondImport = allTagsSelector(stateAfterSecondImportFileSaved)
              const allBooksAfterSecondImport = allBooksAsArraySelector(
                stateAfterSecondImportFileSaved
              )

              it('should revert the import modal state to its initialState', () => {
                expect(importModalDataAfterSecondImport).toEqual(uiState.importModal)
              })

              it('should now have the same total of all characters, notes, places and tags with the items from goldilocks + hamlet items imported', () => {
                expect(allCharactersAfterSecondImport.length).toEqual(
                  goldilocks.characters.length + hamlet_with_attribute_mix.characters.length
                )
                expect(allPlacesAfterSecondImport.length).toEqual(
                  goldilocks.places.length + hamlet_with_attribute_mix.places.length
                )
                expect(allNotesAfterSecondImport.length).toEqual(
                  goldilocks.notes.length + hamlet_with_attribute_mix.notes.length
                )
                expect(allTagsAfterSecondImport.length).toEqual(
                  goldilocks.tags.length + hamlet_with_attribute_mix.tags.length
                )
                expect(allBooksAfterSecondImport.length).toEqual(3)
              })

              it('should now have added the characters, places, notes, tags and books from the second imported file', () => {
                hamlet_with_attribute_mix.notes.forEach((importedNote) => {
                  const isNoteImported = allNotesAfterSecondImport.some(
                    (note) => note.title === importedNote.title
                  )
                  if (isNoteImported) {
                    expect(isNoteImported).toBeTruthy()
                  } else {
                    throw new Error('Could not find the note imported')
                  }
                })
                expect(allCharacters.length).toEqual(uniqBy(allCharacters, 'id').length)
                expect(allPlaces.length).toEqual(uniqBy(allPlaces, 'id').length)
                expect(allNotes.length).toEqual(uniqBy(allNotes, 'id').length)
                expect(allTags.length).toEqual(uniqBy(allTags, 'id').length)

                allBooksAfterSecondImport.forEach((book) => {
                  const arrayedBooks = Object.values(
                    omit(hamlet_with_attribute_mix.books, ['allIds'])
                  )
                  const currentBook = arrayedBooks.find((i) => i.title === book.title)
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
                expect(allBooksAfterSecondImport.length).toEqual(
                  uniqBy(allBooksAfterSecondImport, 'id').length
                )
              })
            })
          })
        })
      })
    })
  })

  describe('given the user do another round of import', () => {
    describe('given the user loads another empty project', () => {
      const secondStore = initialStore()
      const secondStoreInitialState = secondStore.getState()
      it('should produce an initial importModal state', () => {
        const importModalData = importPltrModalSelector(secondStoreInitialState)
        expect(importModalData).toEqual(uiState.importModal)
      })
      const allCharacters = allCharactersSelector(secondStoreInitialState)
      const allPlaces = allPlacesSelector(secondStoreInitialState)
      const allNotes = allNotesSelector(secondStoreInitialState)
      const allTags = allTagsSelector(secondStoreInitialState)

      it('should have no characters, notes, places and tags', () => {
        expect(allCharacters).toHaveLength(0)
        expect(allPlaces).toHaveLength(0)
        expect(allNotes).toHaveLength(0)
        expect(allTags).toHaveLength(0)
      })

      describe('given the user choose an existing project', () => {
        describe('given the user performs import from project tab', () => {
          describe('and choose the same plottr project', () => {
            describe('and import', () => {
              const fullSystemState = fullSystemStateSelector(secondStoreInitialState)
              it('should change the import modal state to open', async () => {
                await secondStore.dispatch(
                  showImportDataPicker(hamlet_with_attribute_mix, fullSystemState)
                )
                const stateBeforeImport = await secondStore.getState()
                const isImportModalOpen = isImportModalOpenSelector(stateBeforeImport)
                expect(isImportModalOpen).toBeTruthy()
              })

              it('should have `data` and `bookData` object', async () => {
                await secondStore.dispatch(
                  showImportDataPicker(hamlet_with_attribute_mix, fullSystemState)
                )
                const stateBeforeImport = await secondStore.getState()

                const importModalData = importPltrModalSelector(stateBeforeImport)
                const bookData = importModalBookDataSelector(stateBeforeImport)
                const importData = importPltrDataSelector(stateBeforeImport)
                expect(importData).toBeDefined()
                expect(bookData).toBeDefined()
                expect(importModalData.data).toEqual(importData)
                expect(importModalData.bookData).toEqual(bookData)
              })

              it('should still have the same number of characters, notes, places, and tags after the first import', async () => {
                await secondStore.dispatch(
                  showImportDataPicker(hamlet_with_attribute_mix, fullSystemState)
                )
                const stateBeforeImport = await secondStore.getState()

                const allCharactersBeforeImport = allCharactersSelector(stateBeforeImport)
                const allPlacesBeforeImport = allPlacesSelector(stateBeforeImport)
                const allNotesBeforeImport = allNotesSelector(stateBeforeImport)
                const allTagsBeforeImport = allTagsSelector(stateBeforeImport)
                expect(allCharactersBeforeImport).toHaveLength(0)
                expect(allPlacesBeforeImport).toHaveLength(0)
                expect(allNotesBeforeImport).toHaveLength(0)
                expect(allTagsBeforeImport).toHaveLength(0)
              })

              describe(`given the user unchecked the select all items`, () => {
                describe('and picked specific items only, and then saved', () => {
                  it('should now have added only the characters, places, notes, tags and books selected from the second imported file', async () => {
                    const characterIdsToImport = [1, 2]
                    const noteIdsToImport = [3, 4]
                    const placeIdsToImport = [1, 2]
                    const tagsIdsToImport = [1, 2]
                    await secondStore.dispatch(toggleAllSectionMarkedToImport('characters', false))
                    await secondStore.dispatch(toggleAllSectionMarkedToImport('notes', false))
                    await secondStore.dispatch(toggleAllSectionMarkedToImport('places', false))
                    await secondStore.dispatch(toggleAllSectionMarkedToImport('tags', false))
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('characters', characterIdsToImport[0], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('characters', characterIdsToImport[1], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('notes', noteIdsToImport[0], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('notes', noteIdsToImport[1], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('places', placeIdsToImport[0], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('places', placeIdsToImport[1], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('tags', tagsIdsToImport[0], true)
                    )
                    await secondStore.dispatch(
                      toggleIdMarkedToImport('tags', tagsIdsToImport[1], true)
                    )

                    await secondStore.dispatch(saveImportPltrData())
                    const stateAfterSelectedImportFileSaved = await secondStore.getState()
                    const allCharactersAfterImport = allCharactersSelector(
                      stateAfterSelectedImportFileSaved
                    )
                    const allPlacesAfterImport = allPlacesSelector(
                      stateAfterSelectedImportFileSaved
                    )
                    const allTagsAfterImport = allTagsSelector(stateAfterSelectedImportFileSaved)
                    const allNotesAfterImport = allNotesSelector(stateAfterSelectedImportFileSaved)
                    const newCharacters = hamlet_with_attribute_mix.characters.filter((i) =>
                      characterIdsToImport.includes(i.id)
                    )
                    const newNotes = hamlet_with_attribute_mix.notes.filter((i) =>
                      noteIdsToImport.includes(i.id)
                    )
                    const newPlaces = hamlet_with_attribute_mix.places.filter((i) =>
                      placeIdsToImport.includes(i.id)
                    )
                    const newTags = hamlet_with_attribute_mix.tags.filter((i) =>
                      tagsIdsToImport.includes(i.id)
                    )

                    expect(allNotesAfterImport.length).toBe(noteIdsToImport.length)
                    expect(allPlacesAfterImport.length).toBe(placeIdsToImport.length)
                    expect(allTagsAfterImport.length).toBe(tagsIdsToImport.length)

                    allCharactersAfterImport.forEach((i) => {
                      const characterExists = newCharacters.findIndex((x) => x.name === i.name)
                      expect(characterExists).toBeGreaterThanOrEqual(0)
                    })
                    allNotesAfterImport.forEach((i) => {
                      const noteExists = newNotes.findIndex((x) => x.title === i.title)
                      expect(noteExists).toBeGreaterThanOrEqual(0)
                    })
                    allPlacesAfterImport.forEach((i) => {
                      const placeExists = newPlaces.findIndex((x) => x.name === i.name)
                      expect(placeExists).toBeGreaterThanOrEqual(0)
                    })
                    allTagsAfterImport.forEach((i) => {
                      const tagExists = newTags.findIndex((x) => x.title === i.title)
                      expect(tagExists).toBeGreaterThanOrEqual(0)
                    })
                  }, 200)
                })
              })
            })
          })
        })
      })
    })
  })

  describe('given a file with lots of data in it', () => {
    describe('when selecting a random collection of data from that file to import', () => {
      it('should leave the file in a valid state', async () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_attribute_mix,
            hamlet_with_attribute_mix.file.version,
            'device://tmp/dummy-url-test-file.pltr'
          )
        )
        store.dispatch(
          showImportDataPicker(pride_and_prejudice, fullSystemStateSelector(store.getState()))
        )
        const data = importPltrDataSelector(store.getState())

        const toggleCheckbox = (sectionName, id, checked) => {
          if (sectionName === 'books') {
            return toggleBookToImport(id, checked)
          } else if (sectionName === 'customAttributes') {
            return toggleCustomAttributeToImport(id, checked)
          } else {
            return toggleIdMarkedToImport(sectionName, id, checked)
          }
        }

        const arrayToggleFunctions = (sectionName, sectionData) => {
          if (Array.isArray(sectionData)) {
            return sectionData.map((item) => (checked) => {
              return toggleCheckbox(sectionName, item.id, checked)
            })
          } else {
            return []
          }
        }

        const objectSectionFunctions = (sectionName, sectionData) => {
          return Object.entries(sectionData).map(([_parentKey, item]) => {
            if (!isEmpty(data)) {
              return (checked) => {
                return toggleCheckbox(sectionName, item.id, checked)
              }
            } else {
              return []
            }
          })
        }

        // TODO: add book imports

        const toggleFunctions = Object.entries(data).flatMap(([key, value]) => {
          if (
            key !== 'images' &&
            ((Array.isArray(value) && value.length) || (isPlainObject(value) && !isEmpty(value)))
          ) {
            return isPlainObject(value) && key !== 'images'
              ? objectSectionFunctions(key, value)
              : arrayToggleFunctions(key, value)
          } else {
            return []
          }
        })
        await fc.assert(
          fc.asyncProperty(
            fc.int32Array({
              min: 0,
              max: toggleFunctions.length - 1,
              minLength: 1,
            }),
            fc.int32Array({
              min: 0,
              max: toggleFunctions.length - 1,
              minLength: 0,
            }),
            (xs, ys) => {
              const assertionStore = initialStore()
              store.dispatch(
                loadFile(
                  'Hamlet',
                  false,
                  hamlet_with_attribute_mix,
                  hamlet_with_attribute_mix.file.version,
                  'device://tmp/dummy-url-test-file.pltr'
                )
              )
              assertionStore.dispatch(
                showImportDataPicker(pride_and_prejudice, fullSystemStateSelector(store.getState()))
              )
              const initialState = assertionStore.getState()

              const turnOnFunctions = []
              xs.forEach((idx) => {
                const fn = toggleFunctions[idx]
                if (typeof fn === 'function') {
                  turnOnFunctions.push(fn(true))
                } else {
                  throw new Error('Invalid toggle function')
                }
              })
              const turnOffFunctions = []
              ys.forEach((idx) => {
                const fn = toggleFunctions[idx]
                if (typeof fn === 'function') {
                  turnOffFunctions.push(fn(false))
                } else {
                  throw new Error('Invalid toggle function')
                }
              })
              const allActions = shuffle([...turnOnFunctions, ...turnOffFunctions])
              allActions.forEach((action) => {
                assertionStore.dispatch(action)
              })
              assertionStore.dispatch(saveImportPltrData())

              return new Promise((resolve) => {
                setTimeout(resolve, 0)
              }).then(() => {
                const finalState = assertionStore.getState()
                if (fullFileStateSelector(initialState) === fullFileStateSelector(finalState)) {
                  throw new Error('Store did not change')
                }

                const {
                  failures,
                  passes: _passes,
                  isValid,
                } = validateFullFileAfterChange(allValidations)(initialState, finalState)
                if (!isValid) {
                  console.log(
                    'Failures:' +
                      // @ts-ignore
                      failures.reduce((acc, failure) => {
                        return acc + `\n - ${failure}`
                      }, '')
                  )
                  throw new Error('Invalid after change!')
                }
              })
            }
          )
        )
      }, 30000)
    })
  })
})
