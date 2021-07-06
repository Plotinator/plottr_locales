import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

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

export const newFile = (
  emailAddress,
  userId,
  fileName,
  fullState,
  setFileList,
  selectedFile,
  clientId
) => {
  const file = fullState.present
  const newFile = {
    ...file.file,
    none: false,
    fileName,
    shareRecords: [{ emailAddress, permission: 'owner' }],
  }
  delete newFile.id

  return axios
    .post(
      '/api/new-file',
      {
        fileRecord: newFile,
        file,
      },
      { params: { userId } }
    )
    .then((response) => {
      const fileId = response.fileId
      listen(userId, fileId, clientId)
      return fetchFiles(userId).then((newFileList) => {
        setFileList(newFileList)
        selectedFile({ ...newFile, id: fileId })
        return newFileList
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
  (
    fileId,
    path,
    withData,
    patching,
    clientId,
    loadFunctionKey = 'load',
    usingFromDocRef = () => ({})
  ) =>
  (documentRef) => {
    const data = documentRef.data()
    if (data.clientId === clientId) return
    delete data.fileId
    delete data.clientId
    store.dispatch(
      patchActions(path)[loadFunctionKey](
        patching,
        withData({ ...usingFromDocRef(documentRef), ...data })
      )
    )
  }

export const fetchFile = (userId, fileId, clientId) => {
  const identity = (x) => x
  return database()
    .collection('file')
    .doc(fileId)
    .onSnapshot(
      onSnapshot(fileId, 'file', identity, true, clientId, 'patchFile', (x) => ({ id: x.id }))
    )
}

const listenForObjectAtPath = (path) => (userId, fileId, clientId) => {
  const identity = (x) => x
  return database()
    .collection(path)
    .doc(fileId)
    .onSnapshot(onSnapshot(fileId, path, identity, true, clientId))
}

const listenForArrayAtPath = (path) => (userId, fileId, clientId) => {
  const values = (x) => Object.values(x)
  return database()
    .collection(path)
    .doc(fileId)
    .onSnapshot(onSnapshot(fileId, path, values, true, clientId))
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
export const listenToClient = listenForObjectAtPath('client')

export const listen = (userId, fileId, clientId) => {
  const unsubscribeFunctions = [
    fetchFile(userId, fileId, clientId),
    listenToBeats(userId, fileId, clientId),
    listenToCards(userId, fileId, clientId),
    listenToSeries(userId, fileId, clientId),
    listenToBooks(userId, fileId, clientId),
    listenToCategories(userId, fileId, clientId),
    listenToCharacters(userId, fileId, clientId),
    listenToCustomAttributes(userId, fileId, clientId),
    listenToLines(userId, fileId, clientId),
    listenToNotes(userId, fileId, clientId),
    listenToPlaces(userId, fileId, clientId),
    listenToTags(userId, fileId, clientId),
    listenTohierarchyLevels(userId, fileId, clientId),
    listenToImages(userId, fileId, clientId),
    listenToClient(userId, fileId, clientId),
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

export const patch = (path, fileId, payload, clientId) => {
  return database()
    .collection(path)
    .doc(fileId)
    .update({
      ...payload,
      clientId,
      fileId,
    })
}

export const shareDocument = (fileId, emailAddress) => {
  const invitationToken = uuidv4()
  return database()
    .collection('file')
    .doc(fileId)
    .set(
      { pending: [{ emailAddress, invitationToken, permission: 'collaborator' }] },
      { merge: true }
    )
    .then((result) => {
      return axios.post('/api/email-invitation', { invitationToken, fileId })
    })
}
