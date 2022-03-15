import auth from '../../../lib/admin/auth'
import { verifyAdminToken } from '../verify-token'

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
