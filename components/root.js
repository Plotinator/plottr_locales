import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { Router, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import { history } from '../lib/history'
import { store } from '../lib/redux'

import Navigation from './navigation'
import Project from './project'
import Timeline from './timeline'
import Outline from './outline'
import Notes from './notes'
import Characters from './characters'
import Places from './places'
import Tags from './tags'
import Listener from './listener'
import Error from './error'
import { fetchFiles, onSessionChange } from '../lib/firebase'

const Root = () => {
  const [userId, setUserId] = useState(null)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    onSessionChange((user) => {
      if (!user) {
        window.location.href = '/login'
      } else {
        setUserId(user.uid)
        fetchFiles(user.uid).then(setFiles)
      }
    })
  }, [])

  return (
    <Provider store={store}>
      <Router history={history}>
        <Listener userId={userId} selectedFile={selectedFile} />
        <Navigation selectedFile={selectedFile} files={files} selectFile={setSelectedFile} />
        <Error />
        <main className="project-main tour-end">
          <Switch>
            <Route path="/project" component={Project} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/outline" component={Outline} />
            <Route path="/notes" component={Notes} />
            <Route path="/characters" component={Characters} />
            <Route path="/places" component={Places} />
            <Route path="/tags" component={Tags} />
          </Switch>
        </main>
      </Router>
    </Provider>
  )
}

Root.propTypes = {
  email: PropTypes.string,
}

export default Root
