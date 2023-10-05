/** @module Actions */
import { SET_BACKUP_FOLDERS } from '../constants/ActionTypes'

/**
 * Sets the backup folders
 * @param {Object[]} folders an array of folder objects
 */
export const setBackupFolders = (folders) => ({
  type: SET_BACKUP_FOLDERS,
  folders,
})
