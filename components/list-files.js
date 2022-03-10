import { useState } from 'react'
import { FormGroup, ControlLabel, FormControl, HelpBlock, Table, Label } from 'react-bootstrap'

import { listFiles } from '../lib/admin/list-files'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const ListFiles = () => {
  const [results, setResults] = useState([])
  const [error, setError] = useState([])
  const [userId, setUserId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const userIdValidationState = () => {
    if (!userId) return null
    const length = userId.length
    if (length < 5) return 'warning'
    return null
  }

  const searchForFiles = (event) => {
    event.preventDefault()
    listFiles(userId, searchTerm)
      .then((results) => {
        setError(null)
        setResults(results)
      })
      .catch((error) => {
        setResults([])
        setError(error.message)
      })
  }

  return (
    <div className="list-files">
      <h1>List Files</h1>
      <p>Search for a user&apos;s files</p>
      <form onSubmit={searchForFiles}>
        <FormGroup controlId="formBasicText" validationState={userIdValidationState()}>
          <ControlLabel>User ID</ControlLabel>
          <FormControl
            type="text"
            value={userId}
            placeholder="Enter text"
            onChange={withEventTargetValue(setUserId)}
          />
          <FormControl.Feedback />
          <HelpBlock>Enter user id to search for.</HelpBlock>
        </FormGroup>
        <FormGroup controlId="formBasicText">
          <ControlLabel>Search Term</ControlLabel>
          <FormControl
            type="text"
            value={searchTerm}
            placeholder="Enter text"
            onChange={withEventTargetValue(setSearchTerm)}
          />
          <FormControl.Feedback />
          <HelpBlock>Enter a search term.</HelpBlock>
        </FormGroup>
        <FormControl type="submit" onSubmit={searchForFiles} />
      </form>
      <p />
      {!error ? (
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Deleted</th>
              <th>File Name</th>
              <th>Permission</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ fileId, deleted, fileName, permission, version }) => (
              <tr key={fileId}>
                <td>{fileId}</td>
                <td>{deleted ? '✘' : ''}</td>
                <td>{fileName}</td>
                <td>{permission}</td>
                <td>{version}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Label>{error}</Label>
      )}
      <style jsx>{`
        .list-files {
        }
      `}</style>
    </div>
  )
}

export default ListFiles
