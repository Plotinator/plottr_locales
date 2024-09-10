import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FaGripLinesVertical } from '@react-icons/all-files/fa/FaGripLinesVertical'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'
import { helpers } from 'pltr'

import Glyphicon from '../../Glyphicon'
import TagLabel from '../../TagLabel'
import Image from '../../images/Image'
import SelectList from '../../SelectList'
import CardDropZone from './CardDropZone'
import CardDescription from './CardDescription'
import FulltextCardView from './FulltextCardView'
import CardTitle from './CardTitle'
import PlanCardView from './PlanCardView'

class CardView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      inDropZone: false,
      dropDepth: 0,
      title: this.props.card.title,
    }

    this.componentRef = null
    this.titleChangeTimeout = null
  }

  shouldComponentUpdate(nextProps, nextState) {
    const stateChanged = Object.keys(nextState).reduce((acc, key) => {
      return acc || nextState[key] !== this.state[key]
    }, false)
    const propsChanged = Object.keys(nextProps).reduce((acc, key) => {
      if (key === 'card' || key === 'selection') return acc
      return acc || nextProps[key] !== this.props[key]
    }, false)
    const tagsChanged = this.props.card.tags !== nextProps.card.tags
    return stateChanged || propsChanged || tagsChanged
  }

  componentWillUnmount() {
    const { editing } = this.props
    if (editing) {
      this.saveEdit()
    }
  }

  saveEdit = () => {
    const { uiActions } = this.props

    uiActions.finishEditingOutlineCard()
    this.deregisterEventListeners()
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  handleEsc = (event) => {
    if (event.which === 27) {
      this.saveEdit()
    }
  }

  handleDragStart = (e) => {
    this.setState({ dragging: true, editing: false })
    this.deregisterEventListeners()
    const { card, index } = this.props
    const lineId = card.lineId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify({ cardId: card.id, lineId, index }))
  }

  handleDragEnd = () => {
    this.setState({ dragging: false })
  }

  registerEventListeners = () => {
    document.addEventListener('click', this.handleClickOutside, true)
  }

  deregisterEventListeners() {
    document.removeEventListener('click', this.handleClickOutside, true)
  }

  handleClickOutside = (e) => {
    // FIXME: this event causes a cascade of events that's *very*
    // expensive.  The purpose is to save the card that we're
    // editing.  It might be better to have that component
    // communicate that it's being edited to the redux store and
    // then, when we hit this point we can decide whether or not to
    // save the card on its behalf.

    const { editing } = this.props

    // Only handle the event if our child is being edited
    if (!editing) return

    // We can't close the editor if we were picking an image, and
    // that's a different component.
    const imagePickerModal = document.querySelector('.image-picker__wrapper')
    if (imagePickerModal) return

    // We can't close the editor if we're inserting an image URL either.
    const urlInputBox = document.querySelector('.modal-dialog')
    if (urlInputBox) return

    if (this.componentRef && !this.componentRef.contains(e.target)) {
      this.saveEdit()
    }
  }

  editOnClick = () => {
    const { uiActions, editing, card } = this.props
    if (!editing) {
      uiActions.startEditingOutlineCard(card.id)
      this.registerEventListeners()
    }
  }

  handleDragEnter = (_e) => {
    // https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
    if (!this.state.dragging) this.setState({ dropDepth: this.state.dropDepth + 1 })
  }

  handleDragOver = (e) => {
    e.preventDefault()
    if (!this.state.dragging) this.setState({ inDropZone: true })
  }

  handleDragLeave = (_e) => {
    if (!this.state.dragging) {
      let dropDepth = this.state.dropDepth
      --dropDepth
      this.setState({ dropDepth: dropDepth })
      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }
    if (this.props.outlineView === 'plan') {
      if (
        !this.componentRef?.current?.contains(_e.relatedTarget) &&
        typeof this.state.inDropZone !== 'undefined'
      ) {
        this.setState({ inDropZone: false })
      }
    }
  }

  handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (this.state.dragging) return
    this.setState({ inDropZone: false, dropDepth: 0, dragging: false })
    this.props.onDropCard()

    const json = e.dataTransfer.getData('text/json')
    try {
      const droppedData = helpers.json.safeParseJSON(json)
      if (!droppedData?.cardId) return

      this.props.reorder({
        current: this.props.card,
        currentIndex: this.props.index,
        dropped: droppedData,
      })
    } catch (_error) {
      // Fail silently.  Something was dropped that didn't have
      // valid JSON data.  (Could be any part of the UI that was
      // dragged but not intended to be dropped here.)
    }
  }

  renderTags() {
    return this.props.card.tags.map((tId) => {
      const tag = this.props.tags.find((t) => t.id == tId)
      if (!tag) return null
      return <TagLabel tag={tag} key={`outline-taglabel-${tId}`} />
    })
  }

  renderChipCloud(ids, list) {
    if (!ids.length) return null

    const chips = ids.map((id, idx) => {
      const thing = list.find((l) => l.id == id)
      if (!thing) return null
      const key = `${idx}-${id}`
      return (
        <div key={key} className="chip">
          <Image size="xs" shape="circle" imageId={thing.imageId} />
          <span>{thing.name}</span>
        </div>
      )
    })

    return <div className="chip-cloud">{chips}</div>
  }

  renderCharacters() {
    const { card, characters } = this.props
    return this.renderChipCloud(card.characters, characters)
  }

  renderPlaces() {
    const { card, places } = this.props
    return this.renderChipCloud(card.places, places)
  }

  renderCardBody = () => {
    const { editing, card, line, characters, tags, places, actions, beatId } = this.props
    const style = { color: line.color }

    return (
      <>
        <div className="outline__card-top">
          <div style={style} className="outline__card__line-title">
            {line.title}
          </div>
          <div
            className={cx('outline__card__grip', {
              editing,
              dragging: this.state.dragging,
            })}
            draggable
            onDragStart={this.handleDragStart}
            onDragEnd={this.handleDragEnd}
          >
            <FaGripLinesVertical />
            {editing ? null : <h5>{card.title}</h5>}
          </div>
        </div>
        <div className={cx('outline__card__description', { editing })} onClick={this.editOnClick}>
          <CardTitle
            cardId={card.id}
            beatId={beatId}
            onKeyPressEnter={this.handleEnter}
            onKeyPressEsc={this.handleEsc}
          />
          <CardDescription saveEdit={this.saveEdit} onEsc={this.handleEsc} card={card} />
          <Glyphicon glyph="pencil" />
        </div>
        <div className="outline-divider" />
        <div className="outline__card-bottom">
          <SelectList
            parentId={card.id}
            type={'Characters'}
            selectedItems={card.characters}
            allItems={characters}
            add={actions.addCharacter}
            remove={actions.removeCharacter}
            horizontal
          />
          <SelectList
            parentId={card.id}
            type={'Places'}
            selectedItems={card.places}
            allItems={places}
            add={actions.addPlace}
            remove={actions.removePlace}
            horizontal
          />
          <SelectList
            parentId={card.id}
            type={'Tags'}
            selectedItems={card.tags}
            allItems={tags}
            add={actions.addTag}
            remove={actions.removeTag}
            horizontal
          />
        </div>
      </>
    )
  }

  render() {
    const {
      card,
      darkMode,
      outlineView,
      editing,
      isFirstCard,
      isLastCard,
      inFirstBeat,
      inLastBeat,
      beatTitle,
      beatId,
    } = this.props
    const isPlanView = outlineView === 'plan'
    const isFulltext = outlineView === 'fulltext'

    return card.isEmpty ? null : isPlanView ? (
      <PlanCardView
        beatId={beatId}
        cardId={card.id}
        cardRef={(ref) => {
          this.componentRef = ref
        }}
        editOnClick={this.editOnClick}
        onKeyPressEsc={this.handleEsc}
        onKeyPressEnter={this.handleEnter}
        onDragEnterCard={this.handleDragEnter}
        onDragOverCard={this.handleDragOver}
        onDragLeaveCard={this.handleDragLeave}
        onDropCard={this.handleDrop}
        onDragCardStart={this.handleDragStart}
        onDragCardEnd={this.handleDragEnd}
        dragging={this.state.dragging}
        inDropZone={this.state.inDropZone}
      />
    ) : isFulltext ? (
      <FulltextCardView
        isFirstCard={isFirstCard}
        isLastCard={isLastCard}
        inFirstBeat={inFirstBeat}
        inLastBeat={inLastBeat}
        beatTitle={beatTitle}
        editOnClick={this.editOnClick}
        saveEdit={this.saveEdit}
        onEsc={this.handleEsc}
        cardRef={(ref) => {
          this.componentRef = ref
        }}
        cardId={card.id}
        beatId={beatId}
      />
    ) : (
      <div
        id={`card-${card.id}`}
        ref={(ref) => {
          this.componentRef = ref
        }}
        className={cx('outline__card-wrapper', {
          editing,
        })}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        {this.state.inDropZone ? <CardDropZone inDropZone={this.state.inDropZone} /> : null}
        <div
          className={cx('outline-list__card-view', {
            darkmode: darkMode,
          })}
        >
          {this.renderCardBody()}
        </div>
      </div>
    )
  }
}

