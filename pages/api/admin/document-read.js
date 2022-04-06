import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const database = admin.firestore()
const auth = admin.auth()

export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(async () => {
    const { collection, docID } = req.body

    try {
      return await database
        .collection(collection)
        .doc(docID)
        .get()
        .then((doc) => {
          if (doc.exists) {
            return res.status(200).send({ document: doc.data() })
          } else {
            res.status(404).send('Does not exist')
            return Promise.resolve('Error fetching document')
          }
        })
        .catch((error) => {
          res.status(500).send({ error })
          return Promise.resolve('Error fetching document')
        })
    } catch (error) {
      console.error(error)
      return res.status(500).send({ error })
    }
  })
}
