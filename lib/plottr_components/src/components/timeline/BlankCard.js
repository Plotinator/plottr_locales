import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'
import { lineColors } from 'pltr/v2'
import { orientedClassName } from 'pltr/v2/helpers/orientedClassName'

import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import { checkDependencies } from '../checkDependencies'
import UnconnectedTemplatePicker from '../templates/TemplatePicker'
import VisualLine from './VisualLine'

const { lightBackground } = lineColors

const BlankCardConnector = (connector) => {
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  const templatesDisabled = connector.platform.templatesDisabled
  checkDependencies({ templatesDisabled })

  class BlankCard extends Component {
    constructor(props) {
      super(props)
      this.state = {
        creating: false,
        templateHover: false,
        defaultHover: false,
        showTemplatePicker: false,
        templates: [],
        inDropZone: false,
        dropDepth: 0,
      }

      this.titleInputRef = null
      this.ref = React.createRef()
    }

    componentDidUpdate(_, prevState) {
      const { creating, showTemplatePicker } = this.state
      // user just chose a template, and now needs to give the card a name
      if (creating && prevState.showTemplatePicker && !showTemplatePicker) {
        setTimeout(() => {
          if (this.titleInputRef) this.titleInputRef.focus()
        }, 100)
      }
    }

    handleDragEnter = (e) => {
      this.setState({ dropDepth: this.state.dropDepth + 1 })
    }

    handleDragOver = (e) => {
      e.preventDefault()
      this.setState({ inDropZone: true })
    }

    handleDragLeave = (e) => {
      let dropDepth = this.state.dropDepth
      --dropDepth
      this.setState({ dropDepth: dropDepth })
      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }

    handleDrop = (e) => {
      e.stopPropagation()
      this.setState({ inDropZone: false, dropDepth: 0 })

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)

      const { beatId, lineId, addMissingBeats } = this.props
      if (droppedData.cardIds) {
        this.props.actions.reorderCardsWithinLine(
          beatId,
          lineId,
          [...droppedData.cardIds],
          addMissingBeats
        )
      } else if (droppedData.cardId) {
        this.props.actions.reorderCardsWithinLine(
          beatId,
          lineId,
          [droppedData.cardId],
          addMissingBeats
        )
      }

      return
    }

    saveCreate = () => {
      const { addMissingBeats } = this.props

      const newCard = this.buildCard(this.titleInputRef.value)
      this.props.actions.addCard(
        Object.assign(newCard, this.state.templates ? { templates: this.state.templates } : {}),
        addMissingBeats
      )
      this.setState({
        creating: false,
        templates: [],
      })
      if (this.props.onDone) this.props.onDone()
    }

    createFromSmall = () => {
      const { addMissingBeats } = this.props

      const newCard = this.buildCard('')
      this.props.actions.addCard(newCard, addMissingBeats)
    }

    handleFinishCreate = (event) => {
      if (event.which === 13) {
        //enter
        this.saveCreate()
      }
    }

    startCreating = () => {
      if (this.props.readOnly) return
      this.setState({ creating: true })
    }

    buildCard(title) {
      const { beatId, lineId } = this.props
      return {
        title,
        beatId,
        lineId,
        positionWithinLine: this.props.positionWithinLine || 0,
      }
    }

    handleCancelCreate = (event) => {
      if (event.which === 27) {
        //esc
        this.setState({ creating: false })
      }
    }

    handleBlur = () => {
      var newTitle = this.titleInputRef.value
      if (newTitle === '') {
        this.setState({ creating: false })
        return false
      } else {
        this.saveCreate()
        this.setState({ creating: false })
      }
    }

    onAddWithTemplateHover = () => {
      this.setState({ templateHover: true })
    }

    onAddWithTemplateLeave = () => {
      this.setState({ templateHover: false })
    }

    onAddWithDefaultHover = () => {
      this.setState({ defaultHover: true })
    }

    onAddWithDefaultLeave = () => {
      this.setState({ defaultHover: false })
    }

    showTemplatePicker = () => {
      if (this.props.readOnly) return
      this.setState({ showTemplatePicker: true })
    }

    handleChooseTemplate = (template) => {
      const newTemplates = this.state.templates.find(({ id }) => id === template.id)
        ? this.state.templates
        : [template, ...this.state.templates]

      this.setState({
        templates: newTemplates,
        showTemplatePicker: false,
        creating: true,
      })
    }

    closeTemplatePicker = () => {
      this.setState({ showTemplatePicker: false })
    }

    renderBlank() {
      const { color, verticalInsertion, orientation, isSmall, isMedium, readOnly, isPinned } =
        this.props
      const { templateHover, defaultHover, inDropZone } = this.state
      if (isSmall) {
        const smallStyle = { borderColor: color }
        return (
          <td
            onDragEnter={this.handleDragEnter}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
          >
            <div
              className={cx('blank-circle', { hover: inDropZone })}
              style={smallStyle}
              onClick={this.createFromSmall}
            />
          </td>
        )
      }

      const blankCardStyle = {
        borderColor: color,
        color: color,
      }
      const addWithTemplateStyle = templateHover ? { background: lightBackground(color) } : {}
      const addWithDefaultStyle = defaultHover ? { background: lightBackground(color) } : {}
      const bodyKlass = cx(orientedClassName('blank-card__body', orientation), {
        disabled: readOnly,
        'vertical-blank-card__body': verticalInsertion,
      })

      return (
        <div
          className={cx(bodyKlass, {
            hover: inDropZone,
            'medium-timeline': isMedium,
            'card-pinned': isPinned,
          })}
          style={blankCardStyle}
        >
          {!templatesDisabled && (
            <div
              className="template"
              onClick={this.showTemplatePicker}
              onMouseEnter={this.onAddWithTemplateHover}
              onMouseLeave={this.onAddWithTemplateLeave}
              style={addWithTemplateStyle}
            >
              {isMedium ? i18n('Templates') : i18n('Use Template')}
            </div>
          )}
          <div
            className="non-template"
            onClick={this.startCreating}
            onMouseEnter={this.onAddWithDefaultHover}
            onMouseLeave={this.onAddWithDefaultLeave}
            style={addWithDefaultStyle}
          >
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )
    }

    renderTemplatePicker() {
      if (!this.state.showTemplatePicker) return null

      return (
        <TemplatePicker
          types={['scenes']}
          modal={true}
          isOpen={this.state.showTemplatePicker}
          close={this.closeTemplatePicker}
          onChooseTemplate={this.handleChooseTemplate}
        />
      )
    }

    renderCreateNew() {
      const { color, isMedium, isPinned } = this.props
      const cardStyle = { borderColor: color }
      const bodyKlass = cx('card__body creating', { 'medium-timeline': isMedium, isPinned })
      return (
        <div className={bodyKlass} style={cardStyle}>
          <FormGroup>
            <ControlLabel>{i18n('Scene Title')}</ControlLabel>
            <FormControl
              type="text"
              autoFocus
              inputRef={(ref) => {
                this.titleInputRef = ref
              }}
              bsSize="small"
              onBlur={this.handleBlur}
              onKeyDown={this.handleCancelCreate}
              onKeyPress={this.handleFinishCreate}
            />
          </FormGroup>
        </div>
      )
    }

    render() {
      window.SCROLLWITHKEYS = !this.state.creating
      const { orientation, verticalInsertion, isSmall, isMedium, isPinned, color } = this.props
      const tableLength =
        this.ref.current?.clientWidth + 70 || (!isMedium || orientation == 'vertical' ? 225 : 110)

      let body = null
      if (this.state.creating) {
        body = this.renderCreateNew()
      } else {
        body = this.renderBlank()
      }

      if (isSmall) return body

      const vertical = orientation === 'vertical'
      return (
        <>
          {verticalInsertion ? (
            body
          ) : (
            <Cell ref={this.ref}>
              {isPinned ? (
                <VisualLine
                  isPinned
                  color={color}
                  orientation={orientation}
                  isMedium={isMedium}
                  tableLength={tableLength}
                />
              ) : null}
              <div
                className={cx('card__cell', {
                  vertical,
                  'medium-timeline': isMedium,
                  'card-pinned': isPinned,
                })}
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
              >
                {/* This div is necessary to match the structure of scene cell cards
                   and thus get the styles to apply in the same way (flexbox) */}
                <div>{body}</div>
              </div>
            </Cell>
          )}
          {this.renderTemplatePicker()}
        </>
      )
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.inDropZone != nextState.inDropZone) return true
      if (this.state.creating != nextState.creating) return true
      if (this.props.color != nextProps.color) return true
      if (this.state.templateHover !== nextState.templateHover) return true
      if (this.state.defaultHover !== nextState.defaultHover) return true
      if (this.state.showTemplatePicker !== nextState.showTemplatePicker) return true
      if (this.state.isPinned !== nextState.isPinned) return true
      return false
    }
  }

  BlankCard.propTypes = {
    beatId: PropTypes.number,
    lineId: PropTypes.number,
    verticalInsertion: PropTypes.bool,
    color: PropTypes.string.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orientation: PropTypes.string,
    positionWithinLine: PropTypes.number,
    onDone: PropTypes.func,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    actions: PropTypes.object,
    notificationActions: PropTypes.object,
    readOnly: PropTypes.bool,
    addMissingBeats: PropTypes.bool,
    isPinned: PropTypes.bool,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  const CardActions = actions.card
  const NotificationActions = actions.notifications
  checkDependencies({
    redux,
    actions,
    selectors,
    CardActions,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          currentTimeline: selectors.currentTimelineSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          readOnly: !selectors.canWriteSelector(state.present),
          addMissingBeats: selectors.parentIsHigherLevelAndViewIsStackedSelector(
            state.present,
            ownProps.beatId
          ),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
          notificationActions: bindActionCreators(NotificationActions, dispatch),
        }
      }
    )(BlankCard)
  }

  throw new Error('Could not connect BlankCard')
}

export default BlankCardConnector