CardView.propTypes = {
  beatId: PropTypes.number.isRequired,
  card: PropTypes.object.isRequired,
  selection: PropTypes.object,
  index: PropTypes.number.isRequired,
  reorder: PropTypes.func.isRequired,
  line: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  darkMode: PropTypes.bool,
  actions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired,
  images: PropTypes.object,
  foci: PropTypes.array.isRequired,
  editing: PropTypes.bool,
  outlineView: PropTypes.string,
  cardDescription: PropTypes.array,
  onDragCardStart: PropTypes.func,
  onDropCard: PropTypes.func,
  showFulltextCardTitle: PropTypes.bool,
  isFirstCard: PropTypes.bool,
  isLastCard: PropTypes.bool,
  inFirstBeat: PropTypes.bool,
  inLastBeat: PropTypes.bool,
  beatTitle: PropTypes.string,
  showFulltextBeatTitle: PropTypes.bool,
}

const CardActions = actions.card
const UIActions = actions.ui

const mapStateToProps = (state, ownProps) => {
  return {
    card: selectors.singleCardOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId,
      ownProps.beatId
    ),
    line: selectors.cardsLineOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId
    ),
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
    tags: selectors.sortedTagsSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    foci: selectors.outlineCurrentFocusSelector(state),
    outlineView: selectors.outlineViewSelector(state),
    cardDescription: selectors.cardDescriptionByIdSelector(
      state,
      // @ts-ignore
      ownProps.cardId
    ),
    editing: selectors.editingOutlineCardSelector(state) === ownProps.cardId,
    showFulltextCardTitle: selectors.showOutlineFulltextCardTitleSelector(state),
    showFulltextBeatTitle: selectors.showOutlineFulltextBeatTitleSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(CardActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
})(CardView)
