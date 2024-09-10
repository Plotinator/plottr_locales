const admin = require('firebase-admin')
const fs = require('fs')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

const { writeFile } = fs.promises

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
    // @ts-ignore
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    // @ts-ignore
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

// test@test.com (on CI): 'ToWgxrNhLif4O89bZD2jhAQQYJ83'
const main = (argv) => {
  const filePath = argv[2]
  if (!filePath || typeof filePath !== 'string') {
    return Promise.reject(Error('Invalid path for file to dump to'))
  } else {
    console.log('Ready to dump to:', filePath)
    const rl = readline.createInterface({ input: stdin, output: stdout })
    return new Promise((resolve, reject) => {
      rl.question('Please enter your user id: ', (executingUserId) => {
        return checkUserId(executingUserId)
          .then(() => {
            return allUsers().then((users) => {
              return users
                .map((user) => {
                  const { uid, email, customClaims } = user
                  if (customClaims?.lifetime === true) {
                    return { uid, email, lifetime: true }
                  } else {
                    return null
                  }
                })
                .filter(Boolean)
            })
          })
          .then(resolve, reject)
      })
    }).then((results) => {
      return writeFile(filePath, JSON.stringify(results, null, 2))
    })
  }
}

const allUsers = () => {
  function iter(acc, nextPageToken) {
    return admin
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        const nextUsers = listUsersResult.users.map((user) => {
          return user
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
      }

      return Promise.reject(error)
    })
}

main(process.argv)
  .then(() => {
    console.log('Success!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
