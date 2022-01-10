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

export default async (req, res) => {
  const { collection, docID, json, admin } = req.body

  if (admin != 'jmcTVOMxrhJPFsAISU2euqDKiOvy') return res.status(500).send('')

  try {
    await database.collection(collection).doc(docID).set(json)

    return res.status(200).send({ result: 'success' })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error })
  }
}
