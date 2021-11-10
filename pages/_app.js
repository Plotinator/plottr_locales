import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { setupI18n } from 'plottr_locales'

import { localeSettings } from '../lib/locale-settings'

import '../styles/globals.scss'

setupI18n(localeSettings, {})

const Plottr = ({ Component, pageProps }) => {
  useEffect(() => {
    const { seedTemplates } = require('../lib/templates')
    seedTemplates()
  }, [])

  return <Component {...pageProps} />
}

Plottr.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object,
}

export default Plottr
