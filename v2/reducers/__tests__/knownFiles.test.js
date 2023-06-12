import { configureStore, pltrAdaptor } from './fixtures/testStore'
import selectors from '../../selectors'
import actions from '../../actions'

const { selectedFileSelector } = selectors(pltrAdaptor)
const {
  project: { selectFile },
  knownFiles: { setKnownFiles },
} = actions(pltrAdaptor)

const EXAMPLE_KNOWN_FILES = [
  {
    fileURL: 'device:///Users/johndoe/wip/plottr_electron/examples/Zelda.pltr',
    fileName: 'Zelda',
    lastOpened: 1683791595786,
    isTempFile: false,
    pathToContainingFolder: ['Users', 'johndoe', 'wip', 'plottr_electron', 'examples'],
  },
  {
    fileURL: 'device:///Users/johndoe/wip/plottr_electron/examples/Zelborg.pltr',
    fileName: 'Zeldaborg',
    lastOpened: 1683791561458,
    isTempFile: false,
    pathToContainingFolder: ['Users', 'johndoe', 'wip', 'plottr_electron', 'examples'],
  },
  {
    fileURL: 'device:///Users/johndoe/wip/plottr_electron/examples/Zeldanger.pltr',
    fileName: 'Zeldanger',
    lastOpened: 1683791492717,
    isTempFile: false,
    pathToContainingFolder: ['Users', 'johndoe', 'wip', 'plottr_electron', 'examples'],
  },
]

describe('setKnownFiles', () => {
  describe('given that no file is selected', () => {
    const store = configureStore()
    const initialSelectedFile = selectedFileSelector(store.getState())
    store.dispatch(setKnownFiles(EXAMPLE_KNOWN_FILES))
    it('should not change the selected file', () => {
      const finalSelectedFile = selectedFileSelector(store.getState())
      expect(finalSelectedFile).toEqual(initialSelectedFile)
      expect(finalSelectedFile).toEqual({})
    })
  })
  describe('given that a file is selected', () => {
    describe('and an updated file appears in the known files', () => {
      const store = configureStore()
      store.dispatch(setKnownFiles(EXAMPLE_KNOWN_FILES))
      store.dispatch(selectFile(EXAMPLE_KNOWN_FILES[0]))
      const initialSelectedFile = selectedFileSelector(store.getState())
      const newFileZero = {
        ...EXAMPLE_KNOWN_FILES[0],
        fileName: 'Zeldation',
      }
      store.dispatch(setKnownFiles([newFileZero, ...EXAMPLE_KNOWN_FILES.slice(1)]))
      it('should select the new file', () => {
        const finalSelectedFile = selectedFileSelector(store.getState())
        expect(finalSelectedFile).not.toEqual(initialSelectedFile)
        expect(finalSelectedFile).toEqual(newFileZero)
      })
    })
    describe('and the selected file no longer exists', () => {
      const store = configureStore()
      store.dispatch(setKnownFiles(EXAMPLE_KNOWN_FILES))
      store.dispatch(selectFile(EXAMPLE_KNOWN_FILES[0]))
      const initialSelectedFile = selectedFileSelector(store.getState())
      store.dispatch(setKnownFiles(EXAMPLE_KNOWN_FILES.slice(1)))
      it('should select the null file', () => {
        const finalSelectedFile = selectedFileSelector(store.getState())
        expect(finalSelectedFile).not.toEqual(initialSelectedFile)
        expect(finalSelectedFile).toEqual({})
      })
    })
  })
})
