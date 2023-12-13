export const safeParseInt = (x) => {
  try {
    return parseInt(x)
  } catch (error) {
    return x
  }
}
