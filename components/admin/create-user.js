import { useState } from 'react'
import { FormGroup, ControlLabel, FormControl, Label, Button } from 'react-bootstrap'
import axios from 'axios'
import UserRecord from './UserRecord'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const CreateUser = () => {
  const [error, setError] = useState([])
  const [userId, setUserId] = useState(null)
  const [password, setPassword] = useState(null)
  const [userRecord, setUserRecord] = useState(null)

  const createUser = () => {
    axios
      .post('/api/admin/create-user', { email: userId, password })
      .then((response) => {
        if (response?.data?.user) {
          setUserRecord(response?.data?.user)
        } else {
          setError({ message: 'Returned null' })
        }
      })
      .catch((error) => {
        console.log(error)
        setError(error)
      })
  }

  const renderUserRecord = () => {
    if (!userRecord) return null

    return <UserRecord user={userRecord} />
  }

  return (
    <div className="user-info">
      <h1>Create a new Firebase User</h1>
      <div>
        <FormGroup controlId="formBasicText">
          <ControlLabel>User Email</ControlLabel>
          <FormControl
            type="text"
            value={userId}
            placeholder="Enter email"
            onChange={withEventTargetValue(setUserId)}
          />
        </FormGroup>
        <FormGroup controlId="formPasswordText">
          <ControlLabel>User Password</ControlLabel>
          <FormControl
            type="text"
            value={password}
            placeholder="Enter password"
            onChange={withEventTargetValue(setPassword)}
          />
        </FormGroup>
        <Button onClick={createUser}>Create!</Button>
      </div>
      <p />
      {renderUserRecord()}
      {error ? <Label>{error.message}</Label> : null}
    </div>
  )
}

export default CreateUser
