import mixpanel from 'mixpanel-browser'

export default function initMixpanel(userId) {
  mixpanel.identify(userId)
  if (mixpanel.__loaded) return
  // only use mixpanel for paid users, not free trial users
  if (process.env.NEXT_PUBLIC_NODE_ENV != 'development') {
    mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
  }
}
