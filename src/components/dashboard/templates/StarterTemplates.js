import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { t } from 'plottr_locales'

import { selectors } from 'wired-up-pltr'

const StarterTemplates = ({ templates }) => {
  const renderedTemplates = templates.map((t) => {
    return (
      <div key={t.id} className="dashboard__template-section__item starter">
        <div>{t.name}</div>
      </div>
    )
  })

  return (
    <div className="dashboard__template-section">
      <h1>{t('Starter Templates')}</h1>
      <div className="dashboard__template-section__wrapper">{renderedTemplates}</div>
    </div>
  )
}

StarterTemplates.propTypes = {
  type: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  templates: PropTypes.array.isRequired,
}

const mapStateToProps = (state, { type, searchTerm }) => ({
  templates: selectors.filteredSortedStarterTemplatesSelector(
    state,
    // @ts-ignore
    type,
    searchTerm
  ),
})

export default connect(mapStateToProps)(StarterTemplates)
