import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { localeNames, getCurrentLocale } from 'plottr_locales'

const LanguagePickerConnector = (connector) => {
  const { platform } = connector

  function LanguagePicker({ onSelectLanguage, settings, forcedSelection }) {
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

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      settings: selectors.appSettingsSelector(state),
    }))(LanguagePicker)
  }

  return LanguagePicker
}

export default LanguagePickerConnector
