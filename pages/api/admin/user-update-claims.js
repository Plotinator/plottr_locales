import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const auth = admin.auth()

export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(() => {
    const { userID, claims } = req.body

    return auth
      .setCustomUserClaims(userID, claims)
      .then(() => {
        return res.status(200).send('Success')
      })
      .catch((error) => {
        res.status(500).send({ error })
        return Promise.resolve('Error adding claims')
      })
  })
}
