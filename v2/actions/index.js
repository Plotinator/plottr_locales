import * as beatActions from './beats'
import * as bookActions from './books'
import * as cardActions from './cards'
import * as categoryActions from './categories'
import * as characterActions from './characters'
import * as customAttributeActions from './customAttributes'
import * as imageActions from './images'
import * as lineActions from './lines'
import * as noteActions from './notes'
import * as placeActions from './places'
import * as seriesActions from './series'
import * as tagActions from './tags'
import * as uiActions from './ui'
import * as undoActions from './undo'
import * as hierarchyActions from './hierarchy'
import * as featureFlagActions from './featureFlags'
import * as errorActions from './error'
import * as permissionActions from './permission'
import * as projectActions from './project'
import * as clientActions from './client'
import * as editorActions from './editors'
import * as licenseActions from './license'
import * as knownFilesActions from './knownFiles'
import * as templatesActions from './templates'
import * as settingsActions from './settings'
import * as backupsActions from './backups'
import * as applicationStateActions from './applicationState'
import * as imageCacheActions from './imageCache'
import * as notificationActions from './notifications'
import * as domEventActions from './domEvents'
import * as testingAndDiagnosisActions from './testingAndDiagnosis'
import * as attributeActions from './attributes'

const actions = (selectState) => {
  const wiredActions = (actions) => {
    return Object.entries(actions).reduce((actionGroupAcc, nextEntry) => {
      const [actionName, actionFunction] = nextEntry
      return {
        ...actionGroupAcc,
        [actionName]: (...actionArgs) => {
          const applied = actionFunction(...actionArgs)
          if (typeof applied === 'function') {
            return (dispatch, getState) => {
              const augmentedGetState = () => {
                return selectState(getState())
              }
              return applied(dispatch, augmentedGetState)
            }
          } else {
            return applied
          }
        },
      }
    }, {})
  }

  return Object.entries({
    beat: beatActions,
    book: bookActions,
    card: cardActions,
    category: categoryActions,
    character: characterActions,
    customAttribute: customAttributeActions,
    image: imageActions,
    line: lineActions,
    note: noteActions,
    place: placeActions,
    series: seriesActions,
    tag: tagActions,
    ui: uiActions,
    undo: undoActions,
    hierarchyLevels: hierarchyActions,
    featureFlags: featureFlagActions,
    error: errorActions,
    permission: permissionActions,
    project: projectActions,
    client: clientActions,
    editors: editorActions,
    license: licenseActions,
    knownFiles: knownFilesActions,
    templates: templatesActions,
    settings: settingsActions,
    backups: backupsActions,
    applicationState: applicationStateActions,
    imageCache: imageCacheActions,
    notifications: notificationActions,
    domEvents: domEventActions,
    testingAndDiagnosis: testingAndDiagnosisActions,
    attributes: attributeActions,
  }).reduce((actionsAcc, nextEntry) => {
    const [name, actionBundle] = nextEntry
    return {
      ...actionsAcc,
      [name]: wiredActions(actionBundle),
    }
  }, {})
}

export default actions
