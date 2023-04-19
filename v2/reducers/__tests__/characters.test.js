import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { hamlet, file_with_legacy_character_tags, goldilocks } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import actions from '../../actions'
import { removeSystemKeys } from '../systemReducers'
import selectors from '../../selectors'

const {
  characterAttributesSelector,
  displayedSingleCharacterSelector,
  singleCharacterSelector,
  allCharacterAttributesSelector,
  characterCustomAttributesSelector,
  fullFileStateSelector,
  attributesSelector,
  allCharactersSelector,
} = selectors(pltrAdaptor)

const wiredUpActions = actions(pltrAdaptor)
const { loadFile, selectCharacterAttributeBookTab } = wiredUpActions.ui
const { addBook, deleteBook } = wiredUpActions.book
const { addTag, deleteTag } = wiredUpActions.tag
const { deleteCharacterCategory } = wiredUpActions.category
const { deleteCharacterAttribute, editCharacterAttributeMetadata } = wiredUpActions.attributes
const addCharacterToCard = wiredUpActions.card.addCharacter
const {
  addCharacter,
  addTemplateToCharacter,
  createCharacterAttribute,
  editCharacterTemplateAttribute,
  editCharacterAttributeValue,
  editShortDescription,
  editDescription,
  editCategory,
} = wiredUpActions.character
const addBookToCharacter = wiredUpActions.character.addBook
const addTagToCharacter = wiredUpActions.character.addTag
const removeTagFromCharacter = wiredUpActions.character.removeTag
const removeBookFromCharacter = wiredUpActions.character.removeBook

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

const ignoringChangesWeDontCareAbout = (state) => {
  return {
    ...state,
    file: {
      ...state.file,
      dirty: null,
      versionStamp: null,
    },
    project: {
      ...state.project,
      unsavedChanges: null,
    },
  }
}

const A_CHARACTER_TEMPLATE = {
  id: 'ch2',
  type: 'characters',
  name: 'Enneagram',
  description: 'Personality types',
  link: 'https://www.enneagraminstitute.com/type-descriptions',
  version: '2022.7.20',
  attributes: [
    {
      name: 'Type',
      type: 'text',
      description: 'Type of personality based on the Enneagram test',
    },
    {
      name: 'Core Desire',
      type: 'text',
    },
    {
      name: 'Core Fear',
      type: 'text',
    },
  ],
}

