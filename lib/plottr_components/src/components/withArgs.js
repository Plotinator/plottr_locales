export const withArgs = (f, ...args) => {
  return (...restOfArgs) => {
    return f(...args, ...restOfArgs)
  }
}
