import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { isEqual } from 'lodash'

import { selectors, actions } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'

import RichText from '../../rce/RichText'
import ButtonToolbar from '../../ButtonToolbar'
import Button from '../../Button'
import Glyphicon from '../../Glyphicon'

const CardDescription = (props) => {
  const { description, id } = props.card
  const { foci, editing, outlineView, saveEdit, onEsc, card, cardActions } = props

  const selectionForMainCardElement = (name) => {
    const cardId = card.id

    return foci?.find(({ path }) => {
      return isEqual(path, ['card', cardId, name])
    })?.selection
  }

  const handleDescriptionChange = (newDescription, selection) => {
    cardActions.editCardDescription(card.id, newDescription, selection)
  }

  return (
    <div className="outline__description__editing" onKeyDown={onEsc}>
      <RichText
        id={`card-${id}-description`}
        className="outline__description"
        onChange={handleDescriptionChange}
        description={description}
        editable={editing}
        selection={selectionForMainCardElement('description')}
        autoFocus={foci && foci[0] && foci[0].path[2] === 'description' && foci[0].path[1] === id}
      />
      {outlineView === 'fulltext' && <Glyphicon glyph="pencil" />}
      {editing && (
        <ButtonToolbar className="card-dialog__button-bar">
          <Button onClick={saveEdit}>{i18n('Close')}</Button>
        </ButtonToolbar>
      )}
    </div>
  )
}

CardDescription.propTypes = {
  card: PropTypes.object.isRequired,
  foci: PropTypes.array.isRequired,
  editing: PropTypes.bool,
  outlineView: PropTypes.string,
  saveEdit: PropTypes.func.isRequired,
  onEsc: PropTypes.func.isRequired,
  cardActions: PropTypes.object.isRequired,
}

const CardActions = actions.card

const mapStateToProps = (state, ownProps) => {
  return {
    outlineView: selectors.outlineViewSelector(state),
    editing: selectors.editingOutlineCardSelector(state) === ownProps.card.id,
    foci: selectors.outlineCurrentFocusSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    cardActions: bindActionCreators(CardActions, dispatch),
  }
})(CardDescription)
