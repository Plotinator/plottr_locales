import { createSelector } from 'reselect'

import { urlPointsToPlottrCloud } from '../helpers/file'

import {
  backupEnabledSelector,
  localBackupsEnabledSelector,
  offlineModeEnabledSelector,
  showDashboardOnBootSelector,
  previouslyLoggedIntoProSelector,
  choseTrialModeSelector,
} from './settingsFirstOrder'
import {
  isLoggedInSelector,
  isOnWebSelector,
  currentAppStateIsDashboardSelector,
} from './clientFirstOrder'
import {
  applicationSettingsAreLoadedSelector,
  checkedLicenseSelector,
  checkedProSubscriptionSelector,
  checkedTrialSelector,
  checkingLicenseSelector,
  checkingTrialSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  filePathToUploadSelector,
  importingNewProjectSelector,
  isOnboardingToProSelector,
  manipulatingAFileSelector,
  sessionCheckedSelector,
  checkingSessionSelector,
  loadingFileSelector,
  firstTimeBootingSelector,
  dashboardClosedSelector,
  checkedFileToLoadSelector,
  checkingFileToLoadSelector,
  trialLoadedSelector,
  plottrLicenseLoadedSelector,
  proLicenseLoadedSelector,
  fetchedPlottrLicenseSelector,
  fetchedProLicenseSelector,
  noFileToShowSelector,
} from './applicationStateFirstOrder'
import {
  isOfflineSelector,
  isResumingSelector,
  fileURLSelector,
  hasAllKeysSelector,
  projectSelector,
} from './projectFirstOrder'
import {
  hasActivePlottrLicenseSelector,
  hasActiveProLicenseSelector,
  trialExpiredSelector,
  trialStartedSelector,
  hasAPlottrLicenseExpiredOrNotSelector,
  hasAProLicenseExpiredOrNotSelector,
  hasATrialExpiredOrNotSelector,
  needsToCheckPlottrLicense,
  needsToCheckProLicense,
} from './licenseFirstOrder'
import { fileIsLoadedSelector } from './applicationStateFirstOrder'
import { shouldBeInProSelector, isLoggedIntoProWithActiveLicenseSelector } from './secondOrder'

export const userNeedsToLoginSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  shouldBeInProSelector,
  sessionCheckedSelector,
  checkingSessionSelector,
  isLoggedInSelector,
  (settingsAreLoaded, shouldBeInPro, sessionChecked, checkingSession, isLoggedIn) => {
    return settingsAreLoaded && shouldBeInPro && !checkingSession && sessionChecked && !isLoggedIn
  }
)

export const isInOfflineModeSelector = createSelector(
  isOfflineSelector,
  shouldBeInProSelector,
  offlineModeEnabledSelector,
  (isOffline, shouldBeInPro, offlineModeEnabled) => {
    return isOffline && shouldBeInPro && offlineModeEnabled
  }
)

export const needToCheckProSubscriptionSelector = createSelector(
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  (shouldBeInPro, checkedProSubscription) => {
    return shouldBeInPro && !checkedProSubscription
  }
)

export const isInTrialModeSelector = createSelector(
  trialStartedSelector,
  trialExpiredSelector,
  hasActivePlottrLicenseSelector,
  shouldBeInProSelector,
  choseTrialModeSelector,
  (started, trialExpired, hasLicense, shouldBeInPro, choseTrialMode) => {
    return started && !trialExpired && !hasLicense && !shouldBeInPro && choseTrialMode
  }
)

export const isInSomeValidLicenseStateSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  sessionCheckedSelector,
  userNeedsToLoginSelector,
  isInOfflineModeSelector,
  needToCheckProSubscriptionSelector,
  hasActiveProLicenseSelector,
  hasActivePlottrLicenseSelector,
  isInTrialModeSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  (
    applicationSettingsAreLoaded,
    sessionChecked,
    needsToLogin,
    isInOfflineMode,
    needToCheckProSubscription,
    hasProLicense,
    hasPlottrLicense,
    isInTrialMode,
    isLoggedIn,
    shouldBeInPro
  ) => {
    return (
      applicationSettingsAreLoaded &&
      (isInOfflineMode ||
        (sessionChecked &&
          !needsToLogin &&
          !needToCheckProSubscription &&
          ((isLoggedIn && hasProLicense) ||
            (!shouldBeInPro && (hasPlottrLicense || isInTrialMode)))))
    )
  }
)

