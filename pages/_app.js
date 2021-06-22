import React from 'react'
import PropTypes from 'prop-types'
import { setupI18n } from 'plottr_locales'

import { localeSettings } from '../lib/locale-settings'

import '../styles/globals.scss'

setupI18n(localeSettings, {})

const Plottr = ({ Component, pageProps }) => <Component {...pageProps} />

Plottr.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object,
}

export default Plottr
