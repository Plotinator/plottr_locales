import { SUPPORT_EMAIL } from '../../../lib/admin/constants'
import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const database = admin.firestore()
const auth = admin.auth()

const permission = 'collaborator'

export default (req, res) => {
  return verifyAdminToken(auth, req, res).then(() => {
    const { fileId, currentShareRecords, supportID, unshare } = req.body

    if (unshare) {
      return database
        .doc(`authorisation/${supportID}/granted/${fileId}`)
        .delete()
        .then((result) => {
          // now remove the share record on the file object
          const newRecords = currentShareRecords.filter((rec) => rec.emailAddress !== SUPPORT_EMAIL)
          return database
            .doc(`file/${fileId}`)
            .update({ shareRecords: newRecords })
            .then((result) => {
              res.status(200)
              res.send('Success')
              return result
            })
            .catch((error) => {
              res.status(500)
              res.send('Error deleting share record')
              return Promise.resolve('Error deleting share record')
            })
        })
        .catch((error) => {
          res.status(500)
          res.send('Error deleting authorisation doc')
          return Promise.resolve('Error deleting authorisation doc')
        })
    } else {
      return database
        .doc(`authorisation/${supportID}/granted/${fileId}`)
        .set({ permission })
        .then((result) => {
          // now add the share record on the file object
          const newRecords = [
            ...currentShareRecords,
            { emailAddress: SUPPORT_EMAIL, permission: permission },
          ]
          return database
            .doc(`file/${fileId}`)
            .update({ shareRecords: newRecords })
            .then((result) => {
              res.status(200)
              res.send('Success')
              return result
            })
            .catch((error) => {
              res.status(500)
              res.send('Error creating share record')
              return Promise.resolve('Error creating share record')
            })
        })
        .catch((error) => {
          res.status(500)
          res.send('Error creating authorisation doc')
          return Promise.resolve('Error creating authorisation doc')
        })
    }
  })
}
