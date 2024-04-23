import React, { useEffect, useState } from 'react'
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
      license: { checkForLicense },
    },
  } = connector
  checkDependencies({ isDevelopment, logOut, checkForLicense })

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({
    nextStep,
    cancel,
    isLoggedIn,
    isInProMode,
    finishCheckingSession,
    hasActivePlottrLicense,
    startSettingsWizard,
    fetchedProSubscription,
    fetchingProSubscription,
    fetchedLicense,
    fetchingLicense,
    finishLoggingIn,
  }) => {
    const noPro = fetchedProSubscription && !fetchingProSubscription && !isInProMode
    const noClassic = fetchedLicense && !fetchingLicense && !hasActivePlottrLicense
    const showFrb = !isInProMode

    const [loggedOut, setLoggedOut] = useState(false)
    const [checkedLicense, setCheckedLicense] = useState(false)

    useEffect(() => {
      logOut().then(() => {
        setLoggedOut(true)
      })
    }, [])

    useEffect(() => {
      if (isLoggedIn) {
        checkForLicense().then(() => {
          setCheckedLicense(true)
        })
      }
    }, [isLoggedIn])

    useEffect(() => {
      if (
        !checkedLicense ||
        !fetchedProSubscription ||
        !fetchedLicense ||
        fetchingLicense ||
        fetchingProSubscription
      ) {
        return
      } else if (isInProMode) {
        nextStep()
      } else if (hasActivePlottrLicense) {
        cancel()
        startSettingsWizard()
      }
    }, [
      checkedLicense,
      fetchedProSubscription,
      fetchedLicense,
      fetchingLicense,
      fetchingProSubscription,
      isInProMode,
      hasActivePlottrLicense,
    ])

    const cancelAndLogout = () => {
      finishLoggingIn()
      logOut().then(() => {
        cancel()
      })
    }

    const fetching = fetchingProSubscription || fetchingLicense

    if (!loggedOut) {
      return (
        <OnboardingStep>
          <StepHeader>
            <h2>{t('Busy')}</h2>
            {fetching ? <Spinner /> : null}
          </StepHeader>
        </OnboardingStep>
      )
    } else {
      return (
        <OnboardingStep>
          <StepHeader>
            <h2>{t('Sign in with your my.plottr.com account')}</h2>
            {fetching ? <Spinner /> : null}
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
          <StepBody>{showFrb ? <FirebaseLogin /> : null}</StepBody>
          {noPro || fetching ? null : (
            <StepFooter>
              <OnboardingButtonBar>
                <Button onClick={cancelAndLogout}>{t('Cancel')}</Button>
              </OnboardingButtonBar>
            </StepFooter>
          )}
        </OnboardingStep>
      )
    }
  }

  ProStep1.propTypes = {
    isLoggedIn: PropTypes.bool,
    nextStep: PropTypes.func,
    cancel: PropTypes.func,
    isInProMode: PropTypes.bool,
    finishCheckingSession: PropTypes.func.isRequired,
    hasActivePlottrLicense: PropTypes.bool,
    startSettingsWizard: PropTypes.func.isRequired,
    fetchedProSubscription: PropTypes.bool,
    fetchingProSubscription: PropTypes.bool,
    fetchedLicense: PropTypes.bool,
    fetchingLicense: PropTypes.bool,
    finishLoggingIn: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        isLoggedIn: selectors.isLoggedInSelector(state),
        isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
        hasActivePlottrLicense: selectors.hasActivePlottrLicenseSelector(state),
        fetchedProSubscription: selectors.fetchedProSubscriptionSelector(state),
        fetchingProSubscription: selectors.fetchingProSubscriptionSelector(state),
        fetchedLicense: selectors.fetchedLicenseSelector(state),
        fetchingLicense: selectors.fetchingLicenseSelector(state),
      }),
      {
        startLoadingALicenseType: actions.applicationState.startLoadingALicenseType,
        finishLoadingALicenseType: actions.applicationState.finishLoadingALicenseType,
        finishCheckingSession: actions.applicationState.finishCheckingSession,
        startSettingsWizard: actions.applicationState.startSettingsWizard,
        finishLoggingIn: actions.applicationState.finishLoggingIn,
      }
    )(ProStep1)
  }

  throw new Error('Could not connect ProStep1')
}

export default ProStep1Connector
