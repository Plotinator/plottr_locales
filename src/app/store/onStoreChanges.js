export const onStoreChanges = (getStore, selectors, fn) => {
  if (selectors.length === 0 || selectors.some((selector) => typeof selector !== 'function')) {
    throw new Error('Invalid selectors provided to onStoreChanges.  Expected an array of functions')
  }
  /**
   * @type {PreviousValuesRef}
   * @typedef PreviousValuesRef
   * @property {Array<any> | null} values
   */
  const previousValuesRef = {
    values: null,
  }
  return getStore().subscribe(() => {
    const previousValues = previousValuesRef.values
    const currentState = getStore().getState()
    const currentValues = selectors.map((selector) => {
      return selector(currentState)
    })
    if (
      previousValues === null ||
      previousValues.some((prevValue, index) => prevValue !== currentValues[index])
    ) {
      previousValuesRef.values = currentValues
      fn(...currentValues)
    } else {
      previousValuesRef.values = currentValues
    }
  })
}
