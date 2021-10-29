import { verifyToken } from './verify-token'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199'
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
const storage = admin.storage()
const auth = admin.auth()
const baseBucket =
  process.env.FIREBASE_ENV === 'production' ? 'plottr.appspot.com' : 'plottr-ci.appspot.com'

const withoutStorageProtocal = (path) => {
  const split = path.split(/[a-zA-Z0-9]+:\/\//g)
  if (split.length > 1) return split[1]
  return split
}

export default (req, res) => {
  return verifyToken(auth, req)
    .then(() => {
      const storageURL = req.query.url
      const fileId = req.query.fileId
      const userId = req.query.userId
      const bucket = storage.bucket(baseBucket)
      return database
        .doc(`authorisation/${userId}/granted/${fileId}`)
        .get()
        .then((file) => {
          const permission = file?.data()?.permission
          if (permission === 'owner' || permission === 'collaborator' || permission === 'viewer') {
            const expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + 1)
            const config = {
              action: 'read',
              expires: `${
                expiryDate.getMonth() + 1
              }-${expiryDate.getDate()}-${expiryDate.getFullYear()}`,
            }
            return bucket.file(withoutStorageProtocal(storageURL)).getSignedUrl(config)
          }
          throw new Error(`Permission denied when accessing: ${storageURL}`)
        })
    })
    .then((publicURL) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ publicURL }))
    })
}
