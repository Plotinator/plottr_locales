import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import CardCell from 'components/timeline/cardCell'
import CardSVGline from 'components/timeline/cardSVGline'
import BlankCard from 'components/timeline/blankCard'
import LineTitleCell from 'components/timeline/lineTitleCell'
import SceneInsertCell from 'components/timeline/SceneInsertCell'
import TopRow from 'components/timeline/TopRow'
import * as UIActions from 'actions/ui'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import { reorderList, insertScene } from 'helpers/lists'
import SceneTitleCell from 'components/timeline/SceneTitleCell'

class TimelineTable extends Component {

  cardIsFiltered (card) {
    if (!card) return false
    const filter = this.state.filter
    if (filter == null) return true
    let filtered = true
    if (card.tags) {
      card.tags.forEach((tId) => {
        if (filter['tag'].indexOf(tId) !== -1) filtered = false
      })
    }
    if (card.characters) {
      card.characters.forEach((cId) => {
        if (filter['character'].indexOf(cId) !== -1) filtered = false
      })
    }
    if (card.places) {
      card.places.forEach((pId) => {
        if (filter['place'].indexOf(pId) !== -1) filtered = false
      })
    }
    return filtered
  }

  labelMap () {
    var mapping = {}
    this.props.tags.forEach((t) => {
      mapping[t.title.toLowerCase()] = {color: t.color, id: t.id, type: 'Tag'}
    })
    this.props.characters.forEach((c) => {
      mapping[c.name.toLowerCase()] = {color: c.color, id: c.id, type: 'Character'}
    })
    this.props.places.forEach((p) => {
      mapping[p.name.toLowerCase()] = {color: p.color, id: p.id, type: 'Place'}
    })
    return mapping
  }

  cards (lineId) {
    var cards = _.filter(this.props.cards, (card) => {
      return card.lineId === lineId
    })
    return _.sortBy(cards, 'position')
  }

  handleReorderScenes = (originalPosition, droppedPosition) => {
    const scenes = reorderList(originalPosition, droppedPosition, this.props.scenes)
    this.props.sceneActions.reorderScenes(scenes)
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    this.props.lineActions.reorderLines(lines)
  }

  sceneMapping () {
    return this.props.scenes.reduce((acc, scene) => {
      acc[scene.position] = scene.id
      return acc
    }, {})
  }

  lineMapping () {
    return this.props.lines.reduce((acc, line) => {
      acc[line.position] = line
      return acc
    }, {})
  }

  handleInsertNewScene = (nextPosition, lineId) => {
    // IDEA: lineId could be used to create a new card at the same time

    const scenes = insertScene(nextPosition, this.props.scenes)
    this.props.sceneActions.reorderScenes(scenes)
  }

  renderLines () {
    const sceneMap = this.sceneMapping()
    const labelMap = this.labelMap()
    const lines = _.sortBy(this.props.lines, 'position')
    return lines.map(line => {
      return <Row key={`lineId-${line.id}`}>
        <LineTitleCell line={line} isZoomed={this.props.isZoomed} handleReorder={this.handleReorderLines}/>
        { this.renderCardsByScene(line, sceneMap, labelMap) }
      </Row>
    }).concat(
      <Row key='insert-line'>
        <Cell>
          <div
            className='line-list__append-line'
            onClick={() => this.props.lineActions.addLine()}
          >
            <div className='line-list__append-line-wrapper'>
              <Glyphicon glyph='plus' />
            </div>
          </div>
        </Cell>
      </Row>
    )
  }

  renderInsertsRow (scene, lineMap) {

    return
  }

