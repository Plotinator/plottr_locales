import axios from 'axios'

import { verifyToken } from './verify-token'

const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'preview') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const auth = admin.auth()

export default (req, res) => {
  return verifyToken(auth, req, res).then(() => {
    const { email } = req.body
    checkForPro(email, (hasPro, info) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ hasPro, info }))
    }).catch(() => {
      res.status(500)
      res.end()
    })
  })
}

export const PRO_ID = '104900'

function isProProduct(info) {
  return info.product_id == PRO_ID
}

function isActiveSub(info) {
  return info.status == 'active'
}

const BASE_URL = 'https://my.plottr.com/edd-api'

function apiURL(path = '', params = '') {
  const authParams = `?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}`
  return `${BASE_URL}/${path}/${authParams}&number=-1${params}`
}

function subscriptionsURL(email) {
  return apiURL('subscriptions', `&customer=${email}`)
}

const currentUser = (email) => {
  return auth.getUserByEmail(email)
}

// callback(hasPro, info)
function checkForPro(email, callback) {
  return axios
    .get(subscriptionsURL(email))
    .then((response) => {
      console.log('successful pro request')
      if (!response.data.subscriptions) {
        console.log(response)
        callback(false)
        return
      }

      // find the subscription with Pro
      const activeSub = response.data.subscriptions.find((sub) => {
        return sub.info && isProProduct(sub.info) && isActiveSub(sub.info)
      })
      if (activeSub) {
        const { info } = activeSub
        // TODO: save this info somewhere
        console.log(info.product_id, info.status, info.expiration)
        callback(true, info)
      } else {
        currentUser(email)
          ?.getIdTokenResult()
          .then((token) => {
            if (token?.claims?.beta || token?.claims?.admin || token?.claims?.lifetime) {
              callback(true)
            } else {
              callback(false)
            }
          })
          .catch((error) => {
            callback(false)
          })
      }
    })
    .catch((err) => {
      if (err.message === `No customer found for ${email}!`) {
        callback(false)
        return Promise.resolve(true)
      }
      console.error('Failed to check for pro', err)
      return Promise.reject(err)
    })
}
