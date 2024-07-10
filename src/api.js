import semverGt from 'semver/functions/gt'
import axios from 'axios'
import { DateTime } from 'luxon'
import { isEqual, identity, capitalize } from 'lodash'

import { removeSystemKeys, ARRAY_KEYS, SYSTEM_REDUCER_KEYS, helpers } from 'pltr'

import { withMetrics } from './metrics'

const safeParseInt = (x) => {
  try {
    return parseInt(x)
  } catch (error) {
    return x
  }
}

/**
 * auth, database and storage should be thunks that produce instances
 * of the correspending firebase objects from either the firebase JS
 * api or the react-native-firebase api.
 */
const api = (
  actions,
  selectors,
  auth,
  database,
  storage,
  baseAPIDomain,
  development,
  log,
  isDesktop
) => {
  const BASE_API_URL =
    (!isDesktop && development) || !baseAPIDomain
      ? ''
      : baseAPIDomain === '/'
      ? ''
      : `https://${baseAPIDomain || ''}`

  const defaultErrorHandler = (label) => (message, error) => {
    if (!currentUser()) {
      log.info(
        `[${label}]: We're logged out and failed to communicate with Firebase.  ${error.message}`
      )
    } else {
      log.error(`[${label}]: Error communicating with Firebase. ${error?.message ?? ''}`, error)
    }
  }

  const pingAuth = (userId, fileId) => {
    return axios
      .post(`${BASE_API_URL}/api/ping-auth`, {
        userId,
        fileId,
      })
      .then((_response) => ({
        userId,
        fileId,
      }))
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(
          `Error pinging auth (to signal that the file list was updated). ${status}. ${error.response}`,
          error
        )
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const updateAuthFileName = (fileId, newName) => {
    return axios
      .post(`${BASE_API_URL}/api/update-auth-name`, {
        fileId,
        newName,
      })
      .then((_response) => ({
        fileId,
      }))
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Error updating auth file name auth.  ${status}. ${error?.response}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const editFileName = (fileId, newName) => {
    const { doc, updateDoc } = database()
    return updateDoc(doc(`file/${fileId}`), {
      fileName: newName,
    }).then(() => {
      return updateAuthFileName(fileId, newName)
    })
  }

  const FLAT_CARD_PATH_MAPPING = {
    flatCards: 'cards',
    flatNotes: 'notes',
    flatPlaces: 'places',
    flatCharacters: 'characters',
  }

  const reinterpretPath = (path) => {
    const mappedValue = FLAT_CARD_PATH_MAPPING[path]
    return typeof mappedValue !== 'undefined' ? mappedValue : path
  }

  const patchActions = (path) => {
    const reinterpretedPath = reinterpretPath(path)
    switch (reinterpretedPath) {
      case 'ui':
        return actions.ui
      case 'beats':
        return actions.beat
      case 'books':
        return actions.book
      case 'cards':
        return actions.card
      case 'series':
        return actions.series
      case 'categories':
        return actions.category
      case 'characters':
        return actions.character
      case 'customAttributes':
        return actions.customAttribute
      case 'featureFlags':
        return actions.featureFlags
      case 'lines':
        return actions.line
      case 'notes':
        return actions.note
      case 'places':
        return actions.place
      case 'tags':
        return actions.tag
      case 'hierarchyLevels':
        return actions.hierarchyLevels
      case 'images':
        return actions.image
      case 'file':
        return actions.ui
      case 'attributes':
        return actions.attributes
    }
    return null
  }

  const handleHandleSnapshotError = defaultErrorHandler('handleSnapshot')
  const handleSnapshot = (
    withAction,
    fileId,
    path,
    withData,
    patching,
    clientId,
    loadFunctionKey = 'load',
    usingFromDocRef = (_doc) => ({})
  ) => {
    return {
      next: (documentRef) => {
        const data = documentRef && documentRef.data()
        if (!data) {
          return
        } else {
          if (data.clientId === clientId) return
          const patchAction = patchActions(path)
          if (!patchAction) {
            log.error(`No patch action for ${path}`, new Error('No patch action'))
            return
          } else {
            delete data.fileId
            delete data.clientId
            withAction({
              ...patchAction[loadFunctionKey](
                patching,
                withData({ ...usingFromDocRef(documentRef), ...data })
              ),
              fileId,
            })
          }
        }
      },
      error: (error) => {
        handleHandleSnapshotError(
          `Error listening to ${fileId} at ${path} with a loadFunctionKey of ${loadFunctionKey}.  ${error.message}`,
          error
        )
      },
    }
  }

  const handleHandleFlatArraySnapshotError = defaultErrorHandler('handleFlatArraySnapshot')
  const handleFlatArraySnapshot = (
    withAction,
    fileId,
    path,
    withData,
    patching,
    clientId,
    loadFunctionKey = 'loadSingle',
    removeFunctionKey = 'removeSingle',
    bulkLoadFunctionKey = 'batchLoad'
  ) => {
    return {
      next: (snapshot) => {
        const documentsToAdd = []
        const patchAction = patchActions(path)
        if (!patchAction) {
          log.error(`No patch action for ${path}`, new Error('No patch action'))
        } else {
          snapshot.docChanges().forEach((docChange) => {
            const document = docChange.doc.data()
            switch (docChange.type) {
              case 'added':
              case 'modified': {
                if (document.clientId !== clientId) {
                  documentsToAdd.push(withData(document))
                }
                break
              }
              case 'removed': {
                withAction({
                  ...patchAction[removeFunctionKey](patching, withData(document)),
                  fileId,
                })
                break
              }
            }
          })
        }
        if (documentsToAdd.length === 1) {
          withAction({
            ...patchAction[loadFunctionKey](patching, withData(documentsToAdd[0])),
            fileId,
          })
        } else if (documentsToAdd.length > 1) {
          withAction({
            ...patchAction[bulkLoadFunctionKey](patching, withData(documentsToAdd)),
            fileId,
          })
        }
      },
      error: (error) => {
        handleHandleFlatArraySnapshotError(
          `Error listening to ${fileId} at ${path} with a loadFunctionKey of ${loadFunctionKey}.  ${error.message}`,
          error
        )
      },
    }
  }

  const listenToFile = (
    userId,
    fileId,
    clientId,
    withAction,
    _errorHandler = defaultErrorHandler('listenToFile')
  ) => {
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId, path: `plottr://${fileId}` })
    const { doc, onSnapshot } = database()
    return onSnapshot(
      doc(`file/${fileId}`),
      handleSnapshot(withAction, fileId, 'file', withIsCloud, true, clientId, 'patchFile', (x) => ({
        id: x.id,
      }))
    )
  }

  const listenForObjectAtPath =
    (path) =>
    (
      userId,
      fileId,
      clientId,
      withAction,
      _errorHandler = defaultErrorHandler('listenForObjectAtPath')
    ) => {
      const { doc, onSnapshot } = database()
      return onSnapshot(
        doc(`${path}/${fileId}`),
        handleSnapshot(withAction, fileId, path, identity, true, clientId)
      )
    }

  const listenForArrayAtPath =
    (path) =>
    (
      userId,
      fileId,
      clientId,
      withAction,
      _errorHandler = defaultErrorHandler('listenForArrayAtPath')
    ) => {
      const values = (x) => Object.values(x)
      const { doc, onSnapshot } = database()
      return onSnapshot(
        doc(`${path}/${fileId}`),
        handleSnapshot(withAction, fileId, path, values, true, clientId)
      )
    }

  const listenForFlatArrayAtPath =
    (path, subPath) =>
    (
      userId,
      fileId,
      clientId,
      withAction,
      _errorHandler = defaultErrorHandler('listenForFlatArrayAtPath')
    ) => {
      const { collection, onSnapshot, query } = database()
      return onSnapshot(
        query(collection(`${path}/${fileId}/${subPath}`)),
        handleFlatArraySnapshot(withAction, fileId, path, identity, true, clientId)
      )
    }

  const WHEN_BEATS_BECAME_AN_OBJECT = '2021.4.13'

  const listenToBeats = (
    userId,
    fileId,
    clientId,
    version,
    withAction,
    _errorHandler = defaultErrorHandler('listenToBeats')
  ) => {
    const transform = semverGt(version, WHEN_BEATS_BECAME_AN_OBJECT)
      ? (x) => x
      : (x) => Object.values(x)
    const { doc, onSnapshot } = database()
    return onSnapshot(
      doc(`beats/${fileId}`),
      handleSnapshot(withAction, fileId, 'beats', transform, true, clientId)
    )
  }

  const listenToUI = listenForObjectAtPath('ui')
  const listenToCards = listenForArrayAtPath('cards')
  const listenToSeries = listenForObjectAtPath('series')
  const listenToBooks = listenForObjectAtPath('books')
  const listenToCategories = listenForObjectAtPath('categories')
  const listenToCharacters = listenForArrayAtPath('characters')
  const listenToCustomAttributes = listenForObjectAtPath('customAttributes')
  const listenToFeatureFlags = listenForObjectAtPath('featureFlags')
  const listenToLines = listenForArrayAtPath('lines')
  const listenToNotes = listenForArrayAtPath('notes')
  const listenToPlaces = listenForArrayAtPath('places')
  const listenToTags = listenForArrayAtPath('tags')
  const listenToHierarchyLevels = listenForObjectAtPath('hierarchyLevels')
  const listenToImages = listenForObjectAtPath('images')
  const listenToAttributes = listenForObjectAtPath('attributes')
  const listenToFlatCards = listenForFlatArrayAtPath('flatCards', 'cards')
  const listenToFlatCharacters = listenForFlatArrayAtPath('flatCharacters', 'characters')
  const listenToFlatNotes = listenForFlatArrayAtPath('flatNotes', 'notes')
  const listenToFlatPlaces = listenForFlatArrayAtPath('flatPlaces', 'places')

  const onFetched = (fileId, path, withData, _clientId) => (documentRef) => {
    const data = documentRef && documentRef.data()
    if (!data) {
      return [path, withData({})]
    }
    delete data.fileId
    delete data.clientId
    return [path, withData(data)]
  }

  const onFetchedArray = (fileId, path, withData, _clientId) => (documentRef) => {
    const documents = []
    documentRef.forEach((document) => {
      const data = document.data()
      if (data.deleted) return

      documents.push({
        ...data,
        id: safeParseInt(document.id),
        fileURL: `plottr://${fileId}`,
        isCloudFile: true,
      })
    })
    return [path, withData(documents)]
  }

  const fetchArrayAtPath = (path) => (userId, fileId, clientId) => {
    const values = (x) => Object.values(x)
    const { doc, getDoc } = database()
    return getDoc(doc(`${path}/${fileId}`)).then(onFetched(fileId, path, values, clientId))
  }

  const fetchFlatArrayAtPath = (path, subPath) => (userId, fileId, clientId) => {
    const { collection, getDocs } = database()
    return getDocs(collection(`${path}/${fileId}/${subPath}`)).then(
      onFetchedArray(fileId, subPath, identity, clientId)
    )
  }

  const fetchObjectAtPath = (path) => (userId, fileId, clientId) => {
    const { doc, getDoc } = database()
    return getDoc(doc(`${path}/${fileId}`)).then(onFetched(fileId, path, identity, clientId))
  }

  const fetchBeats = (userId, fileId, clientId, version) => {
    const transform = semverGt(version, WHEN_BEATS_BECAME_AN_OBJECT)
      ? (x) => x
      : (x) => Object.values(x)
    const { doc, getDoc } = database()
    return getDoc(doc(`beats/${fileId}`)).then(onFetched(fileId, 'beats', transform, clientId))
  }

  const fetchFile = (userId, fileId, clientId) => {
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId })
    const path = 'file'
    const { doc, getDoc } = database()
    return getDoc(doc(`authorisation/${userId}/granted/${fileId}`)).then((authorisationRef) => {
      const withAuthorisation = (x) => withIsCloud({ ...x, ...authorisationRef.data() })
      return getDoc(doc(`${path}/${fileId}`)).then(
        onFetched(fileId, path, withAuthorisation, clientId)
      )
    })
  }

  const fetchOldArrayObject = (path) => (userId, fileId, clientId) => {
    {
      return fetchArrayAtPath(path)(userId, fileId, clientId).then((entry) => {
        const [_key, value] = entry
        if (Array.isArray(value) && value.length > 0) {
          const timestamp = new Date().toISOString()
          return Promise.all(
            value.map((entity, index) => {
              return overwriteWithNoPathTranslation(
                `old${capitalize(path)}/${fileId}/${timestamp}/${index}`,
                fileId,
                entity,
                clientId
              )
            })
          )
            .then(() => {
              return Promise.all(
                value.map((entity) => {
                  return overwrite(path, fileId, entity, clientId, entity.id)
                })
              )
            })
            .then(() => {
              const { doc, deleteDoc } = database()
              return deleteDoc(doc(`${path}/${fileId}`))
            })
            .then(() => {
              return entry
            })
        } else {
          return entry
        }
      })
    }
  }

  const fetchUI = fetchObjectAtPath('ui')
  const fetchChapters = fetchArrayAtPath('chapters')
  const fetchCards = fetchOldArrayObject('cards')
  const fetchSeries = fetchObjectAtPath('series')
  const fetchBooks = fetchObjectAtPath('books')
  const fetchCategories = fetchObjectAtPath('categories')
  const fetchCharacters = fetchOldArrayObject('characters')
  const fetchCustomAttributes = fetchObjectAtPath('customAttributes')
  const fetchEditors = fetchObjectAtPath('featureFlags')
  const fetchLines = fetchArrayAtPath('lines')
  const fetchNotes = fetchOldArrayObject('notes')
  const fetchPlaces = fetchOldArrayObject('places')
  const fetchTags = fetchArrayAtPath('tags')
  const fetchhierarchyLevels = fetchObjectAtPath('hierarchyLevels')
  const fetchImages = fetchObjectAtPath('images')
  const fetchAttributes = fetchObjectAtPath('attributes')
  const fetchFlatCards = fetchFlatArrayAtPath('flatCards', 'cards')
  const fetchFlatCharacters = fetchFlatArrayAtPath('flatCharacters', 'characters')
  const fetchFlatNotes = fetchFlatArrayAtPath('flatNotes', 'notes')
  const fetchFlatPlaces = fetchFlatArrayAtPath('flatPlaces', 'places')

  const toFirestoreArray = (array) =>
    array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

  const FLAT_ARRAY_KEYS = ['cards', 'notes', 'characters', 'places']

  const isFlatArrayKey = (key) => {
    return FLAT_ARRAY_KEYS.indexOf(key) !== -1
  }

  const joinResults = (results) => {
    return results.reduce((acc, next) => {
      const [key, value] = next
      const newValue =
        typeof acc[key] === 'undefined'
          ? value
          : Array.isArray(acc[key])
          ? [...acc[key], ...value]
          : null
      if (newValue) {
        return {
          ...acc,
          [key]: newValue,
        }
      } else {
        return acc
      }
    }, {})
  }

  const overwriteAllKeys = (fileId, clientId, state) => {
    const requests = []
    Object.keys(state).forEach((key) => {
      if (SYSTEM_REDUCER_KEYS.indexOf(key) !== -1) {
        return
      }
      if (isFlatArrayKey(key)) {
        state[key].forEach((payload) => {
          requests.push(
            overwrite(key, fileId, payload, clientId, payload.id)
              .catch((error) => {
                log.error(`Error while force updating file ${fileId} at key: ${key}`, error)
                return Promise.reject(error)
              })
              .then(() => [key, [payload]])
          )
        })
      } else {
        const payload = ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(state[key]) : state[key]
        requests.push(
          overwrite(key, fileId, payload, clientId)
            .catch((error) => {
              log.error(`Error while force updating file ${fileId} at key: ${key}`, error)
              return Promise.reject(error)
            })
            .then(() => [key, ARRAY_KEYS.indexOf(key) !== -1 ? Object.values(payload) : payload])
        )
      }
    })
    return Promise.all(requests).then((results) => {
      return joinResults(results)
    })
  }

  const fetchFileJson = (userId, fileId, clientId) => {
    return fetchFile(userId, fileId, clientId)
      .then((file) => {
        return Promise.all([
          fetchUI(userId, fileId, clientId),
          fetchChapters(userId, fileId, clientId),
          fetchBeats(userId, fileId, clientId, file[1].version),
          fetchCards(userId, fileId, clientId),
          fetchSeries(userId, fileId, clientId),
          fetchBooks(userId, fileId, clientId),
          fetchCategories(userId, fileId, clientId),
          fetchCharacters(userId, fileId, clientId),
          fetchCustomAttributes(userId, fileId, clientId),
          fetchEditors(userId, fileId, clientId),
          fetchLines(userId, fileId, clientId),
          fetchNotes(userId, fileId, clientId),
          fetchPlaces(userId, fileId, clientId),
          fetchTags(userId, fileId, clientId),
          fetchhierarchyLevels(userId, fileId, clientId),
          fetchImages(userId, fileId, clientId),
          fetchAttributes(userId, fileId, clientId),
          fetchFlatCards(userId, fileId, clientId),
          fetchFlatCharacters(userId, fileId, clientId),
          fetchFlatNotes(userId, fileId, clientId),
          fetchFlatPlaces(userId, fileId, clientId),
        ]).then((results) => {
          return [file, ...results]
        })
      })
      .then((results) => {
        const newOpenDate = new Date()
        return patch('file', fileId, { lastOpened: newOpenDate }, clientId)
          .catch((_error) => {
            return {
              results,
              newOpenDate: newOpenDate.getTime(),
            }
          })
          .then(() => {
            return {
              results,
              newOpenDate: newOpenDate.getTime(),
            }
          })
      })
      .then(({ results, newOpenDate }) => {
        const json = joinResults(results)
        return {
          ...json,
          file: {
            ...json.file,
            lastOpened: newOpenDate,
            timeStamp: helpers.time.convertFromNanosAndSecondsOrTimestampOrNull(
              json.file.timeStamp
            ),
          },
        }
      })
  }

  const initialFetch = (userId, fileId, clientId) => {
    return fetchFileJson(userId, fileId, clientId).then((resultFile) => {
      return pingAuth(userId, fileId).then(() => {
        return resultFile
      })
    })
  }

  const deleteFile = (fileId, userId, clientId) => {
    const setDeletedAuthorisation = () => {
      return axios.post(`${BASE_API_URL}/api/delete-auth`, {
        fileId,
      })
    }
    const setDeleted = (path) => patch(path, fileId, { deleted: true }, clientId)
    const setDeletedfile = () => setDeleted('file')
    const setDeletedSeries = () => setDeleted('series')
    const setDeletedBooks = () => setDeleted('books')
    const setDeletedCategories = () => setDeleted('categories')
    const setDeletedCustomAttributes = () => setDeleted('customAttributes')
    const setDeletedLines = () => setDeleted('lines')
    const setDeletedBeats = () => setDeleted('beats')
    const setDeletedTags = () => setDeleted('tags')
    const setDeletedHierarchyLevels = () => setDeleted('hierarchyLevels')
    const setDeletedImages = () => setDeleted('images')
    const setDeletedAttributes = () => setDeleted('attributes')

    const setEachDeleted = (path, subPath) => {
      const { getDocs, collection } = database()
      const rootPath = `${path}/${fileId}/${subPath}`
      return getDocs(collection(rootPath)).then((ref) => {
        const entitys = []
        ref.forEach((entity) => {
          const data = entity.data()
          if (data.deleted) return

          entitys.push({ ...entity, id: entity.id })
        })
        return Promise.all(
          entitys.map((entity) => {
            return patchWithNoPathTranslation(
              `${rootPath}/${entity.id}`,
              fileId,
              { deleted: true, id: entity.id },
              clientId
            )
          })
        )
      })
    }
    const setDeletedCards = () => setEachDeleted('flatCards', 'cards')
    const setDeletedCharacters = () => setEachDeleted('flatCharacters', 'characters')
    const setDeletedNotes = () => setEachDeleted('flatNotes', 'notes')
    const setDeletedPlaces = () => setEachDeleted('flatPlaces', 'places')

    return setDeletedAuthorisation()
      .then(setDeletedfile)
      .then((deleteFileResult) =>
        pingAuth(userId, fileId).then((pingAuthResult) =>
          Promise.all([
            setDeletedCards(),
            setDeletedSeries(),
            setDeletedBooks(),
            setDeletedCategories(),
            setDeletedCharacters(),
            setDeletedCustomAttributes(),
            setDeletedLines(),
            setDeletedBeats(),
            setDeletedNotes(),
            setDeletedPlaces(),
            setDeletedTags(),
            setDeletedHierarchyLevels(),
            setDeletedImages(),
            setDeletedAttributes(),
          ]).then((results) => [pingAuthResult, deleteFileResult, ...results])
        )
      )
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error('Error deleting a file', error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const listenToFiles = (userId, callback, errorHandler = defaultErrorHandler('listenToFiles')) => {
    const { collection, onSnapshot } = database()
    return onSnapshot(collection(`authorisation/${userId}/granted`), {
      next: (authorisationsRef) => {
        const authorisedDocuments = []
        authorisationsRef.forEach((authorisation) => {
          const data = authorisation.data()
          if (data.deleted) return

          authorisedDocuments.push({
            id: authorisation.id,
            ...data,
            timeStamp: helpers.time.convertFromNanosAndSecondsOrTimestampOrNull(data.timeStamp),
            lastOpened: helpers.time.convertFromNanosAndSecondsOrTimestampOrNull(data.lastOpened),
            fileURL: `plottr://${authorisation.id}`,
            isCloudFile: true,
          })
        })
        callback(authorisedDocuments)
      },
      error: (error) => {
        errorHandler(error)
      },
    })
  }

  const fetchFiles = (userId) => {
    const { collection, getDocs } = database()

    return getDocs(collection(`authorisation/${userId}/granted`)).then((authorisationsRef) => {
      const authorisedDocuments = []
      authorisationsRef.forEach((authorisation) => {
        const data = authorisation.data()
        if (data.deleted) return

        authorisedDocuments.push({
          id: authorisation.id,
          ...data,
          timeStamp: helpers.time.convertFromNanosAndSecondsOrTimestampOrNull(data.timeStamp),
          lastOpened: helpers.time.convertFromNanosAndSecondsOrTimestampOrNull(data.lastOpened),
          fileURL: `plottr://${authorisation.id}`,
          isCloudFile: true,
        })
      })
      return authorisedDocuments
    })
  }

  const clearToken = () => {
    return fetch(`${BASE_API_URL}/api/clear-token`).then((response) => {
      if (response.ok) {
        return response
      }
      return response.text().then((body) => {
        return Promise.reject(
          new Error(`HTTP failure while minting a cookie: ${response.status}.  Body: ${body}`)
        )
      })
    })
  }

  const logOut = () => {
    return auth()
      .signOut()
      .then(() => {
        return clearToken()
      })
      .then(() => {
        return 'success'
      })
  }

  const mintCookieToken = () => {
    return currentUser()
      .getIdToken()
      .then((idToken) => {
        // do not remove this comment
        return fetch(`${BASE_API_URL}/api/mint-token`, {
          method: 'POST',
          body: JSON.stringify({ idToken }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
      })
      .then((response) => {
        if (response.ok) {
          return response
        }
        return response.text().then((body) => {
          return Promise.reject(
            new Error(`HTTP failure while minting a cookie: ${response.status}.  Body: ${body}`)
          )
        })
      })
  }

  const onSessionChange = (cb, errorHandler = defaultErrorHandler('onSessionChange')) => {
    return auth().onAuthStateChanged((user) => {
      if (user) {
        return mintCookieToken()
          .catch(errorHandler)
          .then(() => {
            cb(user)
            return Promise.resolve(null)
          })
      }
      cb(user)
      return Promise.resolve(null)
    }, errorHandler)
  }

  const currentUser = () => {
    return auth().currentUser()
  }

  // Useful for debugging because Firebase rejects keys with undefined
  // values.
  const hasUndefinedValue = (object) => {
    if (object === null) return false

    return (
      object === undefined ||
      Object.values(object).some((value) => {
        if (Array.isArray(value)) {
          return value.some(hasUndefinedValue)
        }
        if (value && typeof value === 'object') {
          return hasUndefinedValue(value)
        }
        return value === undefined
      })
    )
  }

  const computeDocumentPath = (path, fileId, id) => {
    const isFlatArray = isFlatArrayKey(path)
    if (isFlatArray) {
      return `flat${capitalize(path)}/${fileId}/${path}/${id}`
    } else {
      return `${path}/${fileId}`
    }
  }

  const patch = (path, fileId, payload, clientId, index) => {
    const { doc, updateDoc } = database()
    const documentPath = computeDocumentPath(path, fileId, index)

    return updateDoc(doc(documentPath), {
      ...payload,
      clientId,
      fileId,
    })
  }

  const patchWithNoPathTranslation = (path, fileId, payload, clientId) => {
    const { doc, updateDoc } = database()

    return updateDoc(doc(path), {
      ...payload,
      clientId,
      fileId,
    })
  }

  const deleteSingle = (path, fileId, payload, clientId, id) => {
    const { doc, deleteDoc } = database()
    const documentPath = computeDocumentPath(path, fileId, id)

    return deleteDoc(doc(documentPath))
  }

  const overwrite = (path, fileId, payload, clientId, id) => {
    const { doc, setDoc } = database()
    const documentPath = computeDocumentPath(path, fileId, id)

    return setDoc(doc(documentPath), {
      ...payload,
      clientId,
      fileId,
    })
  }

  const overwriteAll = (path, fileId, entities, clientId, previousLength) => {
    const { doc, runTransaction } = database()
    return runTransaction((transactions) => {
      entities.forEach((entity, index) => {
        const documentPath = computeDocumentPath(path, fileId, index)
        transactions.set(doc(documentPath), {
          ...entity,
          clientId,
          fileId,
        })
      })
      for (let index = entities.length; index < previousLength; ++index) {
        const documentPath = computeDocumentPath(path, fileId, index)
        transactions.delete(doc(documentPath))
      }
      return Promise.resolve('Done')
    })
  }

  const overwriteWithNoPathTranslation = (path, fileId, payload, clientId) => {
    const { doc, setDoc } = database()

    return setDoc(doc(path), {
      ...payload,
      clientId,
      fileId,
    })
  }

  const shareDocument = (userId, fileId, emailAddress, permission) => {
    return axios
      .post(`${BASE_API_URL}/api/share-document`, {
        fileId,
        emailAddress,
        userId,
        permission,
      })
      .then(() => {
        const { getDoc, doc, setDoc } = database()
        return getDoc(doc(`file/${fileId}`)).then((documentRef) => {
          const document = documentRef && documentRef.data()
          const shareRecords = document.shareRecords || []
          const existingShareRecord = shareRecords.find(
            (shareRecord) => shareRecord.emailAddress === emailAddress
          )
          if (existingShareRecord) {
            return pingAuth(userId, fileId)
          } else {
            return setDoc(
              doc(`file/${fileId}`),
              {
                shareRecords: [...shareRecords, { emailAddress, permission }],
              },
              { merge: true }
            ).then(() => {
              return pingAuth(userId, fileId)
            })
          }
        })
      })
      .catch((error) => {
        const message = error?.message
        const status = error?.response?.status
        log.error(`Error sharing document.  ${message}. ${status}`, error, error)
        if (error?.response?.status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const releaseRCELock = (fileId, editorId, expectedLock) => {
    const { doc, getDoc, runTransaction } = database()
    const lockReference = doc(`rce/${fileId}/editors/${editorId}/locks/current`)
    return runTransaction((transactions) => {
      return transactions.get(lockReference).then((lock) => {
        if (!lock.exists) {
          return Promise.reject(`Lock for file: ${fileId}, and editor: ${editorId} doesn't exist!`)
        }
        if (isEqual(lock.data(), expectedLock)) {
          return transactions.update(lockReference, { clientId: null })
        }
        return Promise.resolve('Lock modified by another client or request')
      })
    }).then(() => {
      return getDoc(doc(`rce/${fileId}/editors/${editorId}/locks/current`)).then((ref) => {
        return ref.data()
      })
    })
  }

  const handleLockRCEError = defaultErrorHandler('lockRCE')
  const lockRCE = (fileId, rawEditorId, clientId, expectedLock, emailAddress = '') => {
    const editorId = rawEditorId.replace(/\//g, '__')
    const { doc, getDoc, runTransaction } = database()
    return runTransaction((transactions) => {
      const lockReference = doc(`rce/${fileId}/editors/${editorId}/locks/current`)
      return transactions.get(lockReference).then((lock) => {
        if (!lock.exists) {
          return lockReference.set({
            clientId,
            emailAddress,
          })
        }
        if (isEqual(lock.data(), expectedLock)) {
          return transactions.set(lockReference, {
            clientId,
            emailAddress,
          })
        }

        return Promise.resolve('Lock modified by another client or request')
      })
    })
      .then(() => {
        return getDoc(doc(`rce/${fileId}/editors/${editorId}/locks/current`)).then((ref) =>
          ref.data()
        )
      })
      .catch((error) => {
        handleLockRCEError(
          `Error acquiring the RCE lock for rce/${fileId}/editors/${editorId}/locks/current.  ${error.message}`,
          error
        )
        return Promise.reject(error)
      })
  }

  const handleListenToRCELockError = defaultErrorHandler('listenForRCELock')
  const listenForRCELock = (fileId, rawEditorId, clientId, cb) => {
    const { doc, onSnapshot } = database()
    const editorId = rawEditorId.replace(/\//g, '__')
    return onSnapshot(doc(`rce/${fileId}/editors/${editorId}/locks/current`), {
      next: (documentRef) => {
        const data = documentRef && documentRef.data()
        if (!data) {
          cb({ clientId: null })
          return
        }
        cb(data)
      },
      error: (error) => {
        handleListenToRCELockError(
          `Error listening for a lock on ${clientId}/${fileId}/${editorId}`,
          error
        )
      },
    })
  }

  const getSingleDocument = (documentRef) => {
    const documents = []
    if (documentRef) {
      documentRef.forEach((document) => {
        documents.push({ document: document.data(), documentRef: document })
      })
    }
    if (documents.length) {
      return documents[0]
    }
    return null
  }

  const startOfSessionBackup = (userId, file, startOfToday, fileId) => {
    const { where, getDocs, query, collection } = database()
    return getDocs(
      query(
        collection(`backup/${userId}/files`),
        where('fileId', '==', fileId),
        where('backupTime', '==', startOfToday),
        where('startOfSession', '==', true)
      )
    ).then(getSingleDocument)
  }

  const currentBackup = (userId, file, startOfToday, fileId) => {
    const { where, getDocs, query, collection } = database()
    return getDocs(
      query(
        collection(`backup/${userId}/files`),
        where('fileId', '==', fileId),
        where('backupTime', '==', startOfToday),
        where('startOfSession', '==', false)
      )
    ).then(getSingleDocument)
  }

  const TEN_SECONDS_IN_MILISECONDS = 10000

  const saveBackup = (userId, fileId, fullFile) => {
    const startOfToday = DateTime.now().startOf('day').toJSDate()
    const lastModified = new Date()
    const fileName = selectors.fileNameSelector(fullFile)
    const fileJSON = selectors.fullFileStateSelector(fullFile)
    const file = removeSystemKeys(fileJSON)

    return startOfSessionBackup(userId, file, startOfToday, fileId)
      .then((startOfSession) => {
        // Is there a backup for the start of today?
        if (startOfSession) {
          // Is there a non-start-of-session backup?
          return currentBackup(userId, file, startOfToday, fileId).then((result) => {
            if (result) {
              // Update the current backup
              const { document, documentRef } = result
              const delta = lastModified.getTime() - document.lastModified.toDate().getTime()
              if (delta < TEN_SECONDS_IN_MILISECONDS || !documentRef) {
                return Promise.resolve({ message: 'Not backed up', delta })
              }
              return backupToStorage(userId, fileId, file, startOfToday, false).then((path) => {
                if (path !== null) {
                  const { doc, updateDoc } = database()
                  return updateDoc(doc(`backup/${userId}/files/${documentRef.id}`), {
                    ...document,
                    fileName,
                    storagePath: path,
                    lastModified: new Date(),
                  })
                } else {
                  return null
                }
              })
            }
            // Add a non-start-of-session backup.
            return backupToStorage(userId, fileId, file, startOfToday, false).then((path) => {
              if (path !== null) {
                const { addDoc, collection } = database()
                return addDoc(collection(`backup/${userId}/files`), {
                  backupTime: startOfToday,
                  storagePath: path,
                  startOfSession: false,
                  fileId,
                  fileName,
                  lastModified: new Date(),
                })
              } else {
                return null
              }
            })
          })
        }
        // Add a start-of-session backup
        return backupToStorage(userId, fileId, file, startOfToday, true).then((path) => {
          if (path !== null) {
            const { addDoc, collection } = database()
            return addDoc(collection(`backup/${userId}/files`), {
              backupTime: startOfToday,
              fileId,
              storagePath: path,
              fileName,
              startOfSession: true,
              lastModified: new Date(),
            })
          } else {
            return null
          }
        })
      })
      .then(() => {
        return true
      })
  }

  const handleListenToBackupsError = defaultErrorHandler('listenForBackups')
  const listenForBackups = (userId, onBackupsChanged) => {
    const { collection, onSnapshot } = database()
    return onSnapshot(collection(`backup/${userId}/files`), {
      next: (documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push({
            ...document.data(),
            proRecordId: document.id,
          })
        })
        onBackupsChanged(documents)
      },
      error: (error) => {
        handleListenToBackupsError(
          `Error listening for backups for ${userId}. ${error.message}`,
          error
        )
      },
    })
  }

  const formatDate = (date) => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
  }

  const toBackupPath = (userId, fileId, date, startOfSession) => {
    return `storage://backups/${userId}/${fileId}/${formatDate(date)}${
      startOfSession ? '-(start-of-session)' : ''
    }.pltr`
  }

  const saveFileToStorage = (userId, storageURL, fileText) => {
    return axios
      .post(`${BASE_API_URL}/api/save-file-to-storage`, {
        userId,
        fileText,
        storageURL,
      })
      .then((response) => {
        return response.data.storageURL
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          log.error(
            `Failed to upload file for user ${userId} to ${storageURL}.  Unauthourised.`,
            error
          )
          return mintCookieToken().then(() => {
            return null
          })
        } else {
          log.error(`Failed to upload file for user ${userId} to ${storageURL}`, error)
          return Promise.reject(error)
        }
      })
  }

  const backupToStorage = (userId, fileId, file, date, startOfSession) => {
    const storageURL = toBackupPath(userId, fileId, date, startOfSession)
    return saveFileToStorage(userId, storageURL, JSON.stringify(file))
  }

  const toTemplatePath = (userId, templateId) => {
    return `storage://userTemplates/${userId}/${templateId}`
  }

  const saveCustomTemplate = (userId, template) => {
    const storageURL = toTemplatePath(userId, template.id)
    return saveFileToStorage(userId, storageURL, JSON.stringify(template)).then((path) => {
      if (path !== null) {
        // Bumping the timestamp will guarantee that listeners fetch
        // the latest versions.
        const { doc, setDoc } = database()
        return setDoc(doc(`templates/${userId}/userTemplates/${template.id}`), {
          id: template.id,
          path,
          timeStamp: new Date(),
        })
      } else {
        return null
      }
    })
  }

  const templatePublicURL = (storageURL) => {
    return axios
      .get(`${BASE_API_URL}/api/template-public-url?url=${storageURL}`)
      .then((response) => {
        // @ts-ignore
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Error getting template public url ${status} ${error?.response}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const allTemplateUrlsForUser = (documents) => {
    return Promise.all(
      documents.map(({ path }) => {
        return templatePublicURL(path).catch((error) => {
          log.error(`Failed to get public URL for template at ${path}`, error)
          return Promise.resolve('IGNORE')
        })
      })
    ).then((urls) => {
      return urls.filter((url) => {
        return url !== 'IGNORE'
      })
    })
  }

  const listenToCustomTemplates = (
    userId,
    callback,
    errorHandler = defaultErrorHandler('listenToCustomTemplates')
  ) => {
    const { collection, onSnapshot } = database()
    return onSnapshot(collection(`templates/${userId}/userTemplates`), {
      next: (documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push(document.data())
        })
        allTemplateUrlsForUser(documents)
          .then((urls) =>
            Promise.all(
              urls.map((url) =>
                fetch(url)
                  .then((response) => {
                    if (response.ok) {
                      return response.json()
                    }

                    return response.text().then((body) => {
                      return Promise.reject(
                        new Error(
                          `HTTP request for custom template failed: ${response.status}.  Body: ${body}`
                        )
                      )
                    })
                  })
                  .catch((error) => {
                    log.info(`Failed to fetch custom template at ${url}.  ${error.message}.`, error)
                    return Promise.resolve('IGNORE')
                  })
              )
            )
          )
          .then(callback)
          .catch(errorHandler)
      },
      error: errorHandler,
    })
  }

  const editCustomTemplate = saveCustomTemplate

  const deleteCustomTemplate = (userId, templateId) => {
    const storageURL = `userTemplates/${userId}/${templateId}`
    return axios
      .post(`${BASE_API_URL}/api/delete-custom-template?url=${storageURL}`)
      .then((response) => {
        // @ts-ignore
        return response.data.publicURL
      })
      .then((_result) => {
        const { doc, deleteDoc } = database()
        return deleteDoc(doc(`templates/${userId}/userTemplates/${templateId}`))
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Error getting template public url. ${status} ${error?.response}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const escapeImageName = (imageName) => {
    return imageName.replace(/\//g, '__').replace(/:/g, '--')
  }

  const toImagePath = (userId, imageName) => {
    return `storage://images/${userId}/${escapeImageName(imageName)}`
  }

  const saveImageToStorageBlob = (userId, imageName, imageUrl) => {
    const filePath = toImagePath(userId, imageName)
    return axios
      .post(`${BASE_API_URL}/api/upload-image`, {
        userId,
        imageUrl,
        storageURL: filePath,
      })
      .then((response) => {
        return response.data.storageURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Failed to upload image for user ${userId} to ${filePath}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const saveImageToStorageFromURL = (userId, imageName, imageUrl) => {
    return saveImageToStorageBlob(userId, imageName, imageUrl)
  }

  const backupPublicURL = (storageProtocolURL) => {
    return axios
      .get(`${BASE_API_URL}/api/backup-public-url?url=${storageProtocolURL}`)
      .then((response) => {
        // @ts-ignore
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Error getting file public url.  ${status}.  ${error?.response}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const filePublicURL = (storageProtocolURL, fileId, userId) => {
    return axios
      .get(
        `${BASE_API_URL}/api/file-public-url?url=${encodeURIComponent(
          storageProtocolURL
        )}&fileId=${fileId}&userId=${userId}`
      )
      .then((response) => {
        // @ts-ignore
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Error getting file public url.  ${status}.  ${error?.response}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  const imagePublicURL = (storageProtocolURL, fileId, userId) => {
    return filePublicURL(storageProtocolURL, fileId, userId)
  }

  const isStorageURL = (string) => {
    return string.startsWith('storage://')
  }

  const loginWithEmailAndPassword = (userName, password) => {
    return auth().signInWithEmailAndPassword(userName, password)
  }

  const deleteProBackup = (userId, backupRecordId, storageProtocolURL) => {
    if (
      typeof backupRecordId !== 'string' ||
      !backupRecordId ||
      typeof storageProtocolURL !== 'string' ||
      !storageProtocolURL
    ) {
      return Promise.reject(
        `Invalid backup record id (${backupRecordId}) or storage URL supplied (${storageProtocolURL}).  We need both because there's a reference to there being a backup on Firestore *and* a backup file on Firebase Storage.`
      )
    } else if (typeof userId !== 'string' || !userId) {
      return Promise.reject(
        `Invalid user id (${userId}).  We need them to delete the Firestore record that the backup exists.`
      )
    } else {
      const { doc, deleteDoc } = database()
      return deleteDoc(doc(`backup/${userId}/files/${backupRecordId}`)).then(() => {
        return axios
          .get(`${BASE_API_URL}/api/move-backup-to-trash?url=${storageProtocolURL}`)
          .catch((error) => {
            const status = error && error.response && error.response.status
            log.error(
              `Error deleting backup (${storageProtocolURL}).  ${status}.  ${error?.response}`,
              error
            )
            if (status === 401) {
              return mintCookieToken()
            } else {
              return Promise.reject(error)
            }
          })
      })
    }
  }

  const sendPasswordResetEmail = (email) => {
    return auth().sendPasswordResetEmail(email)
  }

  const deleteMachineLicenseActivation = (id, os, name, localUserName) => {
    const machineInfo = {
      id,
      os,
      name,
      localUserName,
    }
    return axios
      .post(`https://${process.env.API_BASE_DOMAIN}/api/delete-machine-license`, machineInfo)
      .then((_response) => {
        return Promise.resolve()
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            return Promise.resolve()
          } else {
            return Promise.reject()
          }
        } else {
          return Promise.reject(error)
        }
      })
  }

  const writeUserOwnershipNote = (userId, fileId, permission) => {
    const { doc, setDoc } = database()
    if (
      userId &&
      typeof userId === 'string' &&
      fileId &&
      typeof fileId === 'string' &&
      permission &&
      typeof permission === 'string'
    ) {
      return setDoc(doc(`/owners/${fileId}`), { [userId]: permission }, { merge: true })
    } else {
      // It's not a train wreck if we fail to write the record
      return Promise.resolve()
    }
  }

  const writeMetrics = (userId, metrics, totalCalls) => {
    return axios
      .post(`${BASE_API_URL}/api/metrics`, {
        userId,
        metrics,
        totalCalls,
      })
      .then((_response) => true)
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(`Error writing metrics. ${status}. ${error.response}`, error)
        if (status === 401) {
          return mintCookieToken()
        } else {
          return Promise.reject(error)
        }
      })
  }

  return withMetrics({
    editFileName,
    updateAuthFileName,
    listenToFile,
    listenToBeats,
    listenToUI,
    listenToCards,
    listenToSeries,
    listenToBooks,
    listenToCategories,
    listenToCharacters,
    listenToCustomAttributes,
    listenToFeatureFlags,
    listenToLines,
    listenToNotes,
    listenToPlaces,
    listenToTags,
    listenToHierarchyLevels,
    listenToImages,
    listenToAttributes,
    listenToFlatCards,
    listenToFlatCharacters,
    listenToFlatNotes,
    listenToFlatPlaces,
    toFirestoreArray,
    overwriteAllKeys,
    initialFetch,
    fetchFileJson,
    deleteFile,
    listenToFiles,
    fetchFiles,
    fetchFile,
    logOut,
    mintCookieToken,
    onSessionChange,
    currentUser,
    hasUndefinedValue,
    patch,
    deleteSingle,
    overwrite,
    overwriteAll,
    shareDocument,
    releaseRCELock,
    lockRCE,
    listenForRCELock,
    saveBackup,
    listenForBackups,
    saveCustomTemplate,
    allTemplateUrlsForUser,
    listenToCustomTemplates,
    editCustomTemplate,
    deleteCustomTemplate,
    saveImageToStorageBlob,
    saveImageToStorageFromURL,
    backupPublicURL,
    imagePublicURL,
    isStorageURL,
    loginWithEmailAndPassword,
    deleteProBackup,
    sendPasswordResetEmail,
    deleteMachineLicenseActivation,
    writeUserOwnershipNote,
    writeMetrics,
  })
}

export default api
