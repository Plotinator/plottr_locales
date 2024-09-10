import { createSelector } from 'reselect'

import { singleCardSelector } from './cardsFirstOrder'
import { allBeatsSelector } from './beatsFirstOrder'
import { allLinesSelector } from './linesFirstOrder'
import { emptyCard } from '../helpers/cards'
import { currentTimelineSelector } from './secondOrder'

export const beatIdSelector = (_state, _cardId, beatId) => beatId
export const singleBeatInCurrentBookSelector = createSelector(
  currentTimelineSelector,
  allBeatsSelector,
  beatIdSelector,
  (bookId, beats, beatId) => {
    return beats[bookId].index[beatId]
  }
)

export const singleCardOrDefaultSelector = createSelector(
  allLinesSelector,
  singleCardSelector,
  singleBeatInCurrentBookSelector,
  (lines, card, beat) => {
    return card || emptyCard(0, beat, lines[0])
  }
)
