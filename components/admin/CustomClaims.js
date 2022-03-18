import { Button, FormControl, Label, Table } from 'react-bootstrap'
import { PropTypes } from 'prop-types'
import { useEffect, useState } from 'react'
import axios from 'axios'

const NEW_KEY = '[blank]'
const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const CustomClaims = ({ userID, claims, refetch }) => {
  const [workingClaims, setWorkingClaims] = useState(claims)
  const [hasChanges, setHasChanges] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState(true)

  useEffect(() => {
    setWorkingClaims(claims)
  }, [claims])

  const saveChanges = () => {
    let newClaims = { ...workingClaims }
    if (isCreating && newKey) {
      newClaims[newKey] = newValue
    }

    axios
      .post('/api/admin/user-update-claims', { userID, claims: newClaims })
      .then((response) => {
        console.log(response)
        setIsCreating(false)
        setHasChanges(false)
        refetch()
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        setIsCreating(false)
        setHasChanges(false)
        refetch()
      })
  }

  const changeValues = (key) => () => {
    setHasChanges(true)
    setWorkingClaims({
      ...workingClaims,
      [key]: !workingClaims[key],
    })
  }

  const deleteValue = (key) => () => {
    setHasChanges(true)
    const newClaims = { ...workingClaims }
    delete newClaims[key]
    setWorkingClaims(newClaims)
  }

  const renderCreatingNew = () => {
    if (!isCreating) return

    return (
      <tr>
        <td>
          <FormControl value={newKey} onChange={withEventTargetValue(setNewKey)} />
        </td>
        <td>
          <FormControl
            componentClass="select"
            onChange={() => setNewValue(!newValue)}
            value={String(newValue)}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </FormControl>
        </td>
      </tr>
    )
  }

  const renderClaims = () => {
    if (workingClaims) {
      return Object.entries(workingClaims).map(([key, value], idx) => {
        return (
          <tr key={idx}>
            <th>{key}</th>
            <td>
              <FormControl
                componentClass="select"
                onChange={changeValues(key)}
                value={String(value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </FormControl>
            </td>
            <td>
              <Button bsStyle="danger" bsSize="xs" onClick={deleteValue(key)}>
                Delete
              </Button>
            </td>
          </tr>
        )
      })
    } else {
      return (
        <tr>
          <td>
            <Label bsStyle="primary">None</Label>
          </td>
          <td></td>
          <td></td>
        </tr>
      )
    }
  }

  return (
    <div>
      <h3>Custom Claims</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Claim</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderClaims()}
          {renderCreatingNew()}
          {isCreating ? null : (
            <tr>
              <td>
                <Button bsSize="xs" onClick={() => setIsCreating(true)}>
                  Add New Claim
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {isCreating || hasChanges ? (
        <Button bsStyle="warning" onClick={saveChanges}>
          Save Changes
        </Button>
      ) : null}
    </div>
  )
}

CustomClaims.propTypes = {
  userID: PropTypes.string,
  claims: PropTypes.object,
  refetch: PropTypes.func,
}

export default CustomClaims