describe('editCharacterTemplateAttribute', () => {
  describe('given a store with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = removeSystemKeys(fullFileStateSelector(store.getState()))
      store.dispatch(
        editCharacterTemplateAttribute(
          1,
          'dummy-id',
          'dummy-attribute',
          'dummy-value',
          'characters/1/dummy-id/dummy-attribute'
        )
      )
      const resultState = removeSystemKeys(fullFileStateSelector(store.getState()))
      expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
        ignoringChangesWeDontCareAbout(resultState)
      )
    })
  })
  describe('given a store with a character', () => {
    describe('but no templates applied to that character', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = removeSystemKeys(fullFileStateSelector(store.getState()))
        store.dispatch(
          editCharacterTemplateAttribute(
            1,
            'dummy-id',
            'dummy-attribute',
            'dummy-value',
            'characters/1/dummy-id/dummy-attribute'
          )
        )
        const resultState = removeSystemKeys(fullFileStateSelector(store.getState()))
        expect(ignoringChangesWeDontCareAbout(initialState)).toEqual(
          ignoringChangesWeDontCareAbout(resultState)
        )
      })
    })
    describe('a template applied to that character', () => {
      describe('and the id of an attribute in that template', () => {
        it('should change the value of that attribute', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
          const initialState = store.getState()
          const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
          expect(initialTemplate).toEqual({
            attributes: [
              {
                description: 'Type of personality based on the Enneagram test',
                name: 'Type',
                type: 'text',
              },
              {
                name: 'Core Desire',
                type: 'text',
              },
              {
                name: 'Core Fear',
                type: 'text',
              },
            ],
            id: 'ch2',
            value: '',
            version: '2022.7.20',
          })
          store.dispatch(
            editCharacterTemplateAttribute(
              1,
              'ch2',
              'Type',
              'New value',
              'characters/1/dummy-id/dummy-attribute'
            )
          )
          const resultState = store.getState()
          const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
          expect(resultTemplate).toEqual({
            attributes: [
              {
                description: 'Type of personality based on the Enneagram test',
                name: 'Type',
                type: 'text',
              },
              {
                name: 'Core Desire',
                type: 'text',
              },
              {
                name: 'Core Fear',
                type: 'text',
              },
            ],
            id: 'ch2',
            value: '',
            version: '2022.7.20',
            values: [
              {
                bookId: 'all',
                name: 'Type',
                value: 'New value',
              },
            ],
          })
        })
      })
      describe('and an id for an attribute *not* in that template', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
          const initialState = store.getState()
          const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
          expect(initialTemplate).toEqual({
            attributes: [
              {
                description: 'Type of personality based on the Enneagram test',
                name: 'Type',
                type: 'text',
              },
              {
                name: 'Core Desire',
                type: 'text',
              },
              {
                name: 'Core Fear',
                type: 'text',
              },
            ],
            id: 'ch2',
            value: '',
            version: '2022.7.20',
          })
          store.dispatch(
            editCharacterTemplateAttribute(
              1,
              'ch2',
              'Typo', // Note the typo! ;)
              'New value',
              'characters/1/dummy-id/dummy-attribute'
            )
          )
          const resultState = store.getState()
          const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
          expect(resultTemplate).toEqual(initialTemplate)
        })
      })
      describe('the id of an attribute that *is* in the template', () => {
        describe('when the attribute is not yet modified', () => {
          it('should add that attribute', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
            const initialState = store.getState()
            const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
            expect(initialTemplate).toEqual({
              attributes: [
                {
                  description: 'Type of personality based on the Enneagram test',
                  name: 'Type',
                  type: 'text',
                },
                {
                  name: 'Core Desire',
                  type: 'text',
                },
                {
                  name: 'Core Fear',
                  type: 'text',
                },
              ],
              id: 'ch2',
              value: '',
              version: '2022.7.20',
            })
            store.dispatch(
              editCharacterTemplateAttribute(
                1,
                'ch2',
                'Type',
                'New value',
                'characters/1/dummy-id/dummy-attribute'
              )
            )
            const resultState = store.getState()
            const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
            expect(resultTemplate).toEqual({
              attributes: [
                {
                  description: 'Type of personality based on the Enneagram test',
                  name: 'Type',
                  type: 'text',
                },
                {
                  name: 'Core Desire',
                  type: 'text',
                },
                {
                  name: 'Core Fear',
                  type: 'text',
                },
              ],
              id: 'ch2',
              value: '',
              values: [
                {
                  bookId: 'all',
                  name: 'Type',
                  value: 'New value',
                },
              ],
              version: '2022.7.20',
            })
          })
        })
        describe('when the attribute is already there', () => {
          it('should modify that attribute', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
            const initialState = store.getState()
            const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
            expect(initialTemplate).toEqual({
              attributes: [
                {
                  description: 'Type of personality based on the Enneagram test',
                  name: 'Type',
                  type: 'text',
                },
                {
                  name: 'Core Desire',
                  type: 'text',
                },
                {
                  name: 'Core Fear',
                  type: 'text',
                },
              ],
              id: 'ch2',
              value: '',
              version: '2022.7.20',
            })
            store.dispatch(
              editCharacterTemplateAttribute(
                1,
                'ch2',
                'Type',
                'New value',
                'characters/1/dummy-id/dummy-attribute'
              )
            )
            store.dispatch(
              editCharacterTemplateAttribute(
                1,
                'ch2',
                'Type',
                'Next value',
                'characters/1/dummy-id/dummy-attribute'
              )
            )
            const resultState = store.getState()
            const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
            expect(resultTemplate).toEqual({
              attributes: [
                {
                  description: 'Type of personality based on the Enneagram test',
                  name: 'Type',
                  type: 'text',
                },
                {
                  name: 'Core Desire',
                  type: 'text',
                },
                {
                  name: 'Core Fear',
                  type: 'text',
                },
              ],
              id: 'ch2',
              value: '',
              values: [
                {
                  bookId: 'all',
                  name: 'Type',
                  value: 'Next value',
                },
              ],
              version: '2022.7.20',
            })
          })
        })
        describe('when the attribute is in another book', () => {
          describe('if tabs should not be shown', () => {
            it('should modify the all version of the attribute', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
              store.dispatch(addBook())
              const initialState = store.getState()
              const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
              expect(initialTemplate).toEqual({
                attributes: [
                  {
                    description: 'Type of personality based on the Enneagram test',
                    name: 'Type',
                    type: 'text',
                  },
                  {
                    name: 'Core Desire',
                    type: 'text',
                  },
                  {
                    name: 'Core Fear',
                    type: 'text',
                  },
                ],
                id: 'ch2',
                value: '',
                version: '2022.7.20',
              })
              store.dispatch(
                editCharacterTemplateAttribute(
                  1,
                  'ch2',
                  'Type',
                  'New value',
                  'characters/1/dummy-id/dummy-attribute'
                )
              )
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(
                editCharacterTemplateAttribute(
                  1,
                  'ch2',
                  'Type',
                  'Next value',
                  'characters/1/dummy-id/dummy-attribute'
                )
              )
              const resultState = store.getState()
              const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
              expect(resultTemplate).toEqual({
                attributes: [
                  {
                    description: 'Type of personality based on the Enneagram test',
                    name: 'Type',
                    type: 'text',
                  },
                  {
                    name: 'Core Desire',
                    type: 'text',
                  },
                  {
                    name: 'Core Fear',
                    type: 'text',
                  },
                ],
                id: 'ch2',
                value: '',
                values: [
                  {
                    bookId: 'all',
                    name: 'Type',
                    value: 'Next value',
                  },
                ],
                version: '2022.7.20',
              })
            })
          })
          describe('if tabs should be shown', () => {
            it('should add another template value for the current book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTemplateToCharacter(1, A_CHARACTER_TEMPLATE))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              const initialState = store.getState()
              const initialTemplate = singleCharacterSelector(initialState, 1).templates[0]
              expect(initialTemplate).toEqual({
                attributes: [
                  {
                    description: 'Type of personality based on the Enneagram test',
                    name: 'Type',
                    type: 'text',
                  },
                  {
                    name: 'Core Desire',
                    type: 'text',
                  },
                  {
                    name: 'Core Fear',
                    type: 'text',
                  },
                ],
                id: 'ch2',
                value: '',
                version: '2022.7.20',
              })
              store.dispatch(
                editCharacterTemplateAttribute(
                  1,
                  'ch2',
                  'Type',
                  'New value',
                  'characters/1/dummy-id/dummy-attribute'
                )
              )
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(
                editCharacterTemplateAttribute(
                  1,
                  'ch2',
                  'Type',
                  'Next value',
                  'characters/1/dummy-id/dummy-attribute'
                )
              )
              const resultState = store.getState()
              const resultTemplate = singleCharacterSelector(resultState, 1).templates[0]
              expect(resultTemplate).toEqual({
                attributes: [
                  {
                    description: 'Type of personality based on the Enneagram test',
                    name: 'Type',
                    type: 'text',
                  },
                  {
                    name: 'Core Desire',
                    type: 'text',
                  },
                  {
                    name: 'Core Fear',
                    type: 'text',
                  },
                ],
                id: 'ch2',
                value: '',
                values: [
                  {
                    bookId: 'all',
                    name: 'Type',
                    value: 'New value',
                  },
                  {
                    bookId: '1',
                    name: 'Type',
                    value: 'Next value',
                  },
                ],
                version: '2022.7.20',
              })
            })
          })
        })
      })
    })
  })
})

