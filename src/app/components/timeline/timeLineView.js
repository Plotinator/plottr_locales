import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Navbar, Nav, NavItem, Button, ButtonGroup, Glyphicon, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import SceneListView from 'components/timeline/sceneListView'
import LineListView from 'components/timeline/lineListView'
import FilterList from 'components/filterList'
import * as UIActions from 'actions/ui'

const ZOOM_STATES = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3]
const INITIAL_ZOOM_INDEX = 4
const INITIAL_ZOOM_STATE = 'initial'
const FIT_ZOOM_STATE = 'fit'

var scrollInterval = null

class TimeLineView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filter: null,
      zoomState: INITIAL_ZOOM_STATE,
      zoomIndex: INITIAL_ZOOM_INDEX,
      scrollTarget: 0
    }
  }

  // ////////////////
  //  filtering   //
  // //////////////

  updateFilter (filter) {
    this.setState({ filter })
  }

  filterIsEmpty () {
    let filter = this.state.filter
    return filter == null ||
      (filter['tag'].length === 0 &&
      filter['character'].length === 0 &&
      filter['place'].length === 0)
  }

  // ////////////////
  //   zooming    //
  // //////////////

  scale () {
    var elem = this.refs.timeline
    var scale = ZOOM_STATES[this.state.zoomIndex]
    if (this.state.zoomState === FIT_ZOOM_STATE) scale = window.outerWidth / elem.scrollWidth
    return scale
  }

  makeTransform () {
    if (this.state.zoomState === INITIAL_ZOOM_STATE) return {transform: INITIAL_ZOOM_STATE}
    var scale = this.scale()
    return {transform: `scale(${scale}, ${scale})`, transformOrigin: 'left top'}
  }

  increaseZoomFactor () {
    var newIndex = this.state.zoomIndex
    if (newIndex < ZOOM_STATES.length - 1) newIndex++
    this.setState({zoomState: null, zoomIndex: newIndex})
  }

  decreaseZoomFactor () {
    var newIndex = this.state.zoomIndex
    if (newIndex > 0) newIndex--
    this.setState({zoomState: null, zoomIndex: newIndex})
  }

  resetZoom () {
    this.setState({zoomState: INITIAL_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})
  }

  zoomIntoCard (x, y) {
    var scale = this.scale()
    if (scale >= 1) {
      x *= scale
    } else {
      x /= scale
    }
    this.resetZoom()
    this.scrollTo(x, y)
  }

  // ////////////////
  //  scrolling   //
  // //////////////

  scrollRight () {
    this.setState({scrollTarget: this.state.scrollTarget + 700})
    scrollInterval = setInterval(this.increaseScroll.bind(this), 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 500)
  }

  scrollLeft () {
    this.setState({scrollTarget: this.state.scrollTarget - 700})
    scrollInterval = setInterval(this.decreaseScroll.bind(this), 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 500)
  }

  scrollBeginning () {
    this.setState({scrollTarget: 0})
    scrollInterval = setInterval(this.decreaseScroll.bind(this), 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 3000)
  }

  scrollMiddle () {
    var middle = (this.refs.timeline.scrollWidth / 2) - (window.outerWidth / 2)
    if (this.props.orientation === 'vertical') {
      middle = (this.refs.timeline.scrollHeight / 2)
    }
    this.setState({scrollTarget: middle})
    if (document.body.scrollLeft > middle) {
      scrollInterval = setInterval(this.decreaseScroll.bind(this), 25)
    } else {
      scrollInterval = setInterval(this.increaseScroll.bind(this), 25)
    }
    setTimeout(() => { clearInterval(scrollInterval) }, 1500)
  }

  scrollEnd () {
    var end = this.refs.timeline.scrollWidth - window.outerWidth
    if (this.props.orientation === 'vertical') {
      end = this.refs.timeline.scrollHeight
    }
    this.setState({scrollTarget: end})
    scrollInterval = setInterval(this.increaseScroll.bind(this), 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 3000)
  }

  increaseScroll () {
    if (this.props.orientation === 'vertical') {
      if (document.body.scrollTop >= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollTop += 100
    } else {
      if (document.body.scrollLeft >= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollLeft += 100
    }
  }

  decreaseScroll () {
    if (this.props.orientation === 'vertical') {
      if (document.body.scrollTop <= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollTop -= 100
    } else {
      if (document.body.scrollLeft <= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollLeft -= 100
    }
  }

  scrollTo (x, y) {
    setTimeout(() => {
      document.body.scrollTop = y
      document.body.scrollLeft = x + 300 - (window.outerWidth / 2)
    }, 10)
  }

  // ///////////////
  //  rendering   //
  // //////////////

  renderSubNav () {
    let glyph = 'option-vertical'
    let orientation = 'vertical'
    let scrollDirectionFirst = 'menu-left'
    let scrollDirectionSecond = 'menu-right'
    if (this.props.orientation === 'vertical') {
      orientation = 'horizontal'
      glyph = 'option-horizontal'
      scrollDirectionFirst = 'menu-up'
      scrollDirectionSecond = 'menu-down'
    }
    let popover = <Popover id='filter'>
      <FilterList filteredItems={this.state.filter} updateItems={this.updateFilter.bind(this)}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">Timeline is filtered</Alert>
    if (this.filterIsEmpty()) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className='subnav__container'>
        <Nav bsStyle='pills' >
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> Filter</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <Button bsSize='small' onClick={() => this.props.actions.changeOrientation(orientation)}><Glyphicon glyph={glyph} /> Flip</Button>
          </NavItem>
          <NavItem>
            <span className='subnav__container__label'>Zoom: </span>
            <ButtonGroup bsSize='small'>
              <Button onClick={this.increaseZoomFactor.bind(this)} ><Glyphicon glyph='plus-sign' /></Button>
              <Button onClick={this.decreaseZoomFactor.bind(this)} ><Glyphicon glyph='minus-sign' /></Button>
              <Button onClick={() => this.setState({zoomState: FIT_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})} >Fit</Button>
              <Button onClick={this.resetZoom.bind(this)} >Reset</Button>
            </ButtonGroup>
          </NavItem>
          <NavItem>
            <span className='subnav__container__label'>Scroll: </span>
            <ButtonGroup bsSize='small'>
              <Button onClick={this.scrollLeft.bind(this)} ><Glyphicon glyph={scrollDirectionFirst} /></Button>
              <Button onClick={this.scrollRight.bind(this)} ><Glyphicon glyph={scrollDirectionSecond} /></Button>
              <Button onClick={this.scrollBeginning.bind(this)} >Beginning</Button>
              <Button onClick={this.scrollMiddle.bind(this)} >Middle</Button>
              <Button onClick={this.scrollEnd.bind(this)} >End</Button>
            </ButtonGroup>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  render () {
    let styles = this.makeTransform()
    let isZoomed = (this.state.zoomState !== INITIAL_ZOOM_STATE) && (this.state.zoomIndex <= INITIAL_ZOOM_INDEX)
    let orientation = this.props.orientation === 'vertical' ? 'vertical' : ''
    // zoomFactor allows us to scale cards and scenes in a ratio that fits the scale determined by zoomState
    let zoomFactor = this.state.zoomState === FIT_ZOOM_STATE ? FIT_ZOOM_STATE : ZOOM_STATES[this.state.zoomIndex]
    return (
      <div id='timelineview__container' className='container-with-sub-nav'>
        {this.renderSubNav()}
        <div id='timelineview__root' className={orientation} ref='timeline' style={styles}>
          <SceneListView
            isZoomed={isZoomed}
            zoomFactor={zoomFactor} />
          <LineListView
            sceneMap={this.sceneMapping()}
            filteredItems={this.state.filter}
            isZoomed={isZoomed}
            zoomFactor={zoomFactor}
            zoomIn={this.zoomIntoCard.bind(this)} />
        </div>
      </div>
    )
  }

  sceneMapping () {
    var mapping = {}
    this.props.scenes.forEach((s) => {
      mapping[s.position] = s.id
    })
    return mapping
  }
}

TimeLineView.propTypes = {
  scenes: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  orientation: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    orientation: state.ui.orientation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeLineView)
