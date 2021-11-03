import auth from '@react-native-firebase/auth'
import database from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import Config from 'react-native-config'

import api from '../src/api'

const { BASE_API_DOMAIN } = Config

database().settings({ ignoreUndefinedProperties: true })

export const signInWithEmailAndPassword = (userName, password) => {
  return auth().signInWithEmailAndPassword(userName, password)
}

export const wireUpAPI = (logger) => {
  const wiredUp = api(auth, database, storage, BASE_API_DOMAIN, __DEV__, logger, true)

  return {
    editFileName: wiredUp.editFileName,
    listen: wiredUp.listen,
    withFileId: wiredUp.withFileId,
    toFirestoreArray: wiredUp.toFirestoreArray,
    overwriteAllKeys: wiredUp.overwriteAllKeys,
    initialFetch: wiredUp.initialFetch,
    deleteFile: wiredUp.deleteFile,
    stopListening: wiredUp.stopListening,
    listenToFiles: wiredUp.listenToFiles,
    fetchFiles: wiredUp.fetchFiles,
    logOut: wiredUp.logOut,
    mintCookieToken: wiredUp.mintCookieToken,
    onSessionChange: wiredUp.onSessionChange,
    firebaseUI: wiredUp.firebaseUI,
    currentUser: wiredUp.currentUser,
    hasUndefinedValue: wiredUp.hasUndefinedValue,
    patch: wiredUp.patch,
    overwrite: wiredUp.overwrite,
    shareDocument: wiredUp.shareDocument,
    publishRCEOperations: wiredUp.publishRCEOperations,
    catchupEditsSeen: wiredUp.catchupEditsSeen,
    releaseRCELock: wiredUp.releaseRCELock,
    lockRCE: wiredUp.lockRCE,
    listenForRCELock: wiredUp.listenForRCELock,
    listenForChangesToEditor: wiredUp.listenForChangesToEditor,
    deleteChangeSignal: wiredUp.deleteChangeSignal,
    deleteOldChanges: wiredUp.deleteOldChanges,
    fetchRCEOperations: wiredUp.fetchRCEOperations,
    saveBackup: wiredUp.saveBackup,
    listenForBackups: wiredUp.listenForBackups,
    saveCustomTemplate: wiredUp.saveCustomTemplate,
    allTemplateUrlsForUser: wiredUp.allTemplateUrlsForUser,
    listenToCustomTemplates: wiredUp.listenToCustomTemplates,
    editCustomTemplate: wiredUp.editCustomTemplate,
    deleteCustomTemplate: wiredUp.deleteCustomTemplate,
    saveImageToStorageBlob: wiredUp.saveImageToStorageBlob,
    saveImageToStorageFromURL: wiredUp.saveImageToStorageFromURL,
    backupPublicURL: wiredUp.backupPublicURL,
    imagePublicURL: wiredUp.imagePublicURL,
    isStorageURL: wiredUp.isStorageURL
  }
}
