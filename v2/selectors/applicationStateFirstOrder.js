// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { fullSystemStateSelector } from './fullFileFirstOrder'
import { EDITING, SEARCHING } from '../constants/editStates'

export const applicationStateSelector = createSelector(fullSystemStateSelector, (state) => {
  return state.applicationState || {}
})

export const projectStateSelector = createSelector(
  applicationStateSelector,
  ({ project }) => project
)
export const fileListLoadedSelector = createSelector(
  projectStateSelector,
  ({ fileListLoaded }) => fileListLoaded
)
export const fileListIsLoadingSelector = createSelector(
  projectStateSelector,
  ({ loadingFileList }) => loadingFileList
)

export const importingNewProjectSelector = createSelector(
  projectStateSelector,
  ({ isImportingAProject }) => isImportingAProject
)

export const applicationSettingsSelector = createSelector(
  applicationStateSelector,
  ({ settings }) => settings
)
export const applicationSettingsAreLoadedSelector = createSelector(
  applicationSettingsSelector,
  ({ settingsLoaded }) => settingsLoaded
)
export const applicationSettingsAreLoadingSelector = createSelector(
  applicationSettingsSelector,
  ({ loadingSettings }) => loadingSettings
)
export const exportConfigSettingsAreLoadedSelector = createSelector(
  applicationSettingsSelector,
  ({ exportConfigLoaded }) => exportConfigLoaded
)
export const exportConfigSettingsAreLoadingSelector = createSelector(
  applicationSettingsSelector,
  ({ loadingExportConfig }) => loadingExportConfig
)

export const fileStateSelector = createSelector(applicationStateSelector, ({ file }) => file)
export const checkingFileToLoadSelector = createSelector(
  fileStateSelector,
  ({ checkingFileToLoad }) => checkingFileToLoad
)
export const checkedFileToLoadSelector = createSelector(
  fileStateSelector,
  ({ checkedFileToLoad }) => checkedFileToLoad
)
export const fileIsLoadedSelector = createSelector(
  fileStateSelector,
  ({ fileLoaded }) => fileLoaded
)
export const isRenamingFileSelector = createSelector(
  fileStateSelector,
  ({ renamingFile }) => renamingFile
)
export const creatingCloudFileSelector = createSelector(
  fileStateSelector,
  ({ creatingCloudFile }) => creatingCloudFile
)
export const uploadingFileToCloudSelector = createSelector(
  fileStateSelector,
  ({ uploadingFileToCloud }) => uploadingFileToCloud
)
export const loadingFileSelector = createSelector(
  fileStateSelector,
  ({ loadingFile }) => loadingFile
)
export const errorLoadingFileSelector = createSelector(
  fileStateSelector,
  ({ errorLoadingFile }) => !!errorLoadingFile
)
export const errorIsUpdateErrorSelector = createSelector(
  fileStateSelector,
  ({ errorIsUpdateError }) => errorIsUpdateError
)
export const deletingFileSelector = createSelector(
  fileStateSelector,
  ({ deletingFile }) => deletingFile
)
export const savingFileAsSelector = createSelector(
  fileStateSelector,
  ({ savingFileAs }) => savingFileAs
)
export const filePathToUploadSelector = createSelector(
  fileStateSelector,
  ({ filePathToUpload }) => filePathToUpload
)
export const filePathToProjectDuringBootSelector = createSelector(
  fileStateSelector,
  ({ pathToProjectDuringBoot }) => {
    return pathToProjectDuringBoot
  }
)
export const noFileToShowSelector = createSelector(fileStateSelector, ({ noFileToShow }) => {
  return noFileToShow
})

export const sessionStateSelector = createSelector(
  applicationStateSelector,
  ({ session }) => session
)
export const sessionCheckedSelector = createSelector(
  sessionStateSelector,
  ({ sessionChecked }) => sessionChecked
)
export const checkingSessionSelector = createSelector(
  sessionStateSelector,
  ({ checkingSession }) => checkingSession
)
export const isLoggingInSelector = createSelector(
  sessionStateSelector,
  ({ loggingIn }) => loggingIn
)

export const licenseStateSelector = createSelector(
  applicationStateSelector,
  ({ license }) => license
)
export const checkedTrialSelector = createSelector(
  licenseStateSelector,
  ({ trialLoaded }) => trialLoaded
)
export const trialLoadedSelector = checkedTrialSelector
export const checkingTrialSelector = createSelector(
  licenseStateSelector,
  ({ loadingTrial }) => loadingTrial
)
export const checkedLicenseSelector = createSelector(
  licenseStateSelector,
  ({ licenseLoaded }) => licenseLoaded
)
export const plottrLicenseLoadedSelector = checkedLicenseSelector
export const checkingLicenseSelector = createSelector(
  licenseStateSelector,
  ({ loadingLicense }) => loadingLicense
)
export const checkedProSubscriptionSelector = createSelector(
  licenseStateSelector,
  ({ proSubscriptionChecked }) => proSubscriptionChecked
)
export const proLicenseLoadedSelector = checkedProSubscriptionSelector
export const checkingProSubscriptionSelector = createSelector(
  licenseStateSelector,
  ({ checkingProSubscription }) => checkingProSubscription
)
export const fetchedProSubscriptionSelector = createSelector(
  licenseStateSelector,
  ({ fetchedProSubscription }) => {
    return fetchedProSubscription ?? false
  }
)
export const fetchedProLicenseSelector = fetchedProSubscriptionSelector
export const fetchingProSubscriptionSelector = createSelector(
  licenseStateSelector,
  ({ fetchingProSubscription }) => {
    return fetchingProSubscription ?? false
  }
)
export const fetchedLicenseSelector = createSelector(licenseStateSelector, ({ fetchedLicense }) => {
  return fetchedLicense ?? false
})
export const fetchedPlottrLicenseSelector = fetchedLicenseSelector
export const fetchingLicenseSelector = createSelector(
  licenseStateSelector,
  ({ fetchingLicense }) => {
    return fetchingLicense ?? false
  }
)

