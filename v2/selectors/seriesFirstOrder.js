// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const seriesSelector = createSelector(fullFileStateSelector, ({ series }) => {
  return series ?? {}
})
export const seriesNameSelector = createSelector(seriesSelector, ({ name }) => {
  return name ?? 'Untitled'
})
export const seriesPremiseSelector = createSelector(seriesSelector, ({ premise }) => {
  return premise ?? ''
})
export const seriesGenreSelector = createSelector(seriesSelector, ({ genre }) => {
  return genre ?? ''
})
export const seriesThemeSelector = createSelector(seriesSelector, ({ theme }) => {
  return theme ?? ''
})
