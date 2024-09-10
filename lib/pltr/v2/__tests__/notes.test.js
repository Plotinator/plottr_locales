import { storeWithZelda, pltrAdaptor } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  note: { editNote, editNoteTitle, editNoteContent, editNoteCustomAttribute },
} = actions(pltrAdaptor)
const { singleNoteSelector, noteFociSelector } = selectors(pltrAdaptor)

describe('editNote', () => {
  describe('given an initial file', () => {
    describe('and a note id of 1', () => {
      describe('and an attribute named "title"', () => {
        const store = storeWithZelda()
        const originalTitle = singleNoteSelector(
          store.getState(),
          // @ts-ignore
          1
        ).title
        const originalFoci = noteFociSelector(store.getState())
        store.dispatch(
          editNote(1, {
            title: {
              value: "This note didn't have a title",
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
          })
        )
        it('should edit the title', () => {
          const newTitle = singleNoteSelector(
            store.getState(),
            // @ts-ignore
            1
          ).title
          expect(newTitle).not.toEqual(originalTitle)
          expect(newTitle).toEqual("This note didn't have a title")
        })
        it('should bump the title to the top of note foci', () => {
          const newFoci = noteFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalFoci)
          expect(newFoci).toEqual([
            {
              path: ['note', 1, 'title'],
              selection: {
                direction: 'none',
                end: 0,
                start: 5,
              },
            },
            {
              path: ['note', 2, 'third'],
              selection: {
                direction: 'none',
                end: 15,
                start: 15,
              },
            },
            {
              path: ['note', 2, 'second'],
              selection: {
                direction: 'none',
                end: 2,
                start: 2,
              },
            },
            {
              path: ['note', 2, 'first'],
              selection: {
                direction: 'none',
                end: 4,
                start: 4,
              },
            },
            {
              path: ['note', 2, 'content'],
              selection: {
                direction: 'forward',
                end: 25,
                start: 22,
              },
            },
            {
              path: ['note', 2, 'title'],
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
})

describe('editNoteTitle', () => {
  describe('given an initial file', () => {
    describe('and a note id of 1', () => {
      const store = storeWithZelda()
      const originalTitle = singleNoteSelector(
        store.getState(),
        // @ts-ignore
        1
      ).title
      const originalFoci = noteFociSelector(store.getState())
      store.dispatch(
        editNoteTitle(1, 'This note did not have a title', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should edit the note title', () => {
        const newTitle = singleNoteSelector(
          store.getState(),
          // @ts-ignore
          1
        ).title
        expect(newTitle).not.toEqual(originalTitle)
        expect(newTitle).toEqual('This note did not have a title')
      })
      it('should bump the note title to the top of the foci', () => {
        const newFoci = noteFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['note', 1, 'title'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['note', 2, 'third'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['note', 2, 'second'],
            selection: {
              direction: 'none',
              end: 2,
              start: 2,
            },
          },
          {
            path: ['note', 2, 'first'],
            selection: {
              direction: 'none',
              end: 4,
              start: 4,
            },
          },
          {
            path: ['note', 2, 'content'],
            selection: {
              direction: 'forward',
              end: 25,
              start: 22,
            },
          },
          {
            path: ['note', 2, 'title'],
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

describe('editNoteContent', () => {
  describe('given an initial file', () => {
    describe('and an id of 1', () => {
      const store = storeWithZelda()
      const originalContent = singleNoteSelector(
        store.getState(),
        // @ts-ignore
        1
      ).content
      const originalFoci = noteFociSelector(store.getState())
      const valueToChangeTo = [{ type: 'paragraph', children: [{ text: 'yippeee!' }] }]
      store.dispatch(
        editNoteContent(1, valueToChangeTo, {
          direction: 'forward',
          end: 7,
          start: 4,
        })
      )
      it('should edit the descrription', () => {
        const newContent = singleNoteSelector(
          store.getState(),
          // @ts-ignore
          1
        ).content
        expect(newContent).not.toEqual(originalContent)
        expect(newContent).toEqual(valueToChangeTo)
      })
      it('should bump the note to the top of the foci', () => {
        const newFoci = noteFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['note', 1, 'content'],
            selection: {
              direction: 'forward',
              end: 7,
              start: 4,
            },
          },
          {
            path: ['note', 2, 'third'],
            selection: {
              direction: 'none',
              end: 15,
              start: 15,
            },
          },
          {
            path: ['note', 2, 'second'],
            selection: {
              direction: 'none',
              end: 2,
              start: 2,
            },
          },
          {
            path: ['note', 2, 'first'],
            selection: {
              direction: 'none',
              end: 4,
              start: 4,
            },
          },
          {
            path: ['note', 2, 'content'],
            selection: {
              direction: 'forward',
              end: 25,
              start: 22,
            },
          },
          {
            path: ['note', 2, 'title'],
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

describe('editNoteCustomAttribute', () => {
  describe('given an initial file', () => {
    describe('and an id of 1', () => {
      describe('and an attribute named "here"', () => {
        const store = storeWithZelda()
        const originalValue = singleNoteSelector(
          store.getState(),
          // @ts-ignore
          1
        ).here
        const originalFoci = noteFociSelector(store.getState())
        store.dispatch(
          editNoteCustomAttribute(
            1,
            'here',
            'A brand new value, with all the bells and whistles!',
            {
              direction: 'forward',
              end: 7,
              start: 4,
            }
          )
        )
        it('should edit the attribute value', () => {
          const newValue = singleNoteSelector(
            store.getState(),
            // @ts-ignore
            1
          ).here
          expect(newValue).not.toEqual(originalValue)
          expect(newValue).toEqual('A brand new value, with all the bells and whistles!')
        })
        it('should bump the attribute to the top of the note foci', () => {
          const newFoci = noteFociSelector(store.getState())
          expect(newFoci).not.toEqual(originalFoci)
          expect(newFoci).toEqual([
            {
              path: ['note', 1, 'here'],
              selection: {
                direction: 'forward',
                end: 7,
                start: 4,
              },
            },
            {
              path: ['note', 2, 'third'],
              selection: {
                direction: 'none',
                end: 15,
                start: 15,
              },
            },
            {
              path: ['note', 2, 'second'],
              selection: {
                direction: 'none',
                end: 2,
                start: 2,
              },
            },
            {
              path: ['note', 2, 'first'],
              selection: {
                direction: 'none',
                end: 4,
                start: 4,
              },
            },
            {
              path: ['note', 2, 'content'],
              selection: {
                direction: 'forward',
                end: 25,
                start: 22,
              },
            },
            {
              path: ['note', 2, 'title'],
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
})
