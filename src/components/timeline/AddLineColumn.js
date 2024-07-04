import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr'
import { selectors, actions } from 'wired-up-pltr'

import Glyphicon from '../Glyphicon'
import InputModal from '../dialogs/InputModal'
import TemplatePicker from '../templates/TemplatePicker'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const {
  orientedClassName: { orientedClassName },
} = helpers

const AddLineColumn = ({ actions, templateActions, currentTimeline, isSmall, isMedium }) => {
  const {
    platform: { templatesDisabled },
  } = useContext(PlottrComponentsContext)

  const [hovering, setHovering] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [askingForInput, setAskingForInput] = useState(false)

  const handleChooseTemplate = (template, selectedIndex) => {
    templateActions.applyTimelineTemplate(currentTimeline, template, selectedIndex)
    setShowTemplatePicker(false)
  }

  const simpleAddLine = (title) => {
    actions.addLineWithTitle(title, currentTimeline)
    setAskingForInput(false)
    setHovering(false)
  }

  const renderInputModal = () => {
    if (!askingForInput) return null

    return (
      <InputModal
        isOpen={true}
        getValue={simpleAddLine}
        title={t('Plotline Title:')}
        type="text"
        cancel={() => {
          setAskingForInput(false)
          setHovering(false)
        }}
      />
    )
  }

  const renderInsertButton = () => {
    if (isSmall) {
      return (
        <th className="row-header">
          {renderInputModal()}
          <div className="line-list__append-line" onClick={() => setAskingForInput(true)}>
            <div className="line-list__append-line-wrapper">
              <Glyphicon glyph="plus" />
            </div>
          </div>
        </th>
      )
    }

    const appendKlass = cx(orientedClassName('line-list__append-line', 'vertical'), {
      'medium-timeline': isMedium,
    })
    return hovering ? (
      <div className={appendKlass}>
        <div
          className={cx(orientedClassName('line-list__append-line-wrapper', 'vertical'), {
            'medium-timeline': isMedium,
          })}
        >
          <div className={orientedClassName('line-list__append-line__double', 'vertical')}>
            <div
              onClick={() => {
                setShowTemplatePicker(true)
                setHovering(false)
              }}
              className={cx('template', { disabled: templatesDisabled })}
            >
              {isMedium ? t('Templates') : t('Use Template')}
            </div>
            <div onClick={() => actions.addLine(currentTimeline)} className="non-template">
              <Glyphicon glyph="plus" />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className={appendKlass}>
        <div
          className={cx(orientedClassName('line-list__append-line-wrapper', 'vertical'), {
            'medium-timeline': isMedium,
          })}
        >
          <Glyphicon glyph="plus" />
        </div>
      </div>
    )
  }

  const renderTemplatePicker = () => {
    if (!showTemplatePicker) return null

    return (
      <TemplatePicker
        types={['plotlines']}
        modal={true}
        isOpen={showTemplatePicker}
        close={() => setShowTemplatePicker(false)}
        onChooseTemplate={handleChooseTemplate}
      />
    )
  }

  if (isSmall) {
    return renderInsertButton()
  } else {
    return (
      <Cell onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        {renderInsertButton()}
        {renderTemplatePicker()}
      </Cell>
    )
  }
}

AddLineColumn.propTypes = {
  actions: PropTypes.object.isRequired,
  templateActions: PropTypes.object.isRequired,
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  currentTimeline: selectors.currentTimelineSelector(state),
  isSmall: selectors.isSmallSelector(state),
  isMedium: selectors.isMediumSelector(state),
})

export default connect(mapStateToProps, (dispatch) => ({
  actions: bindActionCreators(actions.line, dispatch),
  templateActions: bindActionCreators(actions.templates, dispatch),
}))(AddLineColumn)
