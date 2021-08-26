export const safeParse = (string, defaultStore = null) => {
  if (!string) return defaultStore
  try {
    return JSON.parse(string)
  } catch (error) {
    console.error(`Error parsing ${string} from JSON`, error)
    return defaultStore
  }
}
