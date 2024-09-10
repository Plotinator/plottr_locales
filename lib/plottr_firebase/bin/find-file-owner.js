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
  const fileId = argv[2]
  if (!fileId || fileId === '') {
    console.log('Please supply a file id to inspect as the sole argument.')
    process.exit(1)
  } else {
    console.log('Running for file id.', fileId)
    rl.question('Please enter your userId: ', (executingUserId) => {
      checkUserId(executingUserId).then((proceed) => {
        if (proceed) {
          console.log('User exists.  Executing script.')
          allUserIds().then((uids) => {
            return findFileOwner(uids, fileId)
              .then(() => {
                process.exit(0)
              })
              .catch((error) => {
                console.error('Something went wrong', error)
              })
          })
        } else {
          process.exit(1)
        }
      })
    })
  }
}

const findFileOwner = (userIds, fileId) => {
  console.log('We have the user ids.  Now to look for who owns the file.')
  function findIter(uids) {
    const next = uids[0]
    if (!next) {
      return Promise.reject(new Error('Not found!'))
    } else {
      console.log('> Checking ', next)
      return doesUserOwnFile(next, fileId).then((ownsIt) => {
        if (ownsIt) {
          return Promise.resolve(next)
        } else {
          return findIter(uids.slice(1))
        }
      })
    }
  }
  return findIter(userIds)
}

const doesUserOwnFile = (userId, fileId) => {
  const database = admin.firestore()
  return database
    .doc(`authorisation/${userId}/granted/${fileId}`)
    .get()
    .then((result) => {
      return result.exists
    })
}

const allUserIds = () => {
  function iter(acc, nextPageToken) {
    return admin
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        const nextUsers = listUsersResult.users.map((user) => {
          return user.uid
        })
        if (listUsersResult.pageToken) {
          return iter([...nextUsers, ...acc], listUsersResult.pageToken)
        } else {
          return acc
        }
      })
      .catch((error) => {
        console.log('Error listing users:', error)
      })
  }

  return iter([])
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
