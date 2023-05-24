import { helpers } from 'pltr/v2'

const makeTempFilesModule = (stores, trashModule) => {
  const { tempFilesStore } = stores
  const { trash } = trashModule

  function removeFromTempFiles(fileURL, doDelete = true) {
    return tempFilesStore.delete(fileURL).then(() => {
      return doDelete ? trash(helpers.file.withoutProtocol(fileURL)) : Promise.resolve(true)
    })
  }

  return {
    removeFromTempFiles,
  }
}

export default makeTempFilesModule
