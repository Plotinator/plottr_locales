import { createSelector } from 'reselect'

export const seriesSelector = ({ series }) => {
  return series || {}
}
export const seriesNameSelector = createSelector(seriesSelector, ({ name }) => {
  return name
})
