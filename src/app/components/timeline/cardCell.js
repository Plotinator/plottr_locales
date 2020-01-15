import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import CardDialog from 'components/timeline/cardDialog'
import CardSVGline from 'components/timeline/cardSVGline'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import orientedClassName from 'helpers/orientedClassName'
import MDdescription from 'components/mdDescription'
import TagLabel from 'components/tagLabel'

class CardCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dialogOpen: false,
      creating: false,
      dropping: false,
      dragging: false,
      hovering: false
    }
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleDragStart = (e) => {
    this.setState({dragging: true, hovering: false})
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.card))
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.setState({dropping: false})
  }

  renderDialog () {
    if (!this.state.dialogOpen) return null
    const { card, sceneId, lineId } = this.props
    return <CardDialog
      card={card}
      sceneId={sceneId}
      lineId={lineId}
      labelMap={this.props.labelMap}
      closeDialog={this.closeDialog}
    />
  }

  renderPopover () {
    return <Popover title={this.props.card.title} id={`card-popover-${this.props.card.id}`}>
      <MDdescription className='card__popover-description' labels={this.props.labelMap}
        description={this.props.card.description.substring(0, 1000)}
        darkMode={this.props.ui.darkMode}
      />
      {this.renderTags()}
    </Popover>
  }

  hasLabels () {
    const { card } = this.props
    return card.tags && card.tags.length > 0
  }

  renderTags () {
    var tags = null
    if (this.props.card.tags) {
      tags = this.props.card.tags.map(tId => {
        var tag = _.find(this.props.tags, {id: tId})
        if (!tag) return null
        return <TagLabel tag={tag} key={`timeline-taglabel-${tId}`} />
      })
    }
    return (<div className='card__popover-labels'>
      {tags}
    </div>)
  }

  renderTitle () {
    let title = <div className='card__title'>
      <p>{this.props.card.title}</p>
    </div>
    if (!this.state.dragging && (this.hasLabels() || this.props.card.description)) {
      let placement = 'left'
      if (this.props.ui.orientation === 'horizontal') {
        placement = this.props.scenePosition <= 1 ? 'right' : placement
      } else {
        placement = this.props.linePosition <= 1 ? 'right' : placement
      }
      if (this.props.isZoomed) placement = 'right'
      title = <OverlayTrigger placement={placement} overlay={this.renderPopover()}>
        {title}
      </OverlayTrigger>
    }
    return title
  }

  renderBody () {
    var cardStyle = {
      borderColor: this.props.color
    }
    if (this.state.dragging) {
      cardStyle.opacity = '0.5'
    }
    if (this.props.filtered) {
      cardStyle.opacity = '0.1'
    }
    const body = <div className='card__body' style={cardStyle}
      draggable={true}
      onDragStart={this.handleDragStart}
      onDragEnd={this.handleDragEnd}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
      onClick={() => this.setState({dialogOpen: true})}>
        {this.props.card.title}
    </div>
    if (!this.state.dragging && (this.hasLabels() || this.props.card.description)) {
      let placement = 'left'
      if (this.props.ui.orientation === 'horizontal') {
        placement = this.props.scenePosition <= 1 ? 'right' : placement
      } else {
        placement = this.props.linePosition <= 1 ? 'right' : placement
      }
      if (this.props.isZoomed) placement = 'right'
      return <OverlayTrigger placement={placement} overlay={this.renderPopover()}>
        {body}
      </OverlayTrigger>
    }
    return body
  }

  render () {
    return <Cell>
      <div className='card__cell'>
        <CardSVGline color={this.props.color} orientation={this.props.ui.orientation}/>
        { this.renderBody() }
        { this.renderDialog() }
      </div>
    </Cell>
  }
}

CardCell.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  labelMap: PropTypes.object.isRequired,
  tags: PropTypes.array,
  isZoomed: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  linePosition: PropTypes.number.isRequired,
  scenePosition: PropTypes.number.isRequired
}

function mapStateToProps (state, passedProps) {
  let line = state.lines.find(l => l.id === passedProps.lineId)
  let scene = state.scenes.find(s => s.id === passedProps.sceneId)
  return {
    tags: state.tags,
    ui: state.ui,
    linePosition: line.position,
    scenePosition: scene.position,
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
)(CardCell)
