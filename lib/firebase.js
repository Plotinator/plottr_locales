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
let database
let auth
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)

  database = firebase.firestore()
  auth = firebase.auth()
  if (window.location.hostname === 'plottr.local') {
    database.useEmulator('plottr.local', 8080)
    auth.useEmulator('http://plottr.local:9099')
  }
}

if (!auth) {
  auth = firebase.auth()
}

if (!database) {
  database = firebase.firestore()
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

  database.collection('files').doc(fileId).get().then(onSnapshot)
  database.collection('files').doc(fileId).onSnapshot(onSnapshot)
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

  database.collection(path).where('fileId', '==', fileId).get().then(onSnapshot)
  database.collection(path).where('fileId', '==', fileId).onSnapshot(onSnapshot)
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

  database.collection(path).where('fileId', '==', fileId).get().then(onSnapshot)
  database.collection(path).where('fileId', '==', fileId).onSnapshot(onSnapshot)
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
  return database
    .collection('files')
    .get()
    .then((filesRef) => {
      const results = []
      filesRef.forEach((files) => results.push({ id: files.id, ...files.data() }))
      return results
    })
}

export const signIn = (email, password, cb = () => {}) => {
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user
      cb(user)
    })
    .catch(() => {
      // TODO: implement error handler in redux.
    })
}
