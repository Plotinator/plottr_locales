import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FiCopy } from '@react-icons/all-files/fi/FiCopy'

import { t as i18n } from 'plottr_locales'
import { helpers } from 'pltr'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'

import { isInviewport } from '../domHelpers'
import { checkDependencies } from '../checkDependencies'

const { isNotDroppingToSamePosition } = helpers.lists

const CharacterItemConnector = (connector) => {
  const Image = UnconnectedImage(connector)

  class CharacterItem extends Component {
    state = {
      deleting: false,
      hovering: false,
      newCharacterIdPosition: null,
      moveUp: null,
      isDragging: false,
    }

    constructor(props) {
      super(props)
      this.ref = React.createRef()
    }

    componentDidMount() {
      this.scrollIntoView()
    }

    componentDidUpdate(prevProps) {
      if (prevProps.selected !== this.props.selected) {
        this.scrollIntoView()
      }
    }

    scrollIntoView = () => {
      if (this.props.selected) {
        const node = this.ref.current
        if (node && !isInviewport(node)) {
          node.scrollIntoView?.()
        }
      }
    }

    deleteCharacter = (e) => {
      e.stopPropagation()
      this.props.actions.deleteCharacter(this.props.character.id)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
      this.props.stopEdit()
    }

    selectCharacter = () => {
      const { character, selected, select, startEdit } = this.props
      if (selected) {
        startEdit()
      } else {
        select(character.id)
      }
    }

    startEditing = (e) => {
      e.stopPropagation()
      if (this.props.editing) {
        this.props.stopEdit()
      } else {
        this.props.select(this.props.character.id)
        this.props.startEdit()
      }
    }

    handleDuplicate = () => {
      this.props.actions.duplicateCharacter(this.props.character.id)
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.character.name || i18n('New Character')}
          onDelete={this.deleteCharacter}
          onCancel={this.cancelDelete}
        />
      )
    }

    handleDragOver = (e) => {
      e.preventDefault()
      const { character, draggedPosition, isMovingToNewCategory, absolutePosition } = this.props
      const { newCharacterIdPosition, moveUp } = this.state
      const targetElement = e.currentTarget
      const mouseY = e.clientY - targetElement.getBoundingClientRect().top
      const isAbove = Boolean(Math.round(mouseY) < Math.round(targetElement.clientHeight / 2))

      if (
        moveUp != isAbove &&
        isNotDroppingToSamePosition(
          draggedPosition,
          absolutePosition,
          isAbove,
          isMovingToNewCategory
        )
      ) {
        this.setState({ moveUp: isAbove })
      }

      if (newCharacterIdPosition != character.id) {
        this.setState({ newCharacterIdPosition: character.id })
      }
    }

    handleDragLeave = (e) => {
      e.preventDefault()
      if (
        !this.ref.current.contains(e.relatedTarget) &&
        typeof this.state.newCharacterIdPosition !== 'undefined'
      ) {
        this.setState({ newCharacterIdPosition: null })
      }
    }

    handleDropItem = (e) => {
      e.stopPropagation()
      e.preventDefault()
      const { character, actions, absolutePosition } = this.props

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
      actions.reorderCharacter(
        droppedData.id,
        absolutePosition,
        character.categoryId || null,
        this.state.moveUp ? 'up' : 'down'
      )
      this.setState({ newCharacterIdPosition: null, moveUp: null, isDragging: false })
    }

    handleDragStart = (e) => {
      const { character } = this.props
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify({ ...character }))
      this.setState({ isDragging: true })
    }

    handleDragEnd = (e) => {
      this.setState({ isDragging: false })
    }

    handleDragEnter = (e) => {
      e.preventDefault()
    }

    renderHoverOptions = () => {
      return (
        <ButtonGroup className="character-list__item-buttons">
          <Button bsSize="small" onClick={this.startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button bsSize="small" onClick={this.handleDuplicate}>
            <FiCopy />
          </Button>
          <Button bsSize="small" onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
        </ButtonGroup>
      )
    }

    render() {
      const { character, selected, draggedPosition, absolutePosition } = this.props
      const { newCharacterIdPosition, moveUp, isDragging } = this.state
      const isDroppable =
        Number.isInteger(newCharacterIdPosition) &&
        character.id == newCharacterIdPosition &&
        draggedPosition !== absolutePosition
      const moveBelow = moveUp !== null && !moveUp && isDroppable
      const moveAbove = moveUp !== null && moveUp && !moveBelow && isDroppable

      let img = null
      if (character.imageId) {
        img = (
          <div className="character-list__item-inner__image-wrapper">
            <Image shape="circle" size="small" imageId={character.imageId} />
          </div>
        )
      }

      return (
        <div
          ref={this.ref}
          draggable
          key={this.props.key}
          onDragStart={this.handleDragStart}
          onDrop={this.handleDropItem}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDragEnd={this.handleDragEnd}
          onDragEnter={this.handleDragEnter}
          onClick={this.selectCharacter}
          className={cx('list-group-item__wrapper', {
            dragging: absolutePosition == draggedPosition && isDragging,
          })}
        >
          <div className={cx('dropzone-indicator', { display: moveAbove })} />
          <div
            className={cx('list-group-item', {
              selected,
            })}
          >
            <div className="character-list__item-inner">
              {img}
              <div>
                <h6 className={cx('list-group-item-heading', { withImage: !!character.imageId })}>
                  {character.name || i18n('New Character')}
                </h6>
                <p className="list-group-item-text">{character.description.substr(0, 100)}</p>
              </div>
              <ButtonGroup className="character-list__item-buttons">
                <Button bsSize="small" onClick={this.startEditing}>
                  <Glyphicon glyph="edit" />
                </Button>
                <Button bsSize="small" onClick={this.handleDuplicate}>
                  <FiCopy />
                </Button>
                <Button bsSize="small" onClick={this.handleDelete}>
                  <Glyphicon glyph="trash" />
                </Button>
              </ButtonGroup>
              {this.renderDelete()}
            </div>
          </div>
          <div className={cx('dropzone-indicator', { display: moveBelow })} />
        </div>
      )
    }

    static propTypes = {
      character: PropTypes.object.isRequired,
      characterId: PropTypes.number.isRequired,
      editing: PropTypes.bool.isRequired,
      selected: PropTypes.bool.isRequired,
      select: PropTypes.func.isRequired,
      startEdit: PropTypes.func.isRequired,
      stopEdit: PropTypes.func.isRequired,
      actions: PropTypes.object.isRequired,
      absolutePosition: PropTypes.number,
      key: PropTypes.number,
      isMovingToNewCategory: PropTypes.bool,
      draggedPosition: PropTypes.number,
    }
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  checkDependencies({ redux, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          character: selectors.displayedSingleCharacterSelector(state, ownProps.characterId),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.character, dispatch),
        }
      }
    )(CharacterItem)
  }

  throw new Error('Cannot connect CharacterItem')
}

export default CharacterItemConnector
