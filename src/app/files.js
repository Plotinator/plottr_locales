const makeFileModule = (localClient) => {
  const saveOfflineFile = (jsonData, knownFiles, onlineFileURL) => {
    return localClient.saveOfflineFile(jsonData, knownFiles, onlineFileURL)
  }

  const saveFile = (fileURL, jsonData) => {
    return localClient.saveFile(fileURL, jsonData)
  }

  const backupOfflineBackupForResume = (file) => {
    return localClient.backupOfflineBackupForResume(file)
  }

  const readOfflineFiles = () => {
    return localClient.readOfflineFiles()
  }

  const isTempFile = (fileURL) => {
    return localClient.isTempFile(fileURL)
  }

  const saveAsTempFile = (file) => {
    return localClient.saveAsTempFile(file)
  }

  const copyFile = (sourceFileURL, newFileURL) => {
    return localClient.copyFile(sourceFileURL, newFileURL)
  }

  const createFileShortcut = (sourceFileURL, newFileURL) => {
    return localClient.createFileShortcut(sourceFileURL, newFileURL)
  }

  const basename = (fileURL, ext) => {
    return localClient.basename(fileURL, ext)
  }

  return {
    saveOfflineFile,
    saveFile,
    backupOfflineBackupForResume,
    readOfflineFiles,
    isTempFile,
    saveAsTempFile,
    copyFile,
    basename,
    createFileShortcut,
  }
}

export { makeFileModule }
