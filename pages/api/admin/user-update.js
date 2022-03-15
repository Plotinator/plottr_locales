import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const auth = admin.auth()

export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(async () => {
    const { email, updateData } = req.body

    await auth
      .getUserByEmail(email)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        return auth
          .updateUser(userRecord.uid, updateData)
          .then((userRecord) => {
            return res.status(200).send({ success: true, user: userRecord })
          })
          .catch((error) => {
            return res.status(500).send({ where: 'updating data', error: error })
          })
      })
      .catch((error) => {
        return res.status(500).send({ where: 'fetching user', error: error })
      })
  })
}
