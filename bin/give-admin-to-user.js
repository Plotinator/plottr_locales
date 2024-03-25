const admin = require('firebase-admin')

const { sequencePromises } = require('../migrations/util')

if (!admin.apps.length) {
  if (!process.env.FIREBASE_ENV || process.env.FIREBASE_ENV === '') {
    console.error(
      'No FIREBASE_ENV set.  Please set one and try again.  Options: "development", "preview" or "production".'
    )
    process.exit(1)
  } else if (process.env.FIREBASE_ENV === 'development') {
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

const auth = admin.auth()

function main(args) {
  const userEmails = args.slice(2)
  console.log(`Adding admin claim to: ${userEmails}`)
  sequencePromises(
    userEmails.map((userEmail) => {
      return () => {
        return addClaim(userEmail)
      }
    })
  )
    .then(() => {
      console.log('Done!')
    })
    .catch((error) => {
      console.error('Error', error)
    })
}

const addClaim = (userEmail) => {
  console.log('Finder user with email ', userEmail)
  return auth
    .getUserByEmail(userEmail)
    .then((user) => {
      console.log(
        'Found user.  Setting claims for ${user.uid} from',
        JSON.stringify(user.customClaims, null, 2),
        'to:',
        JSON.stringify({ ...user.customClaims, admin: true }, null, 2)
      )
      return auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true })
    })
    .catch((error) => {
      console.error(`Error finding user with email ${userEmail}`)
      return Promise.resolve()
    })
}

main(process.argv)
