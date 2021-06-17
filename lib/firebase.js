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

const logFailure = (path) => (error) => {
  console.error(`Error reading ${path}: `, error)
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

  database()
    .collection('file')
    .doc(fileId)
    .get()
    .then(onSnapshot)
    .catch(logFailure(`file/${fileId}`))
  database().collection('file').doc(fileId).onSnapshot(onSnapshot)
}

const onSnapshot = (fileId, path, withData, patching) => (documentRef) => {
  const currentState = store.getState()
  const data = documentRef.data()
  delete data.fileId
  store.dispatch(
    (patching ? ui.patchFile : ui.loadFile)(
      fileId,
      false,
      {
        ...currentState.present,
        [path]: withData(data),
      },
      '2021.5.31'
    )
  )
}

const listenForObjectAtPath = (path) => (userId, fileId) => {
  const identity = (x) => x
  database()
    .collection(path)
    .doc(fileId)
    .get()
    .then(onSnapshot(fileId, path, identity, false))
    .catch(logFailure(`${path}/${fileId}`))
  database().collection(path).doc(fileId).onSnapshot(onSnapshot(fileId, path, identity, true))
}

const listenForArrayAtPath = (path) => (userId, fileId) => {
  const values = (x) => Object.values(x)
  database()
    .collection(path)
    .doc(fileId)
    .get()
    .then(onSnapshot(fileId, path, values, false))
    .catch(logFailure(`${path}/${fileId}`))
  database().collection(path).doc(fileId).onSnapshot(onSnapshot(fileId, path, values, true))
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
    .collection(`authorisation/${userId}/granted`)
    .get()
    .then((authorisationsRef) => {
      const authorisedDocuments = []
      authorisationsRef.forEach((authorisation) => {
        const document = database()
          .collection(`file`)
          .doc(authorisation.id)
          .get()
          .then((file) => ({
            id: file.id,
            ...file.data(),
            ...authorisation.data(),
          }))
        authorisedDocuments.push(document)
      })
      return Promise.all(authorisedDocuments)
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

let _firebaseui
export const firebaseUI = () => {
  if (_firebaseui) return _firebaseui
  const firebaseui = require('firebaseui')
  _firebaseui = new firebaseui.auth.AuthUI(auth())
  return _firebaseui
}

export const startUI = (firebaseUI, queryString) => {
  firebaseUI.start(queryString, {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    ],
  })
}

export const patch = (path, fileId, payload) => {
  console.log('path', path)
  database().collection(path).doc(fileId).set(payload, { merge: true })
}
