import { identity } from 'lodash'

import { selectors as pltrSelectors } from 'pltr'

import exportNotes from '../notes'
import { resetId } from '../../utils'
import { state as raw_state } from './fixtures'
import default_config from '../../../../default_config'

const selectors = pltrSelectors(identity)

const state = { user: raw_state }

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
          description: [
            {
              children: [
                {
                  text: 'Content',
                },
              ],
              type: 'heading-two',
            },
            {
              children: [
                {
                  text: 'A note',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  text: 'Tags',
                },
              ],
              type: 'heading-two',
            },
            {
              children: [
                {
                  text: 'wonder, scary, awesomeness',
                },
              ],
              type: 'paragraph',
            },
          ],
          docTitle: 'Another Note',
        },
      },
    })
  })
})
