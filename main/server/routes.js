import fs from 'fs'

const { rm } = fs.promises

const safeParseGeneration = (query) => {
  const { generation } = query
  try {
    const parsedGeneration = JSON.parse(generation)
    if (typeof parsedGeneration === 'number') {
      return parsedGeneration
    } else {
      return null
    }
  } catch (_e) {
    return null
  }
}

const replyWithResultSync = (result, res) => {
  res.json(result)
}

const replyWithResult = (promise, res) => {
  return promise
    .then((result) => {
      res.json(result)
      res.end()
    })
    .catch((error) => {
      res.status(500)
      res.json({ message: error.message, code: error.code })
    })
}

/**
 * @typedef LongPoll
 * @property {function(): void} cancel
 * @property {Promise<any>} result
 * @param {LongPoll} param0
 * @returns {Promise<void>}
 */
const replyToLongPollWithResult = ({ cancel, result }, req, res) => {
  req.on('close', () => {
    if (typeof cancel === 'function') {
      cancel()
    }
  })
  return result
    .then((value) => {
      res.json(value)
      res.end()
    })
    .catch((error) => {
      res.status(500)
      res.json(error.message)
    })
}

const registeringBusy = (statusManager) => (promise, path) => {
  return statusManager.registerTask(promise, path)
}

const replyWithResultRegisteringBusy = (statusManager) => (promise, res, path) => {
  return registeringBusy(statusManager)(replyWithResult(promise, res), path)
}

const systemRoutes = (app, statusManager) => {
  app.get('/system/busy', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyWithResult(
      statusManager.nextGeneration(generation).then((result) => {
        return { generation: result.generation, data: { busy: result.busy } }
      }),
      res
    )
  })

  app.get('/system/ping', (req, res) => {
    replyWithResultSync('PING', res)
  })

  app.get('/system/shutdown', (req, res) => {
    if (typeof process.send === 'function') {
      process.send('shutdown')
    }
    replyWithResultSync(null, res)
  })

  return Promise.resolve()
}

const backupRoutes = (app, backupModule, logger, statusManager) => {
  const replyRecordingBusy = replyWithResultRegisteringBusy(statusManager)

  app.get('/backups/defaultBackupPath', (req, res) => {
    replyWithResultSync(backupModule.defaultBackupPath, res)
  })

  const saveBackupPath = '/backups'
  app.post(saveBackupPath, (req, res) => {
    const { filePath, file } = req.body.data
    replyRecordingBusy(backupModule.saveBackup(filePath, file), res, saveBackupPath)
  })

  app.get('/backups/isInBackupFolder', (req, res) => {
    const { fileURL } = req.query
    replyWithResult(backupModule.isInBackupFolder(fileURL), res)
  })

  app.get('/backups/today', (req, res) => {
    replyWithResult(backupModule.ensureBackupTodayPath(), res)
  })

  return Promise.resolve()
}

