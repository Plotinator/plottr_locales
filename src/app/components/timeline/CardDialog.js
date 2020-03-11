import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import _ from 'lodash'
import * as CardActions from 'actions/cards'
import { ButtonToolbar, Button, DropdownButton, MenuItem, FormControl } from 'react-bootstrap'
import SelectList from 'components/selectList'
import MDdescription from 'components/mdDescription'
import i18n from 'format-message'

const customStyles = {content: {top: '70px'}}

class CardDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      description: props.card.description
    }
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

  changeScene (sceneId) {
    this.props.actions.changeScene(this.props.card.id, sceneId)
  }

  changeLine (lineId) {
    this.props.actions.changeLine(this.props.card.id, lineId)
  }

  getCurrentScene () {
    return _.find(this.props.scenes, {id: this.props.sceneId})
  }

  getCurrentLine () {
    return _.find(this.props.lines, {id: this.props.lineId})
  }

  renderSceneItems () {
    var scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((scene) => {
      return (<MenuItem
        key={scene.id}
        onSelect={() => this.changeScene(scene.id)} >
        {scene.title}
      </MenuItem>)
    })
  }

  renderLineItems () {
    var lines = _.sortBy(this.props.lines, 'position')
    return lines.map((line) => {
      return (<MenuItem
        key={line.id}
        onSelect={() => this.changeLine(line.id)} >
        {line.title}
      </MenuItem>)
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
      style={{fontSize: '24pt'}}
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

  renderLeftSide () {
    var ids = {
      scene: _.uniqueId('select-scene-'),
      line: _.uniqueId('select-line-')
    }

    return (
      <div className='card-dialog__left-side'>
        <div className='card-dialog__line'>
          <label className='card-dialog__details-label' htmlFor={ids.line}>{i18n('Line')}:
            <DropdownButton id={ids.line} className='card-dialog__select-line' title={this.getCurrentLine().title}>
              {this.renderLineItems()}
            </DropdownButton>
          </label>
        </div>
        <div className='card-dialog__scene'>
          <label className='card-dialog__details-label' htmlFor={ids.scene}>{i18n('Scene')}:
            <DropdownButton id={ids.scene} className='card-dialog__select-scene' title={this.getCurrentScene().title}>
              {this.renderSceneItems()}
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
          {this.renderTitle()}
          <div className='card-dialog__body'>
            {this.renderLeftSide()}
            <div className='card-dialog__description'>
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
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  labelMap: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    scenes: state.scenes,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

const Pure = PureComponent(CardDialog)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)
