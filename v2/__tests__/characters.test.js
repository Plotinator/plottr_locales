import { storeWithZelda, pltrAdaptor } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  character: {
    editCharacterName,
    editCharacterTemplateAttribute,
    editCharacterAttributeValue,
    editShortDescription,
    editDescription,
  },
} = actions(pltrAdaptor)
const {
  singleCharacterSelector,
  characterFociSelector,
  characterTemplateAttributeValueSelector,
  characterAttributeValuesForCurrentBookSelector,
  displayedSingleCharacterSelector,
} = selectors(pltrAdaptor)

describe('editCharacterName', () => {
  describe('given an initial file', () => {
    describe('and a character id of 1', () => {
      const store = storeWithZelda()
      const originalName = singleCharacterSelector(
        store.getState(),
        // @ts-ignore
        1
      ).name
      const originalCharacterFoci = characterFociSelector(store.getState())
      store.dispatch(
        editCharacterName(1, 'Zelborg', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should update the character name', () => {
        const newName = singleCharacterSelector(
          store.getState(),
          // @ts-ignore
          1
        ).name
        expect(newName).not.toEqual(originalName)
        expect(newName).toEqual('Zelborg')
      })
      it('should update the character foci', () => {
        const newFoci = characterFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalCharacterFoci)
        expect(newFoci).toEqual([
          {
            path: ['character', 1, 'name'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
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
        ])
      })
    })
  })
})

describe('editCharacterTemplateAttribute', () => {
  describe('given an initial file', () => {
    describe('and a character id of 3', () => {
      describe('and a template id of ch3', () => {
        describe('and the tameplate name "Birth Order"', () => {
          const store = storeWithZelda()
          const originalValue = characterTemplateAttributeValueSelector(
            store.getState(),
            // @ts-ignore
            3,
            'ch3',
            'Birth Order'
          )
          const originalFoci = characterFociSelector(store.getState())
          store.dispatch(
            editCharacterTemplateAttribute(3, 'ch3', 'Birth Order', 'Ultimate!', {
              direction: 'forward',
              end: 7,
              start: 4,
            })
          )
          it('should edit the value of "Birth Order"', () => {
            const newValue = characterTemplateAttributeValueSelector(
              store.getState(),

              // @ts-ignore
              3,
              'ch3',
              'Birth Order'
            )
            expect(newValue).not.toEqual(originalValue)
            expect(newValue).toEqual('Ultimate!')
          })
          it('should update the character foci', () => {
            const newFoci = characterFociSelector(store.getState())
            expect(newFoci).not.toEqual(originalFoci)
            expect(newFoci).toEqual([
              {
                path: ['character', 3, 'template', 'ch3', 'Birth Order', 5],
                selection: {
                  direction: 'forward',
                  end: 7,
                  start: 4,
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
            ])
          })
        })
      })
    })
  })
})

describe('editCharacterAttributeValue', () => {
  describe('given an initial file', () => {
    describe('and a character id of 3', () => {
      describe('and an attribute id of 2', () => {
        const store = storeWithZelda()
        const originalValue = characterAttributeValuesForCurrentBookSelector(
          store.getState(),
          // @ts-ignore
          3
        )['2'][0]
        const originalFoci = characterFociSelector(store.getState())
        store.dispatch(
          editCharacterAttributeValue(3, 2, 'Woah there, horsey!', {
            direction: 'forward',
            end: 7,
            start: 4,
          })
        )
        it('should edit the value of the custom attribute', () => {
          const newValue = characterAttributeValuesForCurrentBookSelector(
            store.getState(),
            // @ts-ignore
            3
          )['2'][0]
          expect(newValue).not.toEqual(originalValue)
          expect(newValue).toEqual('Woah there, horsey!')
        })
        it('should update the foci for characters', () => {
          const newFoci = characterFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalFoci)
          expect(newFoci).toEqual([
            {
              path: ['character', 3, 2, 5],
              selection: {
                direction: 'forward',
                end: 7,
                start: 4,
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
          ])
        })
      })
    })
  })
})

describe('editShortDescription', () => {
  describe('given an initial file', () => {
    describe('and a character id of 3', () => {
      const store = storeWithZelda()
      const originalValue = displayedSingleCharacterSelector(
        store.getState(),
        // @ts-ignore
        3
      ).description
      const originalFoci = characterFociSelector(store.getState())
      store.dispatch(
        editShortDescription(3, 'Dude, where is my turbuencabulator', {
          direction: 'forward',
          end: 7,
          start: 4,
        })
      )
      it('should edit the character description', () => {
        const newValue = displayedSingleCharacterSelector(
          store.getState(),
          // @ts-ignore
          3
        ).description
        expect(newValue).not.toEqual(originalValue)
        expect(newValue).toEqual('Dude, where is my turbuencabulator')
      })
      it('should push the attribute to the top of the foci', () => {
        const newFoci = characterFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['character', 3, 'short-description', 5, 5],
            selection: {
              direction: 'forward',
              end: 7,
              start: 4,
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
        ])
      })
    })
  })
})

describe('editDescription', () => {
  describe('given an initial file', () => {
    describe('and a character id of 3', () => {
      const store = storeWithZelda()
      const originalValue = displayedSingleCharacterSelector(
        store.getState(),
        // @ts-ignore
        3
      ).notes
      const originalFoci = characterFociSelector(store.getState())
      const valueToChangeTo = [{ type: 'paragraph', children: [{ text: 'yippeee!' }] }]
      store.dispatch(
        editDescription(3, valueToChangeTo, {
          direction: 'forward',
          end: 7,
          start: 4,
        })
      )
      it('should modify the description', () => {
        const newValue = displayedSingleCharacterSelector(
          store.getState(),
          // @ts-ignore
          3
        ).notes
        expect(newValue).not.toEqual(originalValue)
        expect(newValue).toEqual(valueToChangeTo)
      })
      it('should bump the description field to the top of the foci', () => {
        const newFoci = characterFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['character', 3, 'description', 1, 5],
            selection: {
              direction: 'forward',
              end: 7,
              start: 4,
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
        ])
      })
    })
  })
})