const fileRoutes = (app, fileModule, logger, statusManager) => {
  const replyRecordingBusy = replyWithResultRegisteringBusy(statusManager)

  const saveFileRoute = '/file/plottr'
  app.post(saveFileRoute, (req, res) => {
    const { fileURL, file } = req.body.data
    replyRecordingBusy(fileModule.saveFile(fileURL, file), res, saveFileRoute)
  })

  const saveRawFileRoute = '/file/raw'
  app.post(saveRawFileRoute, (req, res) => {
    const { filePath, data } = req.body.data
    replyRecordingBusy(fileModule.saveRawFile(filePath, data), res, saveRawFileRoute)
  })

  const offlineFilePath = '/file/offline'
  app.post(offlineFilePath, (req, res) => {
    const { file, onlineFileURL, knownFiles } = req.body.data
    const { isOffline } = req.query
    replyRecordingBusy(
      fileModule.saveOfflineFile(file, knownFiles, onlineFileURL, isOffline === 'true'),
      res,
      offlineFilePath
    )
  })

  app.get('/file/basename', (req, res) => {
    const { filePath, ext } = req.query
    replyWithResultSync(fileModule.basename(filePath, ext), res)
  })

  app.get('/file', (req, res) => {
    const { filePath } = req.query
    replyWithResult(fileModule.readFile(filePath), res)
  })

  app.get('/file/exists', (req, res) => {
    const { filePath } = req.query
    replyWithResult(fileModule.fileExists(filePath), res)
  })

  const saveBackupDuringResumePath = '/file/backupFileForResume'
  app.post(saveBackupDuringResumePath, (req, res) => {
    const { file } = req.body.data
    replyRecordingBusy(
      fileModule.backupOfflineBackupForResume(file),
      res,
      saveBackupDuringResumePath
    )
  })

  app.get('/file/offlineFiles', (req, res) => {
    replyWithResult(fileModule.readOfflineFiles(), res)
  })

  app.get('/file/isTemp', (req, res) => {
    const { file } = req.query
    replyWithResultSync(fileModule.isTempFile(file), res)
  })

  app.get('/file/offlineFilesPath', (req, res) => {
    replyWithResultSync(fileModule.offlineFilesFilesPath, res)
  })

  const saveTempFilePath = '/file/temp'
  app.post(saveTempFilePath, (req, res) => {
    const { file } = req.body.data
    replyRecordingBusy(fileModule.saveTempFile(file), res, saveTempFilePath)
  })

  const writeFilePath = '/file'
  app.post(writeFilePath, (req, res) => {
    const { path, file, base64 } = req.body.data
    const data = file || file === '' ? file : Buffer.from(base64, 'base64')
    replyRecordingBusy(fileModule.writeFile(path, data), res, writeFilePath)
  })

  app.get('/file/join', (req, res) => {
    const { pathArgs } = req.query
    replyWithResult(fileModule.join(...Object.values(pathArgs)), res)
  })

  app.get('/file/separator', (req, res) => {
    replyWithResultSync(fileModule.separator(), res)
  })

  app.get('/file/extname', (req, res) => {
    const { filePath } = req.query
    replyWithResultSync(fileModule.extname(filePath), res)
  })

  app.get('/file/resolvedPath', (req, res) => {
    const { args } = req.query
    replyWithResultSync(fileModule.resolvePath(...Object.values(args)), res)
  })

  app.get('/file/offlineFileURL', (req, res) => {
    const { fileURL } = req.query
    replyWithResultSync(fileModule.offlineFileURL(fileURL), res)
  })

  app.get('/file/stat', (req, res) => {
    const { path } = req.query
    replyWithResult(fileModule.stat(path), res)
  })

  app.get('/file/dir', (req, res) => {
    const { path } = req.query
    replyWithResult(fileModule.readdir(path), res)
  })

  const mkDirPath = '/file/newDirectory'
  app.post(mkDirPath, (req, res) => {
    const { path } = req.body.data
    replyRecordingBusy(fileModule.mkdir(path), res, mkDirPath)
  })

  app.get('/file/uniqNameInDirectory', (req, res) => {
    const { path } = req.query
    replyWithResult(fileModule.findUniqueNameInPath(path), res)
  })

  app.get('/file/pathAsArray', (req, res) => {
    const { path } = req.query
    replyWithResult(fileModule.filePathAsArray(path), res)
  })

  app.get('/file/pathIsWritable', (req, res) => {
    const { path } = req.query
    replyWithResult(fileModule.directoryIsWritable(path), res)
  })

  const convertDocxToHTMLPath = '/file/convertDocxToHTML'
  app.get(convertDocxToHTMLPath, (req, res) => {
    const { path } = req.query
    replyRecordingBusy(fileModule.convertDocxToHTML(path), res, convertDocxToHTMLPath)
  })

  return Promise.resolve()
}

