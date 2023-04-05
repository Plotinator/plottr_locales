import allSelectors from './allSelectors'

const selectors = (selectSubState) => {
  return Object.entries(allSelectors)
    .reduce((selectorsAcc, nextEntry) => {
      const [name, selector] = nextEntry
      return {
        ...selectorsAcc,
        [name]: (state, ...args) => selector(selectSubState(state), ...args),
      }
    }, {})
}

export default selectors
