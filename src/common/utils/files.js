import { helpers } from 'pltr'

import { makeFileModule } from '../../app/files'
import { makeMainProcessClient } from '../../app/mainProcessClient'

const { removeFromKnownFiles } = makeMainProcessClient()

export function doesFileExist(localClient, fileURL) {
  return localClient.fileExists(helpers.file.withoutProtocol(fileURL))
}

export { removeFromKnownFiles }

const readOfflineFiles = (localClient) => makeFileModule(localClient).readOfflineFiles()
export const listOfflineFiles = readOfflineFiles

export function offlineFileURL(localClient, fileURL) {
  return localClient.offlineFileBasePath().then((offlineFileFilesPath) => {
    return localClient
      .join(offlineFileFilesPath, helpers.file.withoutProtocol(fileURL))
      .then((filePath) => {
        return helpers.file.filePathToFileURL(filePath)
      })
  })
}
