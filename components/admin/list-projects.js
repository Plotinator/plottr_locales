import { useState } from 'react'
import { FormGroup, ControlLabel, FormControl, Table, Label, Button } from 'react-bootstrap'
import axios from 'axios'
import UserRecord from './UserRecord'
import ProjectList from './ProjectList'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const ListProjects = () => {
  const [files, setFiles] = useState([])
  const [userRecord, setUserRecord] = useState(null)
  const [error, setError] = useState([])
  const [userEmail, setUserEmail] = useState(null)

  const fetchProjects = () => {
    axios
      .post('/api/admin/projects-read', { email: userEmail })
      .then((response) => {
        if (response?.data?.files) {
          setFiles(response?.data?.files)
          setError(null)
        } else {
          setError({ message: 'Returned null' })
        }
        // if (response?.data?.user) {
        //   setUserRecord(response?.data?.user)
        // }
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        setError(error)
      })
  }

  const renderUserRecord = () => {
    return null
    // if (!userRecord) return null

    // return <div>
    //   <h1>User Data:</h1>
    //   <UserRecord user={userRecord} />
    // </div>
  }

  return (
    <div className="list-files">
      <h1>List Projects</h1>
      <p>Search for a user&apos;s projects</p>
      <div>
        <FormGroup controlId="formBasicText">
          <ControlLabel>User Email</ControlLabel>
          <FormControl
            type="text"
            value={userEmail}
            placeholder="Enter email"
            onChange={withEventTargetValue(setUserEmail)}
          />
          <FormControl.Feedback />
        </FormGroup>
        <Button onClick={fetchProjects}>Fetch!</Button>
      </div>
      <p />
      {!error ? <ProjectList files={files} /> : <Label>{error.message}</Label>}
      {renderUserRecord()}
      <style jsx>{`
        .list-files {
        }
      `}</style>
    </div>
  )
}

export default ListProjects
