import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { actions } from 'pltr/v2'
import { store } from './redux'

export const firebaseConfig =
  process.env.FIREBASE_ENV === 'production'
    ? {
        apiKey: 'AIzaSyDyxfuXIrmXyN4YLlIRBkjA82Guh4XGUEE',
        authDomain: 'plottr.firebaseapp.com',
        databaseURL: 'https://plottr.firebaseio.com',
        projectId: 'plottr',
        storageBucket: 'plottr.appspot.com',
        messagingSenderId: '414647050330',
        appId: '1:414647050330:web:6d0520f0d156e496deb863',
        measurementId: 'G-V8KKTT2SWE',
      }
    : {
        apiKey: 'AIzaSyAwvdLWqVoyhEXbT26aTx0HL_qybstxLFY',
        authDomain: 'plottr-ci.firebaseapp.com',
        projectId: 'plottr-ci',
        storageBucket: 'plottr-ci.appspot.com',
        messagingSenderId: '733541501381',
        appId: '1:733541501381:web:66827ee4e4cbe58ac8e3ac',
        measurementId: 'G-XHGVVN7KYL',
      }

// Initialize firebase instance (check whether one already exists)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const newFile = (userId, fileName, fullState, setFileList, selectedFile) => {
  const newEmptyFile = fullState.present
  const newFile = {
    ...newEmptyFile.file,
    none: false,
    fileName,
  }
  delete newFile.id
  return database()
    .collection('file')
    .add(newFile)
    .then((fileRef) => {
      database()
        .collection(`authorisation/${userId}/granted`)
        .doc(fileRef.id)
        .set({
          permission: 'owner',
        })
        .then((permissionDocRef) => {
          const requests = [
            database().collection('ui').doc(fileRef.id).set(newEmptyFile.ui),
            database().collection('beats').doc(fileRef.id).set(newEmptyFile.beats),
            database()
              .collection('cards')
              .doc(fileRef.id)
              .set({ ...newEmptyFile.cards }),
            database().collection('series').doc(fileRef.id).set(newEmptyFile.series),
            database().collection('books').doc(fileRef.id).set(newEmptyFile.books),
            database().collection('categories').doc(fileRef.id).set(newEmptyFile.categories),
            database()
              .collection('characters')
              .doc(fileRef.id)
              .set({ ...newEmptyFile.characters }),
            database()
              .collection('customAttributes')
              .doc(fileRef.id)
              .set(newEmptyFile.customAttributes),
            database()
              .collection('lines')
              .doc(fileRef.id)
              .set({ ...newEmptyFile.lines }),
            database()
              .collection('notes')
              .doc(fileRef.id)
              .set({ ...newEmptyFile.notes }),
            database()
              .collection('places')
              .doc(fileRef.id)
              .set({ ...newEmptyFile.places }),
            database()
              .collection('tags')
              .doc(fileRef.id)
              .set({ ...newEmptyFile.tags }),
            database()
              .collection('hierarchyLevels')
              .doc(fileRef.id)
              .set(newEmptyFile.hierarchyLevels),
            database().collection('images').doc(fileRef.id).set(newEmptyFile.images),
            database().collection('featureFlags').doc(fileRef.id).set(newEmptyFile.featureFlags),
          ]
          return Promise.all(requests).then((results) => {
            listen(userId, fileRef.id)
            return fetchFiles(userId).then((newFileList) => {
              setFileList(newFileList)
              selectedFile({ ...newFile, id: fileRef.id })
              return newFileList
            })
          })
        })
    })
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
  return database()
    .collection('file')
    .doc(fileId)
    .onSnapshot(onSnapshot(fileId, 'file', identity, true, 'patchFile', (x) => ({ id: x.id })))
}

const listenForObjectAtPath = (path) => (userId, fileId) => {
  const identity = (x) => x
  return database()
    .collection(path)
    .doc(fileId)
    .onSnapshot(onSnapshot(fileId, path, identity, true))
}

const listenForArrayAtPath = (path) => (userId, fileId) => {
  const values = (x) => Object.values(x)
  return database().collection(path).doc(fileId).onSnapshot(onSnapshot(fileId, path, values, true))
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
  const unsubscribeFunctions = [
    fetchFile(userId, fileId),
    listenToBeats(userId, fileId),
    listenToCards(userId, fileId),
    listenToSeries(userId, fileId),
    listenToBooks(userId, fileId),
    listenToCategories(userId, fileId),
    listenToCharacters(userId, fileId),
    listenToCustomAttributes(userId, fileId),
    listenToLines(userId, fileId),
    listenToNotes(userId, fileId),
    listenToPlaces(userId, fileId),
    listenToTags(userId, fileId),
    listenTohierarchyLevels(userId, fileId),
    listenToImages(userId, fileId),
  ]
  return unsubscribeFunctions
}

export const stopListening = (unsubscribeFunctions) => {
  unsubscribeFunctions.forEach((fn) => {
    fn()
  })
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

export const searchForUsersByName = (searchTerm, withFoundUsers) => {
  if (searchTerm.length < 3) return Promise.reject(new Error('Search term too short'))
  console.log('Searching for users with: ', searchTerm)
  withFoundUsers([])
  return Promise.resolve([])
}
