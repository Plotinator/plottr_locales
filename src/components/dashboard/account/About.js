import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import Button from '../../Button'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const About = ({ settings, inValidLicenseState, requestCheckForUpdates, canReceiveUpdates }) => {
  const {
    platform: {
      update: { checkForUpdates },
      appVersion,
      openExternal,
      mpq,
      os,
      showErrorBox,
    },
  } = useContext(PlottrComponentsContext)

  const [version, setVersion] = useState('')

  useEffect(() => {
    appVersion().then(setVersion)
  }, [])

  const osIsUnknown = os() === 'unknown'

  const _checkForUpdates = () => {
    if (canReceiveUpdates) {
      mpq.push('btn_check_for_updates')
      requestCheckForUpdates()
      checkForUpdates()
    } else {
      showErrorBox(t('Error'), t('You cannot receive updates with an inactive subscription.'))
    }
  }

  const seeChangelog = () => {
    mpq.push('btn_see_changelog')
    openExternal('https://plottr.com/changelog')
  }

  const seeAwesomeTeam = () => {
    openExternal('https://plottr.com/team')
  }

  const UpdateButton = () => {
    // Can't update an application on an unknown OS (e.g. OS is unknown on web)
    if (osIsUnknown) return null

    if (inValidLicenseState || settings.canGetUpdates) {
      // in the free trial or valid license
      return (
        <dd>
          <Button bsSize="small" onClick={_checkForUpdates}>
            {t('Check for Updates')}
          </Button>
        </dd>
      )
    } else {
      return (
        <dd>
          <span className="text-danger">{t('Not Receiving Updates')}</span>
        </dd>
      )
    }
  }

  return (
    <div className="dashboard__about">
      <h1>{t('About Plottr')}</h1>
      <hr />
      <div className="dashboard__about__wrapper">
        <dl className="dl-horizontal">
          <dt>{t('Version')}</dt>
          <dd>{version}</dd>
          {osIsUnknown ? null : <dt>{t('Updates')}</dt>}
          <UpdateButton />
          <dt>{t('Changelog')}</dt>
          <dd>
            <a href="#" onClick={seeChangelog} draggable={false}>
              {t("See What's New")}
            </a>
          </dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{t('Created By')}</dt>
          <dd>
            Cameron Sutter and{' '}
            <a href="#" onClick={seeAwesomeTeam}>
              an awesome team
            </a>
          </dd>
        </dl>
      </div>
    </div>
  )
}

About.propTypes = {
  requestCheckForUpdates: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  inValidLicenseState: PropTypes.bool,
  canReceiveUpdates: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  settings: selectors.appSettingsSelector(state),
  inValidLicenseState: selectors.isInSomeValidLicenseStateSelector(state),
  canReceiveUpdates: selectors.canReceiveUpdatesSelector(state),
})

export default connect(mapStateToProps, {
  requestCheckForUpdates: actions.applicationState.requestCheckForUpdates,
})(About)
