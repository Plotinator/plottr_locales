import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const auth = admin.auth()

export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(async () => {
    const { email, pw } = req.body

    const newRecord = await auth
      .createUser({ email: email, password: pw })
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        return userRecord
      })
      .catch((error) => {
        console.log('Error creating user:', email)
        console.error(error)
        return null
      })

    return res.status(200).send({ user: newRecord })
  })
}
