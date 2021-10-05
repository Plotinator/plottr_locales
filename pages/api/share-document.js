const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'preview') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const database = admin.firestore()
const auth = admin.auth()

export default (req, res) => {
  const { fileId, emailAddress, permission, userId } = req.body

  return database
    .doc(`authorisation/${userId}/granted/${fileId}`)
    .get()
    .then((documentRef) => {
      if (documentRef.exists) {
        const data = documentRef.data()
        if (data.permission === 'owner') {
          return auth
            .getUserByEmail(emailAddress)
            .then((user) => {
              return database
                .doc(`authorisation/${user.uid}/granted/${fileId}`)
                .set({ permission })
                .then((result) => {
                  res.status(200)
                  res.end()
                  return result
                })
            })
            .catch((error) => {
              res.status(400)
              res.send('No user found with that email address')
              return Promise.resolve('No user found with that email address')
            })
        }
      }
      console.error(`User <${userId}> doesn't own document <${fileId}> and can't share it.`)
      res.status(400)
      res.send(`We're having trouble sharing the document with that user.`)
      return Promise.resolve(
        `User <${userId}> doesn't own document <${fileId}> and can't share it.`
      )
    })
    .catch((error) => {
      res.status(503)
      res.send(`Error sharing document ${fileId} to ${emailAddress}: ${error}`)
      console.error(`Error sharing document ${fileId} to ${emailAddress}`, error)
    })
}
