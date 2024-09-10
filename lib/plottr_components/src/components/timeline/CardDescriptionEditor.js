import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { selectors, actions } from 'wired-up-pltr'

import RichText from '../rce/RichText'

const areEqual = (prevProps, nextProps) => {
  return Object.keys(prevProps).reduce((acc, key) => {
    return prevProps[key] === nextProps[key] && acc
  }, true)
}

const CardDescriptionEditor = ({ cardId, description, editCardDescription, foci }) => {
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
  editCardDescription: PropTypes.func.isRequired,
  foci: PropTypes.array.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  description: selectors.cardDescriptionByIdSelector(
    state,
    // @ts-ignore
    ownProps.cardId
  ),
  foci: selectors.timelineCurrentFocusSelector(state),
})

export default connect(mapStateToProps, { editCardDescription: actions.card.editCardDescription })(
  React.memo(CardDescriptionEditor, areEqual)
)