describe('addTag', () => {
  describe('given a store with no characters and no tags', () => {
    it('should add a base attribute for tags to the attributes collection', () => {
      const store = initialStore()
      store.dispatch(addTagToCharacter(1, 1))
      expect(attributesSelector(store.getState())).toEqual({
        characters: [
          {
            id: 1,
            name: 'tags',
            type: 'base-attribute',
          },
        ],
      })
    })
  })
  describe('given a store with a character', () => {
    describe('and no tags', () => {
      it('should a base attribute for tags to the attributes collection', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addTagToCharacter(1, 1))
        expect(attributesSelector(store.getState())).toEqual({
          characters: [
            {
              id: 1,
              name: 'tags',
              type: 'base-attribute',
            },
          ],
        })
      })
    })
    describe('and only one book', () => {
      describe('when book one tab is selected', () => {
        it('should apply the tag to the "all" book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          expect(singleCharacterSelector(store.getState(), 1).attributes).toBeUndefined()
          store.dispatch(selectCharacterAttributeBookTab('1'))
          store.dispatch(addTagToCharacter(1, 1))
          const resultState = store.getState()
          expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: [1],
            },
          ])
          expect(attributesSelector(resultState)).toEqual({
            characters: [
              {
                id: 1,
                name: 'tags',
                type: 'base-attribute',
              },
            ],
          })
        })
      })
      describe('when the "all" book tab is selected', () => {
        it('should apply the tag to the "all" book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          expect(singleCharacterSelector(store.getState(), 1).attributes).toBeUndefined()
          store.dispatch(selectCharacterAttributeBookTab('all'))
          store.dispatch(addTagToCharacter(1, 1))
          const resultState = store.getState()
          expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: [1],
            },
          ])
          expect(attributesSelector(resultState)).toEqual({
            characters: [
              {
                id: 1,
                name: 'tags',
                type: 'base-attribute',
              },
            ],
          })
        })
      })
    })
    describe('and two books', () => {
      describe('when no book is associated with the character', () => {
        it('should add the tag to the "all" book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          expect(singleCharacterSelector(store.getState(), 1).attributes).toBeUndefined()
          store.dispatch(selectCharacterAttributeBookTab('all'))
          store.dispatch(addTagToCharacter(1, 1))
          const resultState = store.getState()
          expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: [1],
            },
          ])
          expect(attributesSelector(resultState)).toEqual({
            characters: [
              {
                id: 1,
                name: 'tags',
                type: 'base-attribute',
              },
            ],
          })
        })
      })
      describe('when a book is associated with the character', () => {
        describe('and the  "all" tab is selected', () => {
          it('should add the tag to the "all" book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTag())
            expect(singleCharacterSelector(store.getState(), 1).attributes).toBeUndefined()
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            store.dispatch(selectCharacterAttributeBookTab('all'))
            store.dispatch(addTagToCharacter(1, 1))
            const resultState = store.getState()
            expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
              {
                bookId: 'all',
                id: 1,
                value: [1],
              },
            ])
            expect(attributesSelector(resultState)).toEqual({
              characters: [
                {
                  id: 1,
                  name: 'tags',
                  type: 'base-attribute',
                },
              ],
            })
          })
        })
        describe('and the first book is selected', () => {
          it('should add the tag to the first book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTag())
            expect(singleCharacterSelector(store.getState(), 1).attributes).toBeUndefined()
            store.dispatch(addBook())
            store.dispatch(addBookToCharacter(1, 1))
            store.dispatch(selectCharacterAttributeBookTab('1'))
            store.dispatch(addTagToCharacter(1, 1))
            const resultState = store.getState()
            expect(singleCharacterSelector(resultState, 1).attributes).toEqual([
              {
                bookId: '1',
                id: 1,
                value: [1],
              },
            ])
            expect(attributesSelector(resultState)).toEqual({
              characters: [
                {
                  id: 1,
                  name: 'tags',
                  type: 'base-attribute',
                },
              ],
            })
          })
        })
      })
    })
  })
  describe('given a state with legacy tags associated to the first character', () => {
    describe('when adding a tag', () => {
      it('should add it to the existing list of legacy tags in the new attribute', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            file_with_legacy_character_tags,
            file_with_legacy_character_tags.file.version,
            'device://tmp/dummy-url-test-file.pltr'
          )
        )
        const character1TagsBefore = displayedSingleCharacterSelector(store.getState(), 1).tags
        expect(character1TagsBefore).toEqual([1, 2, 3, 4, 5, 7, 9, 10, 8])
        store.dispatch(addTagToCharacter(1, 11))
        const character1TagsAfter = displayedSingleCharacterSelector(store.getState(), 1)
          .attributes[0].value
        expect(character1TagsAfter).toEqual([11, 1, 2, 3, 4, 5, 7, 9, 10, 8])
      })
    })
  })
})

