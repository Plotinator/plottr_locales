import { CACHE_IMAGE, PURGE_IMAGE } from '../constants/ActionTypes'

export const cacheImage = (storageUrl, publicUrl) => ({
  type: CACHE_IMAGE,
  storageUrl,
  publicUrl,
  timestamp: new Date().getTime(),
})

export const purgeImage = (storageUrl) => ({
  type: PURGE_IMAGE,
  storageUrl,
})
