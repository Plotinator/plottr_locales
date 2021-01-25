import exportPlaces from '../places'
import { resetId } from '../../utils'
import { headingTwo, paragraph, state } from './fixtures'

describe('exportPlaces', () => {
  let documentContents = {}
  beforeEach(() => resetId())

  it('exports places binder from state', () => {
    const binderItem = exportPlaces(state, documentContents)
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
    expect(documentContents).toEqual({
      4: {
        lineTitle: 'Place: first place',
        description: [
          headingTwo('description'),
          paragraph('my favorite place'),
          headingTwo('notes'),
          ...state.places[0].notes,
          headingTwo('weather'),
          paragraph('stormy'),
          headingTwo('Tags'),
          paragraph('wonder'),
          headingTwo('Template attribute'),
          paragraph('This is a template attribute'),
        ],
      },
    })
  })
})