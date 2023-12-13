import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { FiCopy } from 'react-icons/fi'

import { t as i18n } from 'plottr_locales'

import ButtonGroup from '../ButtonGroup'
import ButtonToolbar from '../ButtonToolbar'
import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import UnconnectedTextFormControl from '../TextFormControl'
import Button from '../Button'
import UnconnectedColorPicker from '../ColorPicker'
import UnconnectedCategoryPicker from '../CategoryPicker'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { checkDependencies } from '../checkDependencies'

const TagViewConnector = (connector) => {
  const ColorPicker = UnconnectedColorPicker(connector)
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const TextFormControl = UnconnectedTextFormControl(connector)

  const TagView = ({ tag, newTag, darkMode, editing, foci, doneCreating, actions, uiActions }) => {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [hovering, setHovering] = useState(false)
    const [color, setColor] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [categoryId, setCategoryId] = useState(tag.categoryId)
    const [title, setTitle] = useState(tag.title || '')

    useRef(() => {
      return () => {
        if (editing && !newTag) saveEdit()
      }
    }, [])

    useEffect(() => {
      setCategoryId(categoryId)
    }, [categoryId])

    const deleteTag = (e) => {
      e.stopPropagation()
      actions.deleteTag(tag.id)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
    }

    const handleCancel = () => {
      uiActions.finishEditingSelectedTag()
      stopHovering()
      if (newTag) {
        doneCreating()
      }
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveEdit()
      }
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        saveEdit()
      }
    }

    const startEditing = () => {
      uiActions.editSelectedTag()
    }

    const startHovering = () => {
      setHovering(true)
    }

    const stopHovering = () => {
      setHovering(false)
    }

    const handleTitleChange = (value, _selection) => {
      setTitle(value)
    }

    const saveEdit = () => {
      if (title === '') {
        handleCancel()
        return
      }

      let { id } = tag
      var newTitle = title || tag.title
      if (newTag) {
        actions.addCreatedTag({
          title: newTitle,
          color: tag.color || color,
          categoryId: categoryId,
        })
        doneCreating()
      } else {
        actions.editTag(id, newTitle, tag.color || color, categoryId)
      }
      uiActions.finishEditingSelectedTag()
      stopHovering()
    }

    const changeColor = (color) => {
      if (newTag) {
        setColor(color)
      } else {
        let { id, title, categoryId } = tag
        actions.editTag(id, title, color, categoryId)
      }
      setShowColorPicker(false)
      stopHovering()
    }

    const changeCategory = (categoryId) => {
      let { id, title, color } = tag
      setCategoryId(Number(categoryId) || null)
      if (!newTag) {
        actions.editTag(id, title, color, Number(categoryId))
      }
    }

    const renderDelete = () => {
      if (!deleting) return null

      return <DeleteConfirmModal name={tag.title} onDelete={deleteTag} onCancel={cancelDelete} />
    }

    const renderColorPicker = () => {
      if (showColorPicker) {
        var key = 'colorPicker-' + tag.id
        return <ColorPicker key={key} color={tag.color || color} closeDialog={changeColor} />
      } else {
        return null
      }
    }

    const handleDuplicate = () => {
      actions.duplicateTag(tag.id)
    }

    const selectionForMainElement = (name) => {
      const tagId = tag.id

      return foci?.find(({ path }) => {
        return isEqual(path, ['tag', tagId, name])
      })?.selection
    }

    const renderEditing = () => {
      return (
        <div>
          <FormGroup>
            <ControlLabel>{i18n('Tag Name')}</ControlLabel>
            <TextFormControl
              id={`tag-${tag?.id || '<new>'}-title`}
              type="text"
              onChange={handleTitleChange}
              onKeyDown={handleEsc}
              onKeyPress={handleEnter}
              autoFocus
              selection={selectionForMainElement('title')}
              value={title}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{i18n('Category')}</ControlLabel>
            <CategoryPicker type="tags" selectedId={categoryId} onChange={changeCategory} />
          </FormGroup>
          {renderColorPicker()}
          <ButtonToolbar className="tag-list__tag__button-bar">
            <Button bsStyle="success" onClick={saveEdit}>
              {i18n('Save')}
            </Button>
            <Button onClick={handleCancel}>{i18n('Cancel')}</Button>
          </ButtonToolbar>
        </div>
      )
    }

    const renderHoverOptions = () => {
      const { color } = tag
      var style = { visibility: 'hidden' }
      if (hovering) style.visibility = 'visible'
      return (
        <div className="tag-list__tag__hover-options" style={style}>
          <ButtonGroup>
            {newTag ? null : (
              <Button title={i18n('Edit')} onClick={startEditing}>
                <Glyphicon glyph="edit" />
              </Button>
            )}
            {newTag ? null : (
              <Button title={i18n('Duplicate')} onClick={handleDuplicate}>
                <FiCopy />
              </Button>
            )}
            <Button title={i18n('Choose color')} onClick={() => setShowColorPicker(true)}>
              <Glyphicon glyph="tint" />
            </Button>
            {color || color ? (
              <Button bsStyle="warning" title={i18n('No color')} onClick={() => changeColor(null)}>
                <Glyphicon glyph="ban-circle" />
              </Button>
            ) : null}
            {newTag ? null : (
              <Button bsStyle="danger" title={i18n('Delete')} onClick={handleDelete}>
                <Glyphicon glyph="trash" />
              </Button>
            )}
          </ButtonGroup>
        </div>
      )
    }

    const renderTag = () => {
      return (
        <div className="tag-list__tag-normal" onClick={startEditing}>
          <h6>{tag.title}</h6>
        </div>
      )
    }

    let body = null
    if (editing) {
      body = renderEditing()
    } else {
      body = renderTag()
    }
    let styles = {}
    if (tag.color) styles = { border: `2px solid ${tag.color}` }
    if (color) styles = { border: `2px solid ${color}` }

    return (
      <div
        className="tag-list__tag-wrapper"
        onMouseOver={startHovering}
        onMouseLeave={stopHovering}
      >
        {renderDelete()}
        {renderColorPicker()}
        {renderHoverOptions()}
        <div
          className={cx('tag-list__tag', { darkmode: darkMode, editing: editing })}
          style={styles}
        >
          {body}
        </div>
      </div>
    )
  }

  TagView.propTypes = {
    tag: PropTypes.object.isRequired,
    newTag: PropTypes.bool,
    editing: PropTypes.bool,
    doneCreating: PropTypes.func,
    foci: PropTypes.array,
    actions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    darkMode: PropTypes.bool,
  }

  const {
    pltr: { actions, selectors },
  } = connector
  const TagActions = actions.tag
  const UiActions = actions.ui
  const { redux } = connector
  checkDependencies({ actions, TagActions, UiActions, redux })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          darkMode: selectors.isDarkModeSelector(state),
          editing: selectors.isEditingTagSelector(state, ownProps.tag.id),
          foci: selectors.tagCurrentFociSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(TagActions, dispatch),
          uiActions: bindActionCreators(UiActions, dispatch),
        }
      }
    )(TagView)
  }

  throw new Error('Could not connect TagView')
}

export default TagViewConnector