describe('addBook', () => {
  describe('given a state with no characters', () => {
    it('leave the state un changed', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(addBookToCharacter(1, 1))
      expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
        ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
      )
    })
  })
  describe('given a state with a character', () => {
    describe('and a different character id', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(2, 1))
        expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([])
      })
    })
    describe('and that characters id', () => {
      it('should add the book to that character', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([1])
      })
      describe('and a book id that does not exist', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          const initialState = store.getState()
          store.dispatch(addBookToCharacter(1, 2))
          expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
            ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
          )
        })
      })
      describe('and the book id "series"', () => {
        it('should associate the "series" book with the character', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 'series'))
          expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual(['series'])
        })
      })
    })
  })
})

describe('removeTag', () => {
  describe('given a state with no characters', () => {
    it('should add an empty base attribute for tags', () => {
      const store = initialStore()
      store.dispatch(removeTagFromCharacter(1, 1))
      expect(allCharacterAttributesSelector(store.getState())).toEqual([
        {
          id: 1,
          name: 'tags',
          type: 'base-attribute',
        },
      ])
    })
  })
  describe('given a state with a character', () => {
    describe('and no tags', () => {
      it('should add an empty base attribute for tags', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(removeTagFromCharacter(1, 1))
        expect(allCharacterAttributesSelector(store.getState())).toEqual([
          {
            id: 1,
            name: 'tags',
            type: 'base-attribute',
          },
        ])
      })
    })
    describe('and a tag', () => {
      describe('but the tag is not associated with the character', () => {
        it('should add an empty base attribute for tags', () => {
          const store = initialStore()
          store.dispatch(addTag())
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(removeTagFromCharacter(1, 1))
          expect(allCharacterAttributesSelector(store.getState())).toEqual([
            {
              id: 1,
              name: 'tags',
              type: 'base-attribute',
            },
          ])
        })
      })
      describe('and the tag is associated with the character', () => {
        it('should remove the tag from the character', () => {
          const store = initialStore()
          store.dispatch(addTag())
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTagToCharacter(1, 1))
          store.dispatch(removeTagFromCharacter(1, 1))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
            { id: 1, value: [], bookId: 'all' },
          ])
          expect(attributesSelector(store.getState())).toEqual({
            characters: [{ id: 1, type: 'base-attribute', name: 'tags' }],
          })
        })
        describe('when the tag is associated in both book 1 and "all"', () => {
          describe('and book 1 is selected', () => {
            it('should remove the tag from book 1', () => {
              const store = initialStore()
              store.dispatch(addTag())
              store.dispatch(addBook())
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTagToCharacter(1, 1))
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(addTagToCharacter(1, 1))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                { id: 1, value: [1], bookId: 'all' },
                { id: 1, value: [1], bookId: '1' },
              ])
              store.dispatch(removeTagFromCharacter(1, 1))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                { id: 1, value: [1], bookId: 'all' },
                { id: 1, value: [], bookId: '1' },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, type: 'base-attribute', name: 'tags' }],
              })
            })
          })
          describe('and the "all" book is selected', () => {
            it('should remove the tag from the "all" book', () => {
              const store = initialStore()
              store.dispatch(addTag())
              store.dispatch(addBook())
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addTagToCharacter(1, 1))
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(addTagToCharacter(1, 1))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                { id: 1, value: [1], bookId: 'all' },
                { id: 1, value: [1], bookId: '1' },
              ])
              store.dispatch(selectCharacterAttributeBookTab('all'))
              store.dispatch(removeTagFromCharacter(1, 1))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                { id: 1, value: [], bookId: 'all' },
                { id: 1, value: [1], bookId: '1' },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, type: 'base-attribute', name: 'tags' }],
              })
            })
          })
        })
      })
    })
  })
  describe('given a state with legacy tags associated to the first character', () => {
    describe('when removing a tag', () => {
      it('should remove it from the list of legacy attributes in the new attribute', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            file_with_legacy_character_tags,
            file_with_legacy_character_tags.file.version,
            'device://tmp/dummy-url-test-file.pltr'
          )
        )
        const character1TagsBefore = displayedSingleCharacterSelector(store.getState(), 1).tags
        expect(character1TagsBefore).toEqual([1, 2, 3, 4, 5, 7, 9, 10, 8])
        store.dispatch(removeTagFromCharacter(1, 10))
        const attributesAfter = allCharacterAttributesSelector(store.getState())
        expect(attributesAfter).toEqual([
          {
            id: 1,
            type: 'base-attribute',
            name: 'tags',
          },
        ])
        const character1TagsAfter = displayedSingleCharacterSelector(store.getState(), 1)
          .attributes[0].value
        expect(character1TagsAfter).toEqual([1, 2, 3, 4, 5, 7, 9, 8])
      })
    })
  })
})

