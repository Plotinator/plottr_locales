import xml from 'xml-js'
import rtf from 'jsrtf'
import { slate } from 'pltr/v2'
import exportBeats from './exporters/beats'
import exportCharacters from './exporters/characters'
import exportNotes from './exporters/notes'
import exportPlaces from './exporters/places'
import { convertUnicode, addToScrivx, remove, startNewScrivx } from './utils'

const { serialize } = slate.rtf
const serializePlain = slate.plain.serialize

export default function Exporter(state, exportPath, options, isWindows, notifyUser, log, rm) {
  const realPath = exportPath.includes('.scriv') ? exportPath : `${exportPath}.scriv`

  return Promise.resolve()
    .then(() => {
      try {
        // create the structure of the project package
        return createProjectStructure(realPath, rm).then(() => {
          // create the .scrivx
          let documentContents = createScrivx(state, realPath, options)

          // create the rtf documents for each scene card
          createRTFDocuments(documentContents, realPath, options, isWindows, log)
        })
      } catch (error) {
        log.error(error)
        // move anything we've made to the trash
        return remove(realPath, rm).then(() => {
          // don't go any further
          return Promise.reject(error)
        })
      }
    })
    .then(() => {
      notifyUser(realPath, 'scrivener')
    })
}

function createProjectStructure(exportPath, rm) {
  return Promise.resolve()
    .then(() => {
      // create package folder
      try {
        const stat = fs.statSync(exportPath)

        // if it already exists: overwrite (OS should have already asked)
        if (stat.isDirectory()) {
          // delete current
          return remove(exportPath, rm).then(() => {
            // and then create new
            fs.mkdirSync(exportPath)
          })
        }
        return true
      } catch (error) {
        // doesn't exist, cool keep going
        fs.mkdirSync(exportPath)
        return true
      }
    })
    .then(() => {
      // create Files & Files/Docs
      fs.mkdirSync(path.join(exportPath, 'Files', 'Docs'), { recursive: true })

      // create Settings
      fs.mkdirSync(path.join(exportPath, 'Settings'))
    })
}

function createScrivx(state, basePath, options) {
  let scrivx = startNewScrivx()
  let documentContents = {}

  if (options.outline.export) {
    const beatBinderItems = exportBeats(state, documentContents, options)
    addToScrivx(scrivx, beatBinderItems, 'main')
  }

  if (options.characters.export) {
    const charactersBinderItem = exportCharacters(state, documentContents, options)
    addToScrivx(scrivx, charactersBinderItem, 'research')
  }

  if (options.places.export) {
    const placesBinderItem = exportPlaces(state, documentContents, options)
    addToScrivx(scrivx, placesBinderItem, 'research')
  }

  if (options.notes.export) {
    const notesBinderItem = exportNotes(state, documentContents, options)
    addToScrivx(scrivx, notesBinderItem, 'research')
  }

  const data = xml.json2xml(scrivx, { compact: true, ignoreComment: true, spaces: 2 })
  const baseName = path.basename(basePath).replace('.scriv', '')
  fs.writeFileSync(path.join(basePath, `${baseName}.scrivx`), data)

  return documentContents
}

function createRTFDocuments(documentContents, basePath, isWindows, log) {
  const realBasePath = path.join(basePath, 'Files', 'Docs')

  Object.keys(documentContents).forEach((docID) => {
    // documentContents is {notes: <document>, body: <document>, synopsis: <document>}
    // document is {docTitle: '', description: []}
    const documents = documentContents[docID]
    if (documents.notes) {
      createRTF(docID, documents.notes, realBasePath, true, log)
    }

    if (documents.body) {
      createRTF(docID, documents.body, realBasePath, false, log)
    }

    if (documents.synopsis) {
      createSynopsis(docID, documents.synopsis, realBasePath, isWindows, log)
    }
  })
}

function createRTF(docID, document, realBasePath, isNotes, log) {
  let doc = new rtf()
  let data = null
  if (document.docTitle) {
    doc.writeText(document.docTitle)
    doc.addLine()
    doc.addLine()
  }
  try {
    serialize(document.description, doc)
    data = doc.createDocument()
    data = convertUnicode(data)
    data = Buffer.from(data, 'utf8')
    const fileName = isNotes ? `${docID}_notes.rtf` : `${docID}.rtf`
    fs.writeFileSync(path.join(realBasePath, fileName), data)
  } catch (error) {
    log.error(error)
    // do nothing, just don't blow up
  }
}

function createSynopsis(docID, document, realBasePath, isWindows, log) {
  try {
    const data = serializePlain(document.description, isWindows)
    const fileName = `${docID}_synopsis.txt`
    fs.writeFileSync(path.join(realBasePath, fileName), data)
  } catch (error) {
    log.error(error)
    // do nothing, just don't blow up
  }
}
