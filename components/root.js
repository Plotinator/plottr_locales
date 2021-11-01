import React, { useEffect, useState } from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PropTypes } from 'prop-types'
import { ActionCreators } from 'redux-undo'
import Head from 'next/head'

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
import SaveTemplate from './save-template'
import Error from './error'
import SessionObserver from './session-observer'
import ClientIdMinter from './client-id-minter'
import FileListListener from './file-list-listener'
import Renamer from './renamer'
import SettingsConsistencyChecker from './settings-consistency-checker'
import Upload from './upload'
import { logger } from '../lib/logger'

const redo = () => {
  store.dispatch(ActionCreators.redo())
}

const undo = () => {
  store.dispatch(ActionCreators.undo())
}

const Root = ({ projectId }) => {
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    return store.subscribe(() => {
      const {
        present: {
          project: { selectedFile },
        },
      } = store.getState()
      if (selectedFile?.fileName !== fileName) {
        setFileName(selectedFile?.fileName)
      }
    })
  }, [])

  useEffect(() => {
    const listener = (event) => {
      if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }
      // On Linux, redo is CTRL+y
      if (event.key === 'y' && event.ctrlKey) {
        event.preventDefault()
        redo()
        return
      }
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])
  useEffect(() => {
    if (projectId) {
      // open the correct project
      logger.info('PROJECT ID', projectId)
    }
  }, [projectId])

  return (
    <Provider store={store}>
      <Head>
        <title>Plottr{fileName ? ` | ${fileName}` : ''}</title>
        <meta name="description" content="Plottr" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <script>
          {`var beamer_config = {
            product_id: 'IgDazaTp8480',
            selector: '#beamer-bell',
            lazy: true,
          }`}
        </script>
        <script
          type="text/javascript"
          async
          src="https://app.getbeamer.com/js/beamer-embed.js"
        ></script>
      </Head>
      <React.StrictMode>
        <SettingsConsistencyChecker />
        <Renamer />
        <FileListListener />
        <SessionObserver />
        <Listener />
        <ClientIdMinter />
        <SaveTemplate />
        <Upload />
        <Router history={history}>
          <Navigation />
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
      </React.StrictMode>
    </Provider>
  )
}

Root.propTypes = {
  projectId: PropTypes.string,
}

export default Root
