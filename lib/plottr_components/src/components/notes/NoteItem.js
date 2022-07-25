import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import prettydate from 'pretty-date'
import { FiCopy } from 'react-icons/fi'

import { t as i18n } from 'plottr_locales'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'
import UnconnectedPlottrFloater from '../PlottrFloater'
import { checkDependencies } from '../checkDependencies'

const NoteItemConnector = (connector) => {
  const Image = UnconnectedImage(connector)
  const Floater = UnconnectedPlottrFloater(connector)

  class NoteItem extends Component {
    state = { deleting: false, hovering: false }

    constructor(props) {
      super(props)
      this.ref = React.createRef()
    }

    componentDidMount() {
      this.scrollIntoView()
    }

    componentDidUpdate() {
      this.scrollIntoView()
    }

    scrollIntoView = () => {
      if (this.props.selected) {
        const node = this.ref.current
        if (node) node.scrollIntoView()
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
      this.props.select(this.props.note.id)
      this.props.startEdit()
    }

    handleDuplicate = () => {
      this.props.actions.duplicateNote(this.props.note.id)
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
        <ButtonGroup className="btn-group__list-group-item">
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
      const { note, selected } = this.props
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
      const klasses = cx('list-group-item', { selected: selected })
      return (
        <div onMouseOver={this.startHovering} onMouseLeave={this.stopHovering}>
          <Floater
            hideArrow
            open={selected || this.state.hovering}
            placement="bottom"
            component={this.renderHoverOptions}
            zIndex={1}
          >
            <div className={klasses} ref={this.ref} onClick={this.selectNote}>
              {this.renderDelete()}
              <div className="note-list__item-inner">
                {img}
                <div>
                  <h6 className={cx('list-group-item-heading', { withImage: !!note.imageId })}>
                    {note.title || i18n('New Note')}
                  </h6>
                  {lastEdited}
                </div>
              </div>
            </div>
          </Floater>
        </div>
      )
    }

    static propTypes = {
      note: PropTypes.object.isRequired,
      selected: PropTypes.bool.isRequired,
      select: PropTypes.func.isRequired,
      startEdit: PropTypes.func.isRequired,
      stopEdit: PropTypes.func.isRequired,
      actions: PropTypes.object.isRequired,
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
