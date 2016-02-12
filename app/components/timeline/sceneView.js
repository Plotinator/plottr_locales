import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup, Input } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'

class SceneView extends Component {
  constructor (props) {
    super(props)
    this.state = {hovering: false, editing: false, dragging: false, dropping: false}
  }

  handleFinishEditing (event) {
    if (event.which === 13) {
      var id = this.props.scene.id
      var newTitle = this.refs.titleInput.getValue()
      this.props.actions.editSceneTitle(id, newTitle)
      this.setState({editing: false})
    }
  }

  handleDragStart (e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.scene))
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
    var droppedScene = JSON.parse(json)
    if (!droppedScene.id) return

    this.props.handleReorder(this.props.scene.position, droppedScene.position)
  }

  handleDelete () {
    if (window.confirm(`Do you want to delete this scene: '${this.props.scene.title}'?`)) {
      this.props.actions.deleteScene(this.props.scene.id)
    }
  }

  renderHoverOptions () {
    var style = {visibility: 'hidden'}
    if (this.state.hovering) style.visibility = 'visible'
    return (<div className='scene-list__item__hover-options' style={style}>
      <ButtonGroup>
        <Button onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
        <Button bsStyle='danger' onClick={this.handleDelete.bind(this)}><Glyphicon glyph='trash' /></Button>
      </ButtonGroup>
    </div>)
  }

  renderTitle () {
    if (!this.state.editing) return <span>{this.props.scene.title}</span>
    return (<Input
        type='text'
        defaultValue={this.props.scene.title}
        label='Scene name'
        ref='titleInput'
        autoFocus
        onBlur={() => this.setState({editing: false})}
        onKeyPress={this.handleFinishEditing.bind(this)} />)
  }

  render () {
    var classes = 'scene-list__item__body'
    if (this.state.hovering) classes += ' hover'
    return (<div className='scene-list__item'
      draggable={true}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
      onDragStart={this.handleDragStart.bind(this)}
      onDragEnd={this.handleDragEnd.bind(this)}
      onDragEnter={this.handleDragEnter.bind(this)}
      onDragOver={this.handleDragOver.bind(this)}
      onDragLeave={this.handleDragLeave.bind(this)}
      onDrop={this.handleDrop.bind(this)} >
      {this.renderHoverOptions()}
      <div className={classes}>
        <div className='scene-list__item__title'>
          {this.renderTitle()}
        </div>
      </div>
    </div>)
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired,
  handleReorder: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SceneView)
