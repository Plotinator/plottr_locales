import React from 'react'
import { PropTypes } from 'prop-types'

import UnconnectedRichText from '../rce/RichText'

const areEqual = (prevProps, nextProps) => {
  return Object.keys(prevProps).reduce((acc, key) => {
    if (key === 'description') return acc
    return prevProps[key] === nextProps[key] && acc
  }, true)
}

const CardDescriptionEditorConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)

  const CardDescriptionEditor = ({ cardId, description, darkMode, editCardAttributes }) => {
    const handleDescriptionChange = (newDescription) => {
      editCardAttributes(cardId, { description: newDescription })
    }

    return (
      <RichText
        description={description}
        onChange={handleDescriptionChange}
        editable={true}
        darkMode={darkMode}
        autofocus
      />
    )
  }

  CardDescriptionEditor.propTypes = {
    cardId: PropTypes.number.isRequired,
    description: PropTypes.array.isRequired,
    editCardAttributes: PropTypes.func.isRequired,
    darkMode: PropTypes.bool.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state, ownProps) => ({
        description: selectors.cardDescriptionByIdSelector(state.present, ownProps.cardId),
        darkMode: selectors.isDarkModeSelector(state.present),
      }),
      { editCardAttributes: actions.card.editCardAttributes }
    )(React.memo(CardDescriptionEditor, areEqual))
  }

  throw new Error('Could not connect CardDescriptionEditor')
}

export default CardDescriptionEditorConnector
