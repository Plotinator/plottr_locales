import electron from 'electron'
import fs from 'fs'
import path from 'path'

const { app } = electron
const { readFile } = fs.promises

export const currentSettings = () => {
  const appVersion = app.getVersion()
  const isAlphaOrBeta = appVersion.match(/\d{4}\.\d\d?.\d\d?-(alpha|beta)\.\d+/)
    ? 'isBetaOrAlpha'
    : ''
  const env = JSON.parse(JSON.stringify(process.env))['NODE_ENV']
  const isDevelopment = env === 'development'
  const suffix = isDevelopment ? '_dev' : isAlphaOrBeta ? '_test' : ''
  const configStorePath = `config${suffix}.json`
  return readFile(path.join(app.getPath('userData'), configStorePath)).then((result) => {
    return JSON.parse(result.toString('utf8'))
  })
}
