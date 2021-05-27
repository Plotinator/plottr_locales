import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

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

  database = firebase.database()
  auth = firebase.auth()
  if (window.location.hostname === 'plottr.local') {
    database.useEmulator('plottr.local', 9000)
    auth.useEmulator('http://plottr.local:9099')
  }
}

export const fetchInitialState = (userId, fileId) => {
  const initialStateRef = database.ref(`/users/${userId}/files/${fileId}`)
  initialStateRef.once('value', (snapshot) => {
    store.dispatch(ui.loadFile(fileId, false, snapshot.val(), '2021.5.31'))
  })
}

const listenForPath = (path) => (userId, fileId) => {
  const pathRef = database.ref(`/users/${userId}/files/${fileId}/${path}`)
  const currentState = store.getState()
  pathRef.on('value', (snapshot) => {
    store.dispatch(
      ui.loadFile(
        fileId,
        false,
        {
          ...currentState.present,
          [path]: snapshot.val(),
        },
        '2021.5.31'
      )
    )
  })
}

export const listenToBeats = listenForPath('beats')
export const listenToCards = listenForPath('cards')
export const listenToSeries = listenForPath('series')
export const listenToBooks = listenForPath('books')
export const listenToCategories = listenForPath('categories')
export const listenToCharacters = listenForPath('characters')
export const listenToCustomAttributes = listenForPath('customAttributes')
export const listenToLines = listenForPath('lines')
export const listenToNotes = listenForPath('notes')
export const listenToPlaces = listenForPath('places')
export const listenToTags = listenForPath('tags')
export const listenTohierarchyLevels = listenForPath('hierarchyLevels')
export const listenToImages = listenForPath('images')

export const listen = (userId, fileId) => {
  fetchInitialState(userId, fileId)
  // listenToBeats(userId, fileId)
  // listenToCards(userId, fileId)
  // listenToSeries(userId, fileId)
  // listenToBooks(userId, fileId)
  // listenToCategories(userId, fileId)
  // listenToCharacters(userId, fileId)
  // listenToCustomAttributes(userId, fileId)
  // listenToLines(userId, fileId)
  // listenToNotes(userId, fileId)
  // listenToPlaces(userId, fileId)
  // listenToTags(userId, fileId)
  // listenTohierarchyLevels(userId, fileId)
  // listenToImages(userId, fileId)
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
