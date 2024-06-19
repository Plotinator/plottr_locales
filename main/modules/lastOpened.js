export const makeLastOpenedModule = (localClient) => {
  const lastOpenedFile = () => {
    return localClient.lastOpenedFile()
  }

  const setLastOpenedFilePath = (filePath) => {
    return localClient.setLastOpenedFilePath(filePath)
  }

  return { lastOpenedFile, setLastOpenedFilePath }
}