export const settingsWizardStateSelector = createSelector(
  applicationStateSelector,
  ({ settingsWizard }) => settingsWizard
)
export const currentSettingsWizardStepSelector = createSelector(
  settingsWizardStateSelector,
  ({ wizardStep }) => wizardStep
)
export const isInSettingsWizardSelector = createSelector(
  settingsWizardStateSelector,
  ({ isInSettingsWizard }) => isInSettingsWizard
)
export const stagedLanguageSelector = createSelector(
  settingsWizardStateSelector,
  ({ stagedLanguage }) => stagedLanguage
)

export const proOnboardingStateSelector = createSelector(
  applicationStateSelector,
  ({ proOnboarding }) => proOnboarding
)
export const currentProOnboardingStepSelector = createSelector(
  proOnboardingStateSelector,
  ({ onboardingStep }) => onboardingStep
)
export const isOnboardingToProSelector = createSelector(
  proOnboardingStateSelector,
  ({ isOnboarding }) => isOnboarding
)
export const isOnboardingToProFromRootSelector = createSelector(
  proOnboardingStateSelector,
  ({ isOnboardingFromRoot }) => isOnboardingFromRoot
)

export const checkingWhatToLoadOrNeedToCheckWhatToLoadSelector = createSelector(
  checkingFileToLoadSelector,
  checkedFileToLoadSelector,
  (checkingFileToLoad, checkedFileToLoad) => {
    return checkingFileToLoad || !checkedFileToLoad
  }
)

export const manipulatingAFileSelector = createSelector(
  isRenamingFileSelector,
  creatingCloudFileSelector,
  uploadingFileToCloudSelector,
  deletingFileSelector,
  savingFileAsSelector,
  (isRenamingFile, creatingCloudFile, uploadingFileToCloud, deletingFile, savingFileAs) => {
    return (
      isRenamingFile || creatingCloudFile || uploadingFileToCloud || deletingFile || savingFileAs
    )
  }
)

const updateStateSelector = createSelector(applicationStateSelector, ({ update }) => {
  return update
})

export const shouldCheckForUpdatesSelector = createSelector(
  updateStateSelector,
  ({ shouldCheck }) => {
    return shouldCheck
  }
)

export const updateAvailableSelector = createSelector(updateStateSelector, ({ available }) => {
  return available
})

export const downloadInProgressSelector = createSelector(
  updateStateSelector,
  ({ percentDownloaded }) => {
    return percentDownloaded > 0 && percentDownloaded < 100
  }
)

export const percentDownloadedSelector = createSelector(
  updateStateSelector,
  ({ percentDownloaded }) => {
    return percentDownloaded
  }
)

export const finishedDownloadingSelector = createSelector(
  updateStateSelector,
  ({ percentDownloaded }) => {
    return percentDownloaded === 100
  }
)

export const updateErrorSelector = createSelector(updateStateSelector, ({ error }) => {
  return error
})

export const updateInfoSelector = createSelector(updateStateSelector, ({ info }) => {
  return info
})

export const updateNotificationHiddenSelector = createSelector(
  updateStateSelector,
  ({ notifierHidden }) => {
    return notifierHidden
  }
)

export const checkingForUpdatesSelector = createSelector(updateStateSelector, ({ checking }) => {
  return checking
})

const workSelector = createSelector(applicationStateSelector, ({ work }) => {
  return work
})

export const busyWithWorkThatPreventsQuittingSelector = createSelector(workSelector, ({ busy }) => {
  return busy
})

export const userInteractionsSelector = createSelector(
  applicationStateSelector,
  ({ userInteractions }) => {
    return userInteractions || {}
  }
)

export const jumpCounterSelector = createSelector(userInteractionsSelector, ({ jumpCounter }) => {
  return jumpCounter || 0
})

export const editStateSelector = createSelector(userInteractionsSelector, ({ editState }) => {
  return editState || EDITING
})

export const isSearchingSelector = createSelector(editStateSelector, (editState) => {
  return editState === SEARCHING
})

export const dashboardAppStateSelector = createSelector(
  applicationStateSelector,
  ({ dashboard }) => {
    return dashboard ?? {}
  }
)
export const dashboardViewToOpenToSelector = createSelector(
  dashboardAppStateSelector,
  ({ openTo }) => {
    return openTo ?? null
  }
)
export const dashboardClosedSelector = createSelector(dashboardAppStateSelector, ({ closed }) => {
  return closed ?? false
})

export const bootingAppStateSelector = createSelector(applicationStateSelector, ({ booting }) => {
  return booting ?? false
})
export const firstTimeBootingSelector = createSelector(
  bootingAppStateSelector,
  ({ firstTimeBooting }) => {
    return firstTimeBooting
  }
)
