import React from 'react'
import PropTypes from 'react-proptypes'

import { t as i18n } from 'plottr_locales'

import Modal from '../Modal'
import Button from '../Button'
import getTestIds from '../getTestIds'

export const testIds = getTestIds()

export default function AskToSaveModal({ save, busy, dismiss }) {
  return (
    <Modal show={true} onHide={dismiss} dialogClassName="center-modal-vertically">
      <Modal.Header closeButton>{i18n('There are unsaved changes')}</Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            data-testid={testIds.ok}
            bsStyle="success"
            onClick={busy ? () => {} : save}
            disabled={busy}
          >
            {busy ? i18n('Saving...') : i18n('Save')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

AskToSaveModal.propTypes = {
  save: PropTypes.func,
  dismiss: PropTypes.func,
  busy: PropTypes.bool,
}
