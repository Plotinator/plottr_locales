import { actions as pltrActions, selectors as pltrSelectors } from 'pltr'

export const selectPresentState = (fullState) => {
  return fullState
}
export const actions = pltrActions(selectPresentState)
export const selectors = pltrSelectors(selectPresentState)
