import React, { useState, useEffect, useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { helpers } from 'pltr'
import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import Uploading from './Uploading'
import Choose from './Choose'
import { PlottrComponentsContext } from '../../../../connections/pltrContext'

const ProStep2 = ({ nextStep, fileSystemCustomTemplates, fileSystemKnownFiles }) => {
  const {
    platform: {
      file: { doesFileExist },
    },
  } = useContext(PlottrComponentsContext)

  const [nothingToUpload, setNothingToUpload] = useState(null)
  const [view, setView] = useState('choice')
  const [templates, setTemplates] = useState(null)
  const [projects, setProjects] = useState(null)
  const emptyList = useRef([])

  useEffect(() => {
    // discover all templates
    const templatesList = fileSystemCustomTemplates
    if (!templates && templatesList.length) {
      setTemplates(templatesList)
    }
    // discover all projects
    if (!projects && fileSystemKnownFiles.length) {
      Promise.all(
        fileSystemKnownFiles.reduce((acc, project) => {
          if (!helpers.file.urlPointsToPlottrCloud(project.fileURL)) {
            return [
              ...acc,
              doesFileExist(project.fileURL).then((exists) => {
                if (exists) {
                  return project
                } else {
                  return null
                }
              }),
            ]
          }
          return acc
        }, [])
      ).then((projectsToUpload) => {
        // @ts-ignore
        setProjects(projectsToUpload.filter(Boolean))
      })
    }

    if (!templatesList.length && !fileSystemKnownFiles.length) {
      // @ts-ignore
      setNothingToUpload(true)
    }
  }, [fileSystemKnownFiles, fileSystemCustomTemplates])

  useEffect(() => {
    // there's nothing to upload
    if (fileSystemCustomTemplates && fileSystemKnownFiles && nothingToUpload) nextStep()
  }, [fileSystemKnownFiles, fileSystemCustomTemplates, nothingToUpload])

  const finalizeChoices = (selectedProjects, selectedTemplates) => {
    setProjects(selectedProjects)
    setTemplates(selectedTemplates)
    setView('upload')
  }

  if (!templates && !projects && !nothingToUpload) {
    return (
      <StepBody>
        <Spinner />
      </StepBody>
    )
  }

  let body = null
  switch (view) {
    case 'choose':
      body = (
        <Choose
          cancel={() => setView('choice')}
          finalize={finalizeChoices}
          projects={projects || emptyList.current}
          templates={templates || emptyList.current}
        />
      )
      break
    case 'upload':
      body = <Uploading nextStep={nextStep} projects={projects} templates={templates} />
      break
    case 'choice':
    default:
      body = (
        <StepBody>
          <div className="verify__chooser">
            <div className="verify__choice" onClick={() => setView('upload')}>
              <h2>{t('Upload ALL projects & templates')}</h2>
            </div>
            <div className="verify__choice" onClick={() => setView('choose')}>
              <h2>{t('Choose what to upload')}</h2>
            </div>
          </div>
        </StepBody>
      )
      break
  }

  return <OnboardingStep>{body}</OnboardingStep>
}

ProStep2.propTypes = {
  nextStep: PropTypes.func,
  fileSystemCustomTemplates: PropTypes.array.isRequired,
  fileSystemKnownFiles: PropTypes.array.isRequired,
}

const mapStateToProps = (state) => ({
  fileSystemCustomTemplates: selectors.fileSystemCustomTemplatesSelector(state),
  fileSystemKnownFiles: selectors.fileSystemKnownFilesSelector(state),
})

export default connect(mapStateToProps)(ProStep2)
