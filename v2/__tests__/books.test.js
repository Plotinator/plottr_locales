import { storeWithZelda, pltrAdaptor } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  book: { setBookTitle, setBookPremise, setBookGenre, setBookTheme },
} = actions(pltrAdaptor)
const { bookByIdSelector, projectAllFociSelector } = selectors(pltrAdaptor)

describe('setBookTitle', () => {
  describe('given an initial file', () => {
    describe('and a book id of 1', () => {
      const store = storeWithZelda()
      const originalTitle = bookByIdSelector(store.getState(), 1).title
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookTitle(1, 'A brand new title', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 1', () => {
        const newTitle = bookByIdSelector(store.getState(), 1).title
        expect(originalTitle).not.toEqual(newTitle)
        expect(newTitle).toEqual('A brand new title')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
    describe('and a book id of 5', () => {
      const store = storeWithZelda()
      const originalTitle = bookByIdSelector(store.getState(), 5).title
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookTitle(5, 'A brand new title', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 5', () => {
        const newTitle = bookByIdSelector(store.getState(), 5).title
        expect(originalTitle).not.toEqual(newTitle)
        expect(newTitle).toEqual('A brand new title')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 5, 'title'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
  })
})

describe('setBookPremise', () => {
  describe('given an initial file', () => {
    describe('and a book id of 1', () => {
      const store = storeWithZelda()
      const originalPremise = bookByIdSelector(store.getState(), 1).premise
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookPremise(1, 'A brand new premise', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the premise of book 1', () => {
        const newPremise = bookByIdSelector(store.getState(), 1).premise
        expect(originalPremise).not.toEqual(newPremise)
        expect(newPremise).toEqual('A brand new premise')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 1, 'premise'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
    describe('and a book id of 5', () => {
      const store = storeWithZelda()
      const originalPremise = bookByIdSelector(store.getState(), 5).premise
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookPremise(5, 'A brand new premise', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 5', () => {
        const newPremise = bookByIdSelector(store.getState(), 5).premise
        expect(originalPremise).not.toEqual(newPremise)
        expect(newPremise).toEqual('A brand new premise')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 5, 'premise'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
  })
})

describe('setBookGenre', () => {
  describe('given an initial file', () => {
    describe('and a book id of 1', () => {
      const store = storeWithZelda()
      const originalGenre = bookByIdSelector(store.getState(), 1).genre
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookGenre(1, 'A brand new genre', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 1', () => {
        const newGenre = bookByIdSelector(store.getState(), 1).genre
        expect(originalGenre).not.toEqual(newGenre)
        expect(newGenre).toEqual('A brand new genre')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 1, 'genre'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
    describe('and a book id of 5', () => {
      const store = storeWithZelda()
      const originalGenre = bookByIdSelector(store.getState(), 5).genre
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookGenre(5, 'A brand new genre', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 5', () => {
        const newGenre = bookByIdSelector(store.getState(), 5).genre
        expect(originalGenre).not.toEqual(newGenre)
        expect(newGenre).toEqual('A brand new genre')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 5, 'genre'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
  })
})

describe('setBookTheme', () => {
  describe('given an initial file', () => {
    describe('and a book id of 1', () => {
      const store = storeWithZelda()
      const originalTheme = bookByIdSelector(store.getState(), 1).theme
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookTheme(1, 'A brand new theme', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 1', () => {
        const newTheme = bookByIdSelector(store.getState(), 1).theme
        expect(originalTheme).not.toEqual(newTheme)
        expect(newTheme).toEqual('A brand new theme')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 1, 'theme'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
    describe('and a book id of 5', () => {
      const store = storeWithZelda()
      const originalTheme = bookByIdSelector(store.getState(), 5).theme
      const originalProjectFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        setBookTheme(5, 'A brand new theme', {
          direction: 'none',
          end: 0,
          start: 5,
        })
      )
      it('should change the title of book 5', () => {
        const newTheme = bookByIdSelector(store.getState(), 5).theme
        expect(originalTheme).not.toEqual(newTheme)
        expect(newTheme).toEqual('A brand new theme')
      })
      it('should push the focus of the project tab', () => {
        const newProjectFoci = projectAllFociSelector(store.getState())
        expect(originalProjectFoci).not.toEqual(newProjectFoci)
        expect(newProjectFoci).toEqual([
          {
            path: ['book', 5, 'theme'],
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
          {
            path: ['book', 9, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'premise'],
            selection: {
              direction: 'forward',
              end: 8,
              start: 5,
            },
          },
          {
            path: ['book', 8, 'title'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['book', 7, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['book', 6, 'title'],
            selection: {
              direction: 'forward',
              end: 3,
              start: 0,
            },
          },
          {
            path: ['book', 1, 'title'],
            selection: {
              direction: 'forward',
              end: 13,
              start: 10,
            },
          },
          {
            path: ['name'],
            selection: {
              direction: 'forward',
              end: 21,
              start: 18,
            },
          },
          {
            path: ['theme'],
            selection: {
              direction: 'none',
              end: 8,
              start: 8,
            },
          },
          {
            path: ['premise'],
            selection: {
              direction: 'none',
              end: 6,
              start: 6,
            },
          },
          {
            path: ['genre'],
            selection: {
              direction: 'none',
              end: 5,
              start: 5,
            },
          },
        ])
      })
    })
  })
})
