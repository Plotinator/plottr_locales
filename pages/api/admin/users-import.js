import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const auth = admin.auth()

// this endpoint shouldn't be needed much
// it's used to import people who weren't created properly from WP
// NOTES:
// https://carluc.ci/cracking-wordpress-password-hash/
export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(async () => {
    const { users } = req.body

    let allFrbUsers = {}
    let frbUsersCount = 0
    let usersThatFailed = []
    let usersToImport = []
    let numToImport = 0
    let successCount = 0
    let failureCount = 0

    const listAllUsers = (nextPageToken) => {
      // List batch of users, 1000 at a time.
      return auth
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
      await auth
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
