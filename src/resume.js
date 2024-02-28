import { selectors } from 'wired-up-pltr'

export const resumeDirective = (offlineFile, cloudFile) => {
  const originalVersionStamp = selectors.originalVersionStampSelector(offlineFile)
  const currentVersionStamp = selectors.currentVersionStampSelector(offlineFile)
  const versionStampsExist = currentVersionStamp && originalVersionStamp
  const cloudFileVersionStamp = selectors.currentVersionStampSelector(cloudFile)
  const madeOfflineEdits = versionStampsExist && currentVersionStamp !== originalVersionStamp
  const madeEditsOnline = versionStampsExist && cloudFileVersionStamp !== originalVersionStamp
  const doNothing = !madeOfflineEdits
  const uploadOurs = madeOfflineEdits && !madeEditsOnline
  const backupOurs = !versionStampsExist || (madeOfflineEdits && madeEditsOnline)

  return [uploadOurs, backupOurs, doNothing]
}
