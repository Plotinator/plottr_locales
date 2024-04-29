import { actions as pltrActions, selectors as pltrSelectors } from 'pltr'

export const selectPresentState = (fullState) => {
  if (typeof fullState.present !== 'undefined') {
    return fullState.present
  } else {
    return fullState
  }
}
export const actions = pltrActions(selectPresentState)
export const selectors = pltrSelectors(selectPresentState)
