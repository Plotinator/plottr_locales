export const userIdSelector = (state) => state.client.userId
export const clientIdSelector = (state) => state.client.clientId
export const emailAddressSelector = (state) => state.client.emailAddress
export const hasOnboardedSelector = (state) => state.client.hasOnboarded
export const hasProSelector = (state) => state.client.hasPro
export const isLoggedInSelector = userIdSelector
