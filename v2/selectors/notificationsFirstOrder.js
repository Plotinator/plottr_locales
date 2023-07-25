// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const toastNotificationSelector = createSelector(
  fullFileStateSelector,
  (state) => state.notifications.toast
)
export const messageSelector = createSelector(
  fullFileStateSelector,
  (state) => state.notifications.message
)
export const timeoutSelector = createSelector(
  fullFileStateSelector,
  (state) => state.notifications.timeout
)