describe('removeBook', () => {
  describe('given a state with no characters', () => {
    it('leave the state un changed', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(removeBookFromCharacter(1, 1))
      expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
        ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
      )
    })
  })
  describe('given a state with a character', () => {
    describe('and no books associated with that character', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(removeBookFromCharacter(1, 1))
        expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
          ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
        )
      })
    })
    describe('and a book associated with that character', () => {
      describe('and that book id', () => {
        it('should remove it from the character', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          store.dispatch(removeBookFromCharacter(1, 1))
          expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([])
        })
      })
      describe('and a different book id', () => {
        it('should leave the state un changed', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBookToCharacter(1, 1))
          expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([1])
          store.dispatch(removeBookFromCharacter(1, 2))
          expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([1])
        })
      })
    })
    describe('and that characters id', () => {
      it('should add the book to that character', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBookToCharacter(1, 1))
        expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([1])
      })
      describe('and a book id that does not exist', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          const initialState = store.getState()
          store.dispatch(addBookToCharacter(1, 2))
          expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
            ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
          )
        })
      })
    })
  })
})

describe('createCharacterAttribute', () => {
  describe('given a state with no characters', () => {
    it('should not change the character state', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(createCharacterAttribute('text', 'strength'))
      expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
    })
  })
  describe('given a state with a character', () => {
    it('should and and default the value of the new attribute to the character', () => {
      const store = initialStore()
      store.dispatch(addCharacter('John Doe'))
      store.dispatch(createCharacterAttribute('text', 'strength'))
      expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
        {
          id: 1,
          value: undefined,
          bookId: 'all',
        },
      ])
    })
    describe('and a name for an attribute that is shared with a base attribute', () => {
      it('should not inherit that value', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(createCharacterAttribute('text', 'id'))
        expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
          {
            id: 1,
            value: undefined,
            bookId: 'all',
          },
        ])
      })
    })
  })
})

describe('editCharacterAttributeValue', () => {
  describe('given a state with no characters', () => {
    it('should leave the state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(editCharacterAttributeValue(1, 1, 'New value'))
      expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
        ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
      )
    })
  })
  describe('given a state with a character', () => {
    describe('and no attributes', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(editCharacterAttributeValue(1, 1, 'New value'))
        expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
          ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
        )
      })
    })
    describe('and a character attribute', () => {
      describe('and a different character id', () => {
        it('should leave the character state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(createCharacterAttribute('text', 'strength'))
          const initialState = store.getState()
          store.dispatch(editCharacterAttributeValue(2, 1, 'New value'))
          expect(ignoringChangesWeDontCareAbout(fullFileStateSelector(store.getState()))).toEqual(
            ignoringChangesWeDontCareAbout(fullFileStateSelector(initialState))
          )
        })
      })
    })
    describe('and that character id', () => {
      describe('and an attribute', () => {
        describe('and a different attribute id', () => {
          it('should leave the state unchanged', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(createCharacterAttribute('text', 'strength'))
            const initialState = store.getState()
            store.dispatch(editCharacterAttributeValue(1, 2, 'New value'))
            expect(allCharactersSelector(store.getState())).toEqual(
              allCharactersSelector(initialState)
            )
          })
        })
        describe('and that attribute id', () => {
          it('should edit that attribute value', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(createCharacterAttribute('text', 'strength'))
            store.dispatch(editCharacterAttributeValue(1, 1, 'New value'))
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
              {
                id: 1,
                value: 'New value',
                bookId: 'all',
              },
            ])
          })
        })
      })
    })
  })
  describe('given a file with many legacy attributes', () => {
    describe('when editing a legacy attribute value', () => {
      it('should maintain its original value and ordering', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device:///tmp.dummy.pltr')
        )
        const attributesBefore = characterAttributesSelector(store.getState(), 1)
        expect(attributesBefore).toEqual([
          {
            name: 'Role',
            type: 'text',
            value: 'Protagonist',
          },
          {
            name: 'Motivation',
            type: 'paragraph',
            value: [
              {
                children: [
                  {
                    text: "Hamlet seeks to get revenge for his father's death",
                  },
                ],
              },
            ],
          },
          {
            name: 'Gender',
            type: 'text',
            value: 'Male',
          },
          {
            name: 'Fatal Flaws',
            type: 'text',
            value: 'Too melancholy, acts before thinking it through',
          },
          {
            name: 'Inner Conflict',
            type: 'text',
            value: "Wants to take his own life AND get revenge for his father's murder",
          },
          {
            name: 'How They Die',
            type: 'text',
            value: 'Cut with a poisoned sword in a duel with Laertes',
          },
          {
            name: 'Attended Wittenberg',
            type: 'text',
            value: 'Yes',
          },
          {
            name: 'Royal Family Member',
            type: 'text',
            value: 'Yes',
          },
          {
            name: 'Characters That Die',
            type: 'text',
            value: 'Yes',
          },
        ])
        editCharacterAttributeValue(1, 'Attended Wittenberg', 'No')(store.dispatch, store.getState)
        const attributesAfter = characterAttributesSelector(store.getState(), 1)
        expect(attributesAfter).toEqual([
          {
            name: 'Role',
            type: 'text',
            value: 'Protagonist',
          },
          {
            name: 'Motivation',
            type: 'paragraph',
            value: [
              {
                children: [
                  {
                    text: "Hamlet seeks to get revenge for his father's death",
                  },
                ],
              },
            ],
          },
          {
            name: 'Gender',
            type: 'text',
            value: 'Male',
          },
          {
            name: 'Fatal Flaws',
            type: 'text',
            value: 'Too melancholy, acts before thinking it through',
          },
          {
            name: 'Inner Conflict',
            type: 'text',
            value: "Wants to take his own life AND get revenge for his father's murder",
          },
          {
            name: 'How They Die',
            type: 'text',
            value: 'Cut with a poisoned sword in a duel with Laertes',
          },
          {
            bookId: 'all',
            id: 1,
            name: 'Attended Wittenberg',
            type: 'text',
            value: 'No',
          },
          {
            name: 'Royal Family Member',
            type: 'text',
            value: 'Yes',
          },
          {
            name: 'Characters That Die',
            type: 'text',
            value: 'Yes',
          },
        ])
      })
    })
  })
})

