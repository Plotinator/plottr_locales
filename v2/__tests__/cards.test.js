import { storeWithZelda, pltrAdaptor } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  card: {
    editCardAttributes,
    editCardCustomAttribute,
    editCardDescription,
    editCardTitle,
    editCardTemplateAttribute,
  },
} = actions(pltrAdaptor)
const { singleCardSelector, timelineFociSelector, templateAttributeValueSelector } =
  selectors(pltrAdaptor)

describe('editCardAttributes', () => {
  describe('given an initial file', () => {
    describe('a card id of 35', () => {
      describe('and the attribute name "title"', () => {
        const store = storeWithZelda()
        const originalTitle = singleCardSelector(
          store.getState(),
          // @ts-ignore
          35
        ).title
        const originalTimelineFoci = timelineFociSelector(store.getState())
        const newValue = {
          value: 'A brand new title',
          selection: {
            direction: 'none',
            end: 0,
            start: 5,
          },
        }
        store.dispatch(editCardAttributes(35, { title: newValue }))
        it('should modify the title of the card', () => {
          const newTitle = singleCardSelector(
            store.getState(),
            // @ts-ignore
            35
          ).title
          expect(newTitle).not.toEqual(originalTitle)
          expect(newTitle).toEqual('A brand new title')
        })
        it('should update the foci of the timeline', () => {
          const newFoci = timelineFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalTimelineFoci)
          expect(newFoci).toEqual([
            {
              path: ['card', 35, 'title'],
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
            {
              path: ['card', 19, 'template', 'sc4', 'Conflict'],
              selection: {
                start: 17,
                end: 17,
                direction: 'none',
              },
            },
            {
              path: ['card', 19, 'template', 'sc4', 'Motivation'],
              selection: {
                start: 13,
                end: 13,
                direction: 'none',
              },
            },
            {
              path: ['card', 19, 'template', 'sc4', 'Goal'],
              selection: {
                start: 7,
                end: 7,
                direction: 'none',
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
              path: ['card', 19, 'att 3'],
              selection: {
                direction: 'forward',
                end: 94,
                start: 91,
              },
            },
            {
              path: ['card', 19, 'attr 1'],
              selection: {
                direction: 'forward',
                end: 35,
                start: 32,
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
          ])
        })
      })
    })
  })
})

describe('editCardCustomAttribute', () => {
  describe('given an initial file', () => {
    describe('and a card id of 19', () => {
      describe('and a custom attribute name of "attr 1"', () => {
        const store = storeWithZelda()
        const attributeName = 'attr 1'
        const originalValue = singleCardSelector(
          store.getState(),
          // @ts-ignore
          35
        )[attributeName]
        const originalTimelineFoci = timelineFociSelector(store.getState())
        store.dispatch(
          editCardCustomAttribute(19, attributeName, 'A new value with stuff', {
            direction: 'none',
            end: 0,
            start: 5,
          })
        )
        it('should edit the attribute value', () => {
          const newValue = singleCardSelector(
            store.getState(),
            // @ts-ignore
            19
          )[attributeName]
          expect(newValue).not.toEqual(originalValue)
          expect(newValue).toEqual('A new value with stuff')
        })
        it('should update the timeline foci', () => {
          const newFoci = timelineFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalTimelineFoci)
          expect(newFoci).toEqual([
            {
              path: ['card', 19, attributeName],
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
            {
              path: ['card', 19, 'template', 'sc4', 'Conflict'],
              selection: {
                start: 17,
                end: 17,
                direction: 'none',
              },
            },
            {
              path: ['card', 19, 'template', 'sc4', 'Motivation'],
              selection: {
                start: 13,
                end: 13,
                direction: 'none',
              },
            },
            {
              path: ['card', 19, 'template', 'sc4', 'Goal'],
              selection: {
                start: 7,
                end: 7,
                direction: 'none',
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
              path: ['card', 19, 'att 3'],
              selection: {
                direction: 'forward',
                end: 94,
                start: 91,
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
          ])
        })
      })
    })
  })
})

describe('editCardDescription', () => {
  describe('given an initial file', () => {
    describe('and a card id of 35', () => {
      const store = storeWithZelda()
      const originalDescription = singleCardSelector(
        store.getState(),
        // @ts-ignore
        35
      ).description
      const originalTimelineFoci = timelineFociSelector(store.getState())
      const newValue = 'A brand new description'
      store.dispatch(
        editCardDescription(35, newValue, {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should edit the custom attribute', () => {
        const newDescription = singleCardSelector(
          store.getState(),
          // @ts-ignore
          35
        ).description
        expect(newDescription).not.toEqual(originalDescription)
        expect(newDescription).toEqual('A brand new description')
      })
      it('should update the timeline foci', () => {
        const newFoci = timelineFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalTimelineFoci)
        expect(newFoci).toEqual([
          {
            path: ['card', 35, 'description'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['card', 19, 'template', 'sc4', 'Conflict'],
            selection: {
              start: 17,
              end: 17,
              direction: 'none',
            },
          },
          {
            path: ['card', 19, 'template', 'sc4', 'Motivation'],
            selection: {
              start: 13,
              end: 13,
              direction: 'none',
            },
          },
          {
            path: ['card', 19, 'template', 'sc4', 'Goal'],
            selection: {
              start: 7,
              end: 7,
              direction: 'none',
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
            path: ['card', 19, 'att 3'],
            selection: {
              direction: 'forward',
              end: 94,
              start: 91,
            },
          },
          {
            path: ['card', 19, 'attr 1'],
            selection: {
              direction: 'forward',
              end: 35,
              start: 32,
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
        ])
      })
    })
  })
})

describe('editCardTitle', () => {
  describe('given an initial file', () => {
    describe('and a card id of 35', () => {
      const store = storeWithZelda()
      const originalTitle = singleCardSelector(
        store.getState(),
        // @ts-ignore
        35
      ).title
      const originalTimelineFoci = timelineFociSelector(store.getState())
      const newValue = 'A brand new title'
      store.dispatch(
        editCardTitle(35, newValue, {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should edit the custom attribute', () => {
        const newTitle = singleCardSelector(
          store.getState(),
          // @ts-ignore
          35
        ).title
        expect(newTitle).not.toEqual(originalTitle)
        expect(newTitle).toEqual('A brand new title')
      })
      it('should update the timeline foci', () => {
        const newFoci = timelineFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalTimelineFoci)
        expect(newFoci).toEqual([
          {
            path: ['card', 35, 'title'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['card', 19, 'template', 'sc4', 'Conflict'],
            selection: {
              start: 17,
              end: 17,
              direction: 'none',
            },
          },
          {
            path: ['card', 19, 'template', 'sc4', 'Motivation'],
            selection: {
              start: 13,
              end: 13,
              direction: 'none',
            },
          },
          {
            path: ['card', 19, 'template', 'sc4', 'Goal'],
            selection: {
              start: 7,
              end: 7,
              direction: 'none',
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
            path: ['card', 19, 'att 3'],
            selection: {
              direction: 'forward',
              end: 94,
              start: 91,
            },
          },
          {
            path: ['card', 19, 'attr 1'],
            selection: {
              direction: 'forward',
              end: 35,
              start: 32,
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
        ])
      })
    })
  })
})

describe('editCardTemplateAttribute', () => {
  describe('given an initial file', () => {
    describe('and a card id of 19', () => {
      describe('and a template id of sc4', () => {
        describe('and an attribute name of "Goal"', () => {
          const store = storeWithZelda()
          const selector = templateAttributeValueSelector(19, 'sc4', 'Goal')
          const originalValue = selector(store.getState())
          const originalTimelineFoci = timelineFociSelector(store.getState())
          const newValue = 'A brand new value'
          store.dispatch(
            editCardTemplateAttribute(19, 'sc4', 'Goal', newValue, {
              direction: 'none',
              end: 0,
              start: 5,
            })
          )
          it('should edit the attribute value', () => {
            const newValue = selector(
              store.getState(),
              // @ts-ignore
              19,
              'sc4',
              'Goal'
            )
            expect(newValue).not.toEqual(originalValue)
            expect(newValue).toEqual('A brand new value')
          })
          it('should update the timeline foci', () => {
            const newFoci = timelineFociSelector(store.getState())
            expect(newFoci).not.toEqual(originalTimelineFoci)
            expect(newFoci).toEqual([
              {
                path: ['card', 19, 'template', 'sc4', 'Goal'],
                selection: {
                  direction: 'none',
                  end: 0,
                  start: 5,
                },
              },
              {
                path: ['card', 19, 'template', 'sc4', 'Conflict'],
                selection: {
                  start: 17,
                  end: 17,
                  direction: 'none',
                },
              },
              {
                path: ['card', 19, 'template', 'sc4', 'Motivation'],
                selection: {
                  start: 13,
                  end: 13,
                  direction: 'none',
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
                path: ['card', 19, 'att 3'],
                selection: {
                  direction: 'forward',
                  end: 94,
                  start: 91,
                },
              },
              {
                path: ['card', 19, 'attr 1'],
                selection: {
                  direction: 'forward',
                  end: 35,
                  start: 32,
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
            ])
          })
        })
      })
    })
  })
})
