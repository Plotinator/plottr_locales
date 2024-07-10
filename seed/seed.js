const admin = require('firebase-admin')
// @ts-ignore
const files = require('./files.json')

const projectId = 'plottr-ci'
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
admin.initializeApp({ projectId })

const database = admin.firestore()

function seedDatabase() {
  try {
    const result = createExampleFiles()
    console.log('database seed was successful')
    return result
  } catch (error) {
    console.log(error, 'database seed failed')
    throw new error(error)
  }
}

function createExampleFiles() {
  return Promise.all(
    files.map((record) => {
      return database
        .collection('file')
        .add(record.file)
        .then((documentReference) => {
          const id = documentReference.id
          return Promise.all(
            Object.keys(record).map((key) => {
              if (key === 'file') return
              database
                .collection(key)
                .doc(id)
                .set({
                  ...record[key],
                  fileId: id,
                })
            })
          )
        })
    })
  )
}

function createTestUser() {
  const now = new Date()
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  admin
    .auth()
    .createUser({ email: 'test@test.com', password: 'tester' })
    .then(() => {
      console.log('Created user test@test.com')
      return admin
        .auth()
        .getUserByEmail('test@test.com')
        .then((user) => {
          return database
            .collection('licenseActivations')
            .doc(user.uid)
            .set({
              proLicense: {
                effectiveStartDate: now.toISOString(),
                effectiveEndDate: nextMonth.toISOString(),
              },
            })
        })
    })
    .then(() => {
      return admin
        .auth()
        .createUser({ email: 'test2@test.com', password: 'tester' })
        .then(() => {
          console.log('Created user test2@test.com')
          return admin
            .auth()
            .getUserByEmail('test2@test.com')
            .then((user) => {
              return database
                .collection('licenseActivations')
                .doc(user.uid)
                .set({
                  proLicense: {
                    effectiveStartDate: now.toISOString(),
                    effectiveEndDate: nextMonth.toISOString(),
                  },
                })
            })
        })
    })
}

seedDatabase().then((results) => {
  console.log('Results', results)
  createTestUser()
})
