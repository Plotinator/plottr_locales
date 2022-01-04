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

export default async (req, res) => {
  const { email, uid, admin } = req.body

  if (admin != 'jmcTVOMxrhJPFsAISU2euqDKiOvy') return res.status(500).send('')

  let userUID = uid

  if (!uid) {
    userUID = await admin
      .auth()
      .getUserByEmail(email)
      .then((userRecord) => {
        return userRecord.uid
      })
      .catch((error) => {
        console.log('Error fetching user data:', email)
        return null
      })
  }

  // now list projects
  try {
    const projects = await database.collection('authorisation').doc(userUID).collection('granted')
    console.log('projects', projects)
    const fileObjs = await Promise.all(
      Object.keys(projects).map((id) => database.collection('file').doc(id))
    )
    console.log('fileObjs', fileObjs)

    return res.status(200).send({ projects, files: fileObjs })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
