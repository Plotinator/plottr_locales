import axios from 'axios'
import { PRO_ID, subscriptionsURL } from './eddAPI'

export async function userHasPro(email) {
  console.log('checking if user has pro')
  try {
    const res = await axios.get(subscriptionsURL(email))
    console.log('successfull pro request')
    if (!res.subscriptions) {
      console.log(res)
      return false
    }
    // find the subscription with Pro
    const activeSub = res.subscriptions.find((sub) => {
      return sub.info && isProProduct(sub.info) && isActiveSub(sub.info)
    })
    if (activeSub) {
      const { info } = activeSub
      setSubscriptionInfo(info)
      console.log(info)
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error(error)
  }
}

function isProProduct(info) {
  return info.product_id == PRO_ID
}

function isActiveSub(info) {
  return info.status == 'active'
}

const SUBSCRIPTION_INFO_KEY = 'SUBSCRIPTION_INFO_KEY'

export const getSubscriptionInfo = () => {
  return JSON.parse(window.sessionStorage.getItem(SUBSCRIPTION_INFO_KEY))
}

export const setSubscriptionInfo = (info) => {
  window.sessionStorage._setItem(SUBSCRIPTION_INFO_KEY, JSON.stringify(info))
}

export const useLicenseInfo = () => {
  const info = getSubscriptionInfo()
  if (info) {
    const usableInfo = {
      ...info,
      customer_email: info.customer.email,
      expires: info.beta ? 'Beta' : info.expiration,
      licenseKey: info.beta ? 'Plottr Web Beta' : 'Plottr Pro',
    }
    console.log('usable SubInfo', usableInfo)
    return [usableInfo, Object.keys(usableInfo).length]
  } else {
    return [{}, 0]
  }
}
