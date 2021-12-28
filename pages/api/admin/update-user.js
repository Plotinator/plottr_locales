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

export default async (req, res) => {
  const { email, updateData, superNotSecretKey } = req.body

  if (superNotSecretKey != 'magic$poney^honeydew') return res.status(500).send('')

  await admin
    .auth()
    .getUserByEmail(email)
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      return admin
        .auth()
        .updateUser(userRecord.uid, updateData)
        .then((userRecord) => {
          console.log('Successfully updated data', email, userRecord.email)
          return res.status(200).send({ success: true, userRecord })
        })
        .catch((error) => {
          console.log('Error updating user data:', email)
          return res.status(500).send({ where: 'updating data', error: error })
        })
    })
    .catch((error) => {
      console.log('Error fetching user data:', email)
      return res.status(500).send({ where: 'fetching user', error: error })
    })
}
