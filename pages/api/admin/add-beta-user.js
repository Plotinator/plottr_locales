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

// this is not going to be a permanent endpoint
// i just need it for adding people to the beta
// so it's slightly insecure, but it's only going to live for a week
export default async (req, res) => {
  const { emails, superNotSecretKey } = req.body

  if (superNotSecretKey != 'magic~horse!watermelon') return res.status(500).send('')

  let emailsThatFailed = []
  let resultingClaims = []

  // create accounts with emails
  const uids = await Promise.all(
    emails.map((em) => {
      return admin
        .auth()
        .createUser({ email: em, password: 'betaPW@3' })
        .then((userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Success', userRecord.email, userRecord.uid, userRecord.customClaims)
          return { uid: userRecord.uid, claims: userRecord.customClaims, email: userRecord.email }
        })
        .catch((error) => {
          console.log('Error creating user:', em)
          emailsThatFailed.push(em)
          return null
        })
    })
  )

  // now add the custom claim
  await Promise.all(
    uids.filter(Boolean).map((obj) => {
      const claims = {
        ...obj.claims,
        beta: true,
      }
      resultingClaims.push({ email: obj.email, claims: claims })
      return admin
        .auth()
        .setCustomUserClaims(obj.uid, claims)
        .then(() => {
          console.log('Successfully added claims', obj.uid)
          return true
        })
        .catch((error) => {
          console.log('Error adding claims', error)
          return false
        })
    })
  )

  return res.status(200).send({ results: resultingClaims, rejected: emailsThatFailed })
}
