import AsyncStorage from '@react-native-community/async-storage'
import Config from 'react-native-config'
import { getDeviceName } from 'react-native-device-info'
import {
  LICENSE_PRODUCT_IDS,
  SALES_PRODUCT_IDS,
  TESTR_EMAIL,
  TESTR_CODE,
  BASE_URL,
  USER_KEY,
  SKIP_VERIFICATION_KEY,
  OLD_PRODUCT_IDS,
  PRO_PRODUCT_IDS
} from './constants'

export async function getUserVerification () {
  const info = await AsyncStorage.getItem(USER_KEY);
  return info ? JSON.parse(info) : null
}
export async function getSkipVerificationDetails () {
  const verificationInfo = await AsyncStorage.getItem(SKIP_VERIFICATION_KEY);
  return verificationInfo ? JSON.parse(verificationInfo) : null
}

export async function setSubscribedUser (data) {
  const { validSubscription, transactionDate, transactionId, productId } = data
  const userInfo = newUserInfoTemplate('', [], transactionId, productId)
  userInfo.transactionDate = transactionDate
  userInfo.validSubscription = validSubscription
  AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo))
}

export async function verifyUser (userInfo) {
  userInfo.verified = true
  if (userInfo.email == TESTR_EMAIL) {
    userInfo.validLicense = true
    AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo)) // not await-ing it
    return [true, userInfo]
  }

  const license = await activateLicense(userInfo, 0)
  if (license.success) {
    userInfo.validLicense = license
  } else {
    return [false, license]
  }
  AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo)) // not await-ing it
  return [true, userInfo]
}

export async function reset () {
  await AsyncStorage.removeItem(USER_KEY)
  await AsyncStorage.removeItem(SKIP_VERIFICATION_KEY)
  return null
}

export async function checkForActiveLicense (email) {
  if (email == TESTR_EMAIL) {
    return [true, newUserInfoTemplate(TESTR_EMAIL, [], TESTR_CODE)]
  }
  const url = salesURL(email)
  try {
    let response = await fetch(url, {cache: 'no-cache'})
    let json = await response.json()
    let validSalesId = null
    let validKeys = []
    let userInfo = null
    console.log('json', json)
    console.log('json.sales', json.sales)
    if (json.sales && json.sales.length) {
      await Promise.all(
        json.sales.map(async s => {
          const ids = s.products.map(p => p.id)
          const hasValidSalesProduct = ids.some(id =>
            SALES_PRODUCT_IDS.includes(id)
          )
          if (hasValidSalesProduct && s.licenses) {
            const isOldProducts = isOneOfOldProducts(ids)
            // check each valid license
            const validations = await Promise.all(
              s.licenses.filter(isValidLicense).map(async l => {
                const id = getProductIdFromLicense(l, isOldProducts, ids)
                return await checkIfActiveLicense(l.key, id)
              })
            )
            const validOnes = validations.filter(Boolean)
            if (validOnes.length) {
              validSalesId = s.ID
              validKeys = [...validKeys, ...validOnes]
            }
          }
        })
      )
      if (validSalesId) {
        userInfo = newUserInfoTemplate(
          email,
          json.sales,
          validSalesId,
          validKeys
        )
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo))
      }
    }
    return [!!userInfo, userInfo]
  } catch (error) {
    console.error(error)
    return [false, error]
  }
}

export async function checkLicense (license) {
  try {
    let validSalesId = null
    let validKeys = []
    let userInfo = null
    const ids = license.products.map(p => p.id)
    const hasValidSalesProduct = ids.some(id => SALES_PRODUCT_IDS.includes(id))
    if (hasValidSalesProduct && license.licenses) {
      const isOldProducts = isOneOfOldProducts(ids)
      // check each valid license
      const validations = await Promise.all(
        license.licenses.filter(isValidLicense).map(async l => {
          const id = getProductIdFromLicense(l, isOldProducts, ids)
          return await checkIfActiveLicense(l.key, id)
        })
      )
      const validOnes = validations.filter(Boolean)
      if (validOnes.length) {
        validSalesId = license.ID
        validKeys = [...validKeys, ...validOnes]
      }
    }
    if (validSalesId) {
      userInfo = newUserInfoTemplate(
        license.email,
        [license],
        validSalesId,
        validKeys
      )
      AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    }
    return [!!userInfo, userInfo]
  } catch (error) {
    console.error(error)
    return [false, error]
  }
}

export async function getLicenses (email, callback) {
  if (email == TESTR_EMAIL) {
    return (
      callback && callback([newUserInfoTemplate(TESTR_EMAIL, [], TESTR_CODE)])
    )
  }
  const url = salesURL(email)
  try {
    let response = await fetch(url)
    let json = await response.json()
    let validSalesId = null
    let validKeys = []
    let userInfo = null
    const userLicenses = []
    console.log('json', json)
    console.log('json.sales', json.sales)
    if (json.sales && json.sales.length) {
      json.sales.map(async sale => {
        const userValidProducts = sale.products.filter(({ id: productId }) =>
          SALES_PRODUCT_IDS.includes(productId)
        )
        if (userValidProducts.length && sale.licenses) {
          const userProductIds = sale.products.map(product => product.id)
          const isOldProducts = isOneOfOldProducts(userProductIds)
          const validLicenses = sale.licenses.filter(isValidLicense)
          userLicenses.push({ ...sale, licenses: validLicenses })
        }
      })
      callback && callback(userLicenses)
    } else {
      callback && callback(false)
    }
  } catch (error) {
    console.error('ERROR!', error)
    callback && callback(false, error)
  }
}

