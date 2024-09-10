// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullSystemStateSelector } from './fullFileFirstOrder'

// FIXME: we should eliminate this key and use project only.
// Currently both reducers listen to the "selectFile" action
const fullPermissionSelector = createSelector(fullSystemStateSelector, ({ permission }) => {
  return permission ?? {}
})
export const permissionSelector = createSelector(
  fullPermissionSelector,
  ({ permission }) => permission ?? null
)
export const canReadSelector = createSelector(
  permissionSelector,
  (permission) => permission === 'owner' || permission === 'collaborator' || permission === 'viewer'
)
export const canWriteSelector = createSelector(
  permissionSelector,
  (permission) => permission === 'owner' || permission === 'collaborator'
)
export const canAdministrateSelector = createSelector(
  permissionSelector,
  (permission) => permission === 'owner'
)
