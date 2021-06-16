import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { actions } from 'pltr/v2'
import { store } from './redux'

const { ui } = actions

export const firebaseConfig = {
  apiKey: 'AIzaSyBhfNFWZjphkIWz9U36yJ6VLWxVYHTmy_I',
  authDomain: 'plottr-firestore-poc-2.firebaseapp.com',
  projectId: 'plottr-firestore-poc-2',
  storageBucket: 'plottr-firestore-poc-2.appspot.com',
  messagingSenderId: '692909170189',
  appId: '1:692909170189:web:1218c1e699ce99bbff3f44',
}

// Initialize firebase instance (check whether one already exists)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

let _database = null
const database = () => {
  if (_database) return _database
  _database = firebase.firestore()
  if (
    process.env.NODE_ENV === 'development' ||
    (window && window.location.hostname === 'plottr.local')
  ) {
    _database.useEmulator('plottr.local', 8080)
  }
  return _database
}

let _auth = null
const auth = () => {
  if (_auth) return _auth
  _auth = firebase.auth()
  if (
    process.env.NODE_ENV === 'development' ||
    (window && window.location.hostname === 'plottr.local')
  ) {
    _auth.useEmulator('http://plottr.local:9099')
  }
  return _auth
}

export const fetchFile = (userId, fileId) => {
  const onSnapshot = (doc) => {
    const currentState = store.getState()
    ui.loadFile(
      fileId,
      false,
      {
        ...currentState,
        file: doc.file,
      },
      '2021.5.31'
    )
  }

  database().collection('files').doc(fileId).get().then(onSnapshot)
  database().collection('files').doc(fileId).onSnapshot(onSnapshot)
}

const listenForObjectAtPath = (path) => (userId, fileId) => {
  const onSnapshot = (entities) => {
    const currentState = store.getState()
    entities.forEach((documentRef) => {
      const data = documentRef.data()
      delete data.fileId
      store.dispatch(
        ui.loadFile(
          fileId,
          false,
          {
            ...currentState.present,
            [path]: data,
          },
          '2021.5.31'
        )
      )
    })
  }

  database().collection(path).where('fileId', '==', fileId).get().then(onSnapshot)
  database().collection(path).where('fileId', '==', fileId).onSnapshot(onSnapshot)
}

const listenForArrayAtPath = (path) => (userId, fileId) => {
  const onSnapshot = (entities) => {
    const currentState = store.getState()
    entities.forEach((documentRef) => {
      const data = documentRef.data()
      delete data.fileId
      store.dispatch(
        ui.loadFile(
          fileId,
          false,
          {
            ...currentState.present,
            [path]: Object.values(data),
          },
          '2021.5.31'
        )
      )
    })
  }

  database().collection(path).where('fileId', '==', fileId).get().then(onSnapshot)
  database().collection(path).where('fileId', '==', fileId).onSnapshot(onSnapshot)
}

export const listenToBeats = listenForObjectAtPath('beats')
export const listenToCards = listenForArrayAtPath('cards')
export const listenToSeries = listenForObjectAtPath('series')
export const listenToBooks = listenForObjectAtPath('books')
export const listenToCategories = listenForObjectAtPath('categories')
export const listenToCharacters = listenForArrayAtPath('characters')
export const listenToCustomAttributes = listenForObjectAtPath('customAttributes')
export const listenToLines = listenForArrayAtPath('lines')
export const listenToNotes = listenForArrayAtPath('notes')
export const listenToPlaces = listenForArrayAtPath('places')
export const listenToTags = listenForArrayAtPath('tags')
export const listenTohierarchyLevels = listenForObjectAtPath('hierarchyLevels')
export const listenToImages = listenForObjectAtPath('images')

export const listen = (userId, fileId) => {
  // fetchFile(userId, fileId)
  listenToBeats(userId, fileId)
  listenToCards(userId, fileId)
  listenToSeries(userId, fileId)
  listenToBooks(userId, fileId)
  listenToCategories(userId, fileId)
  listenToCharacters(userId, fileId)
  listenToCustomAttributes(userId, fileId)
  listenToLines(userId, fileId)
  listenToNotes(userId, fileId)
  listenToPlaces(userId, fileId)
  listenToTags(userId, fileId)
  listenTohierarchyLevels(userId, fileId)
  listenToImages(userId, fileId)
}

export const fetchFiles = (userId) => {
  return database()
    .collection('files')
    .get()
    .then((filesRef) => {
      const results = []
      filesRef.forEach((files) => results.push({ id: files.id, ...files.data() }))
      return results
    })
}

export const signIn = (email, password) => {
  return firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
      return auth().signInWithEmailAndPassword(email, password)
    })
}

export const userSession = () => {
  return auth().currentUser
}

export const createAccount = (userName, email, password) => {
  // TODO: do we need the userName?  We could put this in Firestore
  // for later(!)
  return auth().createUserWithEmailAndPassword(email, password)
}

export const logOut = () => {
  return auth().signOut()
}

export const onSessionChange = (cb) => {
  return auth().onAuthStateChanged(cb)
}

export const patch = (path, userId, fileId, payload) => {
  // TODO: keep track of the ids somewhere so that we don't have to
  // query them!
  database()
    .collection(path)
    .where('fileId', '==', fileId)
    .get()
    .then((result) => {
      result.forEach((document) => {
        database().collection(path).doc(document.id).set(payload, { merge: true })
      })
    })
}
