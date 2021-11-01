import { logger } from './logger'

export const safeParse = (string, defaultStore = null) => {
  if (!string) return defaultStore
  try {
    return JSON.parse(string)
  } catch (error) {
    logger.error(`Error parsing ${string} from JSON`, error)
    return defaultStore
  }
}
