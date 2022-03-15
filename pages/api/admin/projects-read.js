import admin from '../../../lib/admin/frbAdmin'
import { verifyAdminToken } from '../verify-token'

const database = admin.firestore()
const auth = admin.auth()

export default async (req, res) => {
  return verifyAdminToken(auth, req, res).then(async () => {
    const { email } = req.body

    await auth
      .getUserByEmail(email)
      .then(async (userRecord) => {
        // now list projects
        try {
          const projects = []
          await database
            .collection('authorisation')
            .doc(userRecord.uid)
            .collection('granted')
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                projects.push(doc.id)
              })
            })
            .catch((error) => {
              console.error('Error fetching projects', error)
              return []
            })

          const fileObjs = []
          await Promise.all(
            projects.map((id) =>
              database
                .collection('file')
                .doc(id)
                .get()
                .then((doc) => {
                  if (doc.exists) {
                    const data = {
                      ...doc.data(),
                      id: doc.id,
                    }
                    fileObjs.push(data)
                  }
                })
                .catch((error) => {
                  console.error('Error fetching file objects for ID:', id, error)
                  return []
                })
            )
          )

          return res.status(200).send({ projects, files: fileObjs, user: userRecord })
        } catch (error) {
          console.error(error)
          return res.status(500).send({ error })
        }
      })
      .catch((error) => {
        console.error(error)
        return res.status(500).send({ error })
      })
  })
}
