import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { actions } from 'pltr/v2'
import { store } from './redux'

export const firebaseConfig = {
  apiKey: 'AIzaSyDyxfuXIrmXyN4YLlIRBkjA82Guh4XGUEE',
  authDomain: 'plottr.firebaseapp.com',
  databaseURL: 'https://plottr.firebaseio.com',
  projectId: 'plottr',
  storageBucket: 'plottr.appspot.com',
  messagingSenderId: '414647050330',
  appId: '1:414647050330:web:6d0520f0d156e496deb863',
  measurementId: 'G-V8KKTT2SWE',
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

const patchActions = (path) => {
  switch (path) {
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
  }
  return null
}

const onSnapshot =
  (fileId, path, withData, patching, loadFunctionKey = 'load', usingFromDocRef = () => ({})) =>
  (documentRef) => {
    const data = documentRef.data()
    delete data.fileId
    store.dispatch(
      patchActions(path)[loadFunctionKey](
        patching,
        withData({ ...usingFromDocRef(documentRef), ...data })
      )
    )
  }

export const fetchFile = (userId, fileId) => {
  const identity = (x) => x
  database()
    .collection('file')
    .doc(fileId)
    .onSnapshot(onSnapshot(fileId, 'file', identity, true, 'patchFile', (x) => ({ id: x.id })))
}

const listenForObjectAtPath = (path) => (userId, fileId) => {
  const identity = (x) => x
  database().collection(path).doc(fileId).onSnapshot(onSnapshot(fileId, path, identity, true))
}

const listenForArrayAtPath = (path) => (userId, fileId) => {
  const values = (x) => Object.values(x)
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
  fetchFile(userId, fileId)
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
  return database().collection(path).doc(fileId).set(payload, { merge: true })
}
