import { useMemo } from 'react'
import { sortBy } from 'lodash'
import { reducers, emptyFile } from 'pltr/v2'

import { useKnownFilesInfo } from './store_hooks'

export function useSortedKnownFiles(searchTerm) {
  const [files] = useKnownFilesInfo()
  const sortedIds = useMemo(() => {
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return f.path.toLowerCase().includes(searchTerm)
      } else {
        return true
      }
    })
    return sortBy(filteredFileIds, (id) => files[`${id}`].lastOpened).reverse()
  }, [files, searchTerm])

  return [sortedIds, files]
}

export const messageOpenExistingFile = () => {
  const openEvent = new Event('open-existing-file', { bubbles: true, cancelable: false })
  document.dispatchEvent(openEvent)
}

export const newEmptyFile = (fileName, appVersion, currentFile) => {
  const emptyFileState = emptyFile(fileName, appVersion)
  return {
    ...emptyFileState,
    project: currentFile.project,
    client: currentFile.client,
    permission: reducers.permission(),
    error: reducers.error(),
  }
}
