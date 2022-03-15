import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const auth = admin.auth()

export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(async () => {
    const { email } = req.body

    const record = await auth
      .getUserByEmail(email)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        return userRecord
      })
      .catch((error) => {
        console.log('Error fetching user data:', email)
        return null
      })

    return res.status(200).send({ user: record })
  })
}
