import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import Button from '../../Button'
import UnconnectedVerifyPro from './VerifyPro'
import AccountHeader from './AccountHeader'

const TRIAL_LENGTH = 60

const ChoiceViewConnector = (connector) => {
  const {
    platform: {
      os,
      license: { startTrial },
    },
  } = connector

  const VerifyPro = UnconnectedVerifyPro(connector)

  const ChoiceView = ({
    goToAccount,
    startProOnboarding,
    startSettingsWizard,
    trialExpired,
    trialStarted,
  }) => {
    const [view, setView] = useState('chooser')

    const goBack = () => setView('chooser')

    // eslint-disable-next-line react/display-name, react/prop-types
    const trialText = t.rich('Start the<br/>Free Trial', { br: () => <br key={'br'} /> })

    const renderBody = () => {
      switch (view) {
        case 'chooser':
          return (
            <div className="verify__chooser with-3">
              {!trialExpired && !trialStarted ? (
                <div className="verify__choice" onClick={() => setView('explain')}>
                  <h2>{trialText}</h2>
                </div>
              ) : null}
              <div
                className="verify__choice"
                onClick={() => {
                  startProOnboarding()
                  setView('pro')
                }}
              >
                <h2>{t(`I've bought Plottr`)}</h2>
              </div>
            </div>
          )
        case 'explain':
          return (
            <div>
              <p>{t("You'll have {trialDays} days", { trialDays: TRIAL_LENGTH })}</p>
              <p>{t('Access all the features')}</p>
              <p>{t('Create unlimited projects')}</p>
              <div style={{ marginTop: '30px' }}>
                <Button
                  bsSize="large"
                  bsStyle="default"
                  onClick={() => {
                    startTrial()
                    startSettingsWizard()
                  }}
                >
                  {t('Start my Free Trial')}
                </Button>
                <Button bsStyle="link" onClick={goBack}>
                  {t('Cancel')}
                </Button>
              </div>
            </div>
          )
        case 'pro':
          return <VerifyPro goBack={goBack} success={goToAccount} />
      }
      return null
    }

    return (
      <div className="text-center">
        <AccountHeader os={os()} />
        {renderBody()}
      </div>
    )
  }

  ChoiceView.propTypes = {
    goToAccount: PropTypes.func.isRequired,
    startProOnboarding: PropTypes.func.isRequired,
    startSettingsWizard: PropTypes.func.isRequired,
    trialExpired: PropTypes.bool,
    trialStarted: PropTypes.bool,
  }

  const {
    pltr: { actions, selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          trialExpired: selectors.trialExpiredSelector(state),
          trialStarted: selectors.trialStartedSelector(state),
        }
      },
      {
        startSettingsWizard: actions.applicationState.startSettingsWizard,
      }
    )(ChoiceView)
  }

  throw new Error('Could not connect ChoiceView')
}

export default ChoiceViewConnector
