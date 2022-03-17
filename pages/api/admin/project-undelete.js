import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const database = admin.firestore()
const auth = admin.auth()

// const deleteVal = admin.firestore.FieldValue.delete() // tells firestore to delete the field

export default (req, res) => {
  return verifyAdminToken(auth, req, res).then(() => {
    const { fileId } = req.body

    const requests = [
      database.collection('file').doc(fileId).udpate({ deleted: false }),
      database.collection('beats').doc(fileId).udpate({ deleted: false }),
      database.collection('cards').doc(fileId).udpate({ deleted: false }),
      database.collection('series').doc(fileId).udpate({ deleted: false }),
      database.collection('books').doc(fileId).udpate({ deleted: false }),
      database.collection('categories').doc(fileId).udpate({ deleted: false }),
      database.collection('characters').doc(fileId).udpate({ deleted: false }),
      database.collection('customAttributes').doc(fileId).udpate({ deleted: false }),
      database.collection('lines').doc(fileId).udpate({ deleted: false }),
      database.collection('notes').doc(fileId).udpate({ deleted: false }),
      database.collection('places').doc(fileId).udpate({ deleted: false }),
      database.collection('tags').doc(fileId).udpate({ deleted: false }),
      database.collection('hierarchyLevels').doc(fileId).udpate({ deleted: false }),
      database.collection('images').doc(fileId).udpate({ deleted: false }),
    ]
    return Promise.all(requests)
      .then((results) => {
        res.status(200).send('Success')
        return results
      })
      .catch((error) => {
        res.status(500).send({ error })
        return Promise.resolve('Error un-deleting the project')
      })
  })
}
