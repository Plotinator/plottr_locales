import { cloneDeep, isEqual, clone, identity, uniq, omit } from 'lodash'
import fc from 'fast-check'

import selectors from '../../selectors'
import actions from '../../actions'

import { configureStore, pltrAdaptor } from './fixtures/testStore'
import { emptyFile } from '../../store/newFileState'
import { hamlet } from './fixtures'
import externalSync, {
  keyFlatArraysById,
  isFlatArrayKey,
  updatePrevious,
  computeNewPaths,
  sync,
} from '../externalSync'

const wiredSelectors = selectors(identity)

describe('isFlatArrayKey', () => {
  describe('given an empty object', () => {
    const testObject = {}
    it('should not indicate that there is a flat array key in it', () => {
      expect(Object.keys(testObject).some(isFlatArrayKey)).toBeFalsy()
    })
  })
  describe('given the hamlet test file', () => {
    it('should indicate that some keys are flat arrays', () => {
      expect(Object.keys(hamlet).some(isFlatArrayKey)).toBeTruthy()
    })
  })
  describe('given a non-empty object', () => {
    describe('that has no flat array keys in it', () => {
      const testObject = {
        bob: 'second',
        alice: 'first',
        jeremy: {
          more: 'complicated',
          rank: 10,
        },
      }
      it('should not indicate that there are flat array keys', () => {
        expect(Object.keys(testObject).some(isFlatArrayKey)).toBeFalsy()
      })
    })
  })
})

describe('keyFlatArraysById', () => {
  describe('given the empty object', () => {
    it('should produce the empty object', () => {
      expect(keyFlatArraysById({})).toEqual({})
    })
  })
  describe('given the hamlet test file', () => {
    it('should produce a new object where the flat array keys are maps ', () => {
      const result = keyFlatArraysById(hamlet)
      for (const key of Object.keys(result)) {
        if (isFlatArrayKey(key)) {
          for (const entity of hamlet[key]) {
            expect(result[key].get(entity.id)).toBe(entity)
          }
          for (const id of result[key].keys()) {
            const originalEntity = hamlet[key].find((original) => {
              return original.id === id
            })
            expect(originalEntity).toBe(result[key].get(id))
          }
        } else {
          expect(result[key]).toBe(hamlet[key])
        }
      }
    })
  })
})

describe('updatePrevious', () => {
  describe('given a previous object computed from hamlet', () => {
    describe('and an empty collection of paths', () => {
      it('should not change the previous object at all', () => {
        const hamletKeyed = keyFlatArraysById(hamlet)
        const previousHamletKeyed = cloneDeep(hamletKeyed)
        updatePrevious(hamletKeyed, [], {})
        expect(isEqual(hamletKeyed, previousHamletKeyed)).toBeTruthy()
      })
    })
    describe('and a path to the file object', () => {
      it('should copy the file object from the third parameter into previous', () => {
        const hamletKeyed = keyFlatArraysById(hamlet)
        const original = clone(hamletKeyed)
        const state = {
          file: 'Yo!',
        }
        updatePrevious(hamletKeyed, [{ path: ['file'], change: 'UPDATED', index: null }], state)
        for (const key of Object.keys(hamletKeyed)) {
          if (key === 'file') {
            expect(hamletKeyed.file).toBe(state.file)
          } else {
            expect(hamletKeyed[key]).toBe(original[key])
          }
        }
      })
    })
    describe('and a path to a specific card', () => {
      it('should copy only that card from the state object', () => {
        const hamletKeyed = keyFlatArraysById(hamlet)
        const original = clone(hamletKeyed)
        const state = {
          cards: hamlet.cards,
        }
        const indexOfCardWithId10 = state.cards.findIndex(({ id }) => {
          return id === 10
        })
        expect(indexOfCardWithId10).toBeGreaterThan(-1)
        state.cards[indexOfCardWithId10].blargyBlargy = 'new stuff to test swap in'
        updatePrevious(
          hamletKeyed,
          [{ path: ['cards', 10], change: 'UPDATED', index: indexOfCardWithId10 }],
          state
        )
        for (const key of Object.keys(hamletKeyed)) {
          if (key === 'cards') {
            expect([...hamletKeyed.cards.keys()].length).toEqual([...original.cards.keys()].length)
            expect([...hamletKeyed.cards.keys()].length).toEqual(state.cards.length)
            for (let index = 0; index < state.cards.length; ++index) {
              if (index === indexOfCardWithId10) {
                expect(hamletKeyed.cards.get(state.cards[index].id)).toBe(state.cards[index])
              } else {
                expect(hamletKeyed.cards.get(state.cards[index].id)).toBe(
                  original.cards.get(state.cards[index].id)
                )
              }
            }
          } else {
            expect(hamletKeyed[key]).toBe(original[key])
          }
        }
      })
    })
  })
})

describe('computeNewPaths', () => {
  describe('given the hamlet file with a selected file in the project key', () => {
    const hamletWithSelectedFile = {
      ...hamlet,
      project: {
        selectedFile: {
          permission: 'owner',
        },
        fileURL: 'plottr://123e',
        userNameSearchResults: [],
        fileLoaded: false,
        isLoading: false,
        isOffline: false,
        resuming: false,
        checkingOfflineDrift: false,
        overwritingCloudWithBackup: false,
        showResumeMessageDialog: false,
        backingUpOfflineFile: false,
        unsavedChanges: false,
      },
    }
    describe('given an object that did not change', () => {
      it('should produce an empty array', () => {
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        const paths = computeNewPaths(hamletKeyed, hamletWithSelectedFile, wiredSelectors)
        expect(paths).toEqual([])
      })
    })
    describe('given a single arbitrary change to the state object', () => {
      it('should compute the corresponding paths', () => {
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        const allPaths = Object.keys(hamlet).reduce((acc, key) => {
          if (isFlatArrayKey(key)) {
            return [
              ...acc,
              ...hamlet[key].map((entity) => {
                return [key, entity.id]
              }),
            ]
          } else {
            return [...acc, [key]]
          }
        }, [])
        fc.assert(
          fc.property(fc.integer({ min: 0, max: allPaths.length - 1 }), (pathToChange) => {
            const path = allPaths[pathToChange]
            const key = path[0]
            const toChange = clone(hamletWithSelectedFile[key])
            if (path.length === 2) {
              const index = toChange.findIndex(({ id }) => {
                return id === path[1]
              })
              toChange[index] = {
                ...toChange[index],
                newStuff: 'some new data',
              }
            } else {
              toChange.newStuff = 'some new data'
            }
            const stateWithChange = {
              ...hamletWithSelectedFile,
              [key]: toChange,
            }
            const paths = computeNewPaths(hamletKeyed, stateWithChange, wiredSelectors)
            expect(paths.length).toEqual(1)
            expect(
              paths.map(({ path }) => {
                return path
              })
            ).toEqual([path])
          })
        )
      })
    })
    describe('given a collection of arbitrary change to the state object', () => {
      it('should compute the corresponding paths', () => {
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        const allPaths = Object.keys(hamlet).reduce((acc, key) => {
          if (isFlatArrayKey(key)) {
            return [
              ...acc,
              ...hamlet[key].map((entity) => {
                return [key, entity.id]
              }),
            ]
          } else {
            return [...acc, [key]]
          }
        }, [])
        fc.assert(
          fc.property(
            fc.array(fc.integer({ min: 0, max: allPaths.length - 1 }), {
              minLength: 1,
              maxLength: 10,
            }),
            (rawPathIndicesToChange) => {
              const pathIndicesToChange = uniq(rawPathIndicesToChange)
              const stateWithChange = clone(hamletWithSelectedFile)
              for (const pathIndex of pathIndicesToChange) {
                const path = allPaths[pathIndex % allPaths.length]
                const key = path[0]
                const toChange = clone(stateWithChange[key])
                if (path.length === 2) {
                  const index = toChange.findIndex(({ id }) => {
                    return id === path[1]
                  })
                  toChange[index] = {
                    ...toChange[index],
                    newStuff: 'some new data',
                  }
                } else {
                  toChange.newStuff = 'some new data'
                }
                stateWithChange[key] = toChange
              }
              const paths = computeNewPaths(hamletKeyed, stateWithChange, wiredSelectors)
              const pathsIntendedToChange = pathIndicesToChange.map((index) => {
                return allPaths[index]
              })
              expect(paths.length).toEqual(pathsIntendedToChange.length)
              expect(
                paths.map(({ path }) => {
                  return path
                })
              ).toEqual(expect.arrayContaining(pathsIntendedToChange))
            }
          )
        )
      })
    })
    describe('given that the file key changed', () => {
      describe('and we are not the owner of the file', () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          project: {
            selectedFile: {
              permission: 'collaborator',
            },
            fileURL: 'plottr://123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        const withStateChanged = {
          ...hamletWithSelectedFile,
          file: {
            ...hamletWithSelectedFile.file,
            new: 'All new.  Today only.',
          },
        }
        it('should not produce the file path', () => {
          const paths = computeNewPaths(hamletKeyed, withStateChanged, wiredSelectors)
          expect(paths.length).toEqual(0)
        })
      })
      describe('and we are the owner of the file', () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          project: {
            selectedFile: {
              permission: 'owner',
            },
            fileURL: 'plottr://123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        const withStateChanged = {
          ...hamletWithSelectedFile,
          file: {
            ...hamletWithSelectedFile.file,
            new: 'All new.  Today only.',
          },
        }
        it('should produce the file path', () => {
          const paths = computeNewPaths(hamletKeyed, withStateChanged, wiredSelectors)
          expect(
            paths.map(({ path }) => {
              return path
            })
          ).toEqual([['file']])
        })
      })
    })
    describe('given that the project key changes', () => {
      const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
      const withStateChanged = {
        ...hamletWithSelectedFile,
        project: {
          ...hamletWithSelectedFile.project,
          new: 'All new.  Today only.',
        },
      }
      it('should not compute that path because it is a system key', () => {
        const paths = computeNewPaths(hamletKeyed, withStateChanged, wiredSelectors)
        expect(
          paths.map(({ path }) => {
            return path
          })
        ).toEqual([])
      })
    })
  })
})

const secondArg = (...args) => args[1]

