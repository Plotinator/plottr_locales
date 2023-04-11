import * as beatActions from './actions/beats'
import * as bookActions from './actions/books'
import * as cardActions from './actions/cards'
import * as categoryActions from './actions/categories'
import * as characterActions from './actions/characters'
import * as customAttributeActions from './actions/customAttributes'
import * as imageActions from './actions/images'
import * as lineActions from './actions/lines'
import * as noteActions from './actions/notes'
import * as placeActions from './actions/places'
import * as seriesActions from './actions/series'
import * as tagActions from './actions/tags'
import * as uiActions from './actions/ui'
import * as undoActions from './actions/undo'
import * as hierarchyActions from './actions/hierarchy'
import * as featureFlagActions from './actions/featureFlags'
import * as errorActions from './actions/error'
import * as permissionActions from './actions/permission'
import * as projectActions from './actions/project'
import * as clientActions from './actions/client'
import * as editorActions from './actions/editors'
import * as licenseActions from './actions/license'
import * as knownFilesActions from './actions/knownFiles'
import * as templatesActions from './actions/templates'
import * as settingsActions from './actions/settings'
import * as backupsActions from './actions/backups'
import * as applicationStateActions from './actions/applicationState'
import * as imageCacheActions from './actions/imageCache'
import * as notificationActions from './actions/notifications'
import * as domEventActions from './actions/domEvents'
import * as testingAndDiagnosisActions from './actions/testingAndDiagnosis'
import * as attributeActions from './actions/attributes'

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
