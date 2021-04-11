import React from 'react'
import PropTypes from 'react-proptypes'
import { Image, StyleSheet } from 'react-native'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'

export default function DetailImage ({ image }) {
  return image ? <Image style={styles.image} source={{ uri: image }} /> : null
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 100,
    marginTop: Metrics.doubleBaseMargin,
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.borderGray
  }
})

DetailImage.propTypes = {
  image: PropTypes.string.isRequired
}
