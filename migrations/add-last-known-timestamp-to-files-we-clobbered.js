const admin = require('firebase-admin')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

const { logChange } = require('./log-change')
const { sequencePromises } = require('./util')

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
  const userId = argv[2]
  const rl = readline.createInterface({ input: stdin, output: stdout })
  rl.question(
    'Is this the production run?\n(Only "Yes" -case sensitive- will be interpreted as affirmative): ',
    (response) => {
      const readOnlyMode = response !== 'Yes'
      console.log('Read only mode: ', readOnlyMode)
      if (userId) {
        console.log('Checking for only user', userId)
      }
      rl.question('Please enter your userId: ', (executingUserId) => {
        checkUserId(executingUserId).then((proceed) => {
          if (proceed) {
            console.log('User exists.  Executing script.')
            createThunks(executingUserId, readOnlyMode, userId)
              .then((thunks) => {
                return sequencePromises(thunks)
              })
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
  )
}

const scriptToLookup = 'copy-known-file-information-to-authorisations.js'

const withoutProtocol = (url) => {
  if (!url) {
    return null
  } else {
    return url.replace(/^[a-zA-Z]+:\/\//, '')
  }
}

const createThunks = (executingUserId, readOnly, limitUserId) => {
  const database = admin.firestore()
  const runTransactionWithAuditing = logChange(readOnly)(
    database,
    executingUserId,
    'add-last-known-timestamp-to-files-we-clobbered.js',
    RUN_DATE
  )
  let query = database.collection('dbAuditLogs').where('scriptName', '==', scriptToLookup)
  if (limitUserId) {
    query = query.where('userId', '==', limitUserId)
  }

  return query.get().then((snapshot) => {
    const updateThunks = []
    snapshot.forEach((record) => {
      const data = record.data()
      // console.log('data', JSON.stringify(data, null, 2))
      const changeRecord = Object.values(data?.changes)[0]
      if (!changeRecord?.chagedTo?.lastOpened && !!changeRecord?.previous?.lastOpened) {
        const collectionName = changeRecord?.collectionName
        const fileId = withoutProtocol(changeRecord?.previous?.fileURL)
        if (!fileId || !collectionName) {
          console.warn('Incomplete audit log.  Ignoring.', JSON.stringify(data))
          return
        } else {
          const docPath = `${collectionName}/${fileId}`
          console.log(`> Considering ${docPath}`)
          updateThunks.push({
            restoredDate: data.runDate,
            docPath,
            process: () => {
              const userId = data.userId
              const change = {
                lastOpened: changeRecord.previous.lastOpened,
              }
              return database
                .doc(docPath)
                .get()
                .then((ref) => {
                  return ref.data()
                })
                .then((oldRecord) => {
                  if (oldRecord?.lastOpened) {
                    console.log(`> Processing ${docPath}`)
                    console.log(
                      '! Found that the current record has an lastOpened date.  Leaving it be.'
                    )
                    return Promise.resolve()
                  } else {
                    const newRecord = {
                      ...oldRecord,
                      ...change,
                    }
                    console.log(
                      `Adding ${JSON.stringify(
                        change,
                        null,
                        2
                      )} to ${docPath} to produce: ${JSON.stringify(newRecord, null, 2)}`
                    )
                    return runTransactionWithAuditing(
                      userId,
                      fileId,
                      collectionName,
                      oldRecord,
                      newRecord
                    )
                  }
                })
            },
          })
        }
      }
    })
    updateThunks.sort((entry1, entry2) => {
      return entry2.restoredDate - entry1.restoredDate
    })
    const filesSeen = new Set()
    const uniqueUpdateThunks = updateThunks.reduce((acc, next) => {
      if (filesSeen.has(next.docPath)) {
        return acc
      } else {
        filesSeen.add(next.docPath)
        return [...acc, next]
      }
    }, [])
    return uniqueUpdateThunks.map(({ process }) => {
      return process
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
