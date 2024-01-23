import electron from 'electron'
import fs from 'fs'
import path from 'path'

const { app } = electron
const { readFile } = fs.promises

export const currentLicense = () => {
  const licenesInfoPath = 'license_info.json'
  return readFile(path.join(app.getPath('userData'), licenesInfoPath)).then((result) => {
    return JSON.parse(result)
  })
}
