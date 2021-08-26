const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'production' || process.env.FIREBASE_ENV === 'preview') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const database = admin.firestore()

export default (req, res) => {
  const file = req.body.file
  const fileRecord = req.body.fileRecord
  const userId = req.query.userId
  return database
    .collection('file')
    .add(fileRecord)
    .then((fileRef) => {
      return database
        .collection(`authorisation/${userId}/granted`)
        .doc(fileRef.id)
        .set({
          permission: 'owner',
        })
        .then((permissionDocRef) => {
          const requests = [
            database.collection('ui').doc(fileRef.id).set(file.ui),
            database.collection('beats').doc(fileRef.id).set(file.beats),
            database
              .collection('cards')
              .doc(fileRef.id)
              .set({ ...file.cards }),
            database.collection('series').doc(fileRef.id).set(file.series),
            database.collection('books').doc(fileRef.id).set(file.books),
            database.collection('categories').doc(fileRef.id).set(file.categories),
            database
              .collection('characters')
              .doc(fileRef.id)
              .set({ ...file.characters }),
            database.collection('customAttributes').doc(fileRef.id).set(file.customAttributes),
            database
              .collection('lines')
              .doc(fileRef.id)
              .set({ ...file.lines }),
            database
              .collection('notes')
              .doc(fileRef.id)
              .set({ ...file.notes }),
            database
              .collection('places')
              .doc(fileRef.id)
              .set({ ...file.places }),
            database
              .collection('tags')
              .doc(fileRef.id)
              .set({ ...file.tags }),
            database.collection('hierarchyLevels').doc(fileRef.id).set(file.hierarchyLevels),
            database.collection('images').doc(fileRef.id).set(file.images),
            database.collection('featureFlags').doc(fileRef.id).set(file.featureFlags),
          ]
          return Promise.all(requests).then((results) => ({ fileId: fileRef.id }))
        })
    })
    .then(({ fileId }) => {
      res.status(200).json({ fileId })
    })
}