export const licenseExpiredSelector = createSelector(
  shouldBeInProSelector,
  isLoggedInSelector,
  hasActiveProLicenseSelector,
  sessionCheckedSelector,
  (shouldBeInPro, isLoggedIn, hasActiveProLicense, sessionChecked) => {
    return !hasActiveProLicense && shouldBeInPro && isLoggedIn && sessionChecked
  }
)

export const readyToCheckFileToLoadSelector = createSelector(
  isInSomeValidLicenseStateSelector,
  filePathToUploadSelector,
  checkedFileToLoadSelector,
  checkingFileToLoadSelector,
  (inValidLicenseState, filePathToUpload, checkedFileToLoad, checkingFileToLoad) => {
    return !filePathToUpload && inValidLicenseState && !checkedFileToLoad && !checkingFileToLoad
  }
)

export const checkingSessionOrNeedToCheckSessionSelector = createSelector(
  sessionCheckedSelector,
  checkingSessionSelector,
  isInOfflineModeSelector,
  (sessionChecked, checkingSession, isInOfflineMode) => {
    return !isInOfflineMode && (checkingSession || !sessionChecked)
  }
)

export const busyLoadingFileOrNeedToLoadFileSelector = createSelector(
  loadingFileSelector,
  fileIsLoadedSelector,
  (fileIsLoading, loadedAFileBefore) => {
    return fileIsLoading || !loadedAFileBefore
  }
)

export const applicationIsBusyAndUninterruptableSelector = createSelector(
  busyLoadingFileOrNeedToLoadFileSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isOnboardingToProSelector,
  importingNewProjectSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    busyLoadingFileOrNeedToLoadFile,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isOnboardingToPro,
    isImportingNewProject,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      busyLoadingFileOrNeedToLoadFile ||
      checkingWhatToLoadOrNeedToCheckWhatToLoad ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (checkingSessionOrNeedToCheckSession && !isOnboardingToPro) ||
      isImportingNewProject ||
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const isFirstTimeSelector = createSelector(
  hasActivePlottrLicenseSelector,
  trialStartedSelector,
  hasActiveProLicenseSelector,
  shouldBeInProSelector,
  (hasLicense, trialStarted, hasCurrentProLicense, shouldBeInPro) => {
    return !hasLicense && !trialStarted && !hasCurrentProLicense && !shouldBeInPro
  }
)

export const isInTrialModeWithExpiredTrialSelector = createSelector(
  trialStartedSelector,
  trialExpiredSelector,
  hasActivePlottrLicenseSelector,
  hasActiveProLicenseSelector,
  checkedProSubscriptionSelector,
  previouslyLoggedIntoProSelector,
  checkedLicenseSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  (
    started,
    trialExpired,
    hasLicense,
    hasCurrentProLicense,
    checkedPro,
    choseProMode,
    checkedLicense,
    checkingSessionOrNeedToCheckSession
  ) => {
    return (
      checkedPro &&
      checkedLicense &&
      !checkingSessionOrNeedToCheckSession &&
      started &&
      trialExpired &&
      !hasLicense &&
      (!hasCurrentProLicense || (hasCurrentProLicense && !choseProMode))
    )
  }
)

export const applicationIsBusyButFileCouldBeUnloadedSelector = createSelector(
  isFirstTimeSelector,
  isInTrialModeWithExpiredTrialSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  isInOfflineModeSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    firstTime,
    isInTrialModeWithExpiredTrial,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    isInOfflineMode,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      // We only check what to load when we're in a valid license
      // state.  So we need to account for there being no license or
      // there being an expired trial.
      (!firstTime && !isInTrialModeWithExpiredTrial && checkingWhatToLoadOrNeedToCheckWhatToLoad) ||
      loadingFile ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (!isInOfflineMode && checkingSessionOrNeedToCheckSession) ||
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const loadingStateSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkingLicenseSelector,
  checkingTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkingLicense,
    checkingTrial
  ) => {
    if (checkingWhatToLoadOrNeedToCheckWhatToLoad) {
      return 'Locating document...'
    }
    if (loadingFile) {
      return 'Placing document on table...'
    }
    if (manipulatingAFile) {
      return 'Spilling ink on desk...'
    }
    if (!applicationSettingsAreLoaded) {
      return 'Loading settings...'
    }
    if (checkingSessionOrNeedToCheckSession) {
      return 'Security checkpoint...'
    }
    if (
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      checkingLicense ||
      checkingTrial
    ) {
      return 'Checking your ticket...'
    }
    return 'Done!'
  }
)

