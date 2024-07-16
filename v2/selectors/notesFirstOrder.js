// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { groupBy } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'
import { positionReset } from '../helpers/lists'

export const allNotesSelector = createSelector(fullFileStateSelector, ({ notes }) => notes ?? [])

const selectId = (_state, id) => id

export const singleNoteSelector = createSelector(allNotesSelector, selectId, (notes, propId) =>
  notes.find((n) => n.id == propId)
)

export const notesByCategorySelector = createSelector(allNotesSelector, (notes) => {
  const notesWithCategory = notes.map((note) => {
    if (!note.categoryId) {
      return {
        ...note,
        categoryId: null,
      }
    }
    return note
  })
  const grouped = groupBy(notesWithCategory, 'categoryId')
  // @ts-ignore
  if (grouped[undefined] !== undefined) {
    // @ts-ignore
    grouped['null'] = grouped[undefined].concat(grouped['null'] || [])
    delete grouped['undefined']
  }

  const groupWithPosition = Object.values(grouped).map((group) => {
    return positionReset(group)
  })
  return groupBy(groupWithPosition.flat(), 'categoryId')
})

export const stringifiedNotesByIdSelector = createSelector(allNotesSelector, (notes) => {
  return notes.reduce((acc, note) => {
    return {
      ...acc,
      [note.id]: JSON.stringify(note).toLowerCase(),
    }
  }, {})
})