describe('editShortDescription', () => {
  describe('given a store with no characters', () => {
    it('should add an attribute but leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(editShortDescription(1, 'New value'))
      expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
      expect(attributesSelector(store.getState())).toEqual({
        characters: [{ id: 1, name: 'shortDescription', type: 'base-attribute' }],
      })
    })
  })
  describe('given a store with a character', () => {
    describe('and a different character id', () => {
      it('should leave the character state unchanged and create an attribute for the description', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(editShortDescription(2, 'New value'))
        expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
        expect(attributesSelector(store.getState())).toEqual({
          characters: [{ id: 1, name: 'shortDescription', type: 'base-attribute' }],
        })
      })
    })
    describe('and that character id', () => {
      it('should edit the character short description for the all book', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(editShortDescription(1, 'New value'))
        expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            value: 'New value',
          },
        ])
        expect(attributesSelector(store.getState())).toEqual({
          characters: [{ id: 1, name: 'shortDescription', type: 'base-attribute' }],
        })
      })
      describe('and more than one book', () => {
        describe('when no book is associated with a character', () => {
          it('should edit the short description for the "all" book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(editShortDescription(1, 'New value'))
            store.dispatch(addBook())
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
              {
                bookId: 'all',
                id: 1,
                value: 'New value',
              },
            ])
            expect(attributesSelector(store.getState())).toEqual({
              characters: [{ id: 1, name: 'shortDescription', type: 'base-attribute' }],
            })
          })
        })
        describe('when a book is associated with a character', () => {
          describe('and the all book is selected', () => {
            it('should edit the short description for the all book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('all'))
              store.dispatch(editShortDescription(1, 'New value'))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: 'all',
                  id: 1,
                  value: 'New value',
                },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, name: 'shortDescription', type: 'base-attribute' }],
              })
            })
          })
          describe('and the first book is selected', () => {
            it('should edit the short description for the first book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(editShortDescription(1, 'New value'))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: '1',
                  id: 1,
                  value: 'New value',
                },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, name: 'shortDescription', type: 'base-attribute' }],
              })
            })
          })
        })
      })
    })
  })
})

describe('editDescription', () => {
  describe('given a store with no characters', () => {
    it('should add an attribute but leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(editDescription(1, 'New value'))
      expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
      expect(attributesSelector(store.getState())).toEqual({
        characters: [{ id: 1, name: 'description', type: 'base-attribute' }],
      })
    })
  })
  describe('given a store with a character', () => {
    describe('and a different character id', () => {
      it('should leave the character state unchanged and create an attribute for the description', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(editDescription(2, 'New value'))
        expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
        expect(attributesSelector(store.getState())).toEqual({
          characters: [{ id: 1, name: 'description', type: 'base-attribute' }],
        })
      })
    })
    describe('and that character id', () => {
      it('should edit the character short description for the all book', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(editDescription(1, 'New value'))
        expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            value: 'New value',
          },
        ])
        expect(attributesSelector(store.getState())).toEqual({
          characters: [{ id: 1, name: 'description', type: 'base-attribute' }],
        })
      })
      describe('and more than one book', () => {
        describe('when no book is associated with a character', () => {
          it('should edit the short description for the "all" book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(editDescription(1, 'New value'))
            store.dispatch(addBook())
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
              {
                bookId: 'all',
                id: 1,
                value: 'New value',
              },
            ])
            expect(attributesSelector(store.getState())).toEqual({
              characters: [{ id: 1, name: 'description', type: 'base-attribute' }],
            })
          })
        })
        describe('when a book is associated with a character', () => {
          describe('and the all book is selected', () => {
            it('should edit the short description for the all book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('all'))
              store.dispatch(editDescription(1, 'New value'))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: 'all',
                  id: 1,
                  value: 'New value',
                },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, name: 'description', type: 'base-attribute' }],
              })
            })
          })
          describe('and the first book is selected', () => {
            it('should edit the short description for the first book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(editDescription(1, 'New value'))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: '1',
                  id: 1,
                  value: 'New value',
                },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, name: 'description', type: 'base-attribute' }],
              })
            })
          })
        })
      })
    })
  })
})