export const loadingProgressSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    let progress = 0
    if (!checkingWhatToLoadOrNeedToCheckWhatToLoad) {
      progress++
    }
    if (!applicationSettingsAreLoaded) {
      progress++
    }
    if (!checkingSessionOrNeedToCheckSession) {
      progress++
    }
    if (!(isLoggedIn && shouldBeInPro && !checkedProSubscription)) {
      progress++
    }
    if (checkedLicense) {
      progress++
    }
    if (checkedTrial) {
      progress++
    }
    return 100.0 * (progress / 6.0)
  }
)

export const isCloudFileSelector = createSelector(
  projectSelector,
  isOnWebSelector,
  (project, isOnWeb) => {
    return isOnWeb || (project && project.fileURL && urlPointsToPlottrCloud(project.fileURL))
  }
)

export const cantShowFileSelector = createSelector(
  fileIsLoadedSelector,
  isLoggedIntoProWithActiveLicenseSelector,
  isCloudFileSelector,
  isResumingSelector,
  isOfflineSelector,
  isInOfflineModeSelector,
  shouldBeInProSelector,
  (
    fileLoaded,
    isInProMode,
    selectedFileIsACloudFile,
    isResuming,
    isOffline,
    isInOfflineMode,
    shouldBeInPro
  ) => {
    return (
      !isResuming &&
      (!fileLoaded ||
        (!isInOfflineMode && isOffline && shouldBeInPro) ||
        (!isInOfflineMode && !!isInProMode !== !!selectedFileIsACloudFile))
    )
  }
)

export const canSaveSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  isCloudFileSelector,
  (fileURL, isResuming, isOffline, offlineModeEnabled, hasAllKeys, isCloudFile) => {
    return (
      !!fileURL &&
      !isResuming &&
      (!isCloudFile || !(isCloudFile && isOffline && !offlineModeEnabled)) &&
      hasAllKeys
    )
  }
)

export const shouldSaveOfflineFileSelector = createSelector(
  canSaveSelector,
  offlineModeEnabledSelector,
  isCloudFileSelector,
  (canSave, offlineModeEnabled, isCloudFile) => {
    return isCloudFile && canSave && offlineModeEnabled
  }
)

export const canBackupSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  isCloudFileSelector,
  localBackupsEnabledSelector,
  backupEnabledSelector,
  (
    fileURL,
    isResuming,
    isOffline,
    offlineModeEnabled,
    hasAllKeys,
    isCloudFile,
    localBackupsEnabled,
    backupEnabled
  ) => {
    return (
      backupEnabled &&
      !!fileURL &&
      !isResuming &&
      !(isOffline && isCloudFile) &&
      ((isCloudFile && localBackupsEnabled) || !isCloudFile) &&
      hasAllKeys
    )
  }
)

export const shouldSwitchToDashboardOnStartupSelector = createSelector(
  userNeedsToLoginSelector,
  isFirstTimeSelector,
  isInTrialModeWithExpiredTrialSelector,
  cantShowFileSelector,
  currentAppStateIsDashboardSelector,
  showDashboardOnBootSelector,
  firstTimeBootingSelector,
  dashboardClosedSelector,
  (
    needsToLogin,
    isFirstTime,
    isInTrialModeWithExpiredTrial,
    cantShowFile,
    currentAppStateIsDashboard,
    showDashboard,
    firstTimeBooting,
    dashboardClosed
  ) => {
    return (
      !firstTimeBooting &&
      !needsToLogin &&
      !isFirstTime &&
      !isInTrialModeWithExpiredTrial &&
      !(cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed))
    )
  }
)

export const notBootingForTheFirstTimeSelector = createSelector(
  applicationIsBusyButFileCouldBeUnloadedSelector,
  firstTimeBootingSelector,
  (busyBooting, firstTimeBooting) => {
    return !busyBooting && firstTimeBooting
  }
)

export const loadedLocalSessionSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  trialLoadedSelector,
  plottrLicenseLoadedSelector,
  proLicenseLoadedSelector,
  (settingsLoaded, trialLoaded, plottrLicenseLoaded, proLicenseLoaded) => {
    return settingsLoaded && trialLoaded && plottrLicenseLoaded && proLicenseLoaded
  }
)

