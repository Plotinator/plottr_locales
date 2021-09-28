const admin = require('firebase-admin')
import askToExport from '../../lib/exporter/start_export'
import AdmZip from 'adm-zip'
import { v4 as uuidv4 } from 'uuid'

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
  process.env.FIREBASE_ENV === 'production' ? 'plottr.appspot.com' : 'plottr-ci.appspot.com'

const storage = admin.storage()

export default (req, res) => {
  const file = req.body.file
  const config = req.body.config
  const type = req.body.type
  const extension = type === 'scrivener' ? 'scrivener' : 'docx'
  const baseFileName = `fileToExport-${uuidv4()}`
  const savedFilePath = `/tmp/${baseFileName}.${extension}`
  askToExport(
    savedFilePath,
    file,
    type,
    config,
    (error, filePath) => {
      if (error) {
        res.status(503)
        res.json({ error, message: error.message })
      } else {
        console.log('Saved file at: ', savedFilePath)
        const uploadFilePath = type === 'scrivener' ? `/tmp/${baseFileName}.zip` : savedFilePath
        if (type === 'scrivener') {
          const zip = new AdmZip()
          zip.addLocalFolder(savedFilePath)
          zip.writeZip(uploadFilePath)
          console.log('Zipped to ', uploadFilePath)
        }
        const destinationFilePath =
          type === 'scrivener'
            ? `tmp/${uuidv4()}-${file.file.fileName}.zip`
            : `tmp/${uuidv4()}-${file.file.fileName}.${extension}`
        const bucket = storage.bucket(baseBucket)
        bucket.upload(
          uploadFilePath,
          {
            destination: bucket.file(destinationFilePath),
            resumable: false,
          },
          (err, storedFile) => {
            if (err) {
              console.error('Error: ', err)
              res.status(503)
              res.json({ err, message: err.message })
              return
            }
            console.log(`Stored file on firestore at: ${destinationFilePath}`)
            storedFile.makePublic().then((result) => {
              const url = storedFile.publicUrl()
              console.log('Redirecting to: ', url)
              res.status(200)
              res.setHeader('Location', url)
              res.send(`See: ${url}`)
            })
          }
        )
      }
    },
    false
  )
}
