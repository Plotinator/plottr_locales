import { verifyToken } from './verify-token'

const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
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
  const { fileId, userId } = req.body

  return verifyToken(auth, req).then(() => {
    return database
      .collection(`authorisation/${userId}/granted`)
      .doc(fileId)
      .update({ timeStamp: new Date() })
      .then((result) => {
        res.status(200).send('')
        return result
      })
  })
}
