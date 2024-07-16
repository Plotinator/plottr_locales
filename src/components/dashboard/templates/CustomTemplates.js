import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { t } from 'plottr_locales'

import { selectors } from 'wired-up-pltr'

const CustomTemplates = ({ templates }) => {
  const renderedTemplates = templates.map((t) => {
    return (
      <div key={t.id} className="dashboard__template-section__item custom">
        <div>{t.name}</div>
      </div>
    )
  })

  return (
    <div className="dashboard__template-section">
      <h1>{t('Custom Templates')}</h1>
      <div className="dashboard__template-section__wrapper">{renderedTemplates}</div>
    </div>
  )
}

CustomTemplates.propTypes = {
  templates: PropTypes.object.isRequired,
  type: PropTypes.string,
  searchTerm: PropTypes.string,
}

const mapStateToProps = (state, { type, searchTerm }) => ({
  templates: selectors.filteredSortedCustomTemplatesSelector(
    state,
    // @ts-ignore
    type,
    searchTerm
  ),
})

export default connect(mapStateToProps)(CustomTemplates)
