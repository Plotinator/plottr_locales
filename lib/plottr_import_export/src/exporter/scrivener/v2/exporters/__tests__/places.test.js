import { identity } from 'lodash'

import { selectors as pltrSelectors } from 'pltr'

import exportPlaces from '../places'
import { resetId } from '../../utils'
import { state as raw_state, headingTwo, paragraph } from './fixtures'
import default_config from '../../../../default_config'

const selectors = pltrSelectors(identity)

const state = { user: raw_state }

describe('exportPlaces', () => {
  let documentContents = {}
  beforeEach(() => resetId())

  it('exports places binder from state', () => {
    const binderItem = exportPlaces(state, documentContents, default_config.scrivener, selectors)
    expect(binderItem).toMatchObject({
      _attributes: {
        Type: 'Folder',
      },
      Title: {
        _text: 'Places',
      },
      Children: {
        BinderItem: [
          {
            Title: {
              _text: 'first place',
            },
            _attributes: {
              Type: 'Text',
            },
          },
        ],
      },
    })
  })

  it('exports the documentContents', () => {
    // @ts-ignore
    const places = selectors.allPlacesSelector(state)
    expect(documentContents).toEqual({
      4: {
        body: {
          docTitle: 'first place',
          description: [
            headingTwo('Description'),
            paragraph('my favorite place'),
            headingTwo('Notes'),
            ...places[0].notes,
            headingTwo('Tags'),
            paragraph('wonder'),
            headingTwo('weather'),
            paragraph('stormy'),
          ],
        },
      },
    })
  })
})