const fileSystemRoutes = (app, fileSystemModule, logger, statusManager) => {
  const replyRecordingBusy = replyWithResultRegisteringBusy(statusManager)

  app.get('/fileSystem/backupBasePath', (req, res) => {
    replyWithResult(fileSystemModule.backupBasePath(), res)
  })

  app.get('/fileSystem/listenToTrialChanges', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToTrialChanges(generation), req, res)
  })

  app.get('/fileSystem/trial', (req, res) => {
    replyWithResult(fileSystemModule.currentTrial(), res)
  })

  const startTrialPath = '/fileSystem/trial'
  app.put(startTrialPath, (req, res) => {
    const { numDays } = req.body.data
    replyRecordingBusy(fileSystemModule.startTrial(numDays), res, startTrialPath)
  })

  const extendTrialPath = '/fileSystem/extendedTrial'
  app.put(extendTrialPath, (req, res) => {
    replyRecordingBusy(fileSystemModule.extendTrialWithReset(), res, extendTrialPath)
  })

  app.get('/fileSystem/licenseChanges', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToLicenseChanges(generation), req, res)
  })

  app.get('/fileSystem/license', (req, res) => {
    replyWithResult(fileSystemModule.currentLicense(), res)
  })

  app.delete('/fileSystem/license', (req, res) => {
    replyWithResult(fileSystemModule.deleteLicense(), res)
  })

  app.delete('/fileSystem/plottrLicense', (req, res) => {
    replyWithResult(fileSystemModule.deletePlottrLicense(), res)
  })

  app.delete('/fileSystem/proLicense', (req, res) => {
    replyWithResult(fileSystemModule.deleteProLicense(), res)
  })

  const saveLegacyLicensePath = '/fileSystem/license'
  app.put(saveLegacyLicensePath, (req, res) => {
    const { newLicense } = req.body.data
    replyRecordingBusy(fileSystemModule.saveLicenseInfo(newLicense), res, saveLegacyLicensePath)
  })

  app.get('/fileSystem/listenToKnownFiles', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToknownFilesChanges(generation), req, res)
  })

  app.get('/fileSystem/knownFiles', (req, res) => {
    replyWithResult(fileSystemModule.currentKnownFiles(), res)
  })

  app.get('/fileSystem/listenToCustomTemplates', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToCustomTemplatesChanges(generation), req, res)
  })

  app.get('/fileSystem/templates', (req, res) => {
    replyWithResult(fileSystemModule.currentTemplates(), res)
  })

  app.get('/fileSystem/listenToTemplates', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToTemplatesChanges(generation), req, res)
  })

  app.get('/fileSystem/customTemplates', (req, res) => {
    replyWithResult(fileSystemModule.currentCustomTemplates(), res)
  })

  app.get('/fileSystem/listenToTemplateManifest', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(
      fileSystemModule.listenToTemplateManifestChanges(generation),
      req,
      res
    )
  })

  app.get('/fileSystem/templateManifest', (req, res) => {
    replyWithResult(fileSystemModule.currentTemplateManifest(), res)
  })

  app.get('/fileSystem/listenToExportConfigSettings', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(
      fileSystemModule.listenToExportConfigSettingsChanges(generation),
      req,
      res
    )
  })

  app.get('/fileSystem/currentExportConfigSettings', (req, res) => {
    replyWithResult(fileSystemModule.currentExportConfigSettings(), res)
  })

  const saveExportSettingsPath = '/fileSystem/exportConfigSettings/:key'
  app.put(saveExportSettingsPath, (req, res) => {
    const { key } = req.params
    const { value } = req.body.data
    replyRecordingBusy(
      fileSystemModule.saveExportConfigSettings(key, value),
      res,
      saveExportSettingsPath
    )
  })

  app.get('/fileSystem/listenToAppSettings', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToAppSettingsChanges(generation), req, res)
  })

  app.get('/fileSystem/appSettings', (req, res) => {
    replyWithResult(fileSystemModule.currentAppSettings(), res)
  })

  const saveAppSettingPath = '/fileSystem/appSetting/:key'
  app.put(saveAppSettingPath, (req, res) => {
    const { key } = req.params
    const { value } = req.body.data
    replyRecordingBusy(fileSystemModule.saveAppSetting(key, value), res, saveAppSettingPath)
  })

  app.get('/fileSystem/listenToBackups', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToBackupsChanges(generation), req, res)
  })

  app.get('/fileSystem/backups', (req, res) => {
    replyWithResult(fileSystemModule.currentBackups(), res)
  })

  const saveCustomTemplatePath = '/fileSystem/customTemplates/:id'
  app.put(saveCustomTemplatePath, (req, res) => {
    const { id } = req.params
    const { template } = req.body.data
    replyRecordingBusy(
      fileSystemModule.setCustomTemplate(id, template),
      res,
      saveCustomTemplatePath
    )
  })

  const deleteTemplatePath = '/fileSystem/customTemplates/:id'
  app.delete(deleteTemplatePath, (req, res) => {
    const { id } = req.params
    replyRecordingBusy(fileSystemModule.deleteCustomTemplate(id), res, deleteTemplatePath)
  })

  const saveTemplatePath = '/fileSystem/templates/:id'
  app.put(saveTemplatePath, (req, res) => {
    const { id } = req.params
    const { template } = req.body.data
    replyRecordingBusy(fileSystemModule.setTemplate(id, template), res, saveTemplatePath)
  })

  app.get('/fileSystem/customTemplatePath', (req, res) => {
    replyWithResult(fileSystemModule.customTemplatesPath(), res)
  })

  app.get('/fileSystem/lastOpenedFilePath', (req, res) => {
    replyWithResult(fileSystemModule.lastOpenedFile(), res)
  })

  const setLastOpenedFilePathPath = '/fileSystem/lastOpenedFilePath'
  app.put(setLastOpenedFilePathPath, (req, res) => {
    const { filePath } = req.body.data
    replyRecordingBusy(
      fileSystemModule.setLastOpenedFilePath(filePath),
      res,
      setLastOpenedFilePathPath
    )
  })

  const resetLastOpenedFilePathPath = '/fileSystem/lastOpenedFilePath'
  app.delete(resetLastOpenedFilePathPath, (req, res) => {
    replyRecordingBusy(fileSystemModule.setLastOpenedFilePath(''), res, resetLastOpenedFilePathPath)
  })

  app.put('/fileSystem/fileCopy', (req, res) => {
    const { sourceFileURL, newFileURL } = req.body.data
    replyWithResult(fileSystemModule.copyFile(sourceFileURL, newFileURL), res)
  })

  app.put('/fileSystem/fileShortcut', (req, res) => {
    const { sourceFileURL, newFileURL } = req.body.data
    replyWithResult(fileSystemModule.createFileShortcut(sourceFileURL, newFileURL), res)
  })

  const saveProLicensePath = '/fileSystem/proLicense'
  app.put(saveProLicensePath, (req, res) => {
    const { secret, machineInfo, expiresAt, dateChecked } = req.body.data
    replyRecordingBusy(
      fileSystemModule.saveProLicense(secret, machineInfo, expiresAt, dateChecked),
      res,
      savePlottrLicensePath
    )
  })

  const savePlottrLicensePath = '/fileSystem/plottrLicense'
  app.put(savePlottrLicensePath, (req, res) => {
    const { secret, machineInfo, expiresAt, dateChecked } = req.body.data
    replyRecordingBusy(
      fileSystemModule.savePlottrLicense(secret, machineInfo, expiresAt, dateChecked),
      res,
      savePlottrLicensePath
    )
  })

  app.get('/fileSystem/plottrLicense', (req, res) => {
    replyWithResult(fileSystemModule.currentPlottrLicense(), res)
  })

  app.get('/fileSystem/proLicense', (req, res) => {
    replyWithResult(fileSystemModule.currentProLicense(), res)
  })

  app.get('/fileSystem/listenToPlottrLicense', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToPlottrLicenseChanges(generation), req, res)
  })

  app.get('/fileSystem/listenToProLicenseChanges', (req, res) => {
    const generation = safeParseGeneration(req.query)
    replyToLongPollWithResult(fileSystemModule.listenToProLicenseChanges(generation), req, res)
  })

  // TODO: move this into the file system module
  const rmPath = '/fileSystem/file'
  app.delete(rmPath, (req, res) => {
    const { path } = req.query
    replyRecordingBusy(rm(path, { recursive: true }), res, rmPath)
  })

  return Promise.resolve()
}

