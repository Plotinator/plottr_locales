import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { localeNames, getCurrentLocale } from 'plottr_locales'

import { PlottrComponentsContext } from '../connections/pltrContext'

function LanguagePicker({ onSelectLanguage, settings, forcedSelection }) {
  const { platform } = useContext(PlottrComponentsContext)
  const [locale, setLocale] = useState(getCurrentLocale(settings, platform))

  const onSelect = (event) => {
    onSelectLanguage(event.target.value)
    setLocale(getCurrentLocale(settings, platform))
  }

  const renderedOptions = Object.entries(localeNames).map((entry) => {
    return (
      <option key={entry[0]} value={entry[0]}>
        {entry[1]}
      </option>
    )
  })
  return (
    <select onChange={onSelect} value={forcedSelection || locale}>
      {renderedOptions}
    </select>
  )
}

LanguagePicker.propTypes = {
  onSelectLanguage: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  forcedSelection: PropTypes.string,
}

const mapStateToProps = (state) => ({
  settings: selectors.appSettingsSelector(state),
})

export default connect(mapStateToProps)(LanguagePicker)
