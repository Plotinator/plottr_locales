import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { actions } from 'wired-up-pltr'

import { PlottrComponentsContext } from '../../../connections/pltrContext'

const ExpiredView = ({ startProOnboardingFromRoot }) => {
  const {
    platform: { openExternal },
  } = useContext(PlottrComponentsContext)

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
}

export default connect(null, {
  startProOnboardingFromRoot: actions.applicationState.startProOnboardingFromRoot,
})(ExpiredView)
