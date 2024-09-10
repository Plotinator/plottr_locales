const admin = require('firebase-admin')
const fs = require('fs')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

const { readFile } = fs.promises

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
    return Promise.reject(Error('Invalid path for file to import from'))
  } else {
    console.log('Ready to import from:', filePath)
    const rl = readline.createInterface({ input: stdin, output: stdout })
    const now = new Date().toISOString()
    return new Promise((resolve, reject) => {
      rl.question('Please enter your user id: ', (executingUserId) => {
        return checkUserId(executingUserId)
          .then(() => {
            return readFile(filePath)
              .then((rawFile) => {
                return JSON.parse(rawFile.toString('utf8'))
              })
              .then((users) => {
                return sequencePromises(
                  users.map((user) => {
                    return () => {
                      const userId = user.uid
                      const plottrLicense = {
                        proLicense: {
                          effectiveStartDate: now,
                          purchaseDate: now,
                        },
                      }
                      const addLicenseActivation = admin
                        .firestore()
                        .doc(`licenseActivations/${userId}`)
                        .set(plottrLicense, { merge: true })
                      const addLicenseLogRecord = admin
                        .firestore()
                        .collection(
                          `licenseChangesFromImports/import-pro-from-lifetime-claim/${userId}`
                        )
                        .add({ plottrLicense, date: new Date().toISOString() })
                      return Promise.all([addLicenseActivation, addLicenseLogRecord]).catch(
                        (_error) => {
                          console.error('Failed to import record for user id: ', userId)
                        }
                      )
                    }
                  })
                )
              })
          })
          .then(resolve, reject)
      })
    })
  }
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
