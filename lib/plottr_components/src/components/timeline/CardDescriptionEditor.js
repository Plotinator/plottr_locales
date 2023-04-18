import React, { useCallback } from 'react'
import { PropTypes } from 'prop-types'

import UnconnectedRichText from '../rce/RichText'

import { checkDependencies } from '../checkDependencies'

const areEqual = (prevProps, nextProps) => {
  return Object.keys(prevProps).reduce((acc, key) => {
    return prevProps[key] === nextProps[key] && acc
  }, true)
}

const CardDescriptionEditorConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)

  const {
    pltr: { helpers, selectors },
  } = connector

  const CardDescriptionEditor = ({
    cardId,
    description,
    selection,
    editCardAttributes,
    // Needed to trigger undo on child components
    undoId,
  }) => {
    const editorPath = helpers.editors.cardDescriptionEditorPath(cardId)
    checkDependencies({ editorPath })

    const handleDescriptionChange = useCallback(
      (newDescription, selection) => {
        editCardAttributes(
          cardId,
          newDescription ? { description: newDescription } : null,
          editorPath,
          selection
        )
      },
      [cardId, editorPath]
    )

    return (
      <RichText
        id={editorPath}
        description={description}
        selection={selection}
        onChange={handleDescriptionChange}
        editable
        autofocus
      />
    )
  }

  CardDescriptionEditor.propTypes = {
    cardId: PropTypes.number.isRequired,
    description: PropTypes.array.isRequired,
    selection: PropTypes.object,
    editCardAttributes: PropTypes.func.isRequired,
    undoId: PropTypes.number,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  checkDependencies({ redux, selectors, actions, helpers })

  if (redux) {
    const { connect } = redux

    return connect(
      (state, ownProps) => ({
        undoId: selectors.undoIdSelector(state),
        description: selectors.cardDescriptionByIdSelector(state, ownProps.cardId),
        selection: selectors.selectionSelector(
          state,
          helpers.editors.cardDescriptionEditorPath(ownProps.cardId)
        ),
      }),
      { editCardAttributes: actions.card.editCardAttributes }
    )(React.memo(CardDescriptionEditor, areEqual))
  }

  throw new Error('Could not connect CardDescriptionEditor')
}

export default CardDescriptionEditorConnector
