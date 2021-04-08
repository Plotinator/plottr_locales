import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ScrollView, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { View } from 'native-base'
import { actions } from 'pltr/v2'
import Toolbar from '../shared/Toolbar'
import t from 'format-message'
import { Text, Input, Button } from '../../shared/common'
import Book from '../../shared/project/Book'
import DrawerButton from '../../ui/DrawerButton'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Collapsible from 'react-native-collapsible'

const { baseMargin } = Metrics

class Project extends Component {
  state = {}
  static getDerivedStateFromProps(props, state) {
    if (state.changes) {
      return { series: state.series, changes: true }
    } else {
      return { series: props.series, changes: false }
    }
  }

  saveChanges = () => {
    this.props.seriesActions.editSeries({ ...this.state.series })
    this.setState({ changes: false })
  }

  openEditModal = (id) => {
    // this.props.navigation.push('SeriesDetails', { id })
    this.props.uiActions.changeCurrentTimeline(id)
    this.props.navigation.navigate('Timeline')
  }

  navigateToTimeline = (id) => {
    this.props.uiActions.changeCurrentTimeline(id)
    this.props.navigation.navigate('Timeline')
  }

  renderBooks() {
    const { books } = this.props
    if (!books.allIds) return null

    return books.allIds.map((id) => {
      return (
        <Book
          key={id}
          book={books[`${id}`]}
          navigateToOutline={this.navigateToTimeline}
          navigateToDetails={this.openEditModal}
          style={styles.book}
        />
      )
    })
  }

  render() {
    const { series, changes } = this.state
    return (
      <View style={styles.container}>
        <Toolbar>
          <DrawerButton openDrawer={this.props.openDrawer} />
        </Toolbar>
        <View style={styles.seriesWrapper}>
          <Text fontSize='h2' style={styles.subTitle}>
            {t('Series')}
          </Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <View style={styles.column}>
                <Input
                  inset
                  small
                  label={`${t('Name')}:`}
                  value={series.name}
                  onChangeText={(text) =>
                    this.setState({
                      series: { ...series, name: text },
                      changes: true
                    })
                  }
                  autoCapitalize='words'
                />
              </View>
              <View style={styles.column}>
                <Input
                  inset
                  small
                  label={`${t('Premise')}:`}
                  value={series.premise}
                  onChangeText={(text) =>
                    this.setState({
                      series: { ...series, premise: text },
                      changes: true
                    })
                  }
                  autoCapitalize='sentences'
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.column}>
                <Input
                  inset
                  small
                  label={`${t('Genre')}:`}
                  value={series.genre}
                  onChangeText={(text) =>
                    this.setState({
                      series: { ...series, genre: text },
                      changes: true
                    })
                  }
                  autoCapitalize='sentences'
                />
              </View>
              <View style={styles.column}>
                <Input
                  inset
                  small
                  label={`${t('Theme')}:`}
                  value={series.theme}
                  onChangeText={(text) =>
                    this.setState({
                      series: { ...series, theme: text },
                      changes: true
                    })
                  }
                  autoCapitalize='sentences'
                />
              </View>
            </View>
            <Collapsible collapsed={!changes}>
              <View style={styles.row}>
                <View style={styles.centerColumn}>
                  <Button
                    tight
                    disabled={!changes}
                    onPress={this.saveChanges}
                    style={styles.saveButton}>
                    {t('Save')}
                  </Button>
                </View>
              </View>
            </Collapsible>
          </View>
        </View>
        <View style={styles.booksWrapper}>
          <Text fontSize='h2' style={styles.subTitle}>
            {t('Books')}
          </Text>
          <ScrollView contentContainerStyle={styles.booksList}>
            <TouchableWithoutFeedback>
              <React.Fragment>{this.renderBooks()}</React.Fragment>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'white',
    flex: 1
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderColor: 'hsl(211, 27%, 70%)', //gray-6
    marginRight: 16
  },
  text: {
    color: 'hsl(209, 61%, 16%)' //gray-0
  },
  icon: {
    color: 'hsl(209, 61%, 16%)' //gray-0
  },
  seriesWrapper: {
    padding: baseMargin * 1.5,
    paddingBottom: 0
  },
  booksWrapper: {
    flex: 2,
    marginTop: 5,
    paddingLeft: baseMargin * 1.5
  },
  subTitle: {
    paddingLeft: baseMargin / 2,
    paddingBottom: baseMargin / 2
  },
  label: {
    // marginBottom: 16,
    backgroundColor: 'white',
    padding: 2
  },
  grid: {
    width: '100%'
  },
  row: {
    width: '100%',
    flexDirection: 'row'
  },
  column: {
    flex: 1,
    padding: baseMargin
  },
  centerColumn: {
    flex: 1,
    padding: baseMargin,
    alignItems: 'center'
  },
  bookScroller: {
    flex: 1
  },
  booksList: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignContent: 'flex-start'
  },
  book: {
    width: '33%'
  },
  saveButton: {
    width: '33%'
  }
})

Project.propTypes = {
  series: PropTypes.object.isRequired,
  books: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  seriesActions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired,
  closeFile: PropTypes.func
}

function mapStateToProps(state) {
  return {
    series: state.series,
    books: state.books
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.book, dispatch),
    seriesActions: bindActionCreators(actions.series, dispatch),
    uiActions: bindActionCreators(actions.ui, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Project)
