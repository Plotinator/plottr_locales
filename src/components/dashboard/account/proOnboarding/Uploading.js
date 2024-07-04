import React, { useEffect, useState, useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { v4 as uuid } from 'uuid'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { helpers, migrateIfNeeded } from 'pltr'

import ProgressBar from '../../../ProgressBar'
import FailedUploads from './FailedUploads'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import { PlottrComponentsContext } from '../../../../connections/pltrContext'

const Uploading = ({ nextStep, projects, templates, userId, emailAddress }) => {
  const {
    platform: {
      file: { doesFileExist, readFile, removeFromKnownFiles },
      firebase: { saveCustomTemplate, uploadExisting, fetchFiles },
      extractImages,
      log,
      appVersion,
      isDevelopment,
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const typeName = {
    project: t('Project'),
    template: t('Template'),
  }

  const [maxItems, setMaxItems] = useState(100)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [currentObj, setCurrentObj] = useState(null)
  const [done, setDone] = useState(false)
  const failedProjects = useRef([])
  const failedTemplates = useRef([])
  const failed = useRef(false)

  useEffect(() => {
    if (!userId || !emailAddress) return
    if (currentProgress > 0) return // don't rerun this after it's started
    const toUpload = []
    if (projects) {
      projects.forEach((pr) => {
        toUpload.push({
          type: 'project',
          fileURL: pr.fileURL,
          name: pr.fileName,
        })
      })
    }
    if (templates) {
      templates.forEach((tm) => {
        toUpload.push({ type: 'template', id: `${tm.id}-${uuid()}`, data: tm, name: tm.name })
      })
    }
    // beging uploading
    setCurrentProgress(1)
    setMaxItems(toUpload.length)
    const allPromises = toUpload.reduce((p, obj, idx) => {
      return p.then(() => {
        const currentObject = `${typeName[obj.type]}: ${obj.name}`
        // @ts-ignore
        setCurrentObj(currentObject)
        setCurrentProgress(idx + 1)
        if (obj.type == 'project') {
          // upload project
          if (isDevelopment) {
            return new Promise((resolve, _reject) => setTimeout(() => resolve(true), 200))
          }
          return uploadProject(obj).catch((error) => {
            getInstance().then((errorReporter) => {
              errorReporter.error(`Error uploading project: ${currentObject}`, error)
            })
            // @ts-ignore
            failedProjects.current.push(obj.name)
            failed.current = true
            return 'Failed'
          })
        } else {
          // upload template
          if (isDevelopment) {
            return new Promise((resolve, _reject) => setTimeout(() => resolve(true), 200))
          }
          return saveCustomTemplate(userId, obj.data).catch((error) => {
            getInstance().then((errorReporter) => {
              errorReporter.error(`Failed to upload template: ${currentObject}`, error)
            })
            // @ts-ignore
            failedTemplates.current.push(obj.name)
            failed.current = true
            return 'Failed'
          })
        }
      })
    }, Promise.resolve())
    allPromises.then(() => {
      fetchFiles(userId).then(() => {
        // done! Go to the next step
        // @ts-ignore
        setCurrentObj(t('Done!'))
        setDone(true)
        if (failed.current) {
          return
        }
        setTimeout(nextStep, 1500)
      })
    })
  }, [userId, emailAddress])

  const uploadProject = (projObj) => {
    // read file
    return doesFileExist(projObj.fileURL).then((exists) => {
      if (!exists) {
        return Promise.reject(new Error(`Couldn't find the file at path: ${projObj.fileURL}`))
      }
      return appVersion().then((version) => {
        return new Promise((resolve, reject) => {
          readFile(helpers.file.withoutProtocol(projObj.fileURL)).then((rawFile) => {
            let file = null
            try {
              // FIXME: we can read files via the local server now.  We
              // don't want to depend on FS from the renderer because we
              // want to eventually sandbox the renderer.
              file = JSON.parse(rawFile)
            } catch (error) {
              getInstance().then((errorReporter) => {
                errorReporter.error(`Error uploading file at path ${projObj.fileURL}`, error)
              })
              reject(error)
              return
            }
            if (!file) {
              reject(new Error(`After reading ${projObj.fileURL}, it was null!?`))
              return
            }
            const fileName = file.file.fileName || projObj.name
            const fileURL = projObj.fileURL
            // migrate if needed
            migrateIfNeeded(
              version,
              file,
              fileURL,
              null,
              (error, migrated, data) => {
                if (error) {
                  getInstance().then((errorReporter) => {
                    errorReporter.error('Error migrating file: ', error)
                  })
                  reject(error)
                  return
                }
                extractImages(data, userId)
                  .then((patchedData) => {
                    return uploadExisting(emailAddress, userId, {
                      ...patchedData,
                      // @ts-ignore
                      file: { ...patchedData.file, fileName },
                    })
                  })
                  .then((result) => {
                    removeFromKnownFiles(projObj.fileURL)
                    resolve(result)
                  })
                  .catch((err) => {
                    getInstance().then((errorReporter) => {
                      errorReporter.error(
                        `Failed to extract images and upload file ${fileName}`,
                        err
                      )
                    })
                    reject(err)
                  })
              },
              log
            )
          })
        })
      })
    })
  }

  if (failed.current && done) {
    return (
      <StepBody>
        <FailedUploads
          nextStep={nextStep}
          failedTemplates={failedTemplates.current}
          failedProjects={failedProjects.current}
        />
      </StepBody>
    )
  }

  return (
    <>
      <StepHeader>
        <h2>{t('Uploading...')}</h2>
      </StepHeader>
      <StepBody>
        <ProgressBar
          now={currentProgress}
          max={maxItems}
          label={`${currentProgress}/${maxItems}`}
          bsStyle="success"
          striped
          active
        />
      </StepBody>
      <StepFooter>
        <p className="large-text">{currentObj}</p>
      </StepFooter>
    </>
  )
}

Uploading.propTypes = {
  nextStep: PropTypes.func,
  projects: PropTypes.array,
  templates: PropTypes.array,
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
}

const mapStateToProps = (state) => ({
  userId: selectors.userIdSelector(state),
  emailAddress: selectors.emailAddressSelector(state),
})

export default connect(mapStateToProps)(Uploading)
