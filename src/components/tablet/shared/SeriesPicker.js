import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet } from 'react-native'
import { t } from 'plottr_locales'
import { selectors, actions } from 'pltr/v2'
import { List, ListItem, Button, Icon } from 'native-base'
import Popover from 'react-native-popover-view'
import { Text, ShellButton } from '../../shared/common'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'

const { size: fontSizes, style: fontStyles } = Fonts

class SeriesPicker extends Component {
  state = { open: false }

  onChange = (val) => {
    this.props.actions.changeCurrentTimeline(val)
    this.setState({ open: false })
  }

  renderItems () {
    const { currentTimeline, bookIds, books } = this.props
    return bookIds.map((id) => {
      const book = books[`${id}`]
      return (
        <ListItem
          key={id}
          style={styles.listItem}
          onPress={() => this.onChange(id)}
          noIndent
          selected={id == currentTimeline}>
          <Text style={styles.text}>{book.title || t('Untitled')}</Text>
        </ListItem>
      )
    })
  }

  render () {
    const { currentTimeline, series, books } = this.props
    const seriesText =
      series.name == ''
        ? t('Series View')
        : `${series.name} (${t('Series View')})`
    const selectedTitle =
      currentTimeline == 'series'
        ? seriesText
        : books[currentTimeline].title || t('Untitled')
    return (
      <Popover
        isVisible={this.state.open}
        onRequestClose={() => this.setState({ open: false })}
        from={
          <ShellButton
            bordered
            dark
            iconRight
            style={styles.picker}
            onPress={() => this.setState({ open: true })}>
            <Text style={styles.title}>{selectedTitle}</Text>
            <Icon
              type='FontAwesome5'
              name='chevron-down'
              style={styles.caret}
            />
          </ShellButton>
        }>
        <List>
          <ListItem
            noIndent
            style={[styles.listItem, styles.seriesListItem]}
            onPress={() => this.onChange('series')}
            selected={currentTimeline == 'series'}>
            <Text style={styles.text}>{seriesText}</Text>
          </ListItem>
          {this.renderItems()}
        </List>
      </Popover>
    )
  }
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Metrics.baseMargin / 1.5,
    paddingLeft: Metrics.baseMargin * 1.5,
    paddingRight: Metrics.doubleBaseMargin / 1.5,
    borderRadius: Metrics.cornerRadius / 2,
    borderColor: Colors.borderGray,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  listItem: {
    width: 400,
    height: 60
  },
  seriesListItem: {
    backgroundColor: 'hsl(210, 36%, 96%)' //gray-9
  },
  title: {
    ...fontStyles.bold,
    paddingRight: Metrics.baseMargin
  },
  caret: {
    fontSize: fontSizes.small,
    marginTop: 3,
    color: Colors.textBlack
  },
  text: {
    fontSize: fontSizes.small
  }
})

SeriesPicker.propTypes = {
  series: PropTypes.object.isRequired,
  books: PropTypes.object.isRequired,
  bookIds: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    series: state.series,
    books: state.books,
    bookIds: state.books.allIds,
    currentTimeline: selectors.currentTimelineSelector(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.ui, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SeriesPicker)
