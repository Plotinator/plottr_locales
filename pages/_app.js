import PropTypes from 'prop-types'

import '../styles/globals.css'

import React from 'react'
import { wrapper } from '../lib/redux'

const Plottr = ({ Component, pageProps }) => <Component {...pageProps} />

Plottr.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object,
}

export default wrapper.withRedux(Plottr)
