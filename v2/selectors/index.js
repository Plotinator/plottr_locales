import allSelectors from './allSelectors'

const selectors = (selectSubState) => {
  return Object.entries(allSelectors).reduce((selectorsAcc, nextEntry) => {
    const [name, initialSelector] = nextEntry

    /**
     * @param {any} selector
     * @returns {function(...any): any}
     */
    function thunkUntilSelector(selector) {
      return function applyArgs(...args) {
        if (typeof selector.memoizedResultFunc === 'undefined') {
          const result = selector(...args)
          if (typeof result === 'function') {
            return (...argsNext) => {
              return thunkUntilSelector(result)(...argsNext)
            }
          } else {
            return result
          }
        } else {
          const [state, ...rest] = args
          return selector(selectSubState(state), ...rest)
        }
      }
    }

    return {
      ...selectorsAcc,
      [name]: thunkUntilSelector(initialSelector),
    }
  }, allSelectors)
}

export default selectors
