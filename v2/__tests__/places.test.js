import { storeWithZelda, pltrAdaptor } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  place: {
    editPlace,
    editPlaceName,
    editPlaceDescription,
    editPlaceNotes,
    editPlaceCustomAttribute,
  },
} = actions(pltrAdaptor)
const { singlePlaceSelector, placeFociSelector } = selectors(pltrAdaptor)

describe('editPlace', () => {
  describe('given an initial file', () => {
    describe('and a place id of 1', () => {
      describe('and an attribute named "name"', () => {
        const store = storeWithZelda()
        const originalName = singlePlaceSelector(
          store.getState(),
          // @ts-ignore
          1
        ).name
        const originalFoci = placeFociSelector(store.getState())
        store.dispatch(
          editPlace(1, {
            name: {
              value: 'This is no longer the castle you are looking for.',
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
          })
        )
        it('should edit the attributen', () => {
          const newName = singlePlaceSelector(
            store.getState(),
            // @ts-ignore
            1
          ).name
          expect(newName).not.toEqual(originalName)
          expect(newName).toEqual('This is no longer the castle you are looking for.')
        })
        it('should bump the place to the top of the foci', () => {
          const newFoci = placeFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalFoci)
          expect(newFoci).toEqual([
            {
              path: ['place', 1, 'name'],
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
            {
              path: ['place', 2, 'three'],
              selection: {
                direction: 'none',
                end: 1,
                start: 1,
              },
            },
            {
              path: ['place', 2, 'two'],
              selection: {
                direction: 'none',
                end: 15,
                start: 15,
              },
            },
            {
              path: ['place', 2, 'one'],
              selection: {
                direction: 'none',
                end: 15,
                start: 15,
              },
            },
            {
              path: ['place', 2, 'description'],
              selection: {
                direction: 'forward',
                end: 23,
                start: 20,
              },
            },
            {
              path: ['place', 2, 'name'],
              selection: {
                direction: 'forward',
                end: 7,
                start: 4,
              },
            },
            {
              path: ['place', 1, 'notes'],
              selection: {
                direction: 'forward',
                end: 3,
                start: 0,
              },
            },
          ])
        })
      })
    })
  })
})

describe('editPlaceName', () => {
  describe('given an initial file', () => {
    describe('and a place id of 1', () => {
      const store = storeWithZelda()
      const originalName = singlePlaceSelector(
        store.getState(),
        // @ts-ignore
        1
      ).name
      const originalFoci = placeFociSelector(store.getState())
      store.dispatch(
        editPlaceName(1, 'Haha!  You thought you had the right castle?', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('sholud edit the name of the place', () => {
        const newName = singlePlaceSelector(
          store.getState(),
          // @ts-ignore
          1
        ).name
        expect(newName).not.toEqual(originalName)
        expect(newName).toEqual('Haha!  You thought you had the right castle?')
      })
      it('should bump the place to the top of the foci', () => {
        const newFoci = placeFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['place', 1, 'name'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['place', 2, 'three'],
            selection: {
              direction: 'none',
              end: 1,
              start: 1,
            },
          },
          {
            path: ['place', 2, 'two'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['place', 2, 'one'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['place', 2, 'description'],
            selection: {
              direction: 'forward',
              end: 23,
              start: 20,
            },
          },
          {
            path: ['place', 2, 'name'],
            selection: {
              direction: 'forward',
              end: 7,
              start: 4,
            },
          },
          {
            path: ['place', 1, 'notes'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
        ])
      })
    })
  })
})

describe('editPlaceDescription', () => {
  describe('given an initial file', () => {
    describe('and a place id of 1', () => {
      const store = storeWithZelda()
      const originalDescription = singlePlaceSelector(
        store.getState(),
        // @ts-ignore
        1
      ).description
      const originalFoci = placeFociSelector(store.getState())
      store.dispatch(
        editPlaceDescription(1, 'This place was never described', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should edit the place description', () => {
        const newDescription = singlePlaceSelector(
          store.getState(),
          // @ts-ignore
          1
        ).description
        expect(newDescription).not.toEqual(originalDescription)
        expect(newDescription).toEqual('This place was never described')
      })
      it('should bump the place to the top of the foci', () => {
        const newFoci = placeFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['place', 1, 'description'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['place', 2, 'three'],
            selection: {
              direction: 'none',
              end: 1,
              start: 1,
            },
          },
          {
            path: ['place', 2, 'two'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['place', 2, 'one'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['place', 2, 'description'],
            selection: {
              direction: 'forward',
              end: 23,
              start: 20,
            },
          },
          {
            path: ['place', 2, 'name'],
            selection: {
              direction: 'forward',
              end: 7,
              start: 4,
            },
          },
          {
            path: ['place', 1, 'notes'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
        ])
      })
    })
  })
})

describe('editPlaceNotes', () => {
  describe('given an initial file', () => {
    describe('and a place id of 1', () => {
      const store = storeWithZelda()
      const originalNotes = singlePlaceSelector(
        store.getState(),
        // @ts-ignore
        1
      ).notes
      const originalFoci = placeFociSelector(store.getState())
      const valueToChangeTo = [{ type: 'paragraph', children: [{ text: 'yippeee!' }] }]
      store.dispatch(
        editPlaceNotes(1, valueToChangeTo, {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should edit the place notes', () => {
        const newNotes = singlePlaceSelector(
          store.getState(),
          // @ts-ignore
          1
        ).notes
        expect(newNotes).not.toEqual(originalNotes)
        expect(newNotes).toEqual(valueToChangeTo)
      })
      it('should bump the place notes to the top of the foci', () => {
        const newFoci = placeFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['place', 1, 'notes'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['place', 2, 'three'],
            selection: {
              direction: 'none',
              end: 1,
              start: 1,
            },
          },
          {
            path: ['place', 2, 'two'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['place', 2, 'one'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['place', 2, 'description'],
            selection: {
              direction: 'forward',
              end: 23,
              start: 20,
            },
          },
          {
            path: ['place', 2, 'name'],
            selection: {
              direction: 'forward',
              end: 7,
              start: 4,
            },
          },
        ])
      })
    })
  })
})

describe('editPlaceCustomAttribute', () => {
  describe('given an initial file', () => {
    describe('and a place id of 1', () => {
      describe('and an attribute named "one"', () => {
        const store = storeWithZelda()
        const originalValue = singlePlaceSelector(
          store.getState(),
          // @ts-ignore
          1
        ).one
        const originalFoci = placeFociSelector(store.getState())
        store.dispatch(
          editPlaceCustomAttribute(
            1,
            'one',
            'I used to have a different value.  Then, I took an arrow to the knee.',
            {
              direction: 'none',
              end: 0,
              start: 5,
            }
          )
        )
        it('should edit the custom attribute value', () => {
          const newValue = singlePlaceSelector(
            store.getState(),
            // @ts-ignore
            1
          ).one
          expect(newValue).not.toEqual(originalValue)
          expect(newValue).toEqual(
            'I used to have a different value.  Then, I took an arrow to the knee.'
          )
        })
        it('should bump the custom attribute to the top of the foci', () => {
          const newFoci = placeFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalFoci)
          expect(newFoci).toEqual([
            {
              path: ['place', 1, 'one'],
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
            {
              path: ['place', 2, 'three'],
              selection: {
                direction: 'none',
                end: 1,
                start: 1,
              },
            },
            {
              path: ['place', 2, 'two'],
              selection: {
                direction: 'none',
                end: 15,
                start: 15,
              },
            },
            {
              path: ['place', 2, 'one'],
              selection: {
                direction: 'none',
                end: 15,
                start: 15,
              },
            },
            {
              path: ['place', 2, 'description'],
              selection: {
                direction: 'forward',
                end: 23,
                start: 20,
              },
            },
            {
              path: ['place', 2, 'name'],
              selection: {
                direction: 'forward',
                end: 7,
                start: 4,
              },
            },
            {
              path: ['place', 1, 'notes'],
              selection: {
                direction: 'forward',
                end: 3,
                start: 0,
              },
            },
          ])
        })
      })
    })
  })
})