  renderScenes () {
    const lineMap = this.lineMapping()
    const labelMap = this.labelMap()
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map(scene => {
      const inserts = Object.keys(lineMap).flatMap(linePosition => {
        const line = lineMap[linePosition];
        return <SceneInsertCell key={`${linePosition}-insert`} isInSceneList={false} scenePosition={scene.position} handleInsert={this.handleInsertNewScene} color={line.color} orientation={this.props.ui.orientation} needsSVGline={true} />
      })
      return [<Row key={`sceneId-${scene.id}`}>
        <SceneInsertCell isInSceneList={true} scenePosition={scene.position} handleInsert={this.handleInsertNewScene}/>
        { inserts }
      </Row>,
      <Row key={`sceneId-${scene.id}-insert`}>
        <SceneTitleCell scene={scene} handleReorder={this.handleReorderScenes} isZoomed={this.props.isZoomed} />
        { this.renderCardsByLine(scene, lineMap, labelMap) }
      </Row>
      ]
    }).concat(
      <Row key='last-insert'>
        <SceneInsertCell isInSceneList={true} handleInsert={() => this.props.sceneActions.addScene()} isLast={true}/>
      </Row>
    )
  }

  renderRows () {
    if (this.props.orientation === 'horizontal') {
      return this.renderLines()
    } else {
      return this.renderScenes()
    }
  }

  renderCardsByScene (line, sceneMap, labelMap) {
    return Object.keys(sceneMap).flatMap(scenePosition => {
      let filtered = false
      const cells = []
      let sceneId = sceneMap[scenePosition]
      let card = _.find(this.cards(line.id), {sceneId: sceneId})
      cells.push(<SceneInsertCell key={`${scenePosition}-insert`} isInSceneList={false} scenePosition={Number(scenePosition)} lineId={line.id} handleInsert={this.handleInsertNewScene} needsSVGline={scenePosition === "0"} orientation={this.props.ui.orientation} color={line.color}/>)
      if (card) {
        if (!this.props.filterIsEmpty && this.cardIsFiltered(card)) {
          filtered = true
        }
        cells.push(<CardCell
          key={`cardId-${card.id}`} card={card}
          sceneId={sceneId} lineId={line.id}
          labelMap={labelMap}
          color={line.color} filtered={filtered}
          isZoomed={this.props.isZoomed} />)
      } else {
        cells.push(<BlankCard sceneId={sceneId} lineId={line.id}
          key={`blank-${sceneId}-${line.id}`}
          color={line.color} isZoomed={this.props.isZoomed}/>)
      }
      return cells
    })
  }

  renderCardsByLine (scene, lineMap, labelMap) {
    return Object.keys(lineMap).flatMap(linePosition => {
      let filtered = false
      const cells = []
      let line = lineMap[linePosition]
      let card = _.find(this.cards(line.id), {sceneId: scene.id})
      if (card) {
        if (!this.props.filterIsEmpty && this.cardIsFiltered(card)) {
          filtered = true
        }
        cells.push(<CardCell
          key={`cardId-${card.id}`} card={card}
          sceneId={scene.id} lineId={line.id}
          labelMap={labelMap}
          color={line.color} filtered={filtered}
          isZoomed={this.props.isZoomed} />)
      } else {
        cells.push(<BlankCard sceneId={scene.id} lineId={line.id}
          key={`blank-${scene.id}-${line.id}`}
          color={line.color} isZoomed={this.props.isZoomed}/>)
      }
      return cells
    })
  }

  renderSpacer (color) {
    return <Cell key='placeholder'>
      <div>
        <CardSVGline color={color} spacer={true} orientation={this.props.ui.orientation}/>
        <div className='line-list__spacer'></div>
      </div>
    </Cell>
  }

  render () {
    const rows = this.renderRows()

    return [<TopRow key='top-row' isZoomed={this.props.isZoomed}/>, rows]
  }
}

TimelineTable.propTypes = {
  scenes: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  isZoomed: PropTypes.bool,
  zoomState: PropTypes.string,
  zoomIndex: PropTypes.number,
  filter: PropTypes.object,
  filterIsEmpty: PropTypes.bool,
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    lines: state.lines,
    cards: state.cards,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineTable)