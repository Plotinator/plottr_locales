export const safeParseJSON = (s) => {
  try {
    return JSON.parse(s)
  } catch (_e) {
    return null
  }
}
