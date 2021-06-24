import { useState } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { FiShare } from 'react-icons/fi'
import { Button, Form, FormGroup, Label, Table } from 'react-bootstrap'
import { GrFormEdit } from 'react-icons/gr'

import { selectors } from 'pltr/v2'
import { PlottrModal } from 'connected-components'
import { withEventTargetValue } from '../lib/withEventTargetValue'

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

const Share = ({ selectedFile }) => {
  const [sharing, setSharing] = useState(false)
  const [emailToShareWith, setEmailToShareWith] = useState('')

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
            <Label>User name</Label>
            <input
              type="text"
              value={emailToShareWith}
              onChange={withEventTargetValue(setEmailToShareWith)}
            />
          </FormGroup>
        </Form>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Email address</th>
            </tr>
            <tr>
              <th>Permission</th>
            </tr>
            <tr>
              <th>&nbsp;</th>
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
      <button
        onClick={() => {
          setSharing(!sharing)
        }}
      >
        <FiShare />
      </button>
    </>
  )
}

Share.propTypes = {
  selectedFile: PropTypes.object,
}

export default connect((state) => ({
  selectedFile: selectors.selectedFileIdSelector(state.present),
}))(Share)
