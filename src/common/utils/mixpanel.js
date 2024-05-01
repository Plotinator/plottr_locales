import mixpanel from 'mixpanel-browser'

export default function initMixpanel() {
  if (mixpanel.__loaded) return
  // only use mixpanel for paid users, not free trial users
  Promise.resolve({ payment_id: 'blarg' }).then((user) => {
    if (user.payment_id && process.env.NODE_ENV != 'development') {
      mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
      mixpanel.identify(user.payment_id.toString())
    }
  })
}
