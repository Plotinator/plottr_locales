import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import { countWords } from './helpers'

const WordCounter = ({ text, totalSelectedWords }) => {
  return (
    <div className="slate-editor__word-counter">
      <div className="row-item">
        <span>{t('Words:')}</span> <span>{countWords(text)}</span>
      </div>
      {totalSelectedWords ? (
        <div className="row-item">
          {' '}
          <span>{t(`(Selected:`)}</span>{' '}
          <span>
            {totalSelectedWords}
            {')'}
          </span>
        </div>
      ) : null}
    </div>
  )
}

WordCounter.propTypes = {
  text: PropTypes.array,
  totalSelectedWords: PropTypes.number,
}

export default WordCounter
