import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t } from 'plottr_locales'
import { actions, selectors, initialState } from 'pltr/v2'
import { StyleSheet, Dimensions, View, ScrollView } from 'react-native'
import SaveButton from '../../ui/SaveButton'
import DetailsScrollView from '../shared/DetailsScrollView'
import { Input } from '../../shared/common'
import {
  checkForChanges,
  addLeaveListener,
  removeLeaveListener
} from '../../../utils/Changes'

class SeriesDetails extends Component {
  constructor (props) {
    super(props)
    const { route } = props
    const { isNewBook, id } = route.params
    let bookObj = {}
    if (isNewBook) {
      bookObj = cloneDeep(initialState.book)
    } else {
      if (id == 'series') {
        bookObj = props.series
      } else {
        bookObj = props.books[`${id}`]
      }
    }
    this.state = {
      isNewBook: isNewBook,
      changes: isNewBook,
      book: bookObj,
      id: id
    }
  }

  componentDidMount () {
    const title = this.state.id == 'series' ? t('Series') : t('Book Details')
    const { navigation } = this.props
    navigation.setOptions({ title })
    this.setSaveButton()
    addLeaveListener(navigation, this.checkChanges, this.saveChanges)
  }

  componentWillUnmount () {
    const { navigation } = this.props
    removeLeaveListener(navigation, this.checkChanges)
  }

  componentDidUpdate () {
    this.setSaveButton()
  }

  checkChanges = (event) => {
    const { changes } = this.state
    const { navigation } = this.props
    checkForChanges(event, changes, this.saveChanges, navigation)
  }

  setSaveButton = () => {
    this.props.navigation.setOptions({
      headerRight: () => (
        <SaveButton changes={this.state.changes} onPress={this.saveChanges} />
      )
    })
  }

  saveChanges = () => {
    const { changes, isNewBook, book, id } = this.state
    if (!changes) return
    if (isNewBook) {
      // TODO: need to make adding a plotline/chapter all one action in root
      // this.props.actions.addBook()
      this.props.navigation.setParams({ isNewBook: false })
    } else {
      const attrs = ['genre', 'premise', 'theme']
      const createUpdateObj = (acc, attr) => {
        acc[attr] = book[attr]
        return acc
      }
      if (id == 'series') {
        const updateObj = ['name', ...attrs].reduce(createUpdateObj, {})
        this.props.seriesActions.editSeries(updateObj)
      } else {
        const updateObj = ['title', ...attrs].reduce(createUpdateObj, {})
        this.props.actions.editBook(id, updateObj)
      }
    }
    this.setState({ isNewBook: false, changes: false })
  }

  handleTitleChange = (title) => {
    const { book } = this.state
    const isSeries = this.state.id == 'series'
    const newTitle = {}
    newTitle[isSeries ? 'name' : 'title'] = title
    this.setState({ book: { ...book, ...newTitle }, changes: true })
  }

  functs = {}
  setChangeTextCallback = (stateName) => {
    const { book } = this.state
    if (!this.functs[stateName]) {
      this.functs[stateName] = (textValue) => {
        const toChange = {}
        book[stateName] = textValue
        const state = { book }
        console.log('BOOK', book)
        state.changes = true
        this.setState(state)
      }
    }
    return this.functs[stateName]
  }

  render () {
    const { id, book } = this.state
    const isSeries = id == 'series'
    const titleValue = book[isSeries ? 'name' : 'title']
    const titleLabel = t(isSeries ? 'Name' : 'Title')
    return (
      <DetailsScrollView>
        <View style={styles.label}>
          <Input
            inset
            label={titleLabel}
            value={titleValue}
            onChangeText={this.handleTitleChange}
            autoCapitalize='words'
          />
        </View>
        <View style={styles.label}>
          <Input
            inset
            label={t('Genre')}
            value={book.genre}
            onChangeText={this.setChangeTextCallback('genre')}
            autoCapitalize='sentences'
          />
        </View>
        <View style={styles.label}>
          <Input
            inset
            label={t('Premise')}
            value={book.premise}
            onChangeText={this.setChangeTextCallback('premise')}
            autoCapitalize='sentences'
          />
        </View>
        <View style={styles.label}>
          <Input
            inset
            label={t('Theme')}
            value={book.theme}
            onChangeText={this.setChangeTextCallback('theme')}
            autoCapitalize='sentences'
          />
        </View>
      </DetailsScrollView>
    )
  }
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 16
  },
  afterList: {
    marginTop: 16
  },
  badge: {
    marginRight: 8
  }
})

SeriesDetails.propTypes = {
  series: PropTypes.object.isRequired,
  books: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  seriesActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    series: state.series,
    books: state.books
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.book, dispatch),
    seriesActions: bindActionCreators(actions.series, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SeriesDetails)
