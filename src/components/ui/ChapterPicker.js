import React, { Component } from 'react'
import { Picker, Icon, Text, List, ListItem, Button } from 'native-base'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { View, StyleSheet } from 'react-native'
import { isTablet } from 'react-native-device-info'
import { selectors, helpers } from 'pltr/v2'
import { t } from 'plottr_locales'
import Popover from 'react-native-popover-view'
import Fonts from '../../fonts'
import Colors from '../../utils/Colors'

class ChapterPicker extends Component {
  renderTablet () {
    const {
      selectedId,
      chapters,
      positionOffset,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    const selected = chapters.find(ch => ch.id == selectedId)
    return (
      <Popover
        from={
          <Button bordered dark iconRight style={styles.picker}>
            <Text>
              {selected
                ? helpers.beats.beatTitle(
                    beatTree,
                    selected,
                    hierarchyLevels,
                    positionOffset,
                    hierarchyEnabled,
                    isSeries
                  )
                : t('Select a Chapter')}
            </Text>
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
    const {
      chapters,
      positionOffset,
      onChange,
      selectedId,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    return chapters.map(ch => {
      return (
        <ListItem
          key={ch.id}
          style={styles.listItem}
          onPress={() => onChange(ch.id)}
          noIndent
          selected={ch.id == selectedId}>
          <Text>{
            helpers.beats.beatTitle(
              beatTree,
              ch,
              hierarchyLevels,
              positionOffset,
              hierarchyEnabled,
              isSeries
            )}</Text>
        </ListItem>
      )
    })
  }

  renderPhoneItems () {
    const {
      chapters,
      positionOffset,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    return chapters.map(ch => {
      return (
        <Picker.Item
          key={ch.id}
          label={helpers.beats.beatTitle(
            beatTree,
            ch,
            hierarchyLevels,
            positionOffset,
            hierarchyEnabled,
            isSeries
          )}
          value={ch.id}
        />
      )
    })
  }

  renderPhone () {
    const { selectedId, onChange } = this.props
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
          iosHeader={selectedId ? '' : t('Select a Chapter')}
          placeholder={selectedId ? '' : t('Select a Chapter')}
          mode='modal'
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

ChapterPicker.propTypes = {
  chapters: PropTypes.array.isRequired,
  positionOffset: PropTypes.number.isRequired,
  selectedId: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  beatTree: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  isSeries: PropTypes.bool.isRequired,
  hierarchyEnabled: PropTypes.bool
}

function mapStateToProps (state) {
  return {
    chapters: selectors.sortedBeatsByBookSelector(state),
    positionOffset: selectors.positionOffsetSelector(state),
    beatTree: selectors.beatsByBookSelector(state),
    hierarchyLevels: selectors.sortedHierarchyLevels(state),
    isSeries: selectors.isSeriesSelector(state),
    hierarchyEnabled: selectors.beatHierarchyIsOn(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterPicker)
