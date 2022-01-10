const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'preview') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const database = admin.firestore()
const auth = admin.auth()

export default async (req, res) => {
  const { email, uid, admin } = req.body

  if (admin != 'jmcTVOMxrhJPFsAISU2euqDKiOvy') return res.status(500).send('')

  let userUID = uid

  if (!uid) {
    userUID = await auth()
      .getUserByEmail(email)
      .then((userRecord) => {
        return userRecord.uid
      })
      .catch((error) => {
        console.log('Error fetching user data:', email)
        console.error(error)
        return null
      })
  }

  // now list projects
  try {
    const projects = []
    await database
      .collection('authorisation')
      .doc(userUID)
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

    return res.status(200).send({ projects, files: fileObjs })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error })
  }
}
