import path from 'path'
import log from 'electron-log'

import { helpers } from 'pltr'

import { sortBy } from 'lodash'

export function buildRecents(projectModule, knownFilesModule) {
  return knownFilesModule
    .getKnownFilesInfo()
    .then((knownFiles) => {
      const sortedFiles = sortBy(
        Object.values(knownFiles).filter((f) => !!f.fileURL),
        'lastOpened'
      ).reverse()
      return sortedFiles.map((f) => {
        const filePath = helpers.file.withoutProtocol(f.fileURL)
        const basename = path.basename(filePath)
        const sublabel = path.dirname(filePath).substr(-14)
        return {
          label: basename,
          sublabel: `...${sublabel}${path.sep}`,
          toolTip: filePath,
          click: () => {
            log.info('Opening recent file from menu', f.fileURL)
            projectModule
              .openProjectWindow(f.fileURL)
              .then(() => {
                log.info('Opened recent file from menu', f.fileURL)
              })
              .catch((error) => {
                log.error('Error opening  recent file from menu', f.fileURL, error)
              })
          },
        }
      })
    })
    .catch((error) => {
      log.error('Failed to fetch recent files to build menu item', error)
      return []
    })
}
