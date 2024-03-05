import { selectors } from 'wired-up-pltr'

const shadow = (store) => (next) => (action) => {
  return next({ ...action, _shadow: selectors.fullFileStateSelector(store.getState()) })
}

export default shadow
