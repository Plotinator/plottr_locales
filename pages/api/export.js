const admin = require('firebase-admin')
import fs from 'fs'
import askToExport from '../../lib/exporter/start_export'

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'preview') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const baseBucket =
  process.env.FIREBASE_ENV === 'production'
    ? 'gs://plottr.appspot.com'
    : 'gs://plottr-ci.appspot.com'

const storage = admin.storage()

export default (req, res) => {
  const file = req.body.file
  const config = req.body.config
  const extension = config.type === 'scrivener' ? 'scrivener' : 'docx'
  return new Promise((resolve, reject) => {
    askToExport(
      `/tmp/fileToExport.${extension}`,
      file,
      config.type,
      config,
      (error, filePath) => {
        if (error) {
          res.status(503)
          reject(res.json({ error }))
        } else {
          console.log('Saved file at: ', `/tmp/fileToExport.${extension}`)
          const bucket = storage.bucket(`${baseBucket}/tmp`)
          bucket.exists().then((result) => {
            const nextBucket = result[0]
              ? Promise.resolve(bucket)
              : bucket.create().then((result) => result[0])
            nextBucket.upload(
              `/tmp/fileToExport.${extension}`,
              {
                destination: bucket.file(`/tmp/fileToExport.${extension}`),
                resumable: false,
              },
              (err, storedFile) => {
                if (err) {
                  console.error('Error: ', err)
                  reject(err)
                  return
                }
                console.log(`Stored file on firestore at: tmp/${file.file.fileName}.${extension}`)
                console.log('file: ', storedFile)
                storedFile.makePublic().then((result) => {
                  console.log('result of make public', result)
                  const url = storedFile.publicUrl
                  console.log('Redirecting to: ', url)
                  res.status(302)
                  res.setHeader('Location', url)
                  resolve()
                })
              }
            )
          })
        }
      },
      false
    )
  })
}
