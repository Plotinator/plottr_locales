import { useEffect, useState } from 'react'
import { FormGroup, ControlLabel, FormControl, Label, Button } from 'react-bootstrap'
import axios from 'axios'
import ProjectList from './ProjectList'
import { AdminErrorBoundary } from './admin-error-boundary'

const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}

const DocumentViewer = () => {
  const [error, setError] = useState([])
  const [docID, setDocID] = useState('')
  const [collection, setCollection] = useState('beats')
  const [document, setDocument] = useState(null)

  const fetchDocument = () => {
    if (!docID) return null

    axios
      .post('/api/admin/document-read', { collection, docID })
      .then((response) => {
        if (response?.data?.document) {
          setDocument(response?.data?.document)
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

  const stringData = JSON.stringify(document, null, 2)

  return (
    <div className="list-files">
      <h1>View Firebase Document</h1>
      <div>
        <FormGroup controlId="formBasicText">
          <ControlLabel>Collection</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={(event) => setCollection(event.target.value)}
            value={collection}
          >
            <option value="beats">beats</option>
            <option value="books">books</option>
            <option value="cards">cards</option>
            <option value="categories">categories</option>
            <option value="characters">characters</option>
            <option value="customAttributes">customAttributes</option>
            <option value="featureFlags">featureFlags</option>
            <option value="file">file</option>
            <option value="hierarchyLevels">hierarchyLevels</option>
            <option value="images">images</option>
            <option value="lines">lines</option>
            <option value="notes">notes</option>
            <option value="places">places</option>
            <option value="series">series</option>
            <option value="tags">tags</option>
            <option value="ui">ui</option>
          </FormControl>
          <ControlLabel>Document ID</ControlLabel>
          <FormControl
            type="text"
            value={docID}
            placeholder="Enter path"
            onChange={withEventTargetValue(setDocID)}
          />
          <FormControl.Feedback />
        </FormGroup>
        <Button onClick={fetchDocument}>Fetch!</Button>
      </div>
      <p />
      {!error ? (
        <AdminErrorBoundary>
          <pre>{stringData}</pre>
        </AdminErrorBoundary>
      ) : (
        <Label>{error.message}</Label>
      )}
      <style jsx>{`
        .list-files {
        }
      `}</style>
    </div>
  )
}

export default DocumentViewer