export const hasNoLicensesSelector = createSelector(
  hasAPlottrLicenseExpiredOrNotSelector,
  hasAProLicenseExpiredOrNotSelector,
  previouslyLoggedIntoProSelector,
  hasATrialExpiredOrNotSelector,
  choseTrialModeSelector,
  (hasPlottrLicense, hasProLicense, choseProMode, hasTrialLicense, choseTrialMode) => {
    return (
      !hasPlottrLicense &&
      (!hasProLicense || (hasProLicense && !choseProMode)) &&
      (!hasTrialLicense || !choseTrialMode)
    )
  }
)

export const hasNoPurchasedLicenseSelector = createSelector(
  hasAPlottrLicenseExpiredOrNotSelector,
  hasAProLicenseExpiredOrNotSelector,
  (hasPlottrLicense, hasProLicense) => {
    return !hasPlottrLicense && !hasProLicense
  }
)

export const displayChoiceViewSelector = createSelector(
  loadedLocalSessionSelector,
  hasNoLicensesSelector,
  (loadedLocalSession, hasNoLicense) => {
    return loadedLocalSession && hasNoLicense
  }
)

export const displayTrialExpiredSelector = createSelector(
  loadedLocalSessionSelector,
  hasNoPurchasedLicenseSelector,
  hasAProLicenseExpiredOrNotSelector,
  previouslyLoggedIntoProSelector,
  trialExpiredSelector,
  choseTrialModeSelector,
  (
    loadedLocalSession,
    hasNoPurchasedLicense,
    hasProLicense,
    previouslyLoggedIntoPro,
    trialExpired,
    choseTrialMode
  ) => {
    return (
      loadedLocalSession &&
      (hasNoPurchasedLicense || (hasProLicense && !previouslyLoggedIntoPro)) &&
      trialExpired &&
      choseTrialMode
    )
  }
)

export const displayExpiredPlottrLicenseSelector = createSelector(
  loadedLocalSessionSelector,
  previouslyLoggedIntoProSelector,
  hasAPlottrLicenseExpiredOrNotSelector,
  fetchedPlottrLicenseSelector,
  hasActivePlottrLicenseSelector,
  (
    loadedLocalSession,
    previouslyLoggedIntoPro,
    hasAPlottrLicenseExpiredOrNot,
    fetchedPlottrLicense,
    hasActivePlottrLicense
  ) => {
    return (
      loadedLocalSession &&
      !previouslyLoggedIntoPro &&
      hasAPlottrLicenseExpiredOrNot &&
      fetchedPlottrLicense &&
      !hasActivePlottrLicense
    )
  }
)

export const displayExpiredProLicenseSelector = createSelector(
  loadedLocalSessionSelector,
  previouslyLoggedIntoProSelector,
  fetchedProLicenseSelector,
  hasActiveProLicenseSelector,
  (loadedLocalSession, previouslyLoggedIntoPro, fetchedProLicense, hasActiveProLicense) => {
    return (
      loadedLocalSession && previouslyLoggedIntoPro && fetchedProLicense && !hasActiveProLicense
    )
  }
)

export const displayConnectToTheInternetSelector = createSelector(
  loadedLocalSessionSelector,
  isOfflineSelector,
  choseTrialModeSelector,
  previouslyLoggedIntoProSelector,
  needsToCheckPlottrLicense,
  needsToCheckProLicense,
  (
    loadedLocalSession,
    isOffline,
    choseTrialMode,
    previouslyLoggedIntoPro,
    needsToCheckPlottr,
    needsToCheckPro
  ) => {
    return (
      loadedLocalSession &&
      isOffline &&
      !choseTrialMode &&
      ((!previouslyLoggedIntoPro && needsToCheckPlottr) ||
        (previouslyLoggedIntoPro && needsToCheckPro))
    )
  }
)

export const displayLoginSelector = createSelector(
  loadedLocalSessionSelector,
  hasAProLicenseExpiredOrNotSelector,
  sessionCheckedSelector,
  isLoggedInSelector,
  previouslyLoggedIntoProSelector,
  (loadedLocalSession, hasAProLicense, sessionChecked, isLoggedIn, previouslyLoggedIntoPro) => {
    return (
      loadedLocalSession &&
      hasAProLicense &&
      sessionChecked &&
      !isLoggedIn &&
      previouslyLoggedIntoPro
    )
  }
)

export const displayDashboardSelector = createSelector(
  cantShowFileSelector,
  currentAppStateIsDashboardSelector,
  showDashboardOnBootSelector,
  noFileToShowSelector,
  (cantShowFile, currentAppStateIsDashboard, showDashboardOnBoot, noFileToShow) => {
    return cantShowFile && currentAppStateIsDashboard && (showDashboardOnBoot || noFileToShow)
  }
)