// valid means not expired, invalid, nor disabled, and not the bundle license
// also, don't check the bundle license
function isValidLicense (license) {
  return (
    ['active', 'inactive'].includes(license.status) &&
    !license.name.includes('Bundle')
  )
}

function isActiveLicense (body) {
  // license could also be:
  // - site_inactive
  // - invalid
  // - disabled
  // - expired
  // - inactive

  // not handling site_inactive nor inactive differently than invalid for now
  return body.success && body.license == 'valid'
}

function hasActivationsLeft (body) {
  return body.activations_left && body.activations_left > 0
}

async function checkIfActiveLicense (license, productId, device) {
  const url = licenseURL('check_license', license, productId, device)
  try {
    let response = await fetch(url, {
      headers: { 'User-Agent': 'mobile;mobile-app' },
      cache: 'no-cache',
    })
    let json = await response.json()
    if (json.success) return { ...json, key: license, productId }
    return false
  } catch (error) {
    console.error(error)
    return false // maybe not?
  }
}

function isOneOfOldProducts (ids) {
  return ids.some(id => OLD_PRODUCT_IDS.includes(id))
}

function salesURL (email) {
  return apiURL('/sales/', [['email', email]])
}

function licenseURL (action, license, productId, device) {
  let url = `${BASE_URL}/?edd_action=${action}&item_id=${productId}&license=${license}`
  if (device) url += `&url=${useableDeviceName(device)}`
  return url
}

function useableDeviceName (name) {
  return name.replace(/[']/g, '-')
}

// otherKeys is an array of arrays e.g. [['email', 'me@example.com'], ...]
function apiURL (path = '', otherKeys) {
  return `${BASE_URL}/edd-api${path}?key=${Config.EDD_KEY}&token=${
    Config.EDD_TOKEN
  }&number=-1${otherKeys.map(k => `&${k[0]}=${k[1]}`)}`
}

function newUserInfoTemplate (email, sales, idToVerify, validKeys) {
  return {
    email,
    verified: email === TESTR_EMAIL,
    validLicense: email === TESTR_EMAIL,
    chancesLeft: 3,
    isV2: true,
    sales,
    idToVerify,
    validKeys
  }
}

function getProductIdFromLicense (license, isOldProducts, ids) {
  if (isOldProducts) {
    if (license.name.includes('Mac')) {
      return LICENSE_PRODUCT_IDS.mac
    } else if (license.name.includes('Windows')) {
      return LICENSE_PRODUCT_IDS.windows
    }
  } else {
    return ids.find(id => PRO_PRODUCT_IDS.includes(id))
  }
  return null
}

export async function checkStoredLicense (userInfo) {
  const info = userInfo || (await getUserVerification())
  if (!info) return false

  if (info.email == TESTR_EMAIL) return true

  const deviceName = await getDeviceName()
  const license = info.validLicense
  return await checkIfActiveLicense(
    license.licenseKey,
    license.item_id,
    deviceName
  )
}

export async function activateLicense (userInfo, index) {
  const deviceName = await getDeviceName()
  const licenseInfo = userInfo.validKeys[index]
  const newIndex = index + 1
  if (
    licenseInfo.activations_left == 'unlimited' ||
    licenseInfo.activations_left > 0
  ) {
    const url = licenseURL(
      'activate_license',
      licenseInfo.key,
      licenseInfo.item_id,
      deviceName
    )
    try {
      let response = await fetch(url, {
        headers: { 'User-Agent': 'mobile;mobile-app' },
        cache: 'no-cache',
      })
      let json = await response.json()
      const isActive = isActiveLicense(json)
      if (isActive) {
        const data = {
          licenseKey: licenseInfo.key,
          ...json
        }
        return data
      } else {
        if (userInfo.validKeys.length > newIndex) {
          // try the next valid key
          return await activateLicense(userInfo, newIndex)
        } else {
          return {
            success: false,
            problem: json.error,
            hasActivationsLeft: hasActivationsLeft(json)
          }
        }
      }
    } catch (error) {
      console.error(error)
      if (userInfo.validKeys.length > newIndex) {
        // try the next valid key
        return await activateLicense(userInfo, newIndex)
      } else {
        return { success: false, problem: 'response failed' } // maybe not?
      }
    }
  } else {
    if (userInfo.validKeys.length > newIndex) {
      // try the next valid key
      return await activateLicense(userInfo, newIndex)
    } else {
      return { success: false, problem: 'no more keys' } // maybe not?
    }
  }
}
