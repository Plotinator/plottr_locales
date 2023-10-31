import { configureStore, pltrAdaptor } from './testStore'
import actions from '../../actions'
import zelda from './zelda.json'
import character_template from './character-template.json'

const {
  ui: { loadFile },
} = actions(pltrAdaptor)

export const storeWithZelda = () => {
  const store = configureStore()
  store.dispatch(loadFile('Zelda', false, zelda, '2023.4.20', 'device://tmp/zelda.json'))
  return store
}

export { configureStore, pltrAdaptor, character_template }
