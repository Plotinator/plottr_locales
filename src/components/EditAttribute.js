import React, { useState, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { isEqual } from 'lodash'

import RichTextConnector from './rce/RichText'
import DeleteConfirmModal from './dialogs/DeleteConfirmModal'
import Glyphicon from './Glyphicon'
import ControlLabel from './ControlLabel'
import FormGroup from './FormGroup'
import UnconnectedTextFormControl from './TextFormControl'
import Button from './Button'
import { checkDependencies } from './checkDependencies'

const areEqual = (prevProps, nextProps) => {
  if (prevProps.entity !== nextProps.entity && isEqual(prevProps.entity, nextProps.entity)) {
    return (
      prevProps.index === nextProps.index &&
      prevProps.entityType === nextProps.entityType &&
      prevProps.value === nextProps.value &&
      prevProps.name === nextProps.name &&
      prevProps.id === nextProps.id &&
      prevProps.type === nextProps.type &&
      prevProps.jumpCounter === nextProps.jumpCounter
    )
  }

  for (const key of Object.keys(prevProps)) {
    if (prevProps[key] !== nextProps[key]) {
      return false
    }
  }
  return true
}
const EditAttributeConnector = (connector) => {
  const RichText = RichTextConnector(connector)
  const TextFormControl = UnconnectedTextFormControl(connector)

  const {
    platform: { undo, redo, log, openExternal },
  } = connector

  checkDependencies({ undo, redo, log })

  const EditAttribute = ({
    templateAttribute,
    name,
    id,
    type,
    description,
    link,
    inputId,
    value,
    index,
    darkMode,
    selection,
    onChange,
    onSave,
    onSaveAndClose,
    removeAttribute,
    editAttribute,
    autoFocus,
  }) => {
    const [deleting, setDeleting] = useState(false)
    const [editing, setEditing] = useState(false)

    const editTitleRef = useRef()

    useEffect(() => {
      if (editTitleRef.current) {
        if (typeof editTitleRef.current?.focus === 'function') {
          editTitleRef.current.focus()
        }
      }
    }, [editing])

    const saveEdits = (newName) => {
      if (!newName) {
        setEditing(false)
        return false
      }
      editAttribute(index, { id, name, type }, { id, name: newName, type })
      setEditing(false)
      return true
    }

    const Label = () => (
      <div className="card-dialog__custom-attributes-label">
        <input
          ref={editTitleRef}
          className={cx('card-dialog__custom-attributes-editable-label', {
            'card-dialog__custom-attributes-editable-label--with-underline': editing,
            'custom-attr-item__input--hidden': !editing,
            darkmode: darkMode,
          })}
          defaultValue={name}
          onBlur={(event) => {
            saveEdits(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.which === 13) {
              saveEdits(event.target.value)
            }
          }}
        />
        {!editing ? <ControlLabel>{name}</ControlLabel> : null}
        {!templateAttribute ? (
          <div className="card-dialog__custom-attributes-edit-controls">
            <Button
              bsSize="small"
              onClick={() => {
                setEditing(!editing)
              }}
            >
              <Glyphicon glyph="edit" />
            </Button>
            <Button
              bsSize="small"
              onClick={() => {
                setDeleting(true)
              }}
            >
              <Glyphicon glyph="trash" />
            </Button>
          </div>
        ) : null}
      </div>
    )

    const Description = () => {
      if (editing) return null
      if (!description) return null

      let anchor = null
      if (link) {
        anchor = (
          <a className="template-picker__link dark" title={link} onClick={() => openExternal(link)}>
            <Glyphicon glyph="link" />
          </a>
        )
      }

      return (
        <p className="template-attr__description-label">
          {description}
          {anchor}
        </p>
      )
    }

    const onShortDescriptionKeyPress = useMemo(
      () => (event) => {
        if (event.which === 13) {
          if (onSave) onSave()
        }
      },
      [onSaveAndClose, onSave]
    )

    const onShortDescriptionKeyDown = useMemo(
      () => (event) => {
        if (event.which === 27) {
          if (onSave) onSave()
          return
        }
        if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          if (event.shiftKey) {
            redo()
          } else {
            undo()
          }
          return
        }
        // On Linux, redo is CTRL+y
        if (event.key === 'y' && event.ctrlKey) {
          event.preventDefault()
          redo()
          return
        }
      },
      [onSave]
    )

    return (
      <>
        {deleting ? (
          <DeleteConfirmModal
            name={name}
            onDelete={() => removeAttribute(name, id)}
            onCancel={() => setDeleting(false)}
          />
        ) : null}
        {type === 'paragraph' ? (
          <div className="card-dia<log__custom-attributes__wrapper">
            <Label />
            <Description />
            <RichText
              id={inputId}
              description={value || []}
              onChange={onChange}
              selection={selection}
              editable
              autoFocus={autoFocus}
            />
          </div>
        ) : (
          <FormGroup>
            <Label />
            <Description />
            <TextFormControl
              value={value || ''}
              type="text"
              id={inputId || `${name}Input`}
              onKeyDown={onShortDescriptionKeyDown}
              onKeyPress={onShortDescriptionKeyPress}
              onChange={onChange}
              autoFocus={autoFocus}
              selection={selection}
            />
          </FormGroup>
        )}
      </>
    )
  }

  EditAttribute.propTypes = {
    templateAttribute: PropTypes.bool,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string,
    link: PropTypes.string,
    index: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    valueSelector: PropTypes.func,
    inputId: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    darkMode: PropTypes.bool.isRequired,
    selection: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onSaveAndClose: PropTypes.func,
    removeAttribute: PropTypes.func.isRequired,
    editAttribute: PropTypes.func.isRequired,
    autoFocus: PropTypes.bool,
    jumpCounter: PropTypes.number,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux
    const mapDispatchToProps = () => {
      const initialActions = {
        removeAttribute: () => {
          throw new Error('Using default edit attribute actions object')
        },
        editAttribute: () => {
          throw new Error('Using default edit attribute actions object')
        },
      }
      let boundActions = initialActions
      return (dispatch, { entityType }) => {
        if (boundActions === initialActions) {
          const customAttributeActions = bindActionCreators(actions.customAttribute, dispatch)
          const attributesActions = bindActionCreators(actions.attributes, dispatch)

          switch (entityType) {
            case 'character': {
              boundActions = {
                // Other attributes are still keyed by name :/
                removeAttribute: attributesActions.deleteCharacterAttirbuteAdaptor,
                // An adaptor because the old interface for editing
                // attributes is super-janky.
                editAttribute: attributesActions.editCharacterAttributeMetadataAdaptor,
              }
              break
            }

            case 'place': {
              boundActions = {
                removeAttribute: customAttributeActions.removePlaceAttr,
                editAttribute: customAttributeActions.editPlaceAttr,
              }
              break
            }

            case 'scene': {
              boundActions = {
                removeAttribute: customAttributeActions.removeCardAttr,
                editAttribute: customAttributeActions.editCardAttr,
              }
              break
            }

            case 'note': {
              boundActions = {
                removeAttribute: customAttributeActions.removeNoteAttr,
                editAttribute: customAttributeActions.editNoteAttr,
              }
              break
            }

            default: {
              log.warn(`${entityType} actions not implemented`)
              boundActions = {
                removeAttribute: () => {},
                editAttribute: () => {},
              }
              break
            }
          }
          return boundActions
        } else {
          return boundActions
        }
      }
    }

    return connect(
      (state, ownProps) => ({
        ...(ownProps.valueSelector ? { value: ownProps.valueSelector(state) } : {}),
        darkMode: selectors.isDarkModeSelector(state),
        jumpCounter: selectors.jumpCounterSelector(state),
      }),
      mapDispatchToProps
    )(React.memo(EditAttribute, areEqual))
  }

  throw new Error('No connecter found for EditAttribute')
}

export default EditAttributeConnector
