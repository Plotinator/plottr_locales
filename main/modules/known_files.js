import { reloadRecents } from './dashboard'
import { OFFLINE_FILE_FILES_PATH } from './offlineFilePath'

export const makeKnownFilesModule = (client) => {
  function getKnownFilesInfo() {
    return client.currentKnownFiles()
  }

  // The difference between `addtoKnown` and `addToKnownFiles` seems to
  // be that `addToKnownFiles` does some fixing to broken stores and
  // `addToKnown` sets the last opened date.
  function addToKnown(fileURL) {
    return client.addKnownFile(fileURL).then(() => {
      return reloadRecents()
    })
  }

  const addToKnownFiles = addToKnown

  return { getKnownFilesInfo, addToKnown, addToKnownFiles }
}
