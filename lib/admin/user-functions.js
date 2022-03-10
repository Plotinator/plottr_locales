import admin from './frb-admin'

export async function getFrbUser(email) {
  return await admin
    .auth()
    .getUserByEmail(email)
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      return [false, userRecord]
    })
    .catch((error) => {
      return [error, null]
    })
}

// this overwrites current claims
export async function setCustomClaims(uid, claims) {
  return admin
    .auth()
    .setCustomUserClaims(uid, claims)
    .then(() => {
      return [null, true]
    })
    .catch((error) => {
      return [error, false]
    })
}
