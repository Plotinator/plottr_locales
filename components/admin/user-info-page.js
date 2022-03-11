import { useState } from 'react'
import { FormGroup, ControlLabel, FormControl, HelpBlock, Label } from 'react-bootstrap'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const dummyUser = {
  uid: 'asdfjkl12347890',
  email: 'example@example.com',
  emailVerified: false,
  disabled: false,
  metadata: {
    lastSignInTime: 'Sun, 27 Feb 2022 18:28:22 GMT',
    creationTime: 'Sun, 27 Feb 2022 18:28:22 GMT',
  },
  customClaims: {
    admin: true,
  },
}

const UserInfoPage = () => {
  const [error, setError] = useState([])
  const [userId, setUserId] = useState(null)
  const [userRecord, setUserRecord] = useState(null)

  const fetchUser = () => {
    setUserRecord(dummyUser)
  }

  const renderUserRecord = () => {
    if (!userRecord) return null

    const stringData = JSON.stringify(userRecord, null, 2)

    const claims = Object.entries(userRecord.customClaims).map(([key, value]) => {
      return (
        <>
          <dt>{key}</dt>
          <dd>{value}</dd>
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
          <dd>{userRecord.disabled}</dd>
          <dt>Last Sign In</dt>
          <dd>{userRecord.metadata.lastSignInTime}</dd>
          <dt>Created</dt>
          <dd>{userRecord.metadata.creationTime}</dd>
          <dt>Email Verified</dt>
          <dd>{userRecord.emailVerified}</dd>
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
      <form onSubmit={fetchUser}>
        <FormGroup controlId="formBasicText">
          <ControlLabel>User Email</ControlLabel>
          <FormControl
            type="text"
            value={userId}
            placeholder="Enter email"
            onChange={withEventTargetValue(setUserId)}
          />
          <FormControl.Feedback />
          <HelpBlock>Enter user email</HelpBlock>
        </FormGroup>
        <FormControl type="submit" onSubmit={fetchUser} />
      </form>
      <p />
      {renderUserRecord()}
      {error ? <Label>{error.message}</Label> : null}
      <style jsx>{`
        .user-info {
        }
      `}</style>
    </div>
  )
}

export default UserInfoPage
