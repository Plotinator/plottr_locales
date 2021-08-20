import { useState, useEffect } from 'react'

import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName } from 'plottr_firebase'

const Renamer = () => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)

  const renameFile = (newName) => {
    editFileName(fileId, newName).then(() => {
      const fetchEvent = new Event('fetch-file-list', { bubbles: true, cancelable: false })
      document.dispatchEvent(fetchEvent)
      const renameEvent = new Event('rename-file-to-new-name', { bubbles: true, cancelable: false })
      renameEvent.fileId = fileId
      renameEvent.newName = newName
      document.dispatchEvent(renameEvent)
      setFileId(null)
      setVisible(false)
    })
  }

  useEffect(() => {
    const renameListener = document.addEventListener('rename-file', (event) => {
      setVisible(true)
      setFileId(event.fileId)
    })
    return () => {
      document.removeEventListener('rename-file', renameListener)
    }
  }, [])

  const hideRenamer = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <InputModal
      title={t('Name')}
      getValue={renameFile}
      isOpen={true}
      cancel={hideRenamer}
      type="text"
    />
  )
}

Renamer.propTypes = {}

export default Renamer
