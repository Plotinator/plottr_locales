import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import _ from 'lodash'
import { isEmpty } from 'lodash'

import { template } from 'pltr'
import { selectors } from 'wired-up-pltr'

import { PlottrComponentsContext } from '../../connections/pltrContext'

const { lineFromTemplate } = template

const PlotlineTemplateDetails = ({ template }) => {
  const {
    platform: { appVersion, log, mountState },
  } = useContext(PlottrComponentsContext)

  const migrateTemplate = () => {
    appVersion().then((version) => {
      lineFromTemplate(
        template,
        version,
        '',
        (error, template) => {
          if (error) {
            // Allow the top level ErrorBoundary to handle the error
            throw new Error(error)
          }
          setStateTemplate({
            id: template.id,
            lines: template.lines,
            cards: template.cards,
            beats: template.beats,
          })
        },
        log
      )
    })
  }

  useEffect(() => {
    migrateTemplate()
  }, [])

  const [stateTemplate, setStateTemplate] = useState({})

  useEffect(() => {
    if (
      // @ts-ignore
      stateTemplate.id === template.id ||
      isEmpty(template)
    )
      return

    setStateTemplate({})

    migrateTemplate()
  }, [template?.id])

  const headingMap = {
    lines: t('Plotlines'),
    cards: t('Scene Cards'),
    beats: t('Chapters'),
  }

  const renderData = (type, data) => {
    switch (type) {
      case 'beats':
        return _.sortBy(data, 'position').map((beat) => <li key={beat.id}>{beat.title}</li>)
      case 'cards':
        return _.sortBy(data, 'id').map((c) => <li key={c.id}>{c.title}</li>)
      case 'lines':
        return _.sortBy(data, 'position').map((l) => <li key={l.id}>{l.title}</li>)
      default:
        return null
    }
  }

  const beatsToRender = isEmpty(stateTemplate)
    ? null
    : selectors.templateBeatsForBookOne(
        // @ts-ignore
        mountState(stateTemplate)
      )
  const beatEntry = (
    <div key="beats">
      <h5 className="text-center text-capitalize">{t('Beats')}</h5>
      <ol>{renderData('beats', beatsToRender)}</ol>
    </div>
  )
  const body = Object.keys(stateTemplate)
    .filter((heading) => heading !== 'id' && heading !== 'beats')
    .filter((heading) => !stateTemplate[heading].every((item) => item.title == 'auto'))
    .map((heading) => {
      let headingText = headingMap[heading] || heading

      return (
        <div key={heading}>
          <h5 className="text-center text-capitalize">{headingText}</h5>
          <ol>{renderData(heading, stateTemplate[heading])}</ol>
        </div>
      )
    })
    .concat([beatEntry])

  return <div className="panel-body">{body}</div>
}

PlotlineTemplateDetails.propTypes = {
  template: PropTypes.object.isRequired,
}

export default PlotlineTemplateDetails
