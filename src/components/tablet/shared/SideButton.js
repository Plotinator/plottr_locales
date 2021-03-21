import React from 'react'
import PropTypes from 'react-proptypes'
import { Image, StyleSheet } from 'react-native'
import { ShellButton, Text } from '../../shared/common'
import { Icon } from 'native-base'
import { Col, Grid } from 'react-native-easy-grid'
import t from 'format-message'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'

export default function SideButton ({
  onPress,
  onDelete,
  isActive,
  image,
  title
}) {
  return (
    <Grid style={[styles.grid, isActive && styles.active]}>
      <Col size={9}>
        <ShellButton style={styles.button} onPress={onPress}>
          {image && <Image style={styles.image} source={{ uri: image }} />}
          <Text style={styles.title}>{title}</Text>
        </ShellButton>
      </Col>
      <Col size={3}>
        <ShellButton style={styles.deleteButton} onPress={onDelete}>
          <Icon type='FontAwesome5' name='trash' style={styles.deleteIcon} />
        </ShellButton>
      </Col>
    </Grid>
  )
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: Metrics.baseMargin,
    paddingRight: Metrics.baseMargin,
    borderColor: 'hsl(210, 36%, 96%)', // gray-9
    borderWidth: 1
  },
  active: {
    borderColor: 'hsl(208, 88%, 62%)', // blue-6
    backgroundColor: 'hsl(210, 31%, 80%)', // gray-7
    borderStyle: 'dashed'
  },
  button: {
    minHeight: 50,
    paddingVertical: Metrics.baseMargin * 0.8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    ...Fonts.style.semiBold,
    fontSize: Fonts.size.tiny
  },
  image: {
    resizeMode: 'contain',
    overflow: 'hidden',
    borderRadius: 50,
    marginRight: Metrics.baseMargin,
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: Colors.borderGray
  },
  deleteButton: {
    alignSelf: 'flex-end'
  },
  deleteIcon: {
    color: Colors.lightGray,
    fontSize: Fonts.size.tiny
  }
})

SideButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
}
