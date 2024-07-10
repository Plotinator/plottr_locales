const admin = require('firebase-admin')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

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
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY ?? '')
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY ?? '')
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const RUN_DATE = new Date()

const main = (argv) => {
  const rl = readline.createInterface({ input: stdin, output: stdout })
  const userId = argv[2]
  if (!userId || userId === '') {
    console.log('Please supply a user id to inspect as the sole argument.')
  } else {
    console.log('Running for user id.', userId)
    rl.question('Please enter your userId: ', (executingUserId) => {
      checkUserId(executingUserId).then((proceed) => {
        if (proceed) {
          console.log('User exists.  Executing script.')
          findAuditEntries(userId)
            .then(() => {
              process.exit(0)
            })
            .catch((error) => {
              console.error('Something went wrong', error)
            })
        } else {
          process.exit(1)
        }
      })
    })
  }
}

const findAuditEntries = (userId) => {
  const database = admin.firestore()
  return database
    .collection('dbAuditLogs')
    .where('userId', '==', userId)
    .get()
    .then((snapshot) => {
      console.log('Found Records')
      console.log('=============')
      snapshot.forEach((record) => {
        console.log(JSON.stringify(record.data(), null, 2))
      })
    })
}

const checkUserId = (userId) => {
  return admin
    .auth()
    .getUser(userId)
    .catch((error) => {
      if (error.errorInfo.code === 'auth/user-not-found') {
        console.error('Executing user does not exist.  Please check the user id!')
        return false
      }

      return Promise.reject(error)
    })
}

main(process.argv)
