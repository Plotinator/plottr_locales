import React from 'react'
import { Router, Switch, Route } from 'react-router-dom'

import { history } from '../lib/history'

import Navigation from './navigation'
import Project from './project'
import Timeline from './timeline'
import Outline from './outline'
import Notes from './notes'
import Characters from './characters'
import Places from './places'
import Tags from './tags'

const Root = () => (
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
)

export default Root
