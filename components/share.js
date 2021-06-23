import { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { FiShare } from 'react-icons/fi'
import { Form, FormGroup, Label } from 'react-bootstrap'

import { actions, selectors } from 'pltr/v2'
import { PlottrModal } from 'connected-components'
import { withEventTargetValue } from '../lib/withEventTargetValue'
import { searchForUsersByName } from '../lib/firebase'

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

const UserSearcher = connect(null, {
  setUserNameSearchResults: actions.project.setUserNameSearchResults,
})(({ searchTerm, setUserNameSearchResults }) => {
  useEffect(() => {
    searchForUsersByName(searchTerm, setUserNameSearchResults).catch((error) => {
      console.error(error)
    })
  }, [searchTerm])

  return null
})

UserSearcher.propTypes = {
  searchTerm: PropTypes.string,
  setUserNameSearchResults: PropTypes.func.isRequired,
}

const Share = ({ userNameSearchResults }) => {
  const [sharing, setSharing] = useState(false)
  const [searchedName, setSearchedName] = useState('')

  return (
    <>
      <UserSearcher searchTerm={searchedName} />
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
              value={searchedName}
              onChange={withEventTargetValue(setSearchedName)}
            />
          </FormGroup>
        </Form>
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
  userNameSearchResults: PropTypes.array.isRequired,
  setUserNameSearchResults: PropTypes.func.isrequired,
}

export default connect((state) => ({
  userNameSearchResults: selectors.userNameSearchResultsSelector(state.present),
}))(Share)
