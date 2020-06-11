import _ from 'lodash'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, FormGroup,
  ControlLabel, Tooltip, OverlayTrigger, Glyphicon } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'
import CategoryPicker from '../CategoryPicker'
import ErrorBoundary from '../../containers/ErrorBoundary'
import CharacterEditDetails from './CharacterEditDetails'
import CharacterDetails from './CharacterDetails'
import SelectList from '../selectList'
import BookSelectList from '../story/BookSelectList'

class CharacterView extends Component {
  state = {editing: false}
  // renderAssociations () {
  //   let cards = null
  //   let notes = null
  //   if (this.props.character.cards.length > 0) {
  //     cards = this.renderCardAssociations()
  //   }
  //   if (this.props.character.noteIds.length > 0) {
  //     notes = this.renderNoteAssociations()
  //   }
  //   if (cards && notes) {
  //     return [cards, <span key='ampersand'> & </span>, notes]
  //   } else {
  //     return cards || notes
  //   }
  // }

  // renderCardAssociations () {
  //   if (!this.props.character.cards) return null
  //   if (!this.props.character.cards.length) return null

  //   let label = i18n('{count, plural, one {1 card} other {# cards}}', { count: this.props.character.cards.length })
  //   let cardsAssoc = this.props.character.cards.reduce((arr, cId) => {
  //     let card = this.props.cards.find(c => c.id == cId)
  //     if (card) return arr.concat(card.title)
  //     return arr
  //   }, []).join(', ')
  //   let tooltip = <Tooltip id='card-association-tooltip'>{cardsAssoc}</Tooltip>
  //   return <OverlayTrigger placement='top' overlay={tooltip} key='card-association'>
  //     <span>{label}</span>
  //   </OverlayTrigger>
  // }

  // renderNoteAssociations () {
  //   if (!this.props.character.noteIds) return null
  //   if (!this.props.character.noteIds.length) return null

  //   let label = i18n('{count, plural, one {1 note} other {# notes}}', { count: this.props.character.noteIds.length })
  //   let noteAssoc = this.props.character.noteIds.reduce((arr, nId) => {
  //     let note = this.props.notes.find(n => n.id == nId)
  //     if (note) return arr.concat(note.title)
  //     return arr
  //   }, []).join(', ')
  //   let tooltip = <Tooltip id='notes-association-tooltip'>{noteAssoc}</Tooltip>
  //   return <OverlayTrigger placement='top' overlay={tooltip} key='note-association'>
  //     <span>{label}</span>
  //   </OverlayTrigger>
  // }

  render () {
    if (this.state.editing) window.SCROLLWITHKEYS = false
    else window.SCROLLWITHKEYS = true

    const { character, tags, actions } = this.props

    return <div className='character-list__character-view'>
      <div className='character-list__character-view__left-side'>
        <BookSelectList
          selectedBooks={character.bookIds}
          parentId={character.id}
          add={actions.addBook}
          remove={actions.removeBook}
        />
        <SelectList
          parentId={character.id} type={'Tags'}
          selectedItems={character.tags}
          allItems={tags}
          add={actions.addTag}
          remove={actions.removeTag}
        />
      </div>
      <div className='character-list__character-view__right-side'>
        <ErrorBoundary>
          { this.state.editing ?
            <CharacterEditDetails characterId={character.id} finishEditing={() => this.setState({editing: false})} />
            :
            <CharacterDetails characterId={character.id} startEditing={() => this.setState({editing: true})}/>
          }
        </ErrorBoundary>
      </div>
    </div>
  }

  static propTypes = {
    characterId: PropTypes.number.isRequired,
    character: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state, ownProps) {
  return {
    character: state.characters.find(ch => ch.id == ownProps.characterId),
    ui: state.ui,
    tags: state.tags,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterView)
