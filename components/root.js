import React, { useEffect } from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import { history } from '../lib/history'
import { configureStore } from '../lib/redux'

import Navigation from './navigation'
import Project from './project'
import Timeline from './timeline'
import Outline from './outline'
import Notes from './notes'
import Characters from './characters'
import Places from './places'
import Tags from './tags'
import { listen, signIn } from '../lib/firebase'

import goldilocks from '../lib/goldilocks.json'

const store = configureStore(goldilocks)

const Root = () => {
  useEffect(() => {
    signIn('test@test.com', 'tester', (user) => {
      // TODO: file id?
      const FILE_ID = 1
      listen(user.uid, FILE_ID)
    })
  }, [])

  return (
    <Provider store={store}>
      <Router history={history}>
        <Navigation />
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
