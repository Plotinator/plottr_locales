import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import _ from 'lodash'
import * as CardActions from 'actions/cards'
import * as UIActions from 'actions/ui'
import { ButtonToolbar, Button, DropdownButton, MenuItem, FormControl } from 'react-bootstrap'
import SelectList from 'components/selectList'
import MDdescription from 'components/mdDescription'
import i18n from 'format-message'
import { chapterTitle } from '../../helpers/chapters'
import { chaptersByBookSelector } from '../../selectors/chapters'
import { linesByBookSelector } from '../../selectors/lines'

const customStyles = {content: {top: '70px'}}

class CardDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      description: props.card.description
    }
  }

  isSeries = () => {
    return this.props.ui.currentTimeline == 'series'
  }

  componentDidMount () {
    window.SCROLLWITHKEYS = false
  }

  componentWillUnmount () {
    this.saveEdit()
    window.SCROLLWITHKEYS = true
  }

  saveAndClose = () => {
    this.saveEdit()
    this.props.closeDialog()
  }

  deleteCard = () => {
    let label = i18n("Do you want to delete this card: { title }?", {title: this.props.card.title})
    if (window.confirm(label)) {
      this.props.actions.deleteCard(this.props.card.id)
    }
  }

  saveEdit = () => {
    var newTitle = ReactDOM.findDOMNode(this.refs.titleInput).value || this.props.card.title
    var newDescription = this.state.description || this.props.card.description
    this.saveCreatedLabels(newDescription)
    this.props.actions.editCard(this.props.card.id, newTitle, newDescription)
  }

  saveCreatedLabels (desc) {
    var regex = /{{([\w\s]*)}}/gi
    var matches
    while ((matches = regex.exec(desc)) !== null) {
      var labelText = matches[1].toLowerCase()
      if (this.props.labelMap[labelText] !== undefined) {
        const { id, type } = this.props.labelMap[labelText]
        if (!this.alreadyHasLabel(id, type)) {
          this.props.actions[`add${type}`](this.props.card.id, id)
        }
      }
    }
  }

  alreadyHasLabel(id, type) {
    let attr = `${type.toLowerCase()}s`
    return this.props.card[attr].includes(id)
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveAndClose()
    }
  }

  changeChapter (chapterId) {
    this.props.actions.changeScene(this.props.card.id, chapterId, this.props.ui.currentTimeline)
  }

  changeLine (lineId) {
    this.props.actions.changeLine(this.props.card.id, lineId, this.props.ui.currentTimeline)
  }

  changeBook (bookId) {
    this.props.actions.changeBook(this.props.card.id, bookId)
  }

  getCurrentChapter () {
    return _.find(this.props.chapters, {id: this.props.chapterId})
  }

  getCurrentLine () {
    return _.find(this.props.lines, {id: this.props.lineId})
  }

  getBookTitle () {
    const book = this.props.books[this.props.card.bookId]
    if (book) {
      return book.title || i18n('Untitled')
    } else {
      return i18n('Choose...')
    }
  }

  renderChapterItems () {
    var chapters = _.sortBy(this.props.chapters, 'position')
    return chapters.map((chapter) => {
      return (<MenuItem key={chapter.id} onSelect={() => this.changeChapter(chapter.id)}>
        {chapterTitle(chapter)}
      </MenuItem>)
    })
  }

  renderLineItems () {
    var lines = _.sortBy(this.props.lines, 'position')
    return lines.map((line) => {
      return (<MenuItem key={line.id} onSelect={() => this.changeLine(line.id)}>
        {line.title}
      </MenuItem>)
    })
  }

  renderBooks () {
    const { books } = this.props
    return books.allIds.map(id => {
      return <MenuItem key={id} onSelect={() => this.changeBook(id)}>
        {books[id].title || i18n('Untitled')}
      </MenuItem>
    })
  }

  renderButtonBar () {
    return (
      <ButtonToolbar className='card-dialog__button-bar'>
        <Button onClick={this.props.closeDialog}>
          {i18n('Cancel')}
        </Button>
        <Button bsStyle='success' onClick={this.saveAndClose}>
          {i18n('Save')}
        </Button>
        <Button className='card-dialog__delete' onClick={this.deleteCard} >
          {i18n('Delete')}
        </Button>
      </ButtonToolbar>
    )
  }

  renderTitle () {
    var title = this.props.card.title
    return <FormControl
      style={{fontSize: '24pt', textAlign: 'center', marginBottom: '6px'}}
      onKeyPress={this.handleEnter}
      type='text' autoFocus
      ref='titleInput'
      defaultValue={title}
    />
  }

  renderDescription () {
    var description = this.props.card.description

    return (
      <MDdescription
        description={description}
        onChange={(desc) => this.setState({description: desc})}
        useRCE={true}
        labels={this.props.labelMap}
        darkMode={this.props.ui.darkMode}
      />
    )
  }

  renderBookDropdown () {
    let bookButton = null
    if (this.props.card.bookId) {
      const handler = () => {
        this.props.uiActions.changeCurrentTimeline(this.props.card.bookId)
        this.props.closeDialog()
      }
      bookButton = <Button onClick={handler}>{i18n('View Timeline')}</Button>
    }
    return <div className='card-dialog__dropdown-wrapper' style={{marginBottom: '5px'}}>
      <label className='card-dialog__details-label' htmlFor='select-book'>{i18n('Book')}:
        <DropdownButton id='select-book' className='card-dialog__select-line' title={this.getBookTitle()}>
          {this.renderBooks()}
        </DropdownButton>
      </label>
      { bookButton }
    </div>
  }

  renderLeftSide () {
    var ids = {
      chapter: _.uniqueId('select-chapter-'),
      line: _.uniqueId('select-line-'),
    }
    let labelText = i18n('Chapter')
    let bookDropDown = null
    if (this.isSeries()) {
      labelText = i18n('Beat')
      bookDropDown = this.renderBookDropdown()
    }

    return (
      <div className='card-dialog__left-side'>
        { bookDropDown }
        <div className='card-dialog__dropdown-wrapper'>
          <label className='card-dialog__details-label' htmlFor={ids.line}>{i18n('Line')}:
            <DropdownButton id={ids.line} className='card-dialog__select-line' title={this.getCurrentLine().title}>
              {this.renderLineItems()}
            </DropdownButton>
          </label>
        </div>
        <div className='card-dialog__sdropdown-wrapper'>
          <label className='card-dialog__details-label' htmlFor={ids.chapter}>{labelText}:
            <DropdownButton id={ids.chapter} className='card-dialog__select-scene' title={chapterTitle(this.getCurrentChapter())}>
              {this.renderChapterItems()}
            </DropdownButton>
          </label>
        </div>
        <SelectList
          parentId={this.props.card.id} type={'Characters'}
          selectedItems={this.props.card.characters}
          allItems={this.props.characters}
          add={this.props.actions.addCharacter}
          remove={this.props.actions.removeCharacter} />
        <SelectList
          parentId={this.props.card.id} type={'Places'}
          selectedItems={this.props.card.places}
          allItems={this.props.places}
          add={this.props.actions.addPlace}
          remove={this.props.actions.removePlace} />
        <SelectList
          parentId={this.props.card.id} type={'Tags'}
          selectedItems={this.props.card.tags}
          allItems={this.props.tags}
          add={this.props.actions.addTag}
          remove={this.props.actions.removeTag} />
      </div>
    )
  }

  render () {
    let klasses = 'card-dialog'
    if (this.props.ui.darkMode) {
      klasses += ' darkmode'
      customStyles.content.backgroundColor = '#888'
    }
    return (
      <Modal isOpen={true} onRequestClose={this.saveAndClose} style={customStyles}>
        <div className={klasses}>
          <div className='card-dialog__body'>
            {this.renderLeftSide()}
            <div className='card-dialog__description'>
              {this.renderTitle()}
              <p className='card-dialog__details-label text-center'>{i18n('Description')}:</p>
              {this.renderDescription()}
            </div>
          </div>
          {this.renderButtonBar()}
        </div>
      </Modal>
    )
  }
}

CardDialog.propTypes = {
  card: PropTypes.object,
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  chapters: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  labelMap: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  books: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    chapters: chaptersByBookSelector(state),
    lines: linesByBookSelector(state),
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui,
    books: state.books,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
}

const Pure = PureComponent(CardDialog)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)