import React from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import Head from 'next/head'

import { PlottrModal } from 'connected-components'
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
import PasswordForm, { passwordSet } from './password-form'
import SettingsConsistencyChecker from './settings-consistency-checker'

const modalStyles = {
  overlay: {
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 0,
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    left: '0',
    top: '0',
    minHeight: '100vh',
    maxHeight: '100vh',
  },
}

const Root = () => {
  return (
    <Provider store={store}>
      <Head>
        <title>Plottr</title>
        <meta name="description" content="Plottr" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <React.StrictMode>
        <PlottrModal isOpen={!passwordSet()} style={modalStyles}>
          <PasswordForm />
        </PlottrModal>
        <SettingsConsistencyChecker />
        <Renamer />
        <FileListListener />
        <SessionObserver />
        <Listener />
        <ClientIdMinter />
        <SaveTemplate />
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

export default Root
