import allSelectors from './allSelectors'

const selectors = (selectSubState) => {
  return Object.entries(allSelectors).reduce((selectorsAcc, nextEntry) => {
    const [name, selector] = nextEntry
    return {
      ...selectorsAcc,
      [name]:
        typeof selector.memoizedResultFunc === 'undefined' && selector.length === 0
          ? () => {
              const actualSelector = selector()
              return (state, ...args) => actualSelector(selectSubState(state), ...args)
            }
          : (state, ...args) => selector(selectSubState(state), ...args),
    }
  }, {})
}

export default selectors
