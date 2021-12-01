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

const auth = admin.auth()

export default (req, res) => {
  const { idToken } = req.body

  const expiresIn = 60 * 60 * 24 * 5 * 1000

  return auth.createSessionCookie(idToken, { expiresIn }).then(
    (sessionCookie) => {
      res.setHeader(
        'Set-Cookie',
        `session=${sessionCookie}; Max-Age=${expiresIn}; SameSite=Lax; HttpOnly`
      )
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ status: 'success' }))
      return Promise.resolve('success')
    },
    (error) => {
      console.error('Error while minting token', error)
      res.status(401).send('Unauthorized')
      return Promise.resolve('failed')
    }
  )
}
