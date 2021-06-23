import React, { useState } from 'react'
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
import SessionObserver from './session-observer'

const Root = () => {
  const [userId, setUserId] = useState(null)

  return (
    <Provider store={store}>
      <SessionObserver userId={userId} setUserId={setUserId} />
      <Listener userId={userId} />
      <Router history={history}>
        <Navigation userId={userId} />
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

export default Root
