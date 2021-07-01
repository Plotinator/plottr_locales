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
import ClientIdMinter from './client-id-minter'

const Root = () => {
  return (
    <Provider store={store}>
      <SessionObserver />
      <Listener />
      <ClientIdMinter />
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
    </Provider>
  )
}

export default Root
