const admin = require('firebase-admin')
const firebase = require('firebase/app')
const files = require('./files.json')
require('firebase/auth')

const projectId = 'plottr'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
admin.initializeApp({ projectId })

const database = admin.firestore()

function seedDatabase() {
  try {
    const result = createExampleFiles()
    console.log('database seed was successful')
    return result
  } catch (error) {
    console.log(error, 'database seed failed')
    throw new error(error)
  }
}

function createExampleFiles() {
  return Promise.all(
    files.map((record) => {
      return database
        .collection('file')
        .add(record.file)
        .then((documentReference) => {
          const id = documentReference.id
          return Promise.all(
            Object.keys(record).map((key) => {
              if (key === 'file') return
              database
                .collection(key)
                .doc(id)
                .set({
                  ...record[key],
                  fileId: id,
                })
            })
          )
        })
    })
  )
}

function createTestUser() {
  const firebaseConfig = {
    apiKey: 'AIzaSyBhfNFWZjphkIWz9U36yJ6VLWxVYHTmy_I',
    authDomain: 'plottr-firestore-poc-2.firebaseapp.com',
    projectId: 'plottr-firestore-poc-2',
    storageBucket: 'plottr-firestore-poc-2.appspot.com',
    messagingSenderId: '692909170189',
    appId: '1:692909170189:web:1218c1e699ce99bbff3f44',
  }
  firebase.initializeApp(firebaseConfig)
  const auth = firebase.auth()
  auth.useEmulator('http://plottr.local:9099')
  firebase
    .auth()
    .createUserWithEmailAndPassword('test@test.com', 'tester')
    .then(() => {
      console.log('Created user test@test.com')
    })
}

seedDatabase().then((results) => {
  createTestUser()
})