describe('sync', () => {
  const wiredSync = sync(identity)
  describe('given a file', () => {
    describe('with permission set to collaborator', () => {
      const hamletWithSelectedFile = {
        ...hamlet,
        project: {
          selectedFile: {
            permission: 'collaborator',
          },
          fileURL: 'plottr://123e',
          userNameSearchResults: [],
          fileLoaded: false,
          isLoading: false,
          isOffline: false,
          resuming: false,
          checkingOfflineDrift: false,
          overwritingCloudWithBackup: false,
          showResumeMessageDialog: false,
          backingUpOfflineFile: false,
          unsavedChanges: false,
        },
      }
      const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
      describe("and a path of ['file']", () => {
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
    })
    describe('with permission set to owner', () => {
      const hamletWithSelectedFile = {
        ...hamlet,
        file: {
          ...hamlet.file,
          id: '123e',
        },
        client: {
          userId: 'dummy-id',
          clientId: '11233222',
          emailAddress: null,
          hasOnboarded: null,
          hasPro: null,
          isOnWeb: null,
          currentAppState: null,
        },
        project: {
          selectedFile: {
            permission: 'owner',
            id: '123e',
          },
          fileURL: 'plottr://123e',
          userNameSearchResults: [],
          fileLoaded: false,
          isLoading: false,
          isOffline: false,
          resuming: false,
          checkingOfflineDrift: false,
          overwritingCloudWithBackup: false,
          showResumeMessageDialog: false,
          backingUpOfflineFile: false,
          unsavedChanges: false,
        },
      }
      const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
      describe("and a path of ['file']", () => {
        it('should call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeTruthy()
          expect(patchCalls.length).toEqual(1)
          expect(patchCalls).toEqual([
            [
              'file',
              '123e',
              {
                appliedMigrations: [
                  'm2020_8_28',
                  'm2020_11_16',
                  'm2021_1_15',
                  'm2021_2_4',
                  'm2021_2_8',
                  'm2021_4_13',
                  'm2021_6_9',
                  'm2021_8_1',
                  'm2022_5_17_1',
                  'm2022_5_17',
                  '*m2023_1_7',
                  '*m2023_3_29',
                  '*m2023_8_15',
                ],
                dirty: true,
                fileName: '/Users/ryanzee/Downloads/Hamlet.pltr',
                id: '123e',
                initialVersion: '2020.7.30',
                isCloudFile: false,
                loaded: true,
                version: '2023.8.21-alpha.3',
                versionStamp: 'f3939b64-7bd4-4790-bf06-c270d5204ca5',
              },
              '11233222',
            ],
          ])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe('given an action with type FILE_LOADED, RECORD_LAST_ACTION, PERMISSION_ERROR, or CLEAR_ERROR', () => {
        it('should not synchronise', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const actionOne = {
            type: 'FILE_LOADED',
          }

          const synchronisedOne = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            actionOne,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronisedOne).toBeFalsy()

          const actionTwo = {
            type: 'RECORD_LAST_ACTION',
          }
          const synchronisedTwo = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            actionTwo,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronisedTwo).toBeFalsy()

          const actionThree = {
            type: 'RECORD_LAST_ACTION',
          }
          const synchronisedThree = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            actionThree,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronisedThree).toBeFalsy()

          const actionFour = {
            type: 'PERMISSION_ERROR',
          }
          const synchronisedFour = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            actionFour,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronisedFour).toBeFalsy()

          const actionFive = {
            type: 'PERMISSION_ERROR',
          }
          const synchronisedFive = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            actionFive,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronisedFive).toBeFalsy()

          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe('given that the action indicates we are patching', () => {
        it('should not call patch or delete nor should it dispatch to redux', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
            patching: true,
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe("and we're not dealing with a cloud file", () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: null,
            clientId: '11233222',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'device:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe("and we're offline", () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: null,
            clientId: '11233222',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: true,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe("and we're resuming", () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: null,
            clientId: '11233222',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: true,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe("and there's no fileId", () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: null,
          },
          client: {
            userId: null,
            clientId: '11233222',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe("and there's no clientId", () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: null,
            clientId: null,
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe('and the selected file id does not match the file id', () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: null,
            clientId: '123323',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123ezzz',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
      describe("and we don't supply a previous state", () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: null,
            clientId: '123323',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        it('should not call patch', () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            null,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          expect(synchronised).toBeFalsy()
          expect(patchCalls.length).toEqual(0)
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(storeDispatchCalls.length).toEqual(0)
        })
      })
    })
    describe('given multiple instructions', () => {
      const hamletWithSelectedFile = {
        ...hamlet,
        file: {
          ...hamlet.file,
          id: '123e',
        },
        client: {
          userId: 'dummy-id',
          clientId: '123323',
          emailAddress: null,
          hasOnboarded: null,
          hasPro: null,
          isOnWeb: null,
          currentAppState: null,
        },
        project: {
          selectedFile: {
            permission: 'owner',
            id: '123e',
          },
          fileURL: 'plottr:///tmp/123e',
          userNameSearchResults: [],
          fileLoaded: false,
          isLoading: false,
          isOffline: false,
          resuming: false,
          checkingOfflineDrift: false,
          overwritingCloudWithBackup: false,
          showResumeMessageDialog: false,
          backingUpOfflineFile: false,
          unsavedChanges: false,
        },
      }
      const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
      it('should carry them all out', () => {
        let patchCalls = []
        const patch = (...args) => {
          patchCalls.push(args)
          return Promise.resolve()
        }
        let deleteSingleCalls = []
        const deleteSingle = (...args) => {
          deleteSingleCalls.push(args)
          return Promise.resolve()
        }
        let storeDispatchCalls = []
        const store = {
          dispatch: (...args) => {
            storeDispatchCalls.push(args)
          },
        }
        const action = {
          type: 'EDIT_FILENAME',
          newName: 'hi there!',
        }
        const synchronised = wiredSync(
          hamletKeyed,
          hamletWithSelectedFile,
          patch,
          deleteSingle,
          secondArg,
          store,
          action,
          [
            { path: ['file'], change: 'UPDATED', index: null },
            { path: ['categories'], change: 'UPDATED', index: null },
            { path: ['ui'], change: 'UPDATED', index: null },
            { path: ['cards', 2], change: 'UPDATED', index: 25 },
          ]
        )
        expect(synchronised).toBeTruthy()
        expect(patchCalls).toEqual([
          [
            'file',
            '123e',
            {
              appliedMigrations: [
                'm2020_8_28',
                'm2020_11_16',
                'm2021_1_15',
                'm2021_2_4',
                'm2021_2_8',
                'm2021_4_13',
                'm2021_6_9',
                'm2021_8_1',
                'm2022_5_17_1',
                'm2022_5_17',
                '*m2023_1_7',
                '*m2023_3_29',
                '*m2023_8_15',
              ],
              dirty: true,
              fileName: '/Users/ryanzee/Downloads/Hamlet.pltr',
              id: '123e',
              initialVersion: '2020.7.30',
              isCloudFile: false,
              loaded: true,
              version: '2023.8.21-alpha.3',
              versionStamp: 'f3939b64-7bd4-4790-bf06-c270d5204ca5',
            },
            '123323',
          ],
          [
            'categories',
            '123e',
            {
              characters: [
                {
                  id: 1,
                  name: 'Main',
                  position: 0,
                },
                {
                  id: 2,
                  name: 'Supporting',
                  position: 1,
                },
                {
                  id: 3,
                  name: 'Other',
                  position: 2,
                },
              ],
              notes: [],
              places: [],
              tags: [],
            },
            '123323',
          ],
          [
            'ui',
            '123e',
            {
              actConfigModal: {
                open: false,
              },
              attributeTabs: {
                characters: 'all',
              },
              bookDialog: {
                bookId: null,
                isOpen: false,
              },
              cardDialog: {
                beatId: null,
                cardId: null,
                isOpen: false,
                lineId: null,
              },
              characterFilter: {
                'Attended Wittenberg': [],
                'Characters That Die': [],
                'Fatal Flaws': [],
                Gender: [],
                'How They Die': [],
                'Inner Conflict': [],
                Role: [],
                'Royal Family Member': [],
                book: [],
                category: [],
                tag: [],
              },
              characterSort: 'name~asc',
              characterTab: {
                selectedCharacter: 2,
              },
              collaborators: {},
              currentTimeline: 1,
              currentView: 'timeline',
              customAttributeOrder: {
                characters: [
                  {
                    name: 'Role',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Motivation',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Gender',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Fatal Flaws',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Inner Conflict',
                    type: 'customAttributes',
                  },
                  {
                    name: 'How They Die',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Attended Wittenberg',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Royal Family Member',
                    type: 'customAttributes',
                  },
                  {
                    name: 'Characters That Die',
                    type: 'customAttributes',
                  },
                ],
              },
              darkMode: false,
              llmGenerateModal: {
                busy: false,
                kind: 'scenes',
                open: true,
                payload: {
                  attributes: {},
                  bookMetadata: {
                    genre: 'Things',
                    premise: 'Stuff',
                    theme: 'Blah',
                    title: 'Hamlet',
                  },
                  context: [],
                  kind: 'scenes',
                  templates: {},
                  title: 'Act 2',
                },
                step: 1,
              },
              noteFilter: null,
              noteSort: 'title~asc',
              noteTab: {
                attributesDialogOpen: false,
                categoriesDialogOpen: false,
                editingSelected: true,
                filterVisible: false,
                focus: [
                  {
                    path: ['note', 4, 'content'],
                    selection: {
                      direction: 'forward',
                      end: 105,
                      start: 99,
                    },
                  },
                ],
                selectedNote: 4,
                sortVisible: false,
              },
              orientation: 'horizontal',
              outlineFilter: null,
              outlineScrollPosition: 11022,
              outlineTab: {
                cardEditor: {
                  editing: null,
                },
                focus: [
                  {
                    path: ['card', 25, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 16,
                      start: 8,
                    },
                  },
                  {
                    path: ['card', 1, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 58,
                      start: 50,
                    },
                  },
                  {
                    path: ['card', 2, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 904,
                      start: 898,
                    },
                  },
                  {
                    path: ['card', 15, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 179,
                      start: 173,
                    },
                  },
                  {
                    path: ['card', 21, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 276,
                      start: 270,
                    },
                  },
                ],
                selectedCard: null,
              },
              placeFilter: null,
              placeSort: 'name~asc',
              placeTab: {
                attributeDialogOpen: false,
                categoriesOpen: false,
                editingSelected: true,
                filterVisible: false,
                focus: [
                  {
                    path: ['place', 1, 'notes'],
                    selection: {
                      direction: 'forward',
                      end: 50,
                      start: 44,
                    },
                  },
                  {
                    path: ['place', 1, 'name'],
                    selection: {
                      direction: 'forward',
                      end: 8,
                      start: 0,
                    },
                  },
                ],
                selectedPlace: 1,
                sortVisible: false,
              },
              projectTab: {
                focus: [
                  {
                    path: ['book', 1, 'title'],
                    selection: {
                      direction: 'forward',
                      end: 6,
                      start: 0,
                    },
                  },
                  {
                    path: ['name'],
                    selection: {
                      direction: 'forward',
                      end: 6,
                      start: 0,
                    },
                  },
                ],
              },
              resturctureTimelineModal: {
                open: false,
              },
              searchDialog: {
                currentHitIndex: 0,
                hitsToReplace: [],
                isOpen: false,
                replacement: '',
                replacing: false,
                scanning: false,
                term: 'story.',
              },
              searchTerms: {
                characters: null,
                notes: null,
                outline: null,
                places: null,
                tags: null,
                timeline: null,
              },
              tagTab: {
                selectedTag: 1,
              },
              templateModal: {
                expanded: false,
              },
              timeline: {
                focus: [
                  {
                    path: ['card', 9, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 710,
                      start: 704,
                    },
                  },
                  {
                    path: ['card', 25, 'description'],
                    selection: {
                      direction: 'forward',
                      end: 347,
                      start: 341,
                    },
                  },
                  {
                    path: ['card', 25, 'title'],
                    selection: {
                      direction: 'forward',
                      end: 35,
                      start: 29,
                    },
                  },
                ],
                size: 'large',
              },
              timelineFilter: {
                character: [],
                place: [],
                tag: [],
              },
              timelineIsExpanded: true,
              timelineScrollPosition: {
                x: 0,
                y: 0,
              },
            },
            '123323',
          ],
          [
            'cards',
            '123e',
            {
              beatId: 2,
              bookId: null,
              characters: [2, 3, 1, 4, 7, 12],
              description: [
                {
                  children: [
                    {
                      text: "The following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. ",
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: "He also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.",
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: "Claudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. ",
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: 'Hamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.',
                    },
                  ],
                  type: 'paragraph',
                },
              ],
              fromTemplateId: null,
              id: 2,
              imageId: null,
              lineId: 2,
              places: [1],
              position: 0,
              positionInChapter: 0,
              positionWithinLine: 1,
              seriesLineId: null,
              tags: [13, 1, 12, 7, 6],
              templates: [],
              title: 'Claudius makes an announcement & Hamlet laments',
            },
            '123323',
            2,
          ],
        ])
        expect(deleteSingleCalls.length).toEqual(0)
        expect(storeDispatchCalls.length).toEqual(0)
      })
    })
    describe('given an instruction to delete the file', () => {
      const hamletWithSelectedFile = {
        ...hamlet,
        file: {
          ...hamlet.file,
          id: '123e',
        },
        client: {
          userId: 'dummy-id',
          clientId: '123323',
          emailAddress: null,
          hasOnboarded: null,
          hasPro: null,
          isOnWeb: null,
          currentAppState: null,
        },
        project: {
          selectedFile: {
            permission: 'owner',
            id: '123e',
          },
          fileURL: 'plottr:///tmp/123e',
          userNameSearchResults: [],
          fileLoaded: false,
          isLoading: false,
          isOffline: false,
          resuming: false,
          checkingOfflineDrift: false,
          overwritingCloudWithBackup: false,
          showResumeMessageDialog: false,
          backingUpOfflineFile: false,
          unsavedChanges: false,
        },
      }
      const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
      it('patch it instead of deleting it', () => {
        let patchCalls = []
        const patch = (...args) => {
          patchCalls.push(args)
          return Promise.resolve()
        }
        let deleteSingleCalls = []
        const deleteSingle = (...args) => {
          deleteSingleCalls.push(args)
          return Promise.resolve()
        }
        let storeDispatchCalls = []
        const store = {
          dispatch: (...args) => {
            storeDispatchCalls.push(args)
          },
        }
        const action = {
          type: 'EDIT_FILENAME',
          newName: 'hi there!',
        }
        const synchronised = wiredSync(
          hamletKeyed,
          hamletWithSelectedFile,
          patch,
          deleteSingle,
          secondArg,
          store,
          action,
          [{ path: ['file'], change: 'DELETED', index: null }]
        )
        expect(synchronised).toBeTruthy()
        expect(patchCalls).toEqual([
          [
            'file',
            '123e',
            {
              appliedMigrations: [
                'm2020_8_28',
                'm2020_11_16',
                'm2021_1_15',
                'm2021_2_4',
                'm2021_2_8',
                'm2021_4_13',
                'm2021_6_9',
                'm2021_8_1',
                'm2022_5_17_1',
                'm2022_5_17',
                '*m2023_1_7',
                '*m2023_3_29',
                '*m2023_8_15',
              ],
              dirty: true,
              fileName: '/Users/ryanzee/Downloads/Hamlet.pltr',
              id: '123e',
              initialVersion: '2020.7.30',
              isCloudFile: false,
              loaded: true,
              version: '2023.8.21-alpha.3',
              versionStamp: 'f3939b64-7bd4-4790-bf06-c270d5204ca5',
            },
            '123323',
          ],
        ])
        expect(deleteSingleCalls.length).toEqual(0)
        expect(storeDispatchCalls.length).toEqual(0)
      })
    })
    describe('given an instruction to delete a card', () => {
      const hamletWithSelectedFile = {
        ...hamlet,
        file: {
          ...hamlet.file,
          id: '123e',
        },
        client: {
          userId: 'dummy-id',
          clientId: '123323',
          emailAddress: null,
          hasOnboarded: null,
          hasPro: null,
          isOnWeb: null,
          currentAppState: null,
        },
        project: {
          selectedFile: {
            permission: 'owner',
            id: '123e',
          },
          fileURL: 'plottr:///tmp/123e',
          userNameSearchResults: [],
          fileLoaded: false,
          isLoading: false,
          isOffline: false,
          resuming: false,
          checkingOfflineDrift: false,
          overwritingCloudWithBackup: false,
          showResumeMessageDialog: false,
          backingUpOfflineFile: false,
          unsavedChanges: false,
        },
      }
      const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
      it('should delete that card', () => {
        let patchCalls = []
        const patch = (...args) => {
          patchCalls.push(args)
          return Promise.resolve()
        }
        let deleteSingleCalls = []
        const deleteSingle = (...args) => {
          deleteSingleCalls.push(args)
          return Promise.resolve()
        }
        let storeDispatchCalls = []
        const store = {
          dispatch: (...args) => {
            storeDispatchCalls.push(args)
          },
        }
        const action = {
          type: 'EDIT_FILENAME',
          newName: 'hi there!',
        }
        const synchronised = wiredSync(
          hamletKeyed,
          hamletWithSelectedFile,
          patch,
          deleteSingle,
          secondArg,
          store,
          action,
          [{ path: ['cards', 2], change: 'DELETED', index: 25 }]
        )
        expect(synchronised).toBeTruthy()
        expect(patchCalls).toEqual([])
        expect(deleteSingleCalls.length).toEqual(1)
        expect(deleteSingleCalls).toEqual([
          [
            'cards',
            '123e',
            {
              beatId: 2,
              bookId: null,
              characters: [2, 3, 1, 4, 7, 12],
              description: [
                {
                  children: [
                    {
                      text: "The following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. ",
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: "He also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.",
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: "Claudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. ",
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: 'Hamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.',
                    },
                  ],
                  type: 'paragraph',
                },
              ],
              fromTemplateId: null,
              id: 2,
              imageId: null,
              lineId: 2,
              places: [1],
              position: 0,
              positionInChapter: 0,
              positionWithinLine: 1,
              seriesLineId: null,
              tags: [13, 1, 12, 7, 6],
              templates: [],
              title: 'Claudius makes an announcement & Hamlet laments',
            },
            '123323',
            2,
          ],
        ])
        expect(storeDispatchCalls.length).toEqual(0)
      })
    })
    describe('given an instruction to delete a card', () => {
      describe('and a delete function that errors out', () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: 'dummy-id',
            clientId: '123323',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should should dispatch an error', async () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.resolve()
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.reject({
              code: 'permission-denied',
            })
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['cards', 2], change: 'DELETED', index: 25 }]
          )
          await new Promise((resolve) => setTimeout(resolve, 100))
          expect(synchronised).toBeTruthy()
          expect(patchCalls).toEqual([])
          expect(deleteSingleCalls.length).toEqual(1)
          expect(deleteSingleCalls).toEqual([
            [
              'cards',
              '123e',
              {
                beatId: 2,
                bookId: null,
                characters: [2, 3, 1, 4, 7, 12],
                description: [
                  {
                    children: [
                      {
                        text: "The following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. ",
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: "He also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.",
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: "Claudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. ",
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Hamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                fromTemplateId: null,
                id: 2,
                imageId: null,
                lineId: 2,
                places: [1],
                position: 0,
                positionInChapter: 0,
                positionWithinLine: 1,
                seriesLineId: null,
                tags: [13, 1, 12, 7, 6],
                templates: [],
                title: 'Claudius makes an announcement & Hamlet laments',
              },
              '123323',
              2,
            ],
          ])
          expect(storeDispatchCalls.length).toEqual(1)
          expect(storeDispatchCalls).toEqual([
            [
              {
                action: {
                  newName: 'hi there!',
                  type: 'EDIT_FILENAME',
                },
                error: 'permission-denied',
                storeKey: 'cards',
                type: 'PERMISSION_ERROR',
              },
            ],
          ])
        })
      })
    })
    describe('given an instruction to patch the file', () => {
      describe('and a patch function that errors out', () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: 'dummy-id',
            clientId: '123323',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should should dispatch an error', async () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.reject({
              code: 'permission-denied',
            })
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['file'], change: 'UPDATED', index: null }]
          )
          await new Promise((resolve) => setTimeout(resolve, 100))
          expect(synchronised).toBeTruthy()
          expect(patchCalls).toEqual([
            [
              'file',
              '123e',
              {
                appliedMigrations: [
                  'm2020_8_28',
                  'm2020_11_16',
                  'm2021_1_15',
                  'm2021_2_4',
                  'm2021_2_8',
                  'm2021_4_13',
                  'm2021_6_9',
                  'm2021_8_1',
                  'm2022_5_17_1',
                  'm2022_5_17',
                  '*m2023_1_7',
                  '*m2023_3_29',
                  '*m2023_8_15',
                ],
                dirty: true,
                fileName: '/Users/ryanzee/Downloads/Hamlet.pltr',
                id: '123e',
                initialVersion: '2020.7.30',
                isCloudFile: false,
                loaded: true,
                version: '2023.8.21-alpha.3',
                versionStamp: 'f3939b64-7bd4-4790-bf06-c270d5204ca5',
              },
              '123323',
            ],
          ])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(deleteSingleCalls).toEqual([])
          expect(storeDispatchCalls.length).toEqual(1)
          expect(storeDispatchCalls).toEqual([
            [
              {
                action: {
                  newName: 'hi there!',
                  type: 'EDIT_FILENAME',
                },
                error: 'permission-denied',
                storeKey: 'file',
                type: 'PERMISSION_ERROR',
              },
            ],
          ])
        })
      })
    })
    describe('given an instruction to patch a card', () => {
      describe('and a patch function that errors out', () => {
        const hamletWithSelectedFile = {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
          client: {
            userId: 'dummy-id',
            clientId: '123323',
            emailAddress: null,
            hasOnboarded: null,
            hasPro: null,
            isOnWeb: null,
            currentAppState: null,
          },
          project: {
            selectedFile: {
              permission: 'owner',
              id: '123e',
            },
            fileURL: 'plottr:///tmp/123e',
            userNameSearchResults: [],
            fileLoaded: false,
            isLoading: false,
            isOffline: false,
            resuming: false,
            checkingOfflineDrift: false,
            overwritingCloudWithBackup: false,
            showResumeMessageDialog: false,
            backingUpOfflineFile: false,
            unsavedChanges: false,
          },
        }
        const hamletKeyed = keyFlatArraysById(hamletWithSelectedFile)
        it('should should dispatch an error', async () => {
          let patchCalls = []
          const patch = (...args) => {
            patchCalls.push(args)
            return Promise.reject({
              code: 'permission-denied',
            })
          }
          let deleteSingleCalls = []
          const deleteSingle = (...args) => {
            deleteSingleCalls.push(args)
            return Promise.resolve()
          }
          let storeDispatchCalls = []
          const store = {
            dispatch: (...args) => {
              storeDispatchCalls.push(args)
            },
          }
          const action = {
            type: 'EDIT_FILENAME',
            newName: 'hi there!',
          }
          const synchronised = wiredSync(
            hamletKeyed,
            hamletWithSelectedFile,
            patch,
            deleteSingle,
            secondArg,
            store,
            action,
            [{ path: ['cards', 2], change: 'UPDATED', index: 25 }]
          )
          await new Promise((resolve) => setTimeout(resolve, 100))
          expect(synchronised).toBeTruthy()
          expect(patchCalls).toEqual([
            [
              'cards',
              '123e',
              {
                beatId: 2,
                bookId: null,
                characters: [2, 3, 1, 4, 7, 12],
                description: [
                  {
                    children: [
                      {
                        text: "The following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. ",
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: "He also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.",
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: "Claudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. ",
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: 'Hamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                fromTemplateId: null,
                id: 2,
                imageId: null,
                lineId: 2,
                places: [1],
                position: 0,
                positionInChapter: 0,
                positionWithinLine: 1,
                seriesLineId: null,
                tags: [13, 1, 12, 7, 6],
                templates: [],
                title: 'Claudius makes an announcement & Hamlet laments',
              },
              '123323',
              2,
            ],
          ])
          expect(deleteSingleCalls.length).toEqual(0)
          expect(deleteSingleCalls).toEqual([])
          expect(storeDispatchCalls.length).toEqual(1)
          expect(storeDispatchCalls).toEqual([
            [
              {
                action: {
                  newName: 'hi there!',
                  type: 'EDIT_FILENAME',
                },
                error: 'permission-denied',
                storeKey: 'cards',
                type: 'PERMISSION_ERROR',
              },
            ],
          ])
        })
      })
    })
  })
})

const wiredUpActions = actions(pltrAdaptor)
const { loadFile } = wiredUpActions.ui
const { editCard, deleteCard } = wiredUpActions.card
const { setClientId, setUserId } = wiredUpActions.client
const { selectFile } = wiredUpActions.project
const { editPlace, deletePlace } = wiredUpActions.place
const { editNote, deleteNote } = wiredUpActions.note
const { editCharacterName, deleteCharacter } = wiredUpActions.character
const EMPTY_FILE = emptyFile('Test file')
const initialStore = () => {
  const store = configureStore()
  store.dispatch(
    loadFile(
      'Test file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://tmp/dummy-url-test-file.pltr'
    )
  )
  return store
}

describe('externalSync', () => {
  describe('given a series of edits to a file', () => {
    const store = initialStore()
    store.dispatch(
      loadFile(
        'Hamlet',
        false,
        {
          ...hamlet,
          file: {
            ...hamlet.file,
            id: '123e',
          },
        },
        hamlet.file.version,
        'plottr://123e'
      )
    )
    store.dispatch(setClientId('123323'))
    store.dispatch(
      selectFile({
        permission: 'owner',
        id: '123e',
      })
    )
    store.dispatch(setUserId('dummy-id'))
    const sync = externalSync(pltrAdaptor)
    let patchCalls = []
    const patch = (...args) => {
      if (args[0] === 'file') {
        patchCalls.push([...args.slice(0, 2), omit(args[2], 'versionStamp'), ...args.slice(3)])
        return Promise.resolve()
      } else if (args[0] === 'notes') {
        patchCalls.push([...args.slice(0, 2), omit(args[2], 'lastEdited'), ...args.slice(3)])
        return Promise.resolve()
      } else {
        patchCalls.push(args)
        return Promise.resolve()
      }
    }
    let deleteSingleCalls = []
    const deleteSingle = (...args) => {
      deleteSingleCalls.push(args)
      return Promise.resolve()
    }
    const next = (action) => store.dispatch(action)
    it('should dispatch updates for the things that changed', () => {
      // Action 1: edit card 1
      sync(patch, deleteSingle, secondArg)(store)(next)(
        editCard(1, 'new title', 'new description', [], {})
      )
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            shareRecords: [],
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [13, 5, 9, 14, 16],
            description: 'new description',
            fromTemplateId: null,
            id: 1,
            imageId: null,
            lineId: 2,
            places: [1],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [13, 6, 1],
            templates: [],
            title: 'new title',
          },
          '123323',
          1,
        ],
      ])
      expect(deleteSingleCalls).toEqual([])

      // Clean up
      patchCalls.pop()
      patchCalls.pop()

      // Action 2: edit card 2
      sync(patch, deleteSingle, secondArg)(store)(next)(
        editCard(2, 'Card 2 new title', 'Card 2 new description', [], {})
      )
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [2, 3, 1, 4, 7, 12],
            description: 'Card 2 new description',
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 2,
            places: [1],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [13, 1, 12, 7, 6],
            templates: [],
            title: 'Card 2 new title',
          },
          '123323',
          2,
        ],
      ])
      expect(deleteSingleCalls).toEqual([])

      // Clean up
      patchCalls.pop()
      patchCalls.pop()

      // Action 3: edit place 1
      sync(patch, deleteSingle, secondArg)(store)(next)(
        editPlace(1, { name: "Elsinore Castle 2 -- it's better!" })
      )
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'places',
          '123e',
          {
            bookIds: [1],
            cards: [
              1, 2, 3, 4, 5, 6, 7, 9, 10, 15, 16, 17, 19, 20, 21, 25, 12, 8, 14, 11, 24, 13, 22,
            ],
            color: null,
            description: 'The Denmark palace',
            id: 1,
            imageId: '9',
            name: "Elsinore Castle 2 -- it's better!",
            noteIds: [3, 4],
            notes: [
              {
                children: [
                  {
                    text: 'Where most of the action takes place in the story.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [],
            templates: [],
          },
          '123323',
          1,
        ],
      ])

      // Clean up
      patchCalls.pop()
      patchCalls.pop()

      // Action 3: edit note 4
      sync(patch, deleteSingle, secondArg)(store)(next)(
        editNote(4, { title: "It's depressing..." })
      )
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [],
            characters: [1, 2, 3, 4, 6, 7],
            content: [
              {
                children: [
                  {
                    text: 'This infographic, which ',
                  },
                  {
                    children: [
                      {
                        text: 'can be found here',
                      },
                    ],
                    type: 'link',
                    url: '#',
                  },
                  {
                    text: ', maps out the deaths in Hamlet, where they happen in the story, and their meaning. It also unpacks themes, character motivations, and more.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: 4,
            imageId: '17',
            places: [1, 5],
            tags: [7, 8, 6, 10, 12],
            templates: [],
            title: "It's depressing...",
          },
          '123323',
          4,
        ],
      ])

      // Clean up
      patchCalls.pop()
      patchCalls.pop()

      // Action 4: edit character 1
      sync(patch, deleteSingle, secondArg)(store)(next)(editCharacterName(2, 'Cloud-eee-us'))
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'ui',
          '123e',
          {
            actConfigModal: {
              open: false,
            },
            attributeTabs: {
              characters: 'all',
            },
            bookDialog: {
              bookId: null,
              isOpen: false,
            },
            cardDialog: {
              beatId: null,
              cardId: null,
              isOpen: false,
              lineId: null,
            },
            characterFilter: {
              'Attended Wittenberg': [],
              'Characters That Die': [],
              'Fatal Flaws': [],
              Gender: [],
              'How They Die': [],
              'Inner Conflict': [],
              Role: [],
              'Royal Family Member': [],
              book: [],
              category: [],
              tag: [],
            },
            characterSort: 'name~asc',
            characterTab: {
              focus: [
                {
                  path: ['character', 2, 'name'],
                  selection: undefined,
                },
              ],
              selectedCharacter: 2,
            },
            collaborators: {},
            currentTimeline: 1,
            currentView: 'timeline',
            customAttributeOrder: {
              characters: [
                {
                  name: 'Role',
                  type: 'customAttributes',
                },
                {
                  name: 'Motivation',
                  type: 'customAttributes',
                },
                {
                  name: 'Gender',
                  type: 'customAttributes',
                },
                {
                  name: 'Fatal Flaws',
                  type: 'customAttributes',
                },
                {
                  name: 'Inner Conflict',
                  type: 'customAttributes',
                },
                {
                  name: 'How They Die',
                  type: 'customAttributes',
                },
                {
                  name: 'Attended Wittenberg',
                  type: 'customAttributes',
                },
                {
                  name: 'Royal Family Member',
                  type: 'customAttributes',
                },
                {
                  name: 'Characters That Die',
                  type: 'customAttributes',
                },
              ],
            },
            darkMode: false,
            llmGenerateModal: {
              busy: false,
              kind: 'scenes',
              open: true,
              payload: {
                attributes: {},
                bookMetadata: {
                  genre: 'Things',
                  premise: 'Stuff',
                  theme: 'Blah',
                  title: 'Hamlet',
                },
                context: [],
                kind: 'scenes',
                templates: {},
                title: 'Act 2',
              },
              step: 1,
            },
            noteFilter: null,
            noteSort: 'title~asc',
            noteTab: {
              attributesDialogOpen: false,
              categoriesDialogOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['note', 4, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 105,
                    start: 99,
                  },
                },
              ],
              selectedNote: 4,
              sortVisible: false,
            },
            orientation: 'horizontal',
            outlineFilter: null,
            outlineScrollPosition: 11022,
            outlineTab: {
              cardEditor: {
                editing: null,
              },
              focus: [
                {
                  path: ['card', 25, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 16,
                    start: 8,
                  },
                },
                {
                  path: ['card', 1, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 58,
                    start: 50,
                  },
                },
                {
                  path: ['card', 2, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 904,
                    start: 898,
                  },
                },
                {
                  path: ['card', 15, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 179,
                    start: 173,
                  },
                },
                {
                  path: ['card', 21, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 276,
                    start: 270,
                  },
                },
              ],
              selectedCard: null,
            },
            placeFilter: null,
            placeSort: 'name~asc',
            placeTab: {
              attributeDialogOpen: false,
              categoriesOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['place', 1, 'notes'],
                  selection: {
                    direction: 'forward',
                    end: 50,
                    start: 44,
                  },
                },
                {
                  path: ['place', 1, 'name'],
                  selection: {
                    direction: 'forward',
                    end: 8,
                    start: 0,
                  },
                },
              ],
              selectedPlace: 1,
              sortVisible: false,
            },
            projectTab: {
              focus: [
                {
                  path: ['book', 1, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 0,
                  },
                },
                {
                  path: ['name'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 0,
                  },
                },
              ],
            },
            resturctureTimelineModal: {
              open: false,
            },
            searchDialog: {
              currentHitIndex: 0,
              hitsToReplace: [],
              isOpen: false,
              replacement: '',
              replacing: false,
              scanning: false,
              term: 'story.',
            },
            searchTerms: {
              characters: null,
              notes: null,
              outline: null,
              places: null,
              tags: null,
              timeline: null,
            },
            tagTab: {
              selectedTag: 1,
            },
            templateModal: {
              expanded: false,
            },
            timeline: {
              focus: [
                {
                  path: ['card', 9, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 710,
                    start: 704,
                  },
                },
                {
                  path: ['card', 25, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 347,
                    start: 341,
                  },
                },
                {
                  path: ['card', 25, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 35,
                    start: 29,
                  },
                },
              ],
              size: 'large',
            },
            timelineFilter: {
              character: [],
              place: [],
              tag: [],
            },
            timelineIsExpanded: true,
            timelineScrollPosition: {
              x: 0,
              y: 0,
            },
          },
          '123323',
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Power hungry',
            Gender: 'Male',
            'How They Die': 'Killed with a poisonous sword & goblet by Hamlet',
            'Inner Conflict': "Regrets over marrying his brother's wife",
            Motivation: [
              {
                children: [
                  {
                    text: 'He wants to be ruler of Denmark so much that he would do anything to get and keep that position',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Antagonist',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [2, 7, 8, 9, 10, 15, 17, 19, 21, 23, 25, 12, 11, 24, 13, 22],
            categoryId: '1',
            color: null,
            description: 'King of Denmark',
            id: 2,
            imageId: '4',
            name: 'Cloud-eee-us',
            noteIds: [3, 4],
            notes: [
              {
                children: [
                  {
                    text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [8, 1, 2, 3, 4, 5, 11, 12],
            templates: [],
          },
          '123323',
          2,
        ],
      ])

      // Clean up
      patchCalls.pop()
      patchCalls.pop()
      patchCalls.pop()

      // Deletes...

      // Action 5: edit card 2
      sync(patch, deleteSingle, secondArg)(store)(next)(deleteCard(2))
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'ui',
          '123e',
          {
            actConfigModal: {
              open: false,
            },
            attributeTabs: {
              characters: 'all',
            },
            bookDialog: {
              bookId: null,
              isOpen: false,
            },
            cardDialog: {
              activeTab: 1,
              beatId: null,
              cardId: null,
              deleting: false,
              isOpen: false,
              lineId: null,
              removeWhichTemplate: null,
              removing: false,
              showColorPicker: false,
              showTemplatePicker: false,
            },
            characterFilter: {
              'Attended Wittenberg': [],
              'Characters That Die': [],
              'Fatal Flaws': [],
              Gender: [],
              'How They Die': [],
              'Inner Conflict': [],
              Role: [],
              'Royal Family Member': [],
              book: [],
              category: [],
              tag: [],
            },
            characterSort: 'name~asc',
            characterTab: {
              focus: [
                {
                  path: ['character', 2, 'name'],
                  selection: undefined,
                },
              ],
              selectedCharacter: 2,
            },
            collaborators: {},
            currentTimeline: 1,
            currentView: 'timeline',
            customAttributeOrder: {
              characters: [
                {
                  name: 'Role',
                  type: 'customAttributes',
                },
                {
                  name: 'Motivation',
                  type: 'customAttributes',
                },
                {
                  name: 'Gender',
                  type: 'customAttributes',
                },
                {
                  name: 'Fatal Flaws',
                  type: 'customAttributes',
                },
                {
                  name: 'Inner Conflict',
                  type: 'customAttributes',
                },
                {
                  name: 'How They Die',
                  type: 'customAttributes',
                },
                {
                  name: 'Attended Wittenberg',
                  type: 'customAttributes',
                },
                {
                  name: 'Royal Family Member',
                  type: 'customAttributes',
                },
                {
                  name: 'Characters That Die',
                  type: 'customAttributes',
                },
              ],
            },
            darkMode: false,
            llmGenerateModal: {
              busy: false,
              kind: 'scenes',
              open: true,
              payload: {
                attributes: {},
                bookMetadata: {
                  genre: 'Things',
                  premise: 'Stuff',
                  theme: 'Blah',
                  title: 'Hamlet',
                },
                context: [],
                kind: 'scenes',
                templates: {},
                title: 'Act 2',
              },
              step: 1,
            },
            noteFilter: null,
            noteSort: 'title~asc',
            noteTab: {
              attributesDialogOpen: false,
              categoriesDialogOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['note', 4, 'content'],
                  selection: {
                    direction: 'forward',
                    end: 105,
                    start: 99,
                  },
                },
              ],
              selectedNote: 4,
              sortVisible: false,
            },
            orientation: 'horizontal',
            outlineFilter: null,
            outlineScrollPosition: 11022,
            outlineTab: {
              cardEditor: {
                editing: null,
              },
              focus: [
                {
                  path: ['card', 25, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 16,
                    start: 8,
                  },
                },
                {
                  path: ['card', 1, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 58,
                    start: 50,
                  },
                },
                {
                  path: ['card', 2, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 904,
                    start: 898,
                  },
                },
                {
                  path: ['card', 15, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 179,
                    start: 173,
                  },
                },
                {
                  path: ['card', 21, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 276,
                    start: 270,
                  },
                },
              ],
              selectedCard: null,
            },
            placeFilter: null,
            placeSort: 'name~asc',
            placeTab: {
              attributeDialogOpen: false,
              categoriesOpen: false,
              editingSelected: true,
              filterVisible: false,
              focus: [
                {
                  path: ['place', 1, 'notes'],
                  selection: {
                    direction: 'forward',
                    end: 50,
                    start: 44,
                  },
                },
                {
                  path: ['place', 1, 'name'],
                  selection: {
                    direction: 'forward',
                    end: 8,
                    start: 0,
                  },
                },
              ],
              selectedPlace: 1,
              sortVisible: false,
            },
            projectTab: {
              focus: [
                {
                  path: ['book', 1, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 0,
                  },
                },
                {
                  path: ['name'],
                  selection: {
                    direction: 'forward',
                    end: 6,
                    start: 0,
                  },
                },
              ],
            },
            resturctureTimelineModal: {
              open: false,
            },
            searchDialog: {
              currentHitIndex: 0,
              hitsToReplace: [],
              isOpen: false,
              replacement: '',
              replacing: false,
              scanning: false,
              term: 'story.',
            },
            searchTerms: {
              characters: null,
              notes: null,
              outline: null,
              places: null,
              tags: null,
              timeline: null,
            },
            tagTab: {
              selectedTag: 1,
            },
            templateModal: {
              expanded: false,
            },
            timeline: {
              focus: [
                {
                  path: ['card', 9, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 710,
                    start: 704,
                  },
                },
                {
                  path: ['card', 25, 'description'],
                  selection: {
                    direction: 'forward',
                    end: 347,
                    start: 341,
                  },
                },
                {
                  path: ['card', 25, 'title'],
                  selection: {
                    direction: 'forward',
                    end: 35,
                    start: 29,
                  },
                },
              ],
              size: 'large',
            },
            timelineFilter: {
              character: [],
              place: [],
              tag: [],
            },
            timelineIsExpanded: true,
            timelineScrollPosition: {
              x: 0,
              y: 0,
            },
          },
          '123323',
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'Yes',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Too melancholy, acts before thinking it through',
            Gender: 'Male',
            'How They Die': 'Cut with a poisoned sword in a duel with Laertes',
            'Inner Conflict': "Wants to take his own life AND get revenge for his father's murder",
            Motivation: [
              {
                children: [
                  {
                    text: "Hamlet seeks to get revenge for his father's death",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Protagonist',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [4, 5, 7, 8, 9, 10, 14, 16, 17, 18, 23, 25, 12, 11, 24, 13],
            categoryId: '1',
            color: null,
            description: 'Prince of Denmark',
            id: 1,
            imageId: '1',
            name: 'Hamlet',
            noteIds: [3, 4],
            notes: [
              {
                children: [
                  {
                    text: 'The title character, Hamlet is the 30 year old Prince of Denmark, nephew to King Claudius, and son of Queen Gertrude. He hates his uncle and resents his mother. Studied at the University of Wittenberg, he is a thoughtful and melancholy individual, but who often makes impulsive, rash decisions. ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [1, 2, 3, 4, 5, 7, 9, 10, 8],
            templates: [],
          },
          '123323',
          1,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Power hungry',
            Gender: 'Male',
            'How They Die': 'Killed with a poisonous sword & goblet by Hamlet',
            'Inner Conflict': "Regrets over marrying his brother's wife",
            Motivation: [
              {
                children: [
                  {
                    text: 'He wants to be ruler of Denmark so much that he would do anything to get and keep that position',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Antagonist',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [7, 8, 9, 10, 15, 17, 19, 21, 23, 25, 12, 11, 24, 13, 22],
            categoryId: '1',
            color: null,
            description: 'King of Denmark',
            id: 2,
            imageId: '4',
            name: 'Cloud-eee-us',
            noteIds: [3, 4],
            notes: [
              {
                children: [
                  {
                    text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [8, 1, 2, 3, 4, 5, 11, 12],
            templates: [],
          },
          '123323',
          2,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Selfish',
            Gender: 'Female',
            'How They Die': 'Poisoned wine from Claudius',
            'Inner Conflict':
              "Doesn't want to give up her own comfort, but also feels she did wrong by her first husband",
            Motivation: [
              {
                children: [
                  {
                    text: 'Self-preservation at all costs',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: '',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [7, 9, 14, 15, 19, 21, 23, 25, 12, 11, 24, 13, 22],
            categoryId: '1',
            color: null,
            description: 'The Queen of Denmark',
            id: 3,
            imageId: '3',
            name: 'Gertrude',
            noteIds: [3, 4],
            notes: [
              {
                children: [
                  {
                    text: 'The Queen of Denmark, wife of Claudius, and mother of Hamlet. While she loves her son very much, her desperation and need for affection leads her to behave selfishly. Has a very gray moral compass.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [8, 2, 3, 1, 4, 12],
            templates: [],
          },
          '123323',
          3,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Too eager to destroy Hamlet',
            Gender: 'Male',
            'How They Die': 'Stabbed by Hamlet when hiding behind a tapestry',
            'Inner Conflict': 'Wants his daughter safe from Hamlet',
            Motivation: [
              {
                children: [
                  {
                    text: 'To keep his daughter and country safe',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Supporting',
            'Royal Family Member': 'No',
            bookIds: [1],
            cards: [3, 6, 7, 8, 9, 14, 12, 11, 24, 13],
            categoryId: '2',
            color: null,
            description: 'Lord Chamberlin',
            id: 4,
            imageId: '15',
            name: 'Polonius',
            noteIds: [3],
            notes: [
              {
                children: [
                  {
                    text: "Serves as Claudius's Lord Chamberlin at court, and is the father of Ophelia and Laertes. ",
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [1, 2, 3, 8, 12, 10, 6],
            templates: [],
          },
          '123323',
          4,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Wants revenge so much it leads to his own undoing',
            Gender: 'Male',
            'How They Die': 'Stabbed in a duel with his own poisoned sword by Hamlet',
            'Inner Conflict': 'Wants revenge for his father, but regrets hurting Hamlet to do it',
            Motivation: [
              {
                children: [
                  {
                    text: 'To study in Paris, and then to get revenge for his father',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Antagonist',
            'Royal Family Member': 'No',
            bookIds: [1],
            cards: [3, 19, 21, 23, 25, 12, 24, 22],
            categoryId: '1',
            color: null,
            description: "Ophelia's brother",
            id: 7,
            imageId: '12',
            name: 'Laertes',
            noteIds: [3],
            notes: [
              {
                children: [
                  {
                    text: "Son of Polonius and brother to Ophelia, Laertes spends the majority of the play away in France. He's quick to act, and serves as a foil to Hamlet who overthinks everything.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [1, 3, 4, 5, 6, 9, 8],
            templates: [],
          },
          '123323',
          7,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': '',
            'Characters That Die': 'No',
            'Fatal Flaws': '',
            Gender: 'Male',
            'How They Die': '',
            'Inner Conflict': '',
            Motivation: [
              {
                children: [
                  {
                    text: 'To deliver a message to Norway from one king to another.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Extras',
            'Royal Family Member': '',
            bookIds: [1],
            cards: [7, 13],
            categoryId: '3',
            color: null,
            description: 'Courtiers',
            id: 12,
            imageId: null,
            name: 'Voltimand and Cornelius',
            noteIds: [],
            notes: [
              {
                children: [
                  {
                    text: 'The two courtiers that Claudius sends to Norway so they can try and persuade Fortinbras not to attack Denmark.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [2, 1, 13, 6],
            templates: [],
          },
          '123323',
          12,
        ],
        [
          'places',
          '123e',
          {
            bookIds: [1],
            cards: [1, 3, 4, 5, 6, 7, 9, 10, 15, 16, 17, 19, 20, 21, 25, 12, 8, 14, 11, 24, 13, 22],
            color: null,
            description: 'The Denmark palace',
            id: 1,
            imageId: '9',
            name: "Elsinore Castle 2 -- it's better!",
            noteIds: [3, 4],
            notes: [
              {
                children: [
                  {
                    text: 'Where most of the action takes place in the story.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [],
            templates: [],
          },
          '123323',
          1,
        ],
      ])
      expect(deleteSingleCalls).toEqual([['cards', '123e', null, '123323', 2]])

      // Clean up
      patchCalls.splice(0, patchCalls.length)
      deleteSingleCalls.pop()

      // Action 6: dedlete place 1
      sync(patch, deleteSingle, secondArg)(store)(next)(deletePlace(1))
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'cards',
          '123e',
          {
            beatId: 6,
            bookId: null,
            characters: [1, 5, 11, 2, 3, 7, 8],
            description: [
              {
                children: [
                  {
                    text: "Back at Elsinore, Hamlet tells Horatio that he swapped the letter meant to kill him and that instead Rosencrantz and Guildenstern will be killed for their betrayal and siding with Claudius. Then, a courtier named Osric enters and tells Hamlet that Laertes wishes to duel him, and starts singing Laertes's praises. Horatio tries to encourage Hamlet not to fight in the duel, but Hamlet decides to anyway. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "They are summoned to court for the duel. Hamlet and Laertes hash things out, and while Laertes says he won't forgive him fully, he'll at least accept his apology. The two men recieve the swords they are to use for the duel, and Claudius says if Hamlet gets the first or second hit, he will drink to Hamlet's health and then offer a cup to Hamlet. (which will actually contain poison) Hamlet gets the first strike in, but refuses to drink from the cup. Then when he hits Laertes again, Gertrude gets up to drink from the cup, even though Claudius tries to warn her not to.. But it is too late. She's already done it.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Before they fight another round, Laertes muses if he should lay down his sword, but decides not to, and on the third one, Laertes manages to cut Hamlet with the poisoned blade. But as they continue to fight, their swords accidentally get mixed up and Hamlet ends up cutting and thus poisoning Laertes. Queen Gertrude proclaims the wine was poisoned and dies, just as Laertes admits the sword was also poisoned, and that is was Claudius's idea for both. Laertes dies too, but not before saying he forgives Hamlet. Hamlet then takes up the poisoned sword and at last, kills his uncle by running Claudius through with the blade and forcing him to drink the last of the poison that killed his wife.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "As Fortinbras arrives at the castle, Hamlet clings to Horatio, asking his friend not to die by suicide, but to live on and tell the story of what happened there. He also asks the Fortinbras be made the new king of Denmark. Horatio vows to tell his story, just as Fortinbras enters and asks that Hamlet be given a soldier's send off. ",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 25,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [5, 7, 8, 13, 12, 9, 10],
            templates: [],
            title: 'The duel between Laertes and Hamlet',
          },
          '123323',
          25,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 6,
            bookId: null,
            characters: [1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 19, 18, 11],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 24,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [3, 7, 8, 10, 12, 13, 9],
            templates: [],
            title: 'Hamlet meets an untimely end',
          },
          '123323',
          24,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [3, 2, 10, 8, 7, 6, 5, 18],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 22,
            imageId: null,
            lineId: 1,
            places: [4],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [12, 13, 9, 6, 3, 10, 2, 7],
            templates: [],
            title: 'Hamlet is sent away, but Laertes returns',
          },
          '123323',
          22,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [2, 7, 3],
            description: [
              {
                children: [
                  {
                    text: "Claudius finally tells Laertes the truth of what happened between Hamlet and Polonius, and the two determine that Hamlet needs to be taken care of in a way that is not as conspicuous to the people of Denmark. Just then, the sailors and Horatio come to tell the men that Hamlet will be back at the court the next day because of the pirates attacking Hamlet's ship. They then devise to tempt Hamlet into a duel, and Laertes plots to use a sharpened sword that has been dipped in poison, so all he needs to do will be the cut Hamlet quickly and he'll die from the poison. Claudius even proposes a back up plan of giving Hamlet a glass of poisoned wine even if he wins the duel. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'At this point, Gertrude enters to tell them the sad news that Ophelia has fallen into a river and drowned, which further stokes Laertes anger and lust for revenge. He storms from the room, which leaves Claudius feeling uneasy.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 21,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 6,
            seriesLineId: null,
            tags: [10, 12, 9, 3, 8],
            templates: [],
            title: 'Claudius and Laertes plan to kill Hamlet',
          },
          '123323',
          21,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [5, 18],
            description: [
              {
                children: [
                  {
                    text: 'Horatio gets a letter from Hamlet, who lets him know that the ship meant to take him to England was set upon by pirates and he needed to turn back towards Denmark. The sailors bearing the message say they also have messages for Gertrude and Claudius, so they go to see them, before stealing away to find Hamlet in the countryside, not far from the castle.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 20,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 5,
            seriesLineId: null,
            tags: [3, 6, 7, 12],
            templates: [],
            title: 'Horatio receives word from Hamlet',
          },
          '123323',
          20,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [3, 2, 6, 7],
            description: [
              {
                children: [
                  {
                    text: 'Gertrude is worried about Ophelia, who appears to have gone mad at the loss of her father. Claudius then enters and sees Ophelia acting strange, and informs Gertrude that there are many suspicious whispers around court about what happened to Polonius. He also tells her that Laertes has returned from France, and then right after that, there is a commotion in the castle. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "A guard tells King Claudius that Laertes has arrived and brought with him a small mob, with whom he plans to potentially try and overthrow the castle to become the new king. Laertes enters in a fit of rage about his father's death, and Claudius attempts to calm him down, but to no avail. When Ophelia comes back in, clearly having lost her mind, it only further fans Laertes's anger. But Claudius finally manages to convince Laertes to listen to him and let him explain what happened to Polonius.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 19,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 4,
            seriesLineId: null,
            tags: [3, 9, 10, 12],
            templates: [],
            title: 'Laertes returns from France in a rage',
          },
          '123323',
          19,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [2, 1, 10],
            description: [
              {
                children: [
                  {
                    text: "Claudius is seen informing courtiers of the untimely death of Polonius, when Hamlet is brought before him to be confronted. He asks Hamlet where he has placed Polonius's body, but at first, Hamlet refuses to tell him. Hamlet insults him by saying that Claudius could seek him out in heaven, or join him in hell. But ultimately, he tells Claudius that the body has been hidden under the stairs in the palace.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Claudius then dismisses Hamlet, ordering him to board the ship to England at once, under the supervision of Rosencrantz and Guildenstern. Once they are all gone, Claudius admits that he has sent sealed orders to England to see to it that Hamlet is killed upon his arrival.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 17,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 2,
            seriesLineId: null,
            tags: [6, 10, 12, 13, 3],
            templates: [],
            title: "Claudius demands to know where Polonius's body is",
          },
          '123323',
          17,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [1, 10],
            description: [
              {
                children: [
                  {
                    text: "Rosencrantz and Guildenstern arrive to meet with Hamlet, who has just finished disposing of Polonius's body. He refuses to tell them what he did with the body, but reminds them that Polonius's blood is on Claudius's hands. He then accuses them of being spies for the King, but ultimately agrees to be taken by the two old friends to an audience with his uncle.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 16,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [2, 6, 3, 10, 12, 13, 9],
            templates: [],
            title: 'Rosencrantz and Guildenstern confront Hamlet',
          },
          '123323',
          16,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [3, 2, 10],
            description: [
              {
                children: [
                  {
                    text: 'Gertrude runs in on Claudius when he is with Rosencrantz and Guildenstern and asks to speak to him alone. When they leave, she tells him about everything that happened when Hamlet came to see her, namely that her son has killed Polonius. Claudius is immediately afraid that news of this could ruin his plans to rule Denmark, and so he summons back Rosencrantz and Guildenstern, telling them to get Hamlet to England with all haste so that he can find a way to explain everything that happened to the people without making himself look bad.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 15,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [9, 6, 3, 12, 13],
            templates: [],
            title: "Gertrude tells Claudius of Hamlet's actions",
          },
          '123323',
          15,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 3, 4, 9],
            description: [
              {
                children: [
                  {
                    text: 'Polonius tells Queen Gertrude to be harsh with her son in hopes of coaxing out of him the reason for his recent madness. He then hides behind a tapestry while Hamlet enters to confront his mother.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Hamlet chastises his mother for her betrayal in marrying his uncle, and begins violently yelling at her. When he does this, Polonius cries out from behind the tapestry for help, and Hamlet, not knowing who it is, stabs through the tapestry, killing Polonius. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'As he continues arguing with his mother, the ghost appears once again, but she is unable to see it. Before disappearing, the ghost reminds Hamlet that he must carry out his mission in killing Claudius, and that he should not be as hard on his mother.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Because Gertrude cannot see the ghost, Hamlet assures her that he hasn't been actually going mad, it was all a facade, but that the ghost is real. Before dragging away Polonius's body, he tells his mother that while he will go to England with Rosencrantz and Guildenstern, he doesn't trust either of them.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 14,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 3,
            seriesLineId: null,
            tags: [2, 3, 7, 8, 9, 10, 12],
            templates: [],
            title: 'Hamlet confronts his mother & kills Polonius',
          },
          '123323',
          14,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 3,
            bookId: null,
            characters: [6, 4, 15, 2, 3, 10, 12, 1, 17],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 13,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [2, 6, 7, 12, 13, 10],
            templates: [],
            title: 'Members of court meet & conspire',
          },
          '123323',
          13,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 16, 14, 15],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 12,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [1, 6, 7, 9, 10, 12, 13],
            templates: [],
            title: 'Hamlet learns the truth from the ghost of his father',
          },
          '123323',
          12,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 2, 3, 4, 5, 6, 10, 15, 17],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 11,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [10, 9, 8, 7, 12, 6, 2],
            templates: [],
            title: 'Hamlet carries out his plan to prove Claudius guilty',
          },
          '123323',
          11,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [2, 1, 10],
            description: [
              {
                children: [
                  {
                    text: "Claudius speaks with Rosencrantz and Guildenstern and instructs them to immediately see to it that Hamlet is taken on a journey to England, because he no longer trusts his nephew's intentions. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Once alone, he begins praying and asking for forgiveness for the evils and wrongs he has done, and Hamlet manages to sneak in unnoticed. Hamlet muses about killing his uncle right then and there, but then realizes he doesn't want to kill him when he is doing something good like praying for forgiveness. He vows to strike his uncle when he is doing something dastardly.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 10,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 2,
            seriesLineId: null,
            tags: [2, 6, 7, 11, 12, 10],
            templates: [],
            title: 'Claudius prays for forgiveness',
          },
          '123323',
          10,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 6, 2, 3, 5, 4, 10, 17],
            description: [
              {
                children: [
                  {
                    text: 'The court readies for the play, as Hamlet gives the players their parts. He then summons Horatio and tells his friend how highly he thinks of him, and entrusts him with the secret of what the ghost told him. He hopes that Horatio will be able to keep an eye on Claudius to see if he shows any signs of guilt. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'As everyone enters the room to watch the play, Hamlet starts acting mad once again in front of Polonius, and messes with Ophelia by telling her a lot of erotic puns. The play then begins, and Hamlet comments on it throughout, teasing Ophelia as he goes. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'When the play reaches the point where the character poisons the king in the garden, Claudius gets loud, angry, and storms out of the room. Hamlet and Horatio agree that such a reaction was damning. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Afterwards, Rosencrantz and Guildenstern try again to find out what has been causing him to act crazy, and he gets upset with them. Polonius then enters to escort Hamlet to his mother's chambers, and Hamlet takes a moment to ready himself for the confrontation that's about to ensue.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 9,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [2, 6, 7, 10, 12],
            templates: [],
            title: 'Court watches The Murder of Gonzago',
          },
          '123323',
          9,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 2, 6, 4, 10],
            description: [
              {
                children: [
                  {
                    text: "Claudius and Gertrude ask Rosencrantz and Guildenstern about their encounter with Hamlet, but the two of them tell the King and Queen that they couldn't figure it out, and that he seemed in good spirits about the players that arrived. Polonius then arrives and Claudius sends the others away so that they can spy on Hamlet and Ophelia.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Hamlet enters, musing on the futility of live and beauty, delivering his "To be or not to be" soliloquy. Then when he encounters Ophelia, things take a turn for the worse. Ophelia tries to give him back the letters and tokens of affection, and he goes off on Ophelia, in a mad rant, declaring her, and all women and mankind to be worthless. He sways between saying he never loved her and that he always will. Ophelia leaves heartbroken.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Polonius and Claudius confer and decide that it doesn't appear to be Ophelia causing his madness, and the two agree to spy on him again after the play to come that night. Polonius says he will spy on Hamlet interacting with Gertrude to root out the cause of his madness.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 8,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [2, 7, 6, 10, 9, 12],
            templates: [],
            title: 'Hamlet denounces Ophelia',
          },
          '123323',
          8,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 3,
            bookId: null,
            characters: [3, 2, 10, 12, 4, 1, 17],
            description: [
              {
                children: [
                  {
                    text: "Claudius and Gertrude summon Rosencrantz and Guildenstern, two friends of Hamlet's from when he was at Wittenberg. The King and Queen ask that the two courtiers try to brighten Hamlet's spirits, and in so doing also find out why he has been acting so strangely.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Then Polonius arrives to tell Claudius that his ambassadors he sent to Norway are back with a reply from the King. They tell him that the King has decided not to attack Denmark, and has given his son an army with which to attack the Poles instead of the Danes. Prince Fortinbras asks only that his armies be allowed to pass through Denmark on their way to Poland, which Claudius agrees to.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Polonius then tells Claudius that he believes Hamlet has gone made, and pitches a plan for finding out if he has lost his mind because of his love for Ophelia, or if it is for some other reason. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Claudius and Gertrude leave when they see Hamlet approaching, but Polonius stays to speak with him. Hamlet acts as if he has gone insane and insults Polonius with a number of jabs that have some truth to them.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'When Polonious leaves, Rosencrantz and Guildenstern enter and Hamlet seems happy to see them. But quickly their facade of concern crumbles and Hamlet expresses that he knows they have been sent to spy on him. They then tell him that a troupe of players is coming to the castle and that might cheer him up.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'The players arrive and Hamlet demands they present on the history of Troy. He is very impressed with the speech and says that the following night, he wants them to stage the play ',
                  },
                  {
                    italic: true,
                    text: 'The Murder of Gonzago. ',
                  },
                  {
                    text: 'Once Hamlet is alone again, he expresses how he wishes he could experience the depth of emotion that the actors do. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "He then devises a plan for bringing down his uncle, in which he plans to stage a play that is similar to how Claudius killed Hamlet's father. If Claudius reacts negatively, Hamlet can consider that proof that he committed the crime.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 7,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [2, 10, 12, 13, 6],
            templates: [],
            title: 'A busy day at court',
          },
          '123323',
          7,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 3,
            bookId: null,
            characters: [6, 4, 15],
            description: [
              {
                children: [
                  {
                    text: 'Polonius sends his servant Reynaldo to France to spy on his son Laertes, and commands him to report back with what he finds. As the servant leaves, Ophelia comes in, crying and distraught about an interaction with Hamlet.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'She tells her father that Hamlet looked "wild eyed" and was breathing heavy, but didn\'t say anything to her. Polonius believes that Hamlet has gone mad because Ophelia was distancing herself from him, so he rushes off to speak with Claudius about it.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 6,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [12, 1, 6, 10],
            templates: [],
            title: 'Polonius speaks with Ophelia',
          },
          '123323',
          6,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [1, 9, 13, 5],
            description: [
              {
                children: [
                  {
                    text: "Hamlet finally gets to speak with the ghost of his father, who tells him that he was murdered by Hamlet's uncle Claudius so that he could steal the crown. He tells him how Claudius snuck into their garden and put poison in his ear.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "The ghost then asks Hamlet to seek out revenge for his murder. Hamlet is so distraught at learning what's happened and that he was right about his evil uncle all along, that he agrees.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Just as the ghost fades away, Horatio and Marcellus catch up with Hamlet and ask him what happened. He doesn't tell them, but says that he might have to act like he's going mad, and they have to swear not to tell anyone what they saw. Though confused, they promise to keep his secret.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 5,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 4,
            seriesLineId: null,
            tags: [1, 6, 7, 8, 9],
            templates: [],
            title: "Hamlet speaks with his father's ghost",
          },
          '123323',
          5,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [1, 9, 13, 5],
            description: [
              {
                children: [
                  {
                    text: 'Hamlet waits outside on the castle ramparts with Marcellus and Horatio, hoping to catch a glimpse of the ghost. In the midst of doing so, they hear loud canons and revelry happening, and Hamlet explains it is a Danish custom for the new King. He expresses disdain for it, saying it makes his country look silly to others, and he wishes it would change.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Then they see the ghost and Hamlet tries calling out to it. When it doesn't answer but beckons Hamlet to follow, Marcellus and Horatio warn him that he shouldn't go. But Hamlet articulates that he doesn't care what happens to him and that if his soul is immortal, he has nothing to fear. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Horatio and Marcellus talk about how they think this is an ill omen for their country, and they debate briefly about whether or not to follow Hamlet, before deciding that they want to make sure their friend is safe.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 3,
            seriesLineId: null,
            tags: [1, 6, 8, 10, 9],
            templates: [],
            title: 'Hamlet goes after the ghost of his father',
          },
          '123323',
          4,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [4, 7, 6],
            description: [
              {
                children: [
                  {
                    text: "As Laertes is preparing to depart for France, he has a conversation with his sister, Ophelia. He cautions her about falling for Hamlet because he believes that Hamlet is too far above Ophelia's station for the two of them to ever be a match. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Laertes then says goodbye to his father, who gives him a some extensive advice for how to live and behave while he is away in France. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'As Laertes finally leaves, Polonius asks Ophelia what she and her brother talked about. She confesses that it was about Hamlet, and that he claims to love her. Polonius agrees with his son in telling Ophelia that he believes Hamlet to be insincere about his affections, and forbids her from seeing him further. ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 2,
            places: [3],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 2,
            seriesLineId: null,
            tags: [1, 12, 13, 6, 7],
            templates: [],
            title: 'Laertes leaves for France',
          },
          '123323',
          3,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [13, 5, 9, 14, 16],
            description: 'new description',
            fromTemplateId: null,
            id: 1,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [13, 6, 1],
            templates: [],
            title: 'new title',
          },
          '123323',
          1,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [1],
            characters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            content: [
              {
                children: [
                  {
                    text: 'From ',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: "Folger's Shakespeare",
                      },
                    ],
                    type: 'link',
                    url: 'https://www.folger.edu/sites/default/files/TM4%20-%20Enter%20Players%20handout.pdf',
                  },
                  {
                    text: ' character chart & worksheet. ',
                  },
                ],
              },
            ],
            id: 3,
            imageId: '16',
            places: [4, 5],
            tags: [1, 2, 3, 4, 5],
            templates: [],
            title: 'Character Chart',
          },
          '123323',
          3,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [],
            characters: [1, 2, 3, 4, 6, 7],
            content: [
              {
                children: [
                  {
                    text: 'This infographic, which ',
                  },
                  {
                    children: [
                      {
                        text: 'can be found here',
                      },
                    ],
                    type: 'link',
                    url: '#',
                  },
                  {
                    text: ', maps out the deaths in Hamlet, where they happen in the story, and their meaning. It also unpacks themes, character motivations, and more.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: 4,
            imageId: '17',
            places: [5],
            tags: [7, 8, 6, 10, 12],
            templates: [],
            title: "It's depressing...",
          },
          '123323',
          4,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [1],
            characters: [1, 2, 3, 4, 5, 6, 7],
            content: [
              {
                children: [
                  {
                    text: '',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: 'This article',
                      },
                    ],
                    type: 'link',
                    url: 'https://literarydevices.net/hamlet-themes/',
                  },
                  {
                    bold: true,
                    text: ' ',
                  },
                  {
                    text: 'unpacks the main themes of the play, as well as digs deeper into some of the more subtle themes. These include...',
                  },
                ],
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Madness',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Revenge',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Religion',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Subversion of Relationships',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Delay',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Honor',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Ambiguity of Language',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Human Beings',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Political Intrigues',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Suicide',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    text: 'This ',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: 'additional article',
                      },
                    ],
                    type: 'link',
                    url: 'https://www.nosweatshakespeare.com/play-themes/hamlet/',
                  },
                  {
                    text: ' also digs more into the complicated themes in Hamlet.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: 5,
            imageId: '18',
            places: [5, 4],
            tags: [6, 7, 9, 10, 11, 12, 13],
            templates: [],
            title: 'Thematic Ideas',
          },
          '123323',
          5,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [],
            characters: [1, 2, 3, 6, 9],
            content: [
              {
                children: [
                  {
                    text: 'This infographic (',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: 'link here',
                      },
                    ],
                    type: 'link',
                    url: 'http://www.macmillanreaders.com/shakespeare-for-life?utm_source=FB-macmillaneducation&utm_medium=Social&utm_campaign=Inforgraphic12609',
                  },
                  {
                    text: ') breaks down five of the key figures in Hamlet: Ophelia, King Hamlet, Claudius, Gertrude, and Prince Hamlet himself.',
                  },
                ],
              },
            ],
            id: 6,
            imageId: '19',
            places: [],
            tags: [8, 6, 7, 9, 12],
            templates: [],
            title: 'Character Sketches',
          },
          '123323',
          6,
        ],
      ])
      expect(deleteSingleCalls).toEqual([['places', '123e', null, '123323', 1]])

      // Clean up
      patchCalls.splice(0, patchCalls.length)
      deleteSingleCalls.pop()

      // Action 7: delete note 4
      sync(patch, deleteSingle, secondArg)(store)(next)(deleteNote(4))
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'Yes',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Too melancholy, acts before thinking it through',
            Gender: 'Male',
            'How They Die': 'Cut with a poisoned sword in a duel with Laertes',
            'Inner Conflict': "Wants to take his own life AND get revenge for his father's murder",
            Motivation: [
              {
                children: [
                  {
                    text: "Hamlet seeks to get revenge for his father's death",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Protagonist',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [4, 5, 7, 8, 9, 10, 14, 16, 17, 18, 23, 25, 12, 11, 24, 13],
            categoryId: '1',
            color: null,
            description: 'Prince of Denmark',
            id: 1,
            imageId: '1',
            name: 'Hamlet',
            noteIds: [3],
            notes: [
              {
                children: [
                  {
                    text: 'The title character, Hamlet is the 30 year old Prince of Denmark, nephew to King Claudius, and son of Queen Gertrude. He hates his uncle and resents his mother. Studied at the University of Wittenberg, he is a thoughtful and melancholy individual, but who often makes impulsive, rash decisions. ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [1, 2, 3, 4, 5, 7, 9, 10, 8],
            templates: [],
          },
          '123323',
          1,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Power hungry',
            Gender: 'Male',
            'How They Die': 'Killed with a poisonous sword & goblet by Hamlet',
            'Inner Conflict': "Regrets over marrying his brother's wife",
            Motivation: [
              {
                children: [
                  {
                    text: 'He wants to be ruler of Denmark so much that he would do anything to get and keep that position',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: 'Antagonist',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [7, 8, 9, 10, 15, 17, 19, 21, 23, 25, 12, 11, 24, 13, 22],
            categoryId: '1',
            color: null,
            description: 'King of Denmark',
            id: 2,
            imageId: '4',
            name: 'Cloud-eee-us',
            noteIds: [3],
            notes: [
              {
                children: [
                  {
                    text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [8, 1, 2, 3, 4, 5, 11, 12],
            templates: [],
          },
          '123323',
          2,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Selfish',
            Gender: 'Female',
            'How They Die': 'Poisoned wine from Claudius',
            'Inner Conflict':
              "Doesn't want to give up her own comfort, but also feels she did wrong by her first husband",
            Motivation: [
              {
                children: [
                  {
                    text: 'Self-preservation at all costs',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: '',
            'Royal Family Member': 'Yes',
            bookIds: [1],
            cards: [7, 9, 14, 15, 19, 21, 23, 25, 12, 11, 24, 13, 22],
            categoryId: '1',
            color: null,
            description: 'The Queen of Denmark',
            id: 3,
            imageId: '3',
            name: 'Gertrude',
            noteIds: [3],
            notes: [
              {
                children: [
                  {
                    text: 'The Queen of Denmark, wife of Claudius, and mother of Hamlet. While she loves her son very much, her desperation and need for affection leads her to behave selfishly. Has a very gray moral compass.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [8, 2, 3, 1, 4, 12],
            templates: [],
          },
          '123323',
          3,
        ],
        [
          'characters',
          '123e',
          {
            'Attended Wittenberg': 'No',
            'Characters That Die': 'Yes',
            'Fatal Flaws': 'Relies too much on others',
            Gender: 'Female',
            'How They Die': 'Falls into a river and drowns',
            'Inner Conflict': "Wants to be with Hamlet, but doesn't want to defy her father",
            Motivation: [
              {
                children: [
                  {
                    text: 'Be a good daughter and sister',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: '',
            'Royal Family Member': 'No',
            bookIds: [1],
            cards: [3, 6, 8, 9, 19, 23, 12, 11, 24, 13, 22],
            categoryId: '2',
            color: null,
            description: "Hamlet's love interest",
            id: 6,
            imageId: '2',
            name: 'Ophelia',
            noteIds: [3],
            notes: [
              {
                children: [
                  {
                    text: "Ophelia is the daughter of Polonius, sister to Laertes, and the woman that Hamlet is in love with. She's a sweet girl but who depends on the men around her to tell her what to do, and ultimately, it leads to her untimely death. She eventually goes mad and dies by falling in a river.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            tags: [7, 10, 8, 1, 2, 3, 9],
            templates: [],
          },
          '123323',
          6,
        ],
      ])
      expect(deleteSingleCalls).toEqual([['notes', '123e', null, '123323', 4]])

      // Clean up
      patchCalls.splice(0, patchCalls.length)
      deleteSingleCalls.pop()

      // Action 8: delete character 1
      sync(patch, deleteSingle, secondArg)(store)(next)(deleteCharacter(2))
      expect(patchCalls).toEqual([
        [
          'file',
          '123e',
          {
            appliedMigrations: [
              'm2020_8_28',
              'm2020_11_16',
              'm2021_1_15',
              'm2021_2_4',
              'm2021_2_8',
              'm2021_4_13',
              'm2021_6_9',
              'm2021_8_1',
              'm2022_5_17_1',
              'm2022_5_17',
              '*m2023_1_7',
              '*m2023_3_29',
              '*m2023_8_15',
            ],
            dirty: true,
            fileName: 'Hamlet',
            id: '123e',
            initialVersion: '2020.7.30',
            isCloudFile: false,
            loaded: true,
            version: '2023.8.21-alpha.3',
          },
          '123323',
        ],
        [
          'cards',
          '123e',
          {
            beatId: 6,
            bookId: null,
            characters: [1, 5, 11, 3, 7, 8],
            description: [
              {
                children: [
                  {
                    text: "Back at Elsinore, Hamlet tells Horatio that he swapped the letter meant to kill him and that instead Rosencrantz and Guildenstern will be killed for their betrayal and siding with Claudius. Then, a courtier named Osric enters and tells Hamlet that Laertes wishes to duel him, and starts singing Laertes's praises. Horatio tries to encourage Hamlet not to fight in the duel, but Hamlet decides to anyway. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "They are summoned to court for the duel. Hamlet and Laertes hash things out, and while Laertes says he won't forgive him fully, he'll at least accept his apology. The two men recieve the swords they are to use for the duel, and Claudius says if Hamlet gets the first or second hit, he will drink to Hamlet's health and then offer a cup to Hamlet. (which will actually contain poison) Hamlet gets the first strike in, but refuses to drink from the cup. Then when he hits Laertes again, Gertrude gets up to drink from the cup, even though Claudius tries to warn her not to.. But it is too late. She's already done it.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Before they fight another round, Laertes muses if he should lay down his sword, but decides not to, and on the third one, Laertes manages to cut Hamlet with the poisoned blade. But as they continue to fight, their swords accidentally get mixed up and Hamlet ends up cutting and thus poisoning Laertes. Queen Gertrude proclaims the wine was poisoned and dies, just as Laertes admits the sword was also poisoned, and that is was Claudius's idea for both. Laertes dies too, but not before saying he forgives Hamlet. Hamlet then takes up the poisoned sword and at last, kills his uncle by running Claudius through with the blade and forcing him to drink the last of the poison that killed his wife.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "As Fortinbras arrives at the castle, Hamlet clings to Horatio, asking his friend not to die by suicide, but to live on and tell the story of what happened there. He also asks the Fortinbras be made the new king of Denmark. Horatio vows to tell his story, just as Fortinbras enters and asks that Hamlet be given a soldier's send off. ",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 25,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [5, 7, 8, 13, 12, 9, 10],
            templates: [],
            title: 'The duel between Laertes and Hamlet',
          },
          '123323',
          25,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 6,
            bookId: null,
            characters: [1, 3, 4, 5, 6, 7, 8, 10, 13, 19, 18, 11],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 24,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [3, 7, 8, 10, 12, 13, 9],
            templates: [],
            title: 'Hamlet meets an untimely end',
          },
          '123323',
          24,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 6,
            bookId: null,
            characters: [1, 5, 3, 7, 6, 19],
            description: [
              {
                children: [
                  {
                    text: "Two gravediggers are readying Ophela's grave and have an exchange about the nature of death, and talk about how the world will always need gravediggers. Then Hamlet and Horatio arrive and watch them silently for a while, with Hamlet musing about how all men die and eventually become dust.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'The two approach the gravediggers, asking who it is that will be buried in this particular grave. The diggers dance around the topic before ultimately saying that it was a woman who has died. Hamlet and Horatio then go to hide when they see the funeral procession approaching. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Among the mourners are the King and Queen and Laertes, who is visibly upset about the loss of his sister. When Hamlet realizes she is the one that died, he bursts onto the scene, raving about how no one, not even her brother, could ever have loved her as much as he did. He and Laertes begin to fight but are pulled apart by other mourners. Hamlet then storms away with Horatio, and while Laertes initially wants to follow him and kill him then and there, Claudius reminds him to stick to their original plan of the duel.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 23,
            imageId: null,
            lineId: 2,
            places: [5],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [4, 7, 6, 12, 11, 9],
            templates: [],
            title: "Hamlet and Horatio witness Ophelia's funeral",
          },
          '123323',
          23,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [3, 10, 8, 7, 6, 5, 18],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 22,
            imageId: null,
            lineId: 1,
            places: [4],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [12, 13, 9, 6, 3, 10, 2, 7],
            templates: [],
            title: 'Hamlet is sent away, but Laertes returns',
          },
          '123323',
          22,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [7, 3],
            description: [
              {
                children: [
                  {
                    text: "Claudius finally tells Laertes the truth of what happened between Hamlet and Polonius, and the two determine that Hamlet needs to be taken care of in a way that is not as conspicuous to the people of Denmark. Just then, the sailors and Horatio come to tell the men that Hamlet will be back at the court the next day because of the pirates attacking Hamlet's ship. They then devise to tempt Hamlet into a duel, and Laertes plots to use a sharpened sword that has been dipped in poison, so all he needs to do will be the cut Hamlet quickly and he'll die from the poison. Claudius even proposes a back up plan of giving Hamlet a glass of poisoned wine even if he wins the duel. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'At this point, Gertrude enters to tell them the sad news that Ophelia has fallen into a river and drowned, which further stokes Laertes anger and lust for revenge. He storms from the room, which leaves Claudius feeling uneasy.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 21,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 6,
            seriesLineId: null,
            tags: [10, 12, 9, 3, 8],
            templates: [],
            title: 'Claudius and Laertes plan to kill Hamlet',
          },
          '123323',
          21,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [3, 6, 7],
            description: [
              {
                children: [
                  {
                    text: 'Gertrude is worried about Ophelia, who appears to have gone mad at the loss of her father. Claudius then enters and sees Ophelia acting strange, and informs Gertrude that there are many suspicious whispers around court about what happened to Polonius. He also tells her that Laertes has returned from France, and then right after that, there is a commotion in the castle. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "A guard tells King Claudius that Laertes has arrived and brought with him a small mob, with whom he plans to potentially try and overthrow the castle to become the new king. Laertes enters in a fit of rage about his father's death, and Claudius attempts to calm him down, but to no avail. When Ophelia comes back in, clearly having lost her mind, it only further fans Laertes's anger. But Claudius finally manages to convince Laertes to listen to him and let him explain what happened to Polonius.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 19,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 4,
            seriesLineId: null,
            tags: [3, 9, 10, 12],
            templates: [],
            title: 'Laertes returns from France in a rage',
          },
          '123323',
          19,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [1, 10],
            description: [
              {
                children: [
                  {
                    text: "Claudius is seen informing courtiers of the untimely death of Polonius, when Hamlet is brought before him to be confronted. He asks Hamlet where he has placed Polonius's body, but at first, Hamlet refuses to tell him. Hamlet insults him by saying that Claudius could seek him out in heaven, or join him in hell. But ultimately, he tells Claudius that the body has been hidden under the stairs in the palace.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Claudius then dismisses Hamlet, ordering him to board the ship to England at once, under the supervision of Rosencrantz and Guildenstern. Once they are all gone, Claudius admits that he has sent sealed orders to England to see to it that Hamlet is killed upon his arrival.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 17,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 2,
            seriesLineId: null,
            tags: [6, 10, 12, 13, 3],
            templates: [],
            title: "Claudius demands to know where Polonius's body is",
          },
          '123323',
          17,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 5,
            bookId: null,
            characters: [3, 10],
            description: [
              {
                children: [
                  {
                    text: 'Gertrude runs in on Claudius when he is with Rosencrantz and Guildenstern and asks to speak to him alone. When they leave, she tells him about everything that happened when Hamlet came to see her, namely that her son has killed Polonius. Claudius is immediately afraid that news of this could ruin his plans to rule Denmark, and so he summons back Rosencrantz and Guildenstern, telling them to get Hamlet to England with all haste so that he can find a way to explain everything that happened to the people without making himself look bad.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 15,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [9, 6, 3, 12, 13],
            templates: [],
            title: "Gertrude tells Claudius of Hamlet's actions",
          },
          '123323',
          15,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 3,
            bookId: null,
            characters: [6, 4, 15, 3, 10, 12, 1, 17],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 13,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [2, 6, 7, 12, 13, 10],
            templates: [],
            title: 'Members of court meet & conspire',
          },
          '123323',
          13,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 2,
            bookId: null,
            characters: [1, 3, 4, 5, 6, 7, 8, 9, 13, 16, 14, 15],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 12,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [1, 6, 7, 9, 10, 12, 13],
            templates: [],
            title: 'Hamlet learns the truth from the ghost of his father',
          },
          '123323',
          12,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 3, 4, 5, 6, 10, 15, 17],
            description: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 11,
            imageId: null,
            lineId: 1,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [10, 9, 8, 7, 12, 6, 2],
            templates: [],
            title: 'Hamlet carries out his plan to prove Claudius guilty',
          },
          '123323',
          11,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 10],
            description: [
              {
                children: [
                  {
                    text: "Claudius speaks with Rosencrantz and Guildenstern and instructs them to immediately see to it that Hamlet is taken on a journey to England, because he no longer trusts his nephew's intentions. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Once alone, he begins praying and asking for forgiveness for the evils and wrongs he has done, and Hamlet manages to sneak in unnoticed. Hamlet muses about killing his uncle right then and there, but then realizes he doesn't want to kill him when he is doing something good like praying for forgiveness. He vows to strike his uncle when he is doing something dastardly.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 10,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 2,
            seriesLineId: null,
            tags: [2, 6, 7, 11, 12, 10],
            templates: [],
            title: 'Claudius prays for forgiveness',
          },
          '123323',
          10,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 6, 3, 5, 4, 10, 17],
            description: [
              {
                children: [
                  {
                    text: 'The court readies for the play, as Hamlet gives the players their parts. He then summons Horatio and tells his friend how highly he thinks of him, and entrusts him with the secret of what the ghost told him. He hopes that Horatio will be able to keep an eye on Claudius to see if he shows any signs of guilt. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'As everyone enters the room to watch the play, Hamlet starts acting mad once again in front of Polonius, and messes with Ophelia by telling her a lot of erotic puns. The play then begins, and Hamlet comments on it throughout, teasing Ophelia as he goes. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'When the play reaches the point where the character poisons the king in the garden, Claudius gets loud, angry, and storms out of the room. Hamlet and Horatio agree that such a reaction was damning. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Afterwards, Rosencrantz and Guildenstern try again to find out what has been causing him to act crazy, and he gets upset with them. Polonius then enters to escort Hamlet to his mother's chambers, and Hamlet takes a moment to ready himself for the confrontation that's about to ensue.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 9,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [2, 6, 7, 10, 12],
            templates: [],
            title: 'Court watches The Murder of Gonzago',
          },
          '123323',
          9,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 4,
            bookId: null,
            characters: [1, 6, 4, 10],
            description: [
              {
                children: [
                  {
                    text: "Claudius and Gertrude ask Rosencrantz and Guildenstern about their encounter with Hamlet, but the two of them tell the King and Queen that they couldn't figure it out, and that he seemed in good spirits about the players that arrived. Polonius then arrives and Claudius sends the others away so that they can spy on Hamlet and Ophelia.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Hamlet enters, musing on the futility of live and beauty, delivering his "To be or not to be" soliloquy. Then when he encounters Ophelia, things take a turn for the worse. Ophelia tries to give him back the letters and tokens of affection, and he goes off on Ophelia, in a mad rant, declaring her, and all women and mankind to be worthless. He sways between saying he never loved her and that he always will. Ophelia leaves heartbroken.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Polonius and Claudius confer and decide that it doesn't appear to be Ophelia causing his madness, and the two agree to spy on him again after the play to come that night. Polonius says he will spy on Hamlet interacting with Gertrude to root out the cause of his madness.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 8,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 0,
            seriesLineId: null,
            tags: [2, 7, 6, 10, 9, 12],
            templates: [],
            title: 'Hamlet denounces Ophelia',
          },
          '123323',
          8,
        ],
        [
          'cards',
          '123e',
          {
            beatId: 3,
            bookId: null,
            characters: [3, 10, 12, 4, 1, 17],
            description: [
              {
                children: [
                  {
                    text: "Claudius and Gertrude summon Rosencrantz and Guildenstern, two friends of Hamlet's from when he was at Wittenberg. The King and Queen ask that the two courtiers try to brighten Hamlet's spirits, and in so doing also find out why he has been acting so strangely.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Then Polonius arrives to tell Claudius that his ambassadors he sent to Norway are back with a reply from the King. They tell him that the King has decided not to attack Denmark, and has given his son an army with which to attack the Poles instead of the Danes. Prince Fortinbras asks only that his armies be allowed to pass through Denmark on their way to Poland, which Claudius agrees to.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Polonius then tells Claudius that he believes Hamlet has gone made, and pitches a plan for finding out if he has lost his mind because of his love for Ophelia, or if it is for some other reason. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Claudius and Gertrude leave when they see Hamlet approaching, but Polonius stays to speak with him. Hamlet acts as if he has gone insane and insults Polonius with a number of jabs that have some truth to them.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'When Polonious leaves, Rosencrantz and Guildenstern enter and Hamlet seems happy to see them. But quickly their facade of concern crumbles and Hamlet expresses that he knows they have been sent to spy on him. They then tell him that a troupe of players is coming to the castle and that might cheer him up.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'The players arrive and Hamlet demands they present on the history of Troy. He is very impressed with the speech and says that the following night, he wants them to stage the play ',
                  },
                  {
                    italic: true,
                    text: 'The Murder of Gonzago. ',
                  },
                  {
                    text: 'Once Hamlet is alone again, he expresses how he wishes he could experience the depth of emotion that the actors do. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "He then devises a plan for bringing down his uncle, in which he plans to stage a play that is similar to how Claudius killed Hamlet's father. If Claudius reacts negatively, Hamlet can consider that proof that he committed the crime.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 7,
            imageId: null,
            lineId: 2,
            places: [],
            position: 0,
            positionInChapter: 0,
            positionWithinLine: 1,
            seriesLineId: null,
            tags: [2, 10, 12, 13, 6],
            templates: [],
            title: 'A busy day at court',
          },
          '123323',
          7,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [1],
            characters: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            content: [
              {
                children: [
                  {
                    text: 'From ',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: "Folger's Shakespeare",
                      },
                    ],
                    type: 'link',
                    url: 'https://www.folger.edu/sites/default/files/TM4%20-%20Enter%20Players%20handout.pdf',
                  },
                  {
                    text: ' character chart & worksheet. ',
                  },
                ],
              },
            ],
            id: 3,
            imageId: '16',
            places: [4, 5],
            tags: [1, 2, 3, 4, 5],
            templates: [],
            title: 'Character Chart',
          },
          '123323',
          3,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [1],
            characters: [1, 3, 4, 5, 6, 7],
            content: [
              {
                children: [
                  {
                    text: '',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: 'This article',
                      },
                    ],
                    type: 'link',
                    url: 'https://literarydevices.net/hamlet-themes/',
                  },
                  {
                    bold: true,
                    text: ' ',
                  },
                  {
                    text: 'unpacks the main themes of the play, as well as digs deeper into some of the more subtle themes. These include...',
                  },
                ],
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Madness',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Revenge',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Religion',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Subversion of Relationships',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Delay',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Honor',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Ambiguity of Language',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Human Beings',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Political Intrigues',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Suicide',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    text: 'This ',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: 'additional article',
                      },
                    ],
                    type: 'link',
                    url: 'https://www.nosweatshakespeare.com/play-themes/hamlet/',
                  },
                  {
                    text: ' also digs more into the complicated themes in Hamlet.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: 5,
            imageId: '18',
            places: [5, 4],
            tags: [6, 7, 9, 10, 11, 12, 13],
            templates: [],
            title: 'Thematic Ideas',
          },
          '123323',
          5,
        ],
        [
          'notes',
          '123e',
          {
            bookIds: [],
            characters: [1, 3, 6, 9],
            content: [
              {
                children: [
                  {
                    text: 'This infographic (',
                  },
                  {
                    children: [
                      {
                        bold: true,
                        text: 'link here',
                      },
                    ],
                    type: 'link',
                    url: 'http://www.macmillanreaders.com/shakespeare-for-life?utm_source=FB-macmillaneducation&utm_medium=Social&utm_campaign=Inforgraphic12609',
                  },
                  {
                    text: ') breaks down five of the key figures in Hamlet: Ophelia, King Hamlet, Claudius, Gertrude, and Prince Hamlet himself.',
                  },
                ],
              },
            ],
            id: 6,
            imageId: '19',
            places: [],
            tags: [8, 6, 7, 9, 12],
            templates: [],
            title: 'Character Sketches',
          },
          '123323',
          6,
        ],
      ])
      expect(deleteSingleCalls).toEqual([['characters', '123e', null, '123323', 2]])
    })
  })
})
