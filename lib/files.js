import fs from 'fs'
import { useMemo } from 'react'
import { sortBy } from 'lodash'
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
