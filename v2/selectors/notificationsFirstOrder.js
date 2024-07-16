// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullSystemStateSelector } from './fullFileFirstOrder'

const notificationSelector = createSelector(fullSystemStateSelector, ({ notifications }) => {
  return notifications ?? {}
})

export const toastNotificationSelector = createSelector(
  notificationSelector,
  (notifications) => notifications.toast
)
export const messageSelector = createSelector(
  notificationSelector,
  (notifications) => notifications.message
)
export const timeoutSelector = createSelector(
  notificationSelector,
  (notifications) => notifications.timeout
)
