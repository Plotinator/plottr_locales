import { isObject } from 'lodash'

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
import * as hierarchyActions from './hierarchy'
import * as featureFlagsActions from './featureFlags'
import * as errorActions from './error'
import * as permissionActions from './permission'
import * as projectActions from './project'
import * as clientActions from './client'
import * as licenseActions from './license'
import * as knownFilesActions from './knownFiles'
import * as templatesActions from './templates'
import * as settingsActions from './settings'
import * as backupsActions from './backups'
import * as applicationStateActions from './applicationState'
import * as imageCacheActions from './imageCache'
import * as notificationsActions from './notifications'
import * as domEventsActions from './domEvents'
import * as testingAndDiagnosisActions from './testingAndDiagnosis'
import * as attributesActions from './attributes'
import * as undoActions from './undo'

const actions = (selectState) => {
  function thunkActionObjectUntilAction(action) {
    // If the action says it was curried, we need to keep thunking
    // until we get to the redux thunk args.
    if (action.curried > 0) {
      return (...args) => {
        return thunkActionObjectUntilAction({
          curried: action.curried - 1,
          action: action.action(...args),
        })
      }
    } else {
      // When we hit zero, this has to be a thunk action.
      return (dispatch, getState) => {
        const augmentedGetState = () => {
          return selectState(getState())
        }
        return action.action(dispatch, augmentedGetState)
      }
    }
  }

  function thunkUntilAction(action) {
    // If it's an object, it uses the new convention of specifying
    // curried depth.
    if (isObject(action) && typeof action !== 'function') {
      return thunkActionObjectUntilAction(action)
    } else {
      // Otherwise, we accomodate at most a depth of one in the
      // curried chain.
      const actionFunction = action
      return (...actionArgs) => {
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
      }
    }
  }

  const wiredActions = (actions) => {
    return Object.entries(actions).reduce((actionGroupAcc, nextEntry) => {
      const [actionName, action] = nextEntry
      // Ignore the default export
      if (actionName === 'default') {
        return actionGroupAcc
      } else {
        return {
          ...actionGroupAcc,
          [actionName]: thunkUntilAction(action),
        }
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
    hierarchyLevels: hierarchyActions,
    featureFlags: featureFlagsActions,
    error: errorActions,
    permission: permissionActions,
    project: projectActions,
    client: clientActions,
    license: licenseActions,
    knownFiles: knownFilesActions,
    templates: templatesActions,
    settings: settingsActions,
    backups: backupsActions,
    applicationState: applicationStateActions,
    imageCache: imageCacheActions,
    notifications: notificationsActions,
    domEvents: domEventsActions,
    testingAndDiagnosis: testingAndDiagnosisActions,
    attributes: attributesActions,
    undo: undoActions,
  }).reduce(
    (actionsAcc, nextEntry) => {
      const [name, actionBundle] = nextEntry
      return {
        ...actionsAcc,
        [name]: wiredActions(actionBundle),
      }
    },
    {
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
      hierarchyLevels: hierarchyActions,
      featureFlags: featureFlagsActions,
      error: errorActions,
      permission: permissionActions,
      project: projectActions,
      client: clientActions,
      license: licenseActions,
      knownFiles: knownFilesActions,
      templates: templatesActions,
      settings: settingsActions,
      backups: backupsActions,
      applicationState: applicationStateActions,
      imageCache: imageCacheActions,
      notifications: notificationsActions,
      domEvents: domEventsActions,
      testingAndDiagnosis: testingAndDiagnosisActions,
      attributes: attributesActions,
      undo: undoActions,
    }
  )
}

export default actions
