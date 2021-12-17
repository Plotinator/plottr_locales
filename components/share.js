import { useState } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { IoIosShareAlt } from 'react-icons/io'
import { NavItem, Button, Form, FormGroup, ControlLabel, Table, FormControl } from 'react-bootstrap'

import { t } from 'plottr_locales'
import { selectors, actions } from 'pltr/v2'
import { PlottrModal } from 'connected-components'
import { withEventTargetValue } from '../lib/withEventTargetValue'
import { shareDocument } from 'wired-up-firebase'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 20,
    width: '50%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    marginTop: '-60px', // counters some !important style
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
  },
}

const Share = ({ userId, selectedFile, generalError }) => {
  const [sharing, setSharing] = useState(false)
  const [emailToShareWith, setEmailToShareWith] = useState('')

  const handleKeyDown = (event) => {
    if (event.which === 13) {
      event.preventDefault()
      shareDocument(userId, selectedFile.id, emailToShareWith, 'collaborator').catch((error) => {
        generalError(error.message)
      })
      setEmailToShareWith('')
    }
  }

  const handleShare = (event) => {
    event.preventDefault()
    shareDocument(userId, selectedFile.id, emailToShareWith, 'collaborator').catch((error) => {
      generalError(error.message)
    })
    setEmailToShareWith('')
  }

  const closeDialog = () => setSharing(false)

  return (
    <>
      <PlottrModal isOpen={sharing} onRequestClose={closeDialog} style={modalStyles}>
        <div className="acts-modal__wrapper">
          <div className="acts-modal__header">
            <div>
              <h3>{t('Sharing')}</h3>
              <Button onClick={closeDialog}>{t('Close')}</Button>
            </div>
            <hr />
          </div>
        </div>
        <div className="acts-modal__body">
          <h4>{t('Send Invite')}</h4>
          <Form inline>
            <FormGroup style={{ width: '100%' }}>
              <ControlLabel>{t('Email Address')}</ControlLabel>{' '}
              <FormControl
                style={{ width: '55%' }}
                type="text"
                value={emailToShareWith}
                onChange={withEventTargetValue(setEmailToShareWith)}
                onKeyDown={handleKeyDown}
              />{' '}
              <Button onClick={handleShare} bsStyle="success">
                <IoIosShareAlt /> {t('Share')}
              </Button>
            </FormGroup>
          </Form>
          <div style={{ height: '16px', margin: '16px' }} />
          <h4>{t('Permissions')}</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>{t('Email address')}</th>
                <th>{t('Permission')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedFile &&
                selectedFile.shareRecords &&
                selectedFile.shareRecords.map(({ emailAddress, permission }) => (
                  <tr key={emailAddress}>
                    <td>{emailAddress}</td>
                    <td>{permission}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </PlottrModal>
      <NavItem>
        <Button onClick={() => setSharing(true)} title={t('Share')} bsSize="small">
          <IoIosShareAlt />
        </Button>
      </NavItem>
    </>
  )
}

Share.propTypes = {
  userId: PropTypes.string,
  selectedFile: PropTypes.object,
  generalError: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
  }),
  {
    generalError: actions.error.generalError,
  }
)(Share)
