import { useState } from 'react'
import { FormGroup, ControlLabel, FormControl, HelpBlock, Label, Button } from 'react-bootstrap'
import axios from 'axios'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const UserInfoPage = () => {
  const [error, setError] = useState([])
  const [userId, setUserId] = useState(null)
  const [userRecord, setUserRecord] = useState(null)

  const fetchUser = () => {
    axios
      .post('/api/admin/uid', { email: userId })
      .then((response) => {
        setUserRecord(response?.data?.user)
      })
      .catch((error) => {
        console.log(error)
        setError(error)
      })
  }

  const renderUserRecord = () => {
    if (!userRecord) return null

    const stringData = JSON.stringify(userRecord, null, 2)

    const claims = Object.entries(userRecord.customClaims).map(([key, value]) => {
      return (
        <>
          <dt>{key}</dt>
          <dd>{String(value)}</dd>
        </>
      )
    })

    return (
      <div>
        <h3>Data</h3>
        <dl>
          <dt>UID</dt>
          <dd>{userRecord.uid}</dd>
          <dt>Email</dt>
          <dd>{userRecord.email}</dd>
          <dt>Disabled</dt>
          <dd>{String(userRecord.disabled)}</dd>
          <dt>Last Sign In</dt>
          <dd>{userRecord.metadata.lastSignInTime}</dd>
          <dt>Created</dt>
          <dd>{userRecord.metadata.creationTime}</dd>
          <dt>Email Verified</dt>
          <dd>{String(userRecord.emailVerified)}</dd>
        </dl>
        <h3>Custom Claims</h3>
        <dl>{claims}</dl>
        <h3>String</h3>
        <pre>{stringData}</pre>
      </div>
    )
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
            value={userId}
            placeholder="Enter email"
            onChange={withEventTargetValue(setUserId)}
          />
        </FormGroup>
        <Button onClick={fetchUser}>Go!</Button>
      </div>
      <p />
      {renderUserRecord()}
      {error ? <Label>{error.message}</Label> : null}
      <style jsx>{`
        .user-info dl dd {
          margin-left: 40px;
        }
        .user-info dl dt {
          font-weigth: bold;
        }
      `}</style>
    </div>
  )
}

export default UserInfoPage
