import { differenceBy, sortBy } from 'lodash'

import { storeWithZelda, pltrAdaptor, twelve_step_mystery_formula_template } from './fixtures'
import actions from '../actions'
import selectors from '../selectors'

const {
  line: { addLinesFromTemplate },
  ui: { changeCurrentTimeline },
} = actions(pltrAdaptor)
const { linesForBookSelector } = selectors(pltrAdaptor)

describe('linesForBookSelector', () => {
  describe('given a store with the zelda book loaded', () => {
    describe('given the 12 step mystery formula', () => {
      describe('when applying it to the current book', () => {
        const store = storeWithZelda()
        const initialLines = linesForBookSelector(
          store.getState(),
          // @ts-ignore
          7
        )
        store.dispatch(changeCurrentTimeline(7))
        store.dispatch(
          addLinesFromTemplate(
            twelve_step_mystery_formula_template.templateData,
            'pl3',
            twelve_step_mystery_formula_template.templateData.lines
          )
        )
        it('should add the lines in-order', () => {
          const newLines = linesForBookSelector(
            store.getState(),
            // @ts-ignore
            7
          )
          const addedLines = differenceBy(newLines, initialLines, 'id')
          expect(addedLines).toEqual([
            {
              bookId: 7,
              characterId: null,
              color: '#6cace4',
              expanded: null,
              fromTemplateId: 'pl3',
              id: 18,
              position: 2,
              title: '12 Step Mystery Formula',
            },
            {
              bookId: 7,
              characterId: null,
              color: '#78be20',
              expanded: null,
              fromTemplateId: 'pl3',
              id: 19,
              position: 3,
              title: '12 Step Mystery Formula Subplot',
            },
          ])
        })
        it('should still include the original lines', () => {
          const newLines = linesForBookSelector(
            store.getState(),
            // @ts-ignore
            7
          )
          const addedLines = differenceBy(newLines, initialLines, 'id')
          const newOriginalLines = differenceBy(newLines, addedLines, 'id')
          expect(newOriginalLines).toEqual(sortBy(initialLines, 'position'))
        })
      })
    })
  })
})
