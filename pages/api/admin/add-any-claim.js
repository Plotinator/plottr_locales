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
  const { emails, claims, superNotSecretKey } = req.body

  if (superNotSecretKey != 'magic$poney^honeydew') return res.status(500).send('')

  let emailsWithoutUID = []
  let resultingClaims = []

  // fetch uids from emails
  const uids = await Promise.all(
    emails.map((em) => {
      return admin
        .auth()
        .getUserByEmail(em)
        .then((userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          return { uid: userRecord.uid, claims: userRecord.customClaims, email: userRecord.email }
        })
        .catch((error) => {
          emailsWithoutUID.push(em)
          return null
        })
    })
  )

  // now add the custom claims
  await Promise.all(
    uids.filter(Boolean).map((obj) => {
      const newClaims = claims.reduce(
        (acc, cl) => {
          return {
            ...acc,
            ...cl,
          }
        },
        { ...obj.claims }
      )
      resultingClaims.push({ email: obj.email, claims: newClaims })
      return admin
        .auth()
        .setCustomUserClaims(obj.uid, newClaims)
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

  return res.status(200).send({ results: resultingClaims, rejected: emailsWithoutUID })
}
