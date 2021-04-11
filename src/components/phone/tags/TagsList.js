import React, { Component } from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { StyleSheet, Alert } from 'react-native'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { ListItem, Icon, Left, Right, View, Badge } from 'native-base'
import { t } from 'plottr_locales'
import TrashButton from '../../ui/TrashButton'
import tinycolor from 'tinycolor2'
import { Text } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'

class TagsList extends Component {
  deleteTag = (tag) => {
    const { title, id } = tag
    Alert.alert(t('Delete Tag'), t('Delete {title} Tag?', { title }), [
      {
        text: t('Yes, Delete'),
        onPress: () => {
          this.props.actions.deleteTag(id)
        }
      },
      { text: t('No'), onPress: () => {}, style: 'cancel' }
    ])
  }

  navigateToDetails = (tag) => {
    this.props.navigation.navigate('TagDetails', { tag })
  }

  renderTag = ({ item }) => {
    const colorObj = tinycolor(item.color || 'black')
    const backgroundColor = { backgroundColor: colorObj.toHexString() }
    return (
      <ListItem
        noIndent
        button
        style={styles.row}
        onPress={() => this.navigateToDetails(item)}>
        <Left>
          <View style={styles.rowView}>
            <Text fontStyle='semiBold' fontSize='h4' style={styles.title}>
              {item.title || t('New Tag')}
            </Text>
            <Badge style={[styles.badge, backgroundColor]}></Badge>
          </View>
        </Left>
        <Right style={styles.right}>
          <Icon type='FontAwesome5' name='chevron-right' />
        </Right>
      </ListItem>
    )
  }

  render () {
    return (
      <SwipeListView
        data={this.props.tags}
        renderItem={this.renderTag}
        renderHiddenItem={({ item }, rowMap) => (
          <TrashButton iconStyle={styles.trash} data={item} onPress={this.deleteTag} />
        )}
        keyExtractor={(item) => item.id}
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
  rowView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badge: {
    marginTop: Metrics.baseMargin / 2,
    marginLeft: Metrics.doubleBaseMargin,
    width: 50
  },
  trash: {
    color: Colors.white
  },
  right: {
    paddingRight: Metrics.baseMargin / 2
  }
})

TagsList.propTypes = {
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    tags: selectors.sortedTagsSelector(state)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.tag, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TagsList)
