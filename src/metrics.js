const METRICS_WRITE_FREQUENCY = 100

export const withMetrics = (firebaseAPI) => {
  const callCounts = {}
  let totalCalls = 0

  const getUserId = () => {
    return firebaseAPI.currentUser().uid
  }

  const countingCalls =
    (key, f) =>
    (...args) => {
      totalCalls++
      callCounts[key] = (callCounts[key] ?? 0) + 1
      if (totalCalls > 0 && totalCalls >= METRICS_WRITE_FREQUENCY) {
        // Ignore the result because this is non-critical.
        firebaseAPI.writeMetrics(getUserId(), callCounts, totalCalls)
        totalCalls = 0
      }
      return f(...args)
    }

  const wrappedWiredUp = Object.entries(firebaseAPI).reduce((acc, next) => {
    const [key, f] = next
    return {
      ...acc,
      [key]: countingCalls(key, f),
    }
  }, firebaseAPI)

  return {
    ...wrappedWiredUp,
    getMetrics: () => {
      return {
        userId: getUserId(),
        ...callCounts,
      }
    },
  }
}
