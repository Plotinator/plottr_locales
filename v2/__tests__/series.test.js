import { storeWithZelda, pltrAdaptor } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  series: { editSeries, setSeriesName, setSeriesPremise, setSeriesGenre, setSeriesTheme },
} = actions(pltrAdaptor)
const {
  seriesNameSelector,
  projectAllFociSelector,
  seriesPremiseSelector,
  seriesGenreSelector,
  seriesThemeSelector,
} = selectors(pltrAdaptor)

describe('editSeries', () => {
  describe('given an initial file', () => {
    describe('and an attribute named "name"', () => {
      const store = storeWithZelda()
      const originalName = seriesNameSelector(store.getState())
      const originalFoci = projectAllFociSelector(store.getState())
      store.dispatch(
        editSeries({
          name: {
            value: 'This is not the legend of Zelda.',
            selection: {
              direction: 'none',
              end: 0,
              start: 5,
            },
          },
        })
      )
      it('should edit the attribute', () => {
        const newName = seriesNameSelector(store.getState())
        expect(newName).not.toEqual(originalName)
        expect(newName).toEqual('This is not the legend of Zelda.')
      })
      it('should bump the name attribute to the top of the foci', () => {
        const newFoci = projectAllFociSelector(store.getState())
        expect(newFoci).not.toEqual(originalFoci)
        expect(newFoci).toEqual([
          {
            path: ['name'],
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

describe('setSeriesName', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const originalName = seriesNameSelector(store.getState())
    const originalFoci = projectAllFociSelector(store.getState())
    store.dispatch(
      setSeriesName('A whole new series', {
        direction: 'none',
        end: 0,
        start: 5,
      })
    )
    it('should edit the series name', () => {
      const newName = seriesNameSelector(store.getState())
      expect(newName).not.toEqual(originalName)
      expect(newName).toEqual('A whole new series')
    })
    it('should bump the series name to the top of the foci', () => {
      const newFoci = projectAllFociSelector(store.getState())
      expect(newFoci).not.toEqual(originalFoci)
      expect(newFoci).toEqual([
        {
          path: ['name'],
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

describe('setSeriesPremise', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const originalPremise = seriesPremiseSelector(store.getState())
    const originalFoci = projectAllFociSelector(store.getState())
    store.dispatch(
      setSeriesPremise('A hero embarks on a strange quest to save the princess', {
        direction: 'none',
        end: 0,
        start: 5,
      })
    )
    it('should edit the premise', () => {
      const newPremise = seriesPremiseSelector(store.getState())
      expect(newPremise).not.toEqual(originalPremise)
      expect(newPremise).toEqual('A hero embarks on a strange quest to save the princess')
    })
    it('should bump the series premise to the top of the foci', () => {
      const newFoci = projectAllFociSelector(store.getState())
      expect(newFoci).not.toEqual(originalFoci)
      expect(newFoci).toEqual([
        {
          path: ['premise'],
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

describe('setSeriesGenre', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const originalGenre = seriesGenreSelector(store.getState())
    const originalFoci = projectAllFociSelector(store.getState())
    store.dispatch(setSeriesGenre('Way out there'))
    it('should edit the series genre', () => {
      const newGenre = seriesGenreSelector(store.getState())
      expect(newGenre).not.toEqual(originalGenre)
      expect(newGenre).toEqual('Way out there')
    })
    it('should bump the genre focus to the top of the foci', () => {
      const newFoci = projectAllFociSelector(store.getState())
      expect(newFoci).not.toEqual(originalFoci)
      expect(newFoci).toEqual([
        {
          path: ['genre'],
          selection: undefined,
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
      ])
    })
  })
})

describe('setSeriesTheme', () => {
  describe('given an initial file', () => {
    const store = storeWithZelda()
    const originalTheme = seriesThemeSelector(store.getState())
    const originalFoci = projectAllFociSelector(store.getState())
    store.dispatch(setSeriesTheme('Adventure'))
    it('should edit the series theme', () => {
      const newTheme = seriesThemeSelector(store.getState())
      expect(newTheme).not.toEqual(originalTheme)
      expect(newTheme).toEqual('Adventure')
    })
    it('should bump the series theme to the top of the foci', () => {
      const newFoci = projectAllFociSelector(store.getState())
      expect(newFoci).not.toEqual(originalFoci)
      expect(newFoci).toEqual([
        {
          path: ['theme'],
          selection: undefined,
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
