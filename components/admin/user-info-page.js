import { useState } from 'react'
import { FormGroup, ControlLabel, FormControl, Label, Button } from 'react-bootstrap'
import axios from 'axios'
import UserRecord from './UserRecord'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const UserInfoPage = () => {
  const [error, setError] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [userRecord, setUserRecord] = useState(null)
  const [isUpdateMode, setUpdateMode] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const fetchUser = () => {
    axios
      .post('/api/admin/user-read', { email: userEmail })
      .then((response) => {
        if (response?.data?.user) {
          setUserRecord(response?.data?.user)
          setError(null)
        } else {
          setError({ message: 'Returned null' })
        }
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        setError(error)
      })
  }

  const updateUserInfo = () => {
    if (!newEmail && !newPassword) return
    setUserRecord(null)

    const updateObj = { email: userEmail, updateData: {} }
    if (newEmail) {
      updateObj.updateData.email = newEmail
    }
    if (newPassword) {
      updateObj.updateData.password = newPassword
    }

    axios
      .post('/api/admin/user-update', updateObj)
      .then((response) => {
        if (response?.data?.user) {
          setUserRecord(response?.data?.user)
        } else {
          console.log('error in API call. Where', response?.data?.where)
          console.error(response?.data?.error)
          setError(response?.data?.error)
        }
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        setError(error)
      })
  }

  const renderUpdateMode = () => {
    if (!isUpdateMode) return null

    return (
      <div>
        <FormGroup controlId="formBasicText">
          <ControlLabel>Change email</ControlLabel>
          <FormControl
            type="text"
            value={newEmail}
            placeholder="Enter new email"
            onChange={withEventTargetValue(setNewEmail)}
          />
        </FormGroup>
        <FormGroup controlId="formBasicText">
          <ControlLabel>Change password</ControlLabel>
          <FormControl
            type="text"
            value={newPassword}
            placeholder="Enter new password"
            onChange={withEventTargetValue(setNewPassword)}
          />
        </FormGroup>
        <Button onClick={updateUserInfo} bsStyle="primary">
          Update User!
        </Button>
      </div>
    )
  }

  const renderUserRecord = () => {
    if (!userRecord) return null

    return <UserRecord user={userRecord} refetch={fetchUser} />
  }

  return (
    <div className="user-info">
      <h1>User Info</h1>
      <p>Search for a user</p>
      <div>
        <FormGroup controlId="formBasicText">
          <ControlLabel>User Email</ControlLabel>
          <FormControl
            type="text"
            value={userEmail}
            placeholder="Enter email"
            onChange={withEventTargetValue(setUserEmail)}
          />
        </FormGroup>
        <Button onClick={fetchUser}>Go!</Button>
        {userRecord ? (
          <Button onClick={() => setUpdateMode(!isUpdateMode)} bsStyle="warning">
            Update User
          </Button>
        ) : null}
      </div>
      {renderUpdateMode()}
      <p />
      {renderUserRecord()}
      {error ? <Label>{error.message}</Label> : null}
      <style jsx>{`
        .user-info {
          min-width: 20%;
        }
      `}</style>
    </div>
  )
}

export default UserInfoPage
