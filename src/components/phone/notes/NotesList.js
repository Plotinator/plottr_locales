import { sortBy } from 'lodash'
import React, { Component } from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { StyleSheet, Animated } from 'react-native'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions } from 'pltr/v2'
import { View, ListItem, Icon, Left, Right, Button } from 'native-base'
import { t } from 'plottr_locales'
import TrashButton from '../../ui/TrashButton'
import { askToDelete } from '../../../utils/delete'
import { Text } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'

class NotesList extends Component {
  deleteNote = (note) => {
    askToDelete(note.title, () => this.props.actions.deleteNote(note.id))
  }

  navigateToDetails = (note) => {
    this.props.navigation.navigate('NoteDetails', { note })
  }

  renderNote = ({ item }) => {
    return (
      <ListItem
        noIndent
        button
        style={styles.row}
        onPress={() => this.navigateToDetails(item)}>
        <Left>
          <Text style={styles.title} fontStyle='semiBold' fontSize='h4'>
            {item.title || t('New Note')}
          </Text>
        </Left>
        <Right style={styles.right}>
          <Icon type='FontAwesome5' name='chevron-right' />
        </Right>
      </ListItem>
    )
  }

  render() {
    const notes = sortBy(this.props.notes, ['lastEdited'])
    return (
      <SwipeListView
        data={notes}
        renderItem={this.renderNote}
        renderHiddenItem={({ item }, rowMap) => (
          <TrashButton
            data={item}
            iconStyle={styles.icon}
            onPress={this.deleteNote}
            color='white'
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        leftOpenValue={75}
      />
    )
  }
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: 'white'
  },
  title: {
    paddingVertical: Metrics.baseMargin / 2
  },
  hiddenRow: {},
  icon: {
    color: Colors.white
  },
  right: {
    paddingRight: Metrics.baseMargin / 2
  }
})

NotesList.propTypes = {
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    notes: state.notes,
    characters: state.characters,
    places: state.places,
    tags: state.tags,
    ui: state.ui
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.note, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotesList)
