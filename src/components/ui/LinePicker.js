import React, { Component } from 'react'
import { Picker, Icon, Text, List, ListItem, Button } from 'native-base'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { View, StyleSheet } from 'react-native'
import { isTablet } from 'react-native-device-info'
import { selectors } from 'pltr/v2'
import { t } from 'plottr_locales'
import Popover from 'react-native-popover-view'
import Fonts from '../../fonts'
import Colors from '../../utils/Colors'
import { IS_ANDROID } from '../../utils/Metrics'

class LinePicker extends Component {
  renderTablet () {
    const { selectedId, lines } = this.props
    const selected = lines.find(l => l.id == selectedId)
    return (
      <Popover
        from={
          <Button bordered dark iconRight style={styles.picker}>
            <Text>{selected ? selected.title : t('Select a Plotline')}</Text>
            <Icon
              type='FontAwesome5'
              name='chevron-down'
              style={{ fontSize: 12 }}
            />
          </Button>
        }>
        <List>{this.renderTabletItems()}</List>
      </Popover>
    )
  }

  renderTabletItems () {
    const { lines, onChange, selectedId } = this.props
    return lines.map(l => {
      return (
        <ListItem
          key={l.id}
          style={styles.listItem}
          onPress={() => onChange(l.id)}
          noIndent
          selected={l.id == selectedId}>
          <Text>{l.title}</Text>
        </ListItem>
      )
    })
  }

  renderPhoneItems () {
    const items = this.props.lines.map(l => {
      return <Picker.Item key={l.id} label={l.title} value={l.id} />
    })
    if (IS_ANDROID) {
      items.unshift(
        <Picker.Item key={'select'} label={t('Select a Plotline')} value='' />
      )
    }
    return items
  }

  renderPhone () {
    const { selectedId, onChange, style } = this.props
    return (
      <View style={styles.container}>
        <Picker
          textStyle={styles.pickerText}
          itemTextStyle={styles.pickerText}
          headerBackButtonTextStyle={styles.pickerText}
          style={styles.pickerParent}
          iosIcon={
            <Icon
              type='FontAwesome5'
              name='chevron-down'
              style={{ fontSize: 12 }}
            />
          }
          iosHeader={selectedId ? '' : t('Select a Plotline')}
          placeholder={selectedId ? '' : t('Select a Plotline')}
          mode='dropdown'
          selectedValue={selectedId}
          onValueChange={onChange}>
          {this.renderPhoneItems()}
        </Picker>
      </View>
    )
  }

  render () {
    if (isTablet()) {
      return this.renderTablet()
    } else {
      return this.renderPhone()
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 10
  },
  pickerParent: {
    maxWidth: '95%'
  },
  picker: {
    backgroundColor: 'white'
  },
  listItem: {
    width: 200
  },
  pickerText: {
    ...Fonts.style.semiBold,
    fontSize: Fonts.size.h5
  }
})

LinePicker.propTypes = {
  lines: PropTypes.array.isRequired,
  selectedId: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    lines: selectors.sortedLinesByBookSelector(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinePicker)
