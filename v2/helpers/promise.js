export const sequenceThunks = (initialThunks) => {
  return initialThunks.reduce((accPromise, next) => {
    return accPromise.then((acc) => {
      return next().then((result) => {
        return [...acc, result]
      })
    })
  }, Promise.resolve([]))
}
