import React from 'react'
import PropTypes from 'prop-types'

import { wrapper } from '../lib/redux'

import '../styles/globals.css'

const Plottr = ({ Component, pageProps }) => <Component {...pageProps} />

Plottr.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object,
}

export default wrapper.withRedux(Plottr)
