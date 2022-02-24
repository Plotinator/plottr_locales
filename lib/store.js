import { setStore } from 'wired-up-firebase'

import { configureStore } from './redux'

export const store = configureStore({})
setStore(store)
