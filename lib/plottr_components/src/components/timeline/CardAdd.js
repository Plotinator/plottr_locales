import React, { Component, createRef } from 'react'
import UnconnectedBlankCard from './BlankCard'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import Glyphicon from '../Glyphicon'
import { checkDependencies } from '../checkDependencies'

const CardAddConnector = (connector) => {
  const BlankCard = UnconnectedBlankCard(connector)

  class CardAdd extends Component {
    state = { creating: false, dropping: false }
    titleInputRef = createRef()

    constructor(props) {
      super(props)

      this.firstClick = props.lastClick
      this.blankCardRef = null
    }

    componentWillUnmount() {
      window.removeEventListener('keydown', this.handleCancelCreate)
    }

    componentDidUpdate(prevProps) {
      if (this.blankCardRef) {
        const { top, right, bottom, left } = this.blankCardRef.getBoundingClientRect()
        const { x, y } = this.props.lastClick
        if (x >= left && x <= right && y >= top && y <= bottom) return
      }

      if (Math.abs(this.firstClick.counter - this.props.lastClick.counter) > 1) {
        this.setState({ creating: false })
      }
    }

    saveCreate = () => {
      const title = this.titleInputRef.current.value
      this.props.addCard({ title, positionWithinLine: this.props.positionWithinLine + 1 })
      this.setState({ creating: false })
    }

    stopCreating = () => {
      this.setState({ creating: false })
    }

    handleFinishCreate = (event) => {
      if (event.which === 13) {
        //enter
        this.saveCreate()
      }
    }

    handleCancelCreate = (event) => {
      window.removeEventListener('keydown', this.handleCancelCreate)
      if (event.which === 27) {
        //esc
        this.setState({ creating: false })
      }
    }

    handleBlur = () => {
      var newTitle = this.titleInputRef.current.value
      if (newTitle == '') {
        this.setState({ creating: false })
        return false
      } else {
        this.saveCreate()
        this.setState({ creating: false })
      }
    }

    startCreating = () => {
      window.addEventListener('keydown', this.handleCancelCreate)
      this.firstClick = this.props.lastClick
      this.setState({ creating: true })
    }

    handleDragEnter = (e) => {
      this.setState({ dropping: true })
    }

    handleDragOver = (e) => {
      this.setState({ dropping: true })
      e.preventDefault()
    }

    handleDragLeave = (e) => {
      this.setState({ dropping: false })
    }

    handleDrop = (e) => {
      e.stopPropagation()
      this.setState({ dropping: false })

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
      if (!droppedData.cardId) return

      this.props.moveCard(
        droppedData.cardId,
        this.props.dropPosition || this.props.positionWithinLine
      )
    }

    render() {
      if (this.state.creating) {
        return (
          <div className="vertical-blank-card__wrapper" ref={(ref) => (this.blankCardRef = ref)}>
            <BlankCard
              verticalInsertion
              beatId={this.props.beatId}
              lineId={this.props.lineId}
              positionWithinLine={this.props.positionWithinLine + 1}
              color={this.props.color}
              onDone={this.stopCreating}
            />
          </div>
        )
      } else {
        if (this.props.allowDrop) {
          return (
            <div
              className={cx('card__add-card', { dropping: this.state.dropping })}
              onClick={this.startCreating}
              onDragEnter={this.handleDragEnter}
              onDragOver={this.handleDragOver}
              onDragLeave={this.handleDragLeave}
              onDrop={this.handleDrop}
            >
              <Glyphicon glyph="plus" />
            </div>
          )
        } else {
          return (
            <div
              className={cx('card__add-card', { dropping: this.state.dropping })}
              onClick={this.startCreating}
            >
              <Glyphicon glyph="plus" />
            </div>
          )
        }
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.dropping != nextState.dropping) return true
      if (this.state.creating != nextState.creating) return true
      if (this.props.color != nextProps.color) return true
      if (this.props.allowDrop != nextProps.allowDrop) return true
      if (this.props.lastClick != nextProps.lastClick) return true
      return false
    }

    static propTypes = {
      color: PropTypes.string.isRequired,
      positionWithinLine: PropTypes.number.isRequired,
      moveCard: PropTypes.func.isRequired,
      addCard: PropTypes.func.isRequired,
      allowDrop: PropTypes.bool.isRequired,
      beatId: PropTypes.number.isRequired,
      lineId: PropTypes.number.isRequired,
      dropPosition: PropTypes.number,
      readOnly: PropTypes.bool,
      lastClick: PropTypes.object,
    }
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      readOnly: !selectors.canWriteSelector(state.present),
      lastClick: selectors.lastClickSelector(state.present),
    }))(CardAdd)
  }

  throw new Error('Could not connect CardAdd')
}

export default CardAddConnector
