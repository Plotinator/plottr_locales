export const safeParse = (string, defaultStore = null) => {
  try {
    return JSON.parse(string)
  } catch (error) {
    console.error(`Error parsing ${string} from JSON`, error)
    return defaultStore
  }
}
