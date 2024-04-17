const fs = require('fs')
const stringify = require('dotenv-stringify')
const path = require('path')

const { appVersion } = require('./version')

const isProduction = appVersion.match(/^[0-9][0-9][0-9][0-9]\.[0-9][0-9]?\.[0-9][0-9]?(-[0-9]*)?$/)
const isBeta = appVersion.match(/^[0-9][0-9][0-9][0-9]\.[0-9][0-9]?\.[0-9][0-9]?-beta\.[0-9]+$/)
const isAlpha = appVersion.match(/^[0-9][0-9][0-9][0-9]\.[0-9][0-9]?\.[0-9][0-9]?-alpha\.[0-9]+$/)

console.log('writing env variables')
const env = {
  ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
  EDD_KEY: process.env.EDD_KEY,
  EDD_TOKEN: process.env.EDD_TOKEN,
  NEXT_PUBLIC_FIREBASE_ENV: isProduction ? 'production' : 'preview',
  API_BASE_DOMAIN: isProduction
    ? // Uses the `main` branch of plottr_web
      'app.plottr.com'
    : isBeta
    ? // Beta uses the latest release branch
      'beta.plottr.com'
    : isAlpha
    ? 'alpha.plottr.com'
    : // Default to alpha (staging branch)
      'alpha.plottr.com',
  FIREBASE_KEY: isProduction
    ? process.env.NEXT_PUBLIC_FIREBASE_KEY
    : process.env.NEXT_PUBLIC_CI_FIREBASE_KEY,
  FALLBACK_ENCRYPTION_KEY: process.env.FALLBACK_ENCRYPTION_KEY,
  FALLBACK_ENCRYPTION_SALT: process.env.FALLBACK_ENCRYPTION_SALT,
  NODE_ENV: 'production', // i'm pretty sure this is useless. I think it gets set by webpack
  TRIALMODE: false, // i'm pretty sure this is uselsss too
}
const envstr = stringify(env)

fs.writeFileSync('.env', envstr)
