import fs from 'fs'
import path from 'path'
import { cloneDeep, set, get } from 'lodash'
import { v4 as uuid } from 'uuid'

const { readFile, open, writeFile, lstat, mkdir } = fs.promises

const promiseIdentity = (s) => {
  return Promise.resolve(s)
}

class Store {
  store = {}
  watchers = new Set()
  nextWatchers = []

  /**
   * @param {String} userDataPath
   * @typedef Logger
   * @property {function(String, Error): void} error
   * @property {function(String): void} warn
   * @property {function(String): void} info
   * @param {Logger} logger
   * @typedef Encryption
   * @property {function(String): Promise<string>} encryptString
   * @property {function(String): Promise<String>} decryptString
   * @typedef Options
   * @property {String} name
   * @property {boolean} [watch]
   * @property {any} [defaults]
   * @property {(function(): void)} [onInvalidStore]
   * @property {Encryption} [encryption]
   * @param {Options} param2
   */
  constructor(userDataPath, logger, { name, watch, defaults, onInvalidStore, encryption }) {
    logger.info(`Constructing store for: ${name}`)

    this.name = name
    this.watch = watch
    this.defaults = defaults || {}
    this.onInvalidStore = onInvalidStore
    this.logger = logger
    this.userDataPath = userDataPath
    this.path = path.join(userDataPath, `${name}.json`)
    this.activeWrite = null
    this.initialReadComplete = false
    this.encryptionEnabled =
      typeof encryption?.encryptString === 'function' &&
      typeof encryption?.decryptString === 'function'
    this.preprocessForWrite = encryption?.encryptString || promiseIdentity
    this.preprocessForRead = encryption?.decryptString || promiseIdentity
    this.generation = 0

    this._readStore().then(() => {
      this.initialReadComplete = true
      if (this.watch) {
        this.watchStore()
      }
    })
  }

  getNextGeneration = (currentGeneration) => {
    if ((!currentGeneration && currentGeneration !== 0) || currentGeneration < this.generation) {
      return {
        cancel: null,
        result: this.currentStore().then((data) => {
          return {
            generation: this.generation,
            data,
          }
        }),
      }
    } else {
      const id = uuid()
      return {
        cancel: () => {
          this.nextWatchers = this.nextWatchers.filter((watcher) => {
            return id !== watcher.id
          })
        },
        result: new Promise((resolve) => {
          this.nextWatchers.push({ resolve, id })
        }),
      }
    }
  }

  isInitialReadComplete = () => {
    return this.initialReadComplete
  }

  stop = () => {
    // @ts-ignore
    if (this.watcher && typeof this.watcher.close === 'function') {
      // @ts-ignore
      this.watcher.close()
    }
  }

  activeWriteRequest = () => {
    return this.activeWrite || Promise.resolve(true)
  }

  watchStore = () => {
    this.watcher = fs.watchFile(this.path, (currentFileStats, previousFileStats) => {
      if (currentFileStats.mtimeMs === previousFileStats.mtimeMs) {
        // File didn't actually change.  It was probably just
        // accessed.
        return
      }
      if (!currentFileStats.isFile()) {
        this.logger.warn(
          `File for store connected to ${this.name} at ${this.path} dissapeared.  Setting store to empty.`
        )
        this.store = {}
        this.writeStore()
        this.publishChangesToWatchers()
        return
      }
      this._readStore().then(() => {
        this.publishChangesToWatchers()
      })
    })
  }

  publishChangesToWatchers = () => {
    this.generation++
    this.nextWatchers.forEach(({ resolve }) => {
      resolve({
        generation: this.generation,
        data: {
          ...this.defaults,
          ...this.store,
        },
      })
    })
    this.nextWatchers = []
    this.watchers.forEach((cb) => {
      cb({
        ...this.defaults,
        ...this.store,
      })
    })
  }

  onDidAnyChange = (cb) => {
    this.watchers.add(cb)
    return () => {
      this.watchers.delete(cb)
    }
  }

  afterActiveWrite = (f) => {
    return this.activeWriteRequest().then(() => {
      return f()
    })
  }

  currentStore = () => {
    return this.afterActiveWrite(() => {
      if (this.initialReadComplete) {
        return this.store
      }

      return this._readStore().then(() => {
        return this.store
      })
    })
  }

  handleBadPreprocess = (error) => {
    if (error?.message === 'encrypt-error') {
      this.store = {}
      return {}
    } else {
      return Promise.reject(error)
    }
  }

