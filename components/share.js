import { useState } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { FiShare } from 'react-icons/fi'
import { Button, Form, FormGroup, Table } from 'react-bootstrap'
import { GrFormEdit } from 'react-icons/gr'

import { selectors } from 'pltr/v2'
import { PlottrModal } from 'connected-components'
import { withEventTargetValue } from '../lib/withEventTargetValue'
import { shareDocument } from 'plottr_firebase'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
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

const Share = ({ userId, selectedFile }) => {
  const [sharing, setSharing] = useState(false)
  const [emailToShareWith, setEmailToShareWith] = useState('')

  const handleKeyDown = (event) => {
    if (event.which === 13) {
      event.preventDefault()
      shareDocument(userId, selectedFile.id, emailToShareWith, 'collaborator')
      setEmailToShareWith('')
    }
  }

  const handleShare = (event) => {
    event.preventDefault()
    shareDocument(userId, selectedFile.id, emailToShareWith, 'collaborator')
    setEmailToShareWith('')
  }

  return (
    <>
      <PlottrModal
        isOpen={sharing}
        onRequestClose={() => {
          setSharing(false)
        }}
        style={modalStyles}
      >
        <h3>Share this file</h3>
        <Form>
          <FormGroup>
            <h6>Email Address</h6>
            <input
              type="text"
              value={emailToShareWith}
              onChange={withEventTargetValue(setEmailToShareWith)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleShare}>
              <FiShare /> Share
            </Button>
          </FormGroup>
        </Form>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Email address</th>
              <th>Permission</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {selectedFile &&
              selectedFile.shareRecords &&
              selectedFile.shareRecords.map(({ emailAddress, permission }) => (
                <tr key={emailAddress}>
                  <td>{emailAddress}</td>
                  <td>{permission}</td>
                  <td>
                    <Button>
                      <GrFormEdit />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </PlottrModal>
      <Button
        onClick={() => {
          setSharing(!sharing)
        }}
      >
        <FiShare />
      </Button>
    </>
  )
}

Share.propTypes = {
  userId: PropTypes.string,
  selectedFile: PropTypes.object,
}

export default connect((state) => ({
  userId: selectors.userIdSelector(state.present),
  selectedFile: selectors.selectedFileSelector(state.present),
}))(Share)