describe('editCategory', () => {
  describe('given a store with no characters', () => {
    it('should add an attribute but leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(editCategory(1, 'New value'))
      expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
      expect(attributesSelector(store.getState())).toEqual({
        characters: [{ id: 1, name: 'category', type: 'base-attribute' }],
      })
    })
  })
  describe('given a store with a character', () => {
    describe('and a different character id', () => {
      it('should leave the character state unchanged and create an attribute for the description', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(editCategory(2, 'New value'))
        expect(allCharactersSelector(store.getState())).toEqual(allCharactersSelector(initialState))
        expect(attributesSelector(store.getState())).toEqual({
          characters: [{ id: 1, name: 'category', type: 'base-attribute' }],
        })
      })
    })
    describe('and that character id', () => {
      it('should edit the character short description for the all book', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(editCategory(1, 'New value'))
        expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
          {
            bookId: 'all',
            id: 1,
            value: 'New value',
          },
        ])
        expect(attributesSelector(store.getState())).toEqual({
          characters: [{ id: 1, name: 'category', type: 'base-attribute' }],
        })
      })
      describe('and more than one book', () => {
        describe('when no book is associated with a character', () => {
          it('should edit the short description for the "all" book', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(editCategory(1, 'New value'))
            store.dispatch(addBook())
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
              {
                bookId: 'all',
                id: 1,
                value: 'New value',
              },
            ])
            expect(attributesSelector(store.getState())).toEqual({
              characters: [{ id: 1, name: 'category', type: 'base-attribute' }],
            })
          })
        })
        describe('when a book is associated with a character', () => {
          describe('and the all book is selected', () => {
            it('should edit the short description for the all book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('all'))
              store.dispatch(editCategory(1, 'New value'))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: 'all',
                  id: 1,
                  value: 'New value',
                },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, name: 'category', type: 'base-attribute' }],
              })
            })
          })
          describe('and the first book is selected', () => {
            it('should edit the short description for the first book', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(addBook())
              store.dispatch(addBookToCharacter(1, 1))
              store.dispatch(selectCharacterAttributeBookTab('1'))
              store.dispatch(editCategory(1, 'New value'))
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: '1',
                  id: 1,
                  value: 'New value',
                },
              ])
              expect(attributesSelector(store.getState())).toEqual({
                characters: [{ id: 1, name: 'category', type: 'base-attribute' }],
              })
            })
          })
        })
      })
    })
  })
})

describe('deleteBook', () => {
  describe('given a state with a character', () => {
    describe('that is not associated with any books', () => {
      it('should leave the character state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addBook())
        const initialState = store.getState()
        store.dispatch(deleteBook(1))
        expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
      })
    })
    describe('that is associated with a book', () => {
      describe('and that book id', () => {
        it('should remove the association with the deleted book', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBook())
          store.dispatch(addBookToCharacter(1, 1))
          store.dispatch(deleteBook(1))
          expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([])
        })
      })
      describe('and a different book id', () => {
        it('should leave the state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBookToCharacter(1, 1))
          store.dispatch(deleteBook(2))
          expect(singleCharacterSelector(store.getState(), 1).bookIds).toEqual([1])
        })
      })
    })
  })
})

describe('deleteCharacterCategory', () => {
  describe('given a state with no characters', () => {
    it('should leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(deleteCharacterCategory(1))
      expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
    })
  })
  describe('given a state with a character', () => {
    describe('but that character has no category', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(deleteCharacterCategory(1))
        expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
      })
    })
    describe('and the character has a category', () => {
      describe('and that category id', () => {
        it('should remove the association between the character and category', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(editCategory(1, 1))
          store.dispatch(deleteCharacterCategory(1))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: null,
            },
          ])
        })
        describe('and we are in a different book tab', () => {
          it('should still remove the association', () => {
            const store = initialStore()
            store.dispatch(addBook())
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(editCategory(1, 1))
            store.dispatch(addBookToCharacter(1, 1))
            store.dispatch(selectCharacterAttributeBookTab('2'))
            store.dispatch(deleteCharacterCategory(1))
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
              {
                bookId: 'all',
                id: 1,
                value: null,
              },
            ])
          })
        })
      })
      describe('and a different category id', () => {
        it('should leave the character unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(editCategory(1, 1))
          store.dispatch(deleteCharacterCategory(2))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: 1,
            },
          ])
        })
      })
    })
  })
})

describe('deleteTag', () => {
  describe('given a state with no characters', () => {
    it('should leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(deleteTag(1))
      expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
    })
  })
  describe('given a state with a character', () => {
    describe('but that character has no tags', () => {
      it('should leave the state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(deleteTag(1))
        expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
      })
    })
    describe('and the character has a tag', () => {
      describe('and that tag id', () => {
        it('should remove the association between the character and tag', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          store.dispatch(addTagToCharacter(1, 1))
          store.dispatch(deleteTag(1))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: [],
            },
          ])
        })
        describe('and we are in a different book tab', () => {
          it('should still remove the association', () => {
            const store = initialStore()
            store.dispatch(addBook())
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addTag())
            store.dispatch(addTagToCharacter(1, 1))
            store.dispatch(addBookToCharacter(1, 1))
            store.dispatch(selectCharacterAttributeBookTab('2'))
            store.dispatch(deleteTag(1))
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
              {
                bookId: 'all',
                id: 1,
                value: [],
              },
            ])
          })
        })
      })
      describe('and a different tag id', () => {
        it('should leave the character unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addTag())
          store.dispatch(addTag())
          store.dispatch(addTagToCharacter(1, 1))
          store.dispatch(deleteTag(2))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: [1],
            },
          ])
        })
      })
    })
  })
})