  // This doesn't need to wait for active writes because it's
  // internal.  Please don't use it externally, That will lead to race
  // conditions.  Use `currentStore` instead!!
  _readStore = () => {
    return readFile(this.path)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          const createStore = () => {
            // The store doesn't yet exist.  Create it.
            this.store = this.defaults
            return this.writeStore().then(() => {
              return this.preprocessForWrite(JSON.stringify(this.store, null, 2)).catch(
                this.handleBadPreprocess
              )
            })
          }
          // Does the user data folder exist?
          return lstat(this.userDataPath)
            .then(createStore)
            .catch((dataDirError) => {
              // Use data folder doesn't exist.  Create it.
              if (dataDirError.code === 'ENOENT') {
                this.logger.warn(
                  `User data path doesn't exist at: ${this.userDataPath}.  Attempting to create it.`
                )
                return mkdir(this.userDataPath, { recursive: true })
                  .then(() => {
                    return new Promise((resolve) => {
                      setTimeout(resolve, Math.random() * 1000 + 1000)
                    })
                  })
                  .then(createStore)
              }
              return Promise.reject(dataDirError)
            })
            .then(createStore)
        }
        this.logger.error(`Failed to construct store for ${this.name} at ${this.path}`, error)
        throw new Error(`Failed to construct store for ${this.name} at ${this.path}`)
      })
      .then((rawStoreContents) => {
        const rawContentsAsString = rawStoreContents.toString()
        if (rawContentsAsString === '') {
          return Promise.resolve('{}')
        } else {
          return this.preprocessForRead(rawContentsAsString).catch((error) => {
            if (error?.message === 'decrypt-error') {
              this.store = {}
              return this.writeStore().then(() => {
                return '{}'
              })
            } else {
              return Promise.reject({})
            }
          })
        }
      })
      .then((storeContents) => {
        try {
          this.store =
            storeContents.toString() === ''
              ? this.defaults
              : {
                  ...this.defaults,
                  ...JSON.parse(storeContents),
                }
          return this.store
        } catch (error) {
          this.logger.error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
          if (this.onInvalidStore) {
            this.logger.info('Recovering with supplied recovery function.')
            return this.onInvalidStore()
          }

          throw new Error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`
          )
        }
      })
  }

  has = (key) => {
    return !!this.get(key)
  }

  writeStore = () => {
    return this.activeWriteRequest().then(() => {
      this.activeWrite = open(this.path, 'w+')
        .then((fileHandle) => {
          return this.preprocessForWrite(
            JSON.stringify(
              {
                ...this.defaults,
                ...this.store,
              },
              null,
              2
            )
          )
            .catch(this.handleBadPreprocess)
            .then((fileContents) => {
              return writeFile(fileHandle, fileContents)
            })
            .then(() => {
              return fileHandle.sync().then(() => {
                return fileHandle.close()
              })
            })
            .then(() => {
              this.publishChangesToWatchers()
            })
        })
        .catch((error) => {
          this.logger.error(
            `Failed to write ${JSON.stringify(this.store)} store for ${this.path}`,
            error
          )
          return Promise.reject(
            new Error(`Failed to write ${JSON.stringify(this.store)} store for ${this.path}`)
          )
        })
        .finally(() => {
          this.activeWrite = null
        })
    })
  }

  set = (storeOrKey, value) => {
    return this.afterActiveWrite(() => {
      if (typeof value !== 'undefined') {
        const key = `${storeOrKey}`
        this.store = cloneDeep(this.store)
        set(this.store, key, value)
        return this.writeStore()
          .then(() => {
            this.publishChangesToWatchers()
          })
          .then(() => true)
      }

      const store = storeOrKey
      if (typeof store !== 'object') {
        return Promise.reject(new Error(`Tried to set store to non-object: ${store}`))
      }
      this.store = cloneDeep(store)
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  // Use this if you have full stops in your key that you don't want
  // the store to interpret as nested objects.
  setRawKey = (key, value) => {
    if (!key) {
      const message = `Attempted to set key: ${key} to ${value} but (as you can see, there's no key)`
      this.logger.error(message, new Error(message))
      return Promise.reject(new Error(message))
    }
    return this.afterActiveWrite(() => {
      this.store = cloneDeep(this.store)
      this.store[key] = value
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  clear = () => {
    return this.afterActiveWrite(() => {
      this.store = {}
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  delete = (id) => {
    return this.afterActiveWrite(() => {
      this.store = cloneDeep(this.store)
      delete this.store[id]
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  filter = (predicate) => {
    return this.afterActiveWrite(() => {
      this.store = Object.entries(cloneDeep(this.store)).reduce((acc, next) => {
        const [key, value] = next
        if (predicate(value, key)) {
          return {
            ...acc,
            [key]: value,
          }
        }
        return acc
      }, {})
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  mapValues = (f) => {
    return this.afterActiveWrite(() => {
      this.store = Object.entries(cloneDeep(this.store)).reduce((acc, next) => {
        const [key, value] = next
        return {
          ...acc,
          [key]: f(value),
        }
      }, {})
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  map = (f) => {
    return this.afterActiveWrite(() => {
      this.store = Object.entries(cloneDeep(this.store)).reduce((acc, next) => {
        const [key, value] = next
        const newKeyValue = f(value, key)
        return {
          ...acc,
          ...newKeyValue,
        }
      }, {})
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  some = (predicate) => {
    return this.afterActiveWrite(() => {
      return Object.entries(this.store).some(([key, value]) => {
        return predicate(value, key)
      })
    })
  }

  getKeyWithoutDefault = (key) => {
    return get(this.store, key)
  }

  get = (key) => {
    if (typeof key !== 'undefined') {
      return get(this.store, key) || get(this.defaults, key)
    }

    return {
      ...this.defaults,
      ...this.store,
    }
  }

  // Use this if you have full stops in your key that you don't want
  // the store to interpret as nested objects.
  getRawKey = (key) => {
    if (typeof key !== 'undefined') {
      return this.store[key] || this.defaults[key]
    }

    return {
      ...this.defaults,
      ...this.store,
    }
  }
}

export default Store