const trashRoutes = (app, trashModule, logger, statusManager) => {
  const replyRecordingBusy = replyWithResultRegisteringBusy(statusManager)

  const trashPath = '/trash'
  app.put(trashPath, (req, res) => {
    const { fileURL } = req.body.data
    replyRecordingBusy(trashModule.trashByURL(fileURL), res, trashPath)
  })

  return Promise.resolve()
}

const defaultLocationRoutes = (app, defaultLocationModule, logger, statusManager) => {
  const replyRecordingBusy = replyWithResultRegisteringBusy(statusManager)

  const saveToDefaultLocationPath = '/defaultLocation/:name'
  app.put(saveToDefaultLocationPath, (req, res) => {
    const { name } = req.params
    const { json } = req.body.data
    replyRecordingBusy(
      defaultLocationModule.saveToDefaultLocation(json, name),
      res,
      saveToDefaultLocationPath
    )
  })

  return Promise.resolve()
}

const knownFilesRoutes = (app, knownFilesModule, logger, statusManager) => {
  const replyRecordingBusy = replyWithResultRegisteringBusy(statusManager)

  const removeKnownFilePath = '/knownFiles'
  app.delete(removeKnownFilePath, (req, res) => {
    const { fileURL } = req.query
    replyRecordingBusy(knownFilesModule.removeFromKnownFiles(fileURL), res, removeKnownFilePath)
  })

  const addKnownFilePath = '/knownFiles'
  app.put(addKnownFilePath, (req, res) => {
    const { fileURL } = req.body.data
    replyRecordingBusy(knownFilesModule.addKnownFile(fileURL), res, addKnownFilePath)
  })

  const editKnownFilePathPath = '/knownFiles/path'
  app.post(editKnownFilePathPath, (req, res) => {
    const { oldFileURL, newFileURL } = req.body.data
    replyRecordingBusy(
      knownFilesModule.editKnownFilePath(oldFileURL, newFileURL),
      res,
      editKnownFilePathPath
    )
  })

  const updateLastOpenedPath = '/knownFiles/lastOpenedDate'
  app.post('/knownFiles/lastOpenedDate', (req, res) => {
    const { fileURL } = req.body.data
    replyRecordingBusy(knownFilesModule.updateLastOpenedDate(fileURL), res, updateLastOpenedPath)
  })

  const deleteKnownFilePath = '/knownFiles/data'
  app.delete(deleteKnownFilePath, (req, res) => {
    const { fileURL } = req.query
    replyRecordingBusy(knownFilesModule.deleteKnownFile(fileURL), res, deleteKnownFilePath)
  })

  const updateKnownFileNamePath = '/knownFiles/name'
  app.post(updateKnownFileNamePath, (req, res) => {
    const { fileURL, newName } = req.body.data
    replyRecordingBusy(
      knownFilesModule.updateKnownFileName(fileURL, newName),
      res,
      updateKnownFileNamePath
    )
  })

  return Promise.resolve()
}

