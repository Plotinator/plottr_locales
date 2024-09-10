import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { isEqual } from 'lodash'

import { selectors, actions } from 'wired-up-pltr'

import FormGroup from '../../FormGroup'
import TextFormControl from '../../TextFormControl'

const CardTitle = (props) => {
  const { cardActions, foci, editing, card, onKeyPressEsc, onKeyPressEnter } = props

  const [cardTitle, setCardTitle] = useState(card.title)
  /** @type {import('react').MutableRefObject<ReturnType<setTimeout> | null>} */
  const titleChangeTimeoutRef = useRef(null)

  const handleTitleChange = useCallback(
    (value, selection) => {
      setCardTitle(value)

      if (titleChangeTimeoutRef.current) {
        clearTimeout(titleChangeTimeoutRef.current)
      }

      setTimeout(() => {
        cardActions.editCardTitle(props.card.id, value, selection)
      }, 300)
    },
    [cardActions, card.id]
  )

  useEffect(() => {
    if (card.title !== cardTitle) {
      setCardTitle(card.title)
    }
  }, [card.title])

  useEffect(() => {
    return () => {
      if (titleChangeTimeoutRef.current) {
        clearTimeout(titleChangeTimeoutRef.current)
      }
    }
  }, [])

  const selectionForMainCardElement = (name) => {
    const cardId = card.id

    return foci?.find(({ path }) => {
      return isEqual(path, ['card', cardId, name])
    })?.selection
  }

  if (!editing) return null

  return (
    <FormGroup>
      <TextFormControl
        id={`card-${card.id}-title`}
        onKeyPress={onKeyPressEnter}
        onKeyDown={onKeyPressEsc}
        onChange={handleTitleChange}
        autoFocus={foci && foci[0] && foci[0].path[2] === 'title' && foci[0].path[1] === card.id}
        selection={selectionForMainCardElement('title')}
        value={cardTitle}
      />
    </FormGroup>
  )
}

CardTitle.propTypes = {
  cardActions: PropTypes.object,
  card: PropTypes.object.isRequired,
  foci: PropTypes.array.isRequired,
  editing: PropTypes.bool.isRequired,
  selectionForMainCardElement: PropTypes.func.isRequired,
  onKeyPressEsc: PropTypes.func,
  onKeyPressEnter: PropTypes.func,
}

const CardActions = actions.card

const mapStateToProps = (state, ownProps) => {
  return {
    editing: selectors.editingOutlineCardSelector(state) === ownProps.cardId,
    foci: selectors.outlineCurrentFocusSelector(state),
    card: selectors.singleCardOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId,
      ownProps.beatId
    ),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    cardActions: bindActionCreators(CardActions, dispatch),
  }
})(CardTitle)
