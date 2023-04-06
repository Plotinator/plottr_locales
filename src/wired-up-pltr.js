import { actions as pltrActions, selectors as pltrSelectors } from 'pltr/v2'

export const selectPresentState = (fullState) => {
  return fullState.present
}
export const actions = pltrActions(selectPresentState)
export const selectors = pltrSelectors(selectPresentState)
