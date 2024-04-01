import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import Alert from '../../../Alert'
import Button from '../../../Button'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedFirebaseLogin from '../../../FirebaseLogin'
import { checkDependencies } from '../../../checkDependencies'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'

const ProStep1Connector = (connector) => {
  const {
    platform: {
      isDevelopment,
      firebase: { logOut },
    },
  } = connector
  checkDependencies({ isDevelopment })

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({
    nextStep,
    cancel,
    isInProMode,
    checkedProSubscription,
    checkingProSubscription,
    startLoadingALicenseType,
    finishLoadingALicenseType,
    finishCheckingSession,
    checkedLicense,
    hasActivePlottrLicense,
    startSettingsWizard,
  }) => {
    const noPro = checkedProSubscription && !isInProMode
    const noClassic = checkedLicense && !hasActivePlottrLicense
    const showFrb = !isInProMode

    useEffect(() => {
      if (!checkedProSubscription) {
        return
      } else if (isInProMode) {
        nextStep()
      } else if (hasActivePlottrLicense) {
        cancel()
        startSettingsWizard()
      }
    }, [checkedProSubscription, isInProMode, hasActivePlottrLicense])

    const toggleChecking = (newVal) => {
      if (newVal) {
        // started checking
        startLoadingALicenseType('proSubscription')
      } else {
        if (checkedProSubscription) return
        // finished checking
        finishLoadingALicenseType('proSubscription')
      }
    }

    const cancelAndLogout = () => {
      logOut().then(() => {
        finishCheckingSession()
        cancel()
      })
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <h2>{t('Sign in with your my.plottr.com account')}</h2>
          {checkingProSubscription ? <Spinner /> : null}
        </StepHeader>
        {noPro && noClassic ? (
          <StepBody>
            <Alert bsStyle="danger">
              <h4>{t("We couldn't find an active license for that email address")}</h4>
            </Alert>
            <Button onClick={cancelAndLogout} bsSize="sm">
              {t('Cancel')}
            </Button>
          </StepBody>
        ) : null}
        <StepBody>{showFrb ? <FirebaseLogin setChecking={toggleChecking} /> : null}</StepBody>
        {noPro || checkingProSubscription ? null : (
          <StepFooter>
            <OnboardingButtonBar>
              <Button onClick={cancelAndLogout}>{t('Cancel')}</Button>
            </OnboardingButtonBar>
          </StepFooter>
        )}
      </OnboardingStep>
    )
  }

  ProStep1.propTypes = {
    nextStep: PropTypes.func,
    cancel: PropTypes.func,
    isInProMode: PropTypes.bool,
    checkingProSubscription: PropTypes.bool,
    checkedProSubscription: PropTypes.bool,
    startLoadingALicenseType: PropTypes.func.isRequired,
    finishLoadingALicenseType: PropTypes.func.isRequired,
    finishCheckingSession: PropTypes.func.isRequired,
    hasActivePlottrLicense: PropTypes.bool,
    checkedLicense: PropTypes.bool,
    startSettingsWizard: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
        checkingProSubscription: selectors.checkingProSubscriptionSelector(state),
        checkedProSubscription: selectors.checkedProSubscriptionSelector(state),
        hasActivePlottrLicense: selectors.hasActivePlottrLicenseSelector(state),
        checkedLicense: selectors.checkedLicenseSelector(state),
      }),
      {
        startLoadingALicenseType: actions.applicationState.startLoadingALicenseType,
        finishLoadingALicenseType: actions.applicationState.finishLoadingALicenseType,
        finishCheckingSession: actions.applicationState.finishCheckingSession,
        startSettingsWizard: actions.applicationState.startSettingsWizard,
      }
    )(ProStep1)
  }

  throw new Error('Could not connect ProStep1')
}

export default ProStep1Connector
