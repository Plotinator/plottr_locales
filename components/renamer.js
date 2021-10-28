import { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName } from 'plottr_firebase'

const Renamer = ({ userId, generalError }) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)

  const renameFile = (newName) => {
    if (!userId) return
    editFileName(userId, fileId, newName)
      .then(() => {
        const fetchEvent = new Event('fetch-file-list', { bubbles: true, cancelable: false })
        document.dispatchEvent(fetchEvent)
        const renameEvent = new Event('rename-file-to-new-name', {
          bubbles: true,
          cancelable: false,
        })
        renameEvent.fileId = fileId
        renameEvent.newName = newName
        document.dispatchEvent(renameEvent)
        setFileId(null)
        setVisible(false)
      })
      .catch((error) => {
        console.error(`Failed to rename file with id ${fileId} to ${newName}`, error)
        generalError('Failed to rename file.')
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

Renamer.propTypes = {
  userId: PropTypes.string,
  generalError: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
  }),
  { generalError: actions.error.generalError }
)(Renamer)
