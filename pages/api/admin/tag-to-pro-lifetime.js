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
  const { key } = req.query

  if (key != 'A2eFc15') return res.status(500).send('')

  const email = req.body['contact[email]']
  const tags = req.body['contact[tags]']
  console.log('PRO-LIFETIME-HOOK', email, new Date().toString())

  // check that the contact has the right tag
  if (!tags.includes('Plottr: Customer - Pro - Lifetime')) {
    return res.status(400).send({ where: 'checking tag', error: 'doesnt have right tag' })
  }

  // look up in Frb
  await admin
    .auth()
    .getUserByEmail(email)
    .then((userRecord) => {
      // add "lifetime" claim
      const claims = {
        ...userRecord.customClaims,
        lifetime: true,
      }
      return admin
        .auth()
        .setCustomUserClaims(userRecord.uid, claims)
        .then(() => {
          console.log('Successfully added claims', email, userRecord.uid, claims)
          return res.status(200).send({ success: true })
        })
        .catch((error) => {
          console.log('Error adding claims', error)
          return res.status(500).send({ where: 'adding claim', error: error })
        })
    })
    .catch((error) => {
      console.log('Error fetching user data:', email)
      return res.status(500).send({ where: 'fetching user', error: error })
    })
}
