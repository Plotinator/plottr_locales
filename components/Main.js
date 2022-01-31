import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { Router, Switch, Route } from 'react-router-dom'

import { selectors } from 'pltr/v2'

import Navigation from './navigation'
import Project from './project'
import Timeline from './timeline'
import Outline from './outline'
import Notes from './notes'
import Characters from './characters'
import Places from './places'
import Tags from './tags'
import Error from './error'
import FullPageSpinner from './spinner'
import Dashboard from './Dashboard'
import { history } from '../lib/history'

const Main = ({
  busyBooting,
  needsToLogin,
  isFirstTime,
  isInTrialModeWithExpiredTrial,
  showDashboard,
  cantShowFile,
  loadingState,
  loadingProgress,
}) => {
  const [dashboardClosed, setDashboardClosed] = useState(false)
  const [firstTimeBooting, setFirstTimeBooting] = useState(busyBooting)

  const closeDashboard = () => {
    setDashboardClosed(true)
  }

  // A latch so that we only show initial loading splash once.
  useEffect(() => {
    if (!busyBooting && firstTimeBooting) {
      setFirstTimeBooting(false)
    }
  }, [busyBooting])

  // If we opened a file then don't show the dashboard all of a sudden
  // when the user changes the always show dashboard setting.
  useEffect(() => {
    // Condition is that it passes by all the other root views and
    // hits `App`.
    if (
      !firstTimeBooting &&
      !needsToLogin &&
      !isFirstTime &&
      !isInTrialModeWithExpiredTrial &&
      !(cantShowFile || (showDashboard && !dashboardClosed))
    ) {
      closeDashboard()
    }
  }, [
    firstTimeBooting,
    needsToLogin,
    isFirstTime,
    isInTrialModeWithExpiredTrial,
    cantShowFile,
    showDashboard,
    dashboardClosed,
  ])

  // IMPORTANT: the order of these return statements is significant.
  // We'll exit at the earliest one that evaluates true for it's
  // guarding if.
  //
  // This matters because the further we make it down the chain, the
  // more assumptions hold true about the app.  e.g. if we make it
  // past `firstTimeBooting` then we know that settings etc. are
  // loaded and we can check things like the user's local and pro
  // licenses.

  if (firstTimeBooting) {
    // TODO: @cameron, @jeana, this is where we can put a more
    // interesting loading component for users and let them know what
    // we're loading based on the `applicationState` key in Redux ^_^
    return (
      <div id="temporary-inner">
        <div className="loading-splash">
          <img src="/logo_28_500.png" height="500" />
          <h3>{loadingState}</h3>
          <div className="loading-splash__progress">
            <div
              className="loading-splash__progress__bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (cantShowFile || (showDashboard && !dashboardClosed)) {
    return <Dashboard closeDashboard={closeDashboard} />
  }

  return (
    <Router history={history}>
      <Navigation />
      <FullPageSpinner />
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
  )
}

Main.propTypes = {
  busyBooting: PropTypes.bool,
  needsToLogin: PropTypes.bool,
  isFirstTime: PropTypes.bool,
  isInTrialModeWithExpiredTrial: PropTypes.bool,
  showDashboard: PropTypes.bool,
  cantShowFile: PropTypes.bool,
  loadingState: PropTypes.string.isRequired,
  loadingProgress: PropTypes.number.isRequired,
}

export default connect((state) => ({
  busyBooting: selectors.applicationIsBusyButFileCouldBeUnloadedSelector(state.present),
  needsToLogin: selectors.userNeedsToLoginSelector(state.present),
  isFirstTime: selectors.isFirstTimeSelector(state.present),
  isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state.present),
  showDashboard: selectors.showDashboardOnBootSelector(state.present),
  cantShowFile: selectors.cantShowFileSelector(state.present),
  loadingState: selectors.loadingStateSelector(state.present),
  loadingProgress: selectors.loadingProgressSelector(state.present),
}))(Main)
