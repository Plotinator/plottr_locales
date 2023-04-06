import { identity } from 'lodash'

import { selectors as pltrSelectors } from 'pltr/v2'

import exportNotes from '../notes'
import { resetId } from '../../utils'
import { state } from './fixtures'
import default_config from '../../../../default_config'

const selectors = pltrSelectors(identity)

describe('exportNotes', () => {
  let documentContents = {}
  beforeEach(() => {
    resetId()
  })

  it('exports notes binder from state', () => {
    const binderItem = exportNotes(state, documentContents, default_config.scrivener, selectors)
    expect(binderItem).toMatchObject({
      _attributes: {
        Type: 'Folder',
      },
      Title: {
        _text: 'Notes',
      },
      Children: {
        BinderItem: [
          {
            Title: {
              _text: 'Another Note',
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
        body: {
          docTitle: expect.stringContaining('Another Note'),
          description: state.notes[0].content,
        },
      },
    })
  })
})
