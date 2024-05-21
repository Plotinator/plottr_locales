import React, { useCallback } from 'react'
import { PropTypes } from 'prop-types'
import { isEqual } from 'lodash'

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

  const CardDescriptionEditor = ({ cardId, description, selection, editCardDescription, foci }) => {
    const selectionForMainCardElement = (name) => {
      return foci?.find(({ path }) => {
        return isEqual(path, ['card', cardId, name])
      })?.selection
    }

    const handleDescriptionChange = useCallback(
      (newDescription, selection) => {
        editCardDescription(cardId, newDescription, selection)
      },
      [cardId]
    )

    return (
      <RichText
        id={`card-${cardId}-description`}
        description={description}
        onChange={handleDescriptionChange}
        editable
        autoFocus={foci && foci[0] && foci[0].path[2] === 'description'}
        selection={selectionForMainCardElement('description')}
      />
    )
  }

  CardDescriptionEditor.propTypes = {
    cardId: PropTypes.number.isRequired,
    description: PropTypes.array.isRequired,
    selection: PropTypes.object,
    editCardDescription: PropTypes.func.isRequired,
    foci: PropTypes.array.isRequired,
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
        description: selectors.cardDescriptionByIdSelector(state, ownProps.cardId),
        foci: selectors.timelineCurrentFocusSelector(state),
      }),
      { editCardDescription: actions.card.editCardDescription }
    )(React.memo(CardDescriptionEditor, areEqual))
  }

  throw new Error('Could not connect CardDescriptionEditor')
}

export default CardDescriptionEditorConnector
