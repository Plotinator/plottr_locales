import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Glyphicon, Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import BookChooser from '../components/story/BookChooser'
import i18n from 'format-message'
import { ipcRenderer } from 'electron'
import Beamer from '../../common/components/Beamer'
import SETTINGS from '../../common/utils/settings'
import { actions } from 'pltr/v2'

const trialMode = SETTINGS.get('trialMode')
const isDev = process.env.NODE_ENV == 'development'

class Navigation extends Component {
  handleSelect = (selectedKey) => {
    this.props.actions.changeCurrentView(selectedKey)
  }

  renderTrialLinks() {
    if (!trialMode) return null

    return (
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={() => ipcRenderer.send('open-buy-window')}>
          <Glyphicon glyph="shopping-cart" /> {i18n('Buy Full Version')}
        </Button>
      </Navbar.Form>
    )
  }

  render() {
    const { ui } = this.props
    return (
      <Navbar className="project-nav" fluid collapseOnSelect inverse={ui.darkMode}>
        <Navbar.Header>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav onSelect={this.handleSelect} activeKey={ui.currentView}>
            <BookChooser />
            <NavItem eventKey="project">{i18n('Project')}</NavItem>
            <NavItem eventKey="timeline">{i18n('Timeline')}</NavItem>
            <NavItem eventKey="outline">{i18n('Outline')}</NavItem>
            <NavItem eventKey="notes">{i18n('Notes')}</NavItem>
            <NavItem eventKey="characters">{i18n('Characters')}</NavItem>
            <NavItem eventKey="places">{i18n('Places')}</NavItem>
            <NavItem eventKey="tags">{i18n('Tags')}</NavItem>
            {isDev ? (
              <NavItem eventKey="analyzer">
                Analyzer<sup>(DEV)</sup>
              </NavItem>
            ) : null}
          </Nav>
          <Beamer inNavigation />
          {this.renderTrialLinks()}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

Navigation.propTypes = {
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.ui, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