describe('deleteCharacterAttribute', () => {
  describe('given a state with no characters', () => {
    it('should leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(deleteCharacterAttribute(1))
      expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
    })
  })
  describe('given a state with a character', () => {
    describe('but no custom attributes', () => {
      it('should leave the character state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(deleteCharacterAttribute(1))
        expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(store.getState()))
      })
    })
    describe('and a custom attribute', () => {
      describe('and that custom attribute id', () => {
        it('should remove the attribute for that custom attribute entirely', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(createCharacterAttribute('text', 'strength'))
          store.dispatch(deleteCharacterAttribute(1))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([])
        })
        describe('and a different book is selected', () => {
          it('should still remove the attribute for that custom attribute entirely', () => {
            const store = initialStore()
            store.dispatch(addCharacter('John Doe'))
            store.dispatch(addBook())
            store.dispatch(createCharacterAttribute('text', 'strength'))
            store.dispatch(selectCharacterAttributeBookTab('2'))
            store.dispatch(deleteCharacterAttribute(1))
            expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([])
          })
        })
      })
      describe('and a different custom attribute id', () => {
        it('should leave the character state unchanged', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(createCharacterAttribute('text', 'strength'))
          store.dispatch(deleteCharacterAttribute(2))
          expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
            {
              bookId: 'all',
              id: 1,
              value: undefined,
            },
          ])
        })
      })
    })
  })
})

describe('addCharacter (to card)', () => {
  describe('given a state with no characters', () => {
    it('should leave the character state unchanged', () => {
      const store = initialStore()
      const initialState = store.getState()
      store.dispatch(addCharacterToCard(1, 2))
      const resultState = store.getState()
      expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(resultState))
    })
  })
  describe('given a state with a character', () => {
    describe('and a different character id', () => {
      it('should leave the character state unchanged', () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        const initialState = store.getState()
        store.dispatch(addCharacterToCard(1, 2))
        const resultState = store.getState()
        expect(allCharactersSelector(initialState)).toEqual(allCharactersSelector(resultState))
      })
    })
    describe('and that character id', () => {
      it("should add the book id to that characters book's", () => {
        const store = initialStore()
        store.dispatch(addCharacter('John Doe'))
        store.dispatch(addCharacterToCard(1, 1))
        const resultState = store.getState()
        expect(singleCharacterSelector(resultState, 1).bookIds).toEqual([1])
      })
      describe('and the character already has that book', () => {
        it('should not add the book id to the character a second time', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addCharacterToCard(1, 1))
          store.dispatch(addCharacterToCard(1, 1))
          const resultState = store.getState()
          expect(singleCharacterSelector(resultState, 1).bookIds).toEqual([1])
        })
      })
    })
  })
})

describe('editAttributeMetadata', () => {
  describe('given a file with one legacy attribute', () => {
    describe('when editing a legacy attribute name', () => {
      it('should maintain its original value', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Goldilocks',
            false,
            goldilocks,
            goldilocks.file.version,
            'device:///tmp.dummy.pltr'
          )
        )
        const otherCharacterBefore = singleCharacterSelector(store.getState(), 2)
        expect(otherCharacterBefore.Species).toEqual('Bear')
        store.dispatch(editCharacterAttributeMetadata(null, 'NewName', 'text', 'Species'))
        const legacyAttributes = characterCustomAttributesSelector(store.getState())
        expect(legacyAttributes).toEqual([
          {
            type: 'text',
            name: 'NewName',
          },
        ])
        const otherCharacterAfter = singleCharacterSelector(store.getState(), 2)
        expect(otherCharacterAfter.Species).toBeUndefined()
        expect(otherCharacterAfter.NewName).toEqual('Bear')
      })
    })
  })
  describe('given a state with a character', () => {
    describe('and a custom attribute', () => {
      describe('when that attribute becomes a paragraph', () => {
        describe('and is then modified', () => {
          describe('and then changed back to text', () => {
            it('should change the value to a text value rather than leave it as a slate object', () => {
              const store = initialStore()
              store.dispatch(addCharacter('John Doe'))
              store.dispatch(createCharacterAttribute('text', 'strength'))
              store.dispatch(editCharacterAttributeMetadata(1, 'strength', 'paragraph', 'strength'))
              store.dispatch(
                editCharacterAttributeValue(1, 1, [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The castle',
                      },
                    ],
                  },
                ])
              )
              expect(singleCharacterSelector(store.getState(), 1).attributes).toEqual([
                {
                  bookId: 'all',
                  id: 1,
                  value: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          text: 'The castle',
                        },
                      ],
                    },
                  ],
                },
              ])
              store.dispatch(
                editCharacterAttributeValue(1, 1, [
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ])
              )
              store.dispatch(editCharacterAttributeMetadata(1, 'strength', 'text', 'strength'))
              const johnDoe = singleCharacterSelector(store.getState(), 1)
              expect(johnDoe.attributes).toEqual([
                {
                  bookId: 'all',
                  id: 1,
                  value: '',
                },
              ])
            })
          })
        })
      })
    })
  })
})
