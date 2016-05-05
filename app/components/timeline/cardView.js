import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { Label } from 'react-bootstrap'
import CardDialog from 'components/timeline/cardDialog'
import * as CardActions from 'actions/cards'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, creating: false, dropping: false, dragging: false, hovering: false}
  }

  closeDialog () {
    this.setState({dialogOpen: false})
  }

  handleDragStart (e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.card))
    this.setState({dragging: true})
  }

  handleDragEnd () {
    this.setState({dragging: false})
  }

  handleDragEnter (e) {
    this.setState({dropping: true})
  }

  handleDragOver (e) {
    e.preventDefault()
    return false
  }

  handleDragLeave (e) {
    this.setState({dropping: false})
  }

  handleDrop (e) {
    e.stopPropagation()
    this.handleDragLeave()

    var json = e.dataTransfer.getData('text/json')
    var droppedCard = JSON.parse(json)
    if (!droppedCard.id) return

    this.props.actions.editCardCoordinates(droppedCard.id, this.props.lineId, this.props.sceneId)
  }

  render () {
    return this.state.dialogOpen ? this.renderDialog() : this.renderShape()
  }

  renderShape () {
    return this.props.card ? this.renderCard() : this.renderBlank()
  }

  renderCard () {
    var cardStyle = {
      borderColor: this.props.color
    }
    if (this.state.dragging) {
      cardStyle.opacity = '0.5'
    }
    var titleStyle = (this.state.hovering && this.hasLabels()) ? {overflow: 'scroll'} : {}

    return (<div className='card__real'
      draggable={true}
      onDragStart={this.handleDragStart.bind(this)}
      onDragEnd={this.handleDragEnd.bind(this)}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
      style={cardStyle}
      onClick={() => this.setState({dialogOpen: true})} >
        <div className='card__title' style={titleStyle}>{this.renderTitle()}</div>
    </div>)
  }

  renderBlank () {
    var cardClass = 'card__blank'
    if (this.state.dropping) {
      cardClass += ' card__hover'
    }

    return (
      <div className={cardClass}
        onDragEnter={this.handleDragEnter.bind(this)}
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
        onDrop={this.handleDrop.bind(this)}
        onClick={ () => { this.setState({creating: true, dialogOpen: true}) } }
        style={{borderColor: this.props.color}}
      ></div>
    )
  }

  renderDialog () {
    const { card, sceneId, lineId } = this.props
    var key = 'new' + sceneId + lineId
    if (card) key = card.id
    return (
      <CardDialog
        key={key}
        card={card}
        sceneId={sceneId}
        lineId={lineId}
        isNewCard={this.state.creating}
        closeDialog={this.closeDialog.bind(this)} />
    )
  }

  renderTitle () {
    if (this.state.hovering && this.hasLabels()) {
      return this.renderTags()
    } else {
      return this.props.card.title
    }
  }

  hasLabels () {
    const { card } = this.props
    return card.tags && card.tags.length > 0
  }

  renderTags () {
    var tags = null
    if (this.props.card.tags) {
      tags = this.props.card.tags.map(tId => {
        var tag = _.find(this.props.tags, 'id', tId)
        var style = {}
        if (tag.color) style = {backgroundColor: tag.color}
        return <Label bsStyle='info' style={style} key={tId}>{tag.title}</Label>
      })
    }
    return (<div className='labels'>
      {tags}
    </div>)
  }
}

CardView.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  tags: PropTypes.array
}

function mapStateToProps (state) {
  return {
    tags: state.tags
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView)