const templatesRoutes = (app, templateFetcher, _logger, _statusManager) => {
  app.get('/templates/hydrate', (req, res) => {
    replyWithResult(templateFetcher.fetch(), res)
  })

  return Promise.resolve()
}

const routes = (
  app,
  statusManager,
  secret,
  userDataPath,
  isBetaOrAlpha,
  logger,
  encryptString,
  decryptString,
  stores,
  settings,
  backupModule,
  fileModule,
  fileSystemModule,
  trashModule,
  defaultLocationModule,
  knownFilesModule,
  templateFetcher
) => {
  const { watchForFilesInDefaultFolder } = fileSystemModule

  watchForFilesInDefaultFolder()

  return systemRoutes(app, statusManager)
    .then(() => {
      return backupRoutes(app, backupModule, logger, statusManager)
    })
    .then(() => {
      return fileRoutes(app, fileModule, logger, statusManager)
    })
    .then(() => {
      return fileSystemRoutes(app, fileSystemModule, logger, statusManager)
    })
    .then(() => {
      return trashRoutes(app, trashModule, logger, statusManager)
    })
    .then(() => {
      return defaultLocationRoutes(app, defaultLocationModule, logger, statusManager)
    })
    .then(() => {
      return knownFilesRoutes(app, knownFilesModule, logger, statusManager)
    })
    .then(() => {
      return templatesRoutes(app, templateFetcher, logger, statusManager)
    })
}

export default routes
