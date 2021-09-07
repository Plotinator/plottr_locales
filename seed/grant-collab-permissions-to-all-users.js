const admin = require('firebase-admin')

process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
const projectId = 'plottr-ci'
admin.initializeApp({ projectId })

const database = admin.firestore()
const auth = admin.auth()

function grantAllPermissions() {
  database
    .collection('file')
    .get()
    .then((documents) => {
      documents.forEach(({ id }) => {
        auth.listUsers().then((response) => {
          response.users.forEach(({ uid }) => {
            console.log(`Granting collaborator for user: ${uid}, to: ${id}`)
            database.collection(`authorisation/${uid}/granted`).doc(id).set({
              permission: 'collaborator',
            })
          })
        })
      })
    })
}

grantAllPermissions()
