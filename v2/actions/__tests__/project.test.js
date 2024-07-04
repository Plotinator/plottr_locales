import { loadFile } from '../ui'
import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import selectors from '../../selectors'
import { uiState } from '../../store/initialState'
import { goldilocks, hamlet_with_attribute_mix } from './fixtures'
import actions from '..'
import { omit } from 'lodash'

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
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { showImportDataPicker } = wiredUpActions.ui
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
              const allCharacters = allCharactersSelector(stateAfterSaving)
              const allPlaces = allPlacesSelector(stateAfterSaving)
              const allNotes = allNotesSelector(stateAfterSaving)
              const allTags = allTagsSelector(stateAfterSaving)
              const allBooksAfterImport = allBooksAsArraySelector(stateAfterSaving)

              expect(allCharacters.length).toEqual(goldilocks.characters.length)
              expect(allPlaces.length).toEqual(goldilocks.places.length)
              expect(allNotes.length).toEqual(goldilocks.notes.length)
              expect(allTags.length).toEqual(goldilocks.tags.length)
              expect(allBooksAfterImport.length).toEqual(2)

              allCharacters.forEach((char) => {
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
                }
              })
              allPlaces.forEach((place) => {
                const curentPlace = goldilocks.places.find((i) => i.name === place.name)
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
                }
              })
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
                }
              })

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
            const allCharacters = allCharactersSelector(stateAfterSecondImport)
            const allPlaces = allPlacesSelector(stateAfterSecondImport)
            const allNotes = allNotesSelector(stateAfterSecondImport)
            const allTags = allTagsSelector(stateAfterSecondImport)
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
              expect(allCharacters).toHaveLength(4)
              expect(allPlaces).toHaveLength(2)
              expect(allNotes).toHaveLength(5)
              expect(allTags).toHaveLength(8)
              expect(booksAfterSecondImport).toHaveLength(2)
            })
          })

          describe('given the user leave everything checked', () => {
            describe('and saved', () => {
              store.dispatch(saveImportPltrData())
              const stateAfterSecondImportFileSaved = store.getState()
              const importModalData = importPltrModalSelector(stateAfterSecondImportFileSaved)

              it('should revert the import modal state to its initialState', () => {
                expect(importModalData).toEqual(uiState.importModal)
              })

              it('should now have added the characters, places, notes, tags and books from the second imported file', () => {
                const allCharacters = allCharactersSelector(stateAfterSecondImportFileSaved)
                const allPlaces = allPlacesSelector(stateAfterSecondImportFileSaved)
                const allNotes = allNotesSelector(stateAfterSecondImportFileSaved)
                const allTags = allTagsSelector(stateAfterSecondImportFileSaved)
                const allBooksAfterSecondImport = allBooksAsArraySelector(
                  stateAfterSecondImportFileSaved
                )

                expect(allCharacters.length).toEqual(
                  goldilocks.characters.length + hamlet_with_attribute_mix.characters.length
                )
                expect(allPlaces.length).toEqual(
                  goldilocks.places.length + hamlet_with_attribute_mix.places.length
                )
                expect(allNotes.length).toEqual(
                  goldilocks.notes.length + hamlet_with_attribute_mix.notes.length
                )
                expect(allTags.length).toEqual(
                  goldilocks.tags.length + hamlet_with_attribute_mix.tags.length
                )
                expect(allBooksAfterSecondImport.length).toEqual(3)

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
              })
            })
          })
        })
      })
    })
  })
})
