import React from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const ExpiredViewConnector = (connector) => {
  const {
    platform: { openExternal },
  } = connector
  checkDependencies({ openExternal })

  const ExpiredView = ({ startSettingsWizard, startProOnboardingFromRoot }) => {
    const buy = () => {
      openExternal('https://plottr.com/pricing/')
    }

    const renderChoices = () => {
      return (
        <>
          <p style={{ padding: '5px 70px' }}>
            {t("Don't worry, all your work is saved in your files")}
          </p>
          <div className="expired__chooser" style={{ marginBottom: '20px' }}>
            <div className="expired__choice" onClick={buy}>
              <h2>{t('I want to buy the full version!')}</h2>
            </div>
            <div className="expired__choice" onClick={startProOnboardingFromRoot}>
              <h2>{t("I've bought Plottr")}</h2>
            </div>
          </div>
        </>
      )
    }

    return (
      <div className="text-center">
        <h1 className="expired">{t('Thanks for trying Plottr')}</h1>
        <h2>{t('Your free trial has expired')} 😭</h2>
        {renderChoices()}
        <p>{t('Please contact us with any questions at support@plottr.com')}</p>
      </div>
    )
  }

  ExpiredView.propTypes = {
    startProOnboardingFromRoot: PropTypes.func.isRequired,
    startSettingsWizard: PropTypes.func.isRequired,
  }

  const {
    pltr: { actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(null, {
      startProOnboardingFromRoot: actions.applicationState.startProOnboardingFromRoot,
      startSettingsWizard: actions.applicationState.startSettingsWizard,
    })(ExpiredView)
  }

  throw new Error('Could not connect ExpiredView')
}

export default ExpiredViewConnector
