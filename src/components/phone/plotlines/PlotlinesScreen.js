import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { StyleSheet, View, LayoutAnimation, Platform, UIManager } from 'react-native'
import { Icon, Item, Container, Content, ListItem, Left, Right, Badge } from 'native-base'
import { SwipeListView } from 'react-native-swipe-list-view'
import t from 'format-message'
import TrashButton from '../../ui/TrashButton'
import { askToDelete } from '../../../utils/delete'
import { Text, Input, Button } from '../../shared/common'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

class PlotlinesScreen extends Component {
  state = {text: ''}

  navigateToDetails = (line) => {
    this.props.navigation.navigate('PlotlineDetails', { line })
  }

  add = () => {
    const { text } = this.state
    const { bookId, actions } = this.props
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    actions.addLineWithTitle(text, bookId)
    this.setState({text: ''})
  }

  delete = (line) => {
    const { bookId, actions } = this.props
    askToDelete(line.title, () => actions.deleteLine(line.id, bookId))
  }

  renderItem = ({ item }) => {
    return (
      <ListItem noIndent button style={styles.row} onPress={() => this.navigateToDetails(item)}>
        <Left>
          <View style={styles.rowView}>
            <Text fontSize='h3' fontStyle='semiBold' style={styles.title}>{item.title || t('New Plotline')}</Text>
            <Badge style={[styles.badge, {backgroundColor: item.color}]}><Text style={styles.hex}>{item.color}</Text></Badge>
          </View>
        </Left>
        <Right>
          <Icon type='FontAwesome5' name='chevron-right'/>
        </Right>
      </ListItem>
    )
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <Input
            inset
            label={t('New Plotline')}
            value={this.state.text}
            onChangeText={text => this.setState({text})}/>
          <Button
            style={styles.button}
            disabled={!this.state.text}
            onPress={this.add}>
            {t('Add')}
          </Button>
        </View>
        <SwipeListView
          data={this.props.lines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={this.renderItem}
          renderHiddenItem={
            (data, rowMap) => (
              <TrashButton
                iconStyle={{ color: 'white' }}
                onPress={() => this.delete(data.item)} />
            )
          }
          leftOpenValue={75}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  subContainer: {
    backgroundColor: 'white',
    padding: Metrics.doubleBaseMargin,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray
  },
  row: {
    backgroundColor: 'white',
  },
  hiddenRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    paddingVertical: 4,
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '96%'
  },
  badge: {
    marginTop: Metrics.baseMargin / 2.5,
    marginLeft: Metrics.baseMargin,
    alignSelf: 'center',
  },
  hex: {
    paddingHorizontal: Metrics.baseMargin / 2,
    color: Colors.white,
    fontSize: Fonts.size.small
  },
  button: {
    marginTop: Metrics.doubleBaseMargin
  }
})

PlotlinesScreen.propTypes = {
  lines: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state, ownProps) {
  return {
    lines: selectors.sortedLinesByBookSelector(state),
    bookId: selectors.currentTimelineSelector(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.line, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlotlinesScreen)
