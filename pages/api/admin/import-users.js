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
// i just need it for importing people who weren't imported properly
// so it's slightly insecure, but it's only going to be live for a week
// NOTES:
// https://carluc.ci/cracking-wordpress-password-hash/
export default async (req, res) => {
  const { users, superNotSecretKey } = req.body

  if (superNotSecretKey != 'magic~horse!cantelope') return res.status(500).send('')

  let allFrbUsers = {}
  let frbUsersCount = 0
  let usersThatFailed = []
  let usersToImport = []
  let numToImport = 0
  let successCount = 0
  let failureCount = 0

  const listAllUsers = (nextPageToken) => {
    // List batch of users, 1000 at a time.
    return admin
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
          allFrbUsers[userRecord.email] = true
        })
        if (listUsersResult.pageToken) {
          // List next batch of users.
          return listAllUsers(listUsersResult.pageToken)
        }
      })
      .catch((error) => {
        console.log('Error listing users:', error)
      })
  }

  try {
    // Start listing users from the beginning, 1000 at a time.
    await listAllUsers()

    frbUsersCount = Object.keys(allFrbUsers).length

    // find WP users that don't have a Frb account
    usersToImport = users.reduce((acc, user) => {
      // check if they have a Frb account already
      if (!allFrbUsers[user.user_email.toLowerCase()]) {
        // no Frb account? add it to import
        acc.push(user)
      }
      return acc
    }, [])

    // taken from our import cloud function that comes with the Integrate Firebase PRO plugin
    const transformedUsers = transformWordPressUsers(usersToImport)
    numToImport = transformedUsers.length

    // now import them into Frb in bulk
    await admin
      .auth()
      .importUsers(transformedUsers, { hash: { algorithm: 'MD5', rounds: 8192 } })
      .then((userImportResult) => {
        successCount = userImportResult.successCount
        failureCount = userImportResult.failureCount
        userImportResult.errors.forEach((indexedError) => {
          // The corresponding user that failed to upload.
          console.log('Error ' + indexedError.index, ' failed to import: ', indexedError.error)
          usersThatFailed.push(transformedUsers[indexedError.index])
        })
      })
      .catch((error) => {
        console.error(error)
      })
  } catch (error) {
    return res.status(500).json({ failed: true, message: error.message })
  }

  return res.status(200).send({
    attempted: numToImport,
    frbUsersCount: frbUsersCount,
    successCount,
    failureCount,
    failed: usersThatFailed,
  })
}

function transformWordPressUsers(users) {
  let firebaseUsers = []
  for (const user of users) {
    const salt = user.user_pass.substr(4, 8)
    const hash = base64Translate(user.user_pass.substr(12))
    // Skip if email is empty
    if (user.user_email) {
      firebaseUsers.push({
        uid: user.user_login,
        email: user.user_email,
        passwordHash: Buffer.from(hash.toString('hex')),
        passwordSalt: Buffer.from(salt),
        displayName: user.display_name || '',
      })
    }
  }
  return firebaseUsers
}

function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = length; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))]
  }
  return result
}

const phpassBase64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
function base64Translate(input) {
  const res = [0]
  let currentBit = 0
  let index = 0
  input.split('').forEach((l) => {
    const i = phpassBase64.indexOf(l)
    res[index] += (i << currentBit) & 0xff
    currentBit += 6
    if (currentBit >= 8) {
      currentBit -= 8
      index++
      res.push(i >> (6 - currentBit))
    }
  })
  if (res[res.length - 1] === 0) res.pop()
  return Buffer.from(res)
}
