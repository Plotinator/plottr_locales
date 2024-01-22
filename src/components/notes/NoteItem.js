import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import prettydate from 'pretty-date'
import { FiCopy } from 'react-icons/fi'

import { t as i18n } from 'plottr_locales'
import { isNotDroppingToSamePosition } from 'pltr/v2/helpers/lists'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'
import { checkDependencies } from '../checkDependencies'

const NoteItemConnector = (connector) => {
  const Image = UnconnectedImage(connector)

  class NoteItem extends Component {
    state = {
      deleting: false,
      hovering: false,
      newNoteIdPosition: null,
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
        if (node) node.scrollIntoView?.()
      }
    }

    deleteNote = (e) => {
      e.stopPropagation()
      this.props.actions.deleteNote(this.props.note.id)
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

    selectNote = () => {
      const { note, selected, select, startEdit } = this.props
      if (selected) {
        startEdit()
      } else {
        select(note.id)
      }
    }

    startHovering = () => {
      this.setState({ hovering: true })
    }

    stopHovering = () => {
      this.setState({ hovering: false })
    }

    startEditing = (e) => {
      e.stopPropagation()
      if (this.props.editing) {
        this.props.stopEdit()
      } else {
        this.props.select(this.props.note.id)
        this.props.startEdit()
      }
    }

    handleDuplicate = () => {
      this.props.actions.duplicateNote(this.props.note.id)
    }

    handleDragOver = (e) => {
      e.preventDefault()
      const { note, draggedPosition, isMovingToNewCategory, absolutePosition } = this.props
      const { newNoteIdPosition, moveUp } = this.state
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
      if (newNoteIdPosition != note.id) {
        this.setState({ newNoteIdPosition: note.id })
      }
    }

    handleDragLeave = (e) => {
      e.preventDefault()

      if (
        !this.ref.current.contains(e.relatedTarget) &&
        typeof this.state.newNoteIdPosition !== 'undefined'
      ) {
        this.setState({
          newNoteIdPosition: null,
          moveUp: null,
        })
      }
    }

    handleDropItem = (e) => {
      e.stopPropagation()
      e.preventDefault()
      const { note } = this.props
      const { moveUp } = this.state

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
      this.props.actions.reorderNotes(
        droppedData.id,
        droppedData.position,
        note.position,
        note.categoryId || null,
        moveUp ? 'up' : 'down'
      )
      this.setState({
        newNoteIdPosition: null,
        moveUp: null,
        isDragging: false,
      })
    }

    handleDragStart = (e) => {
      this.setState({ isDragging: true })
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify({ ...this.props.note }))
    }

    handleDragEnd = (e) => {
      this.setState({ isDragging: false })
    }

    handleDragEnter = (e) => {
      e.preventDefault()
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.note.title || i18n('New Note')}
          onDelete={this.deleteNote}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderHoverOptions = () => {
      return (
        <ButtonGroup className="note-list__item-buttons">
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
      const { note, selected, absolutePosition, draggedPosition } = this.props
      const { newNoteIdPosition, moveUp, isDragging } = this.state

      const isDroppable =
        Number.isInteger(newNoteIdPosition) &&
        note.id == newNoteIdPosition &&
        absolutePosition != draggedPosition
      const moveBelow = moveUp !== null && !moveUp && isDroppable
      const moveAbove = moveUp !== null && moveUp && !moveBelow && isDroppable

      let img = null
      if (note.imageId) {
        img = (
          <div className="note-list__item-inner__image-wrapper">
            <Image responsive imageId={note.imageId} />
          </div>
        )
      }
      let lastEdited = null
      if (note.lastEdited) {
        lastEdited = (
          <p className="list-group-item-text secondary-text">
            {prettydate.format(new Date(note.lastEdited))}
          </p>
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
          className={cx('list-group-item__wrapper', {
            dragging: absolutePosition == draggedPosition && isDragging,
          })}
        >
          <div className={cx('dropzone-indicator', { display: moveAbove })} />
          <div
            className={cx('list-group-item', {
              selected,
            })}
            onClick={this.selectNote}
          >
            {this.renderDelete()}
            <div className="note-list__item-inner">
              {img}
              <div>
                <h6 className={cx('list-group-item-heading', { withImage: !!note.imageId })}>
                  {note.title || i18n('New Note')}
                </h6>
                {lastEdited}
              </div>
              {this.renderHoverOptions()}
            </div>
          </div>
          <div className={cx('dropzone-indicator', { display: moveBelow })} />
        </div>
      )
    }

    static propTypes = {
      editing: PropTypes.bool.isRequired,
      note: PropTypes.object.isRequired,
      selected: PropTypes.bool.isRequired,
      select: PropTypes.func.isRequired,
      startEdit: PropTypes.func.isRequired,
      stopEdit: PropTypes.func.isRequired,
      actions: PropTypes.object.isRequired,
      key: PropTypes.number,
      isMovingToNewCategory: PropTypes.bool,
      draggedPosition: PropTypes.number,
      absolutePosition: PropTypes.number,
    }
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  checkDependencies({ redux, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux
    const NoteActions = actions.note

    return connect(null, (dispatch) => {
      return {
        actions: bindActionCreators(NoteActions, dispatch),
      }
    })(NoteItem)
  }

  throw new Error('Could not connect NoteItem')
}

export default NoteItemConnector
