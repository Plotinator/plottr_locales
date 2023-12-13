import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import elementType from 'prop-types-extra/lib/elementType'
import warning from 'warning'
import { isEqual, omit } from 'lodash'

import FormControlFeedback from './FormControlFeedback'
import FormControlStatic from './FormControlStatic'
import { prefix, bsClass, getClassSet, splitBsProps, bsSizes } from './utils/bootstrapUtils'
import { SIZE_MAP, Size } from './utils/StyleConfig'
import { FormGroupContext } from './context'

const propTypes = {
  componentClass: elementType,
  /**
   * Only relevant if `componentClass` is `'input'`.
   */
  type: PropTypes.string,
  /**
   * Uses `controlId` from `<FormGroup>` if not explicitly specified.
   */
  id: PropTypes.string,
  /**
   * Attaches a ref to the `<input>` element. Only functions can be used here.
   *
   * ```js
   * <FormControl inputRef={ref => { this.input = ref; }} />
   * ```
   */
  inputRef: PropTypes.func,
  className: PropTypes.string,
  bsSize: PropTypes.string,
  autoFocus: PropTypes.bool,
  selection: PropTypes.object,
  onSelectionChange: PropTypes.func,
  jumpCounter: PropTypes.number,
  onClick: PropTypes.func,
}

const defaultProps = {
  componentClass: 'input',
}

class FormControl extends React.Component {
  component = null
  focussing = false

  handleMouseDown = (event) => {
    if (this.props.onClick) {
      this.props.onClick()
    }
    event.stopPropagation()
  }

  focusSelection = () => {
    if (!this.focusing && this.component && this.props.autoFocus) {
      this.focusing = true
      this.component.focus()
      if (typeof this.component.scrollIntoView === 'function') {
        this.component.scrollIntoView({ behavior: 'smooth' })
      }
      setTimeout(() => {
        if (this.props.selection && this.component) {
          this.component.setSelectionRange(
            this.props.selection.start,
            this.props.selection.end,
            this.props.selection.direction
          )
          this.focusing = false
        }
      }, 5)
    }
  }

  handleRef = (ref) => {
    this.component = ref
    this.focusSelection()
    if (this.props.inputRef) {
      this.props.inputRef(ref)
    }
  }

  handleSelectionChange = (event) => {
    if (!this.focusing && this.component && event.target.activeElement === this.component) {
      this.props.onSelectionChange({
        ...event,
        target: event.target.activeElement,
      })
    }
  }

  componentDidUpdate(previousProps) {
    if (
      this.props.autoFocus &&
      (this.props.autoFocus !== previousProps.autoFocus ||
        !isEqual(this.props.selection, previousProps.selection) ||
        this.props.jumpCounter !== previousProps.jumpCounter) &&
      this.component
    ) {
      this.focusSelection()
    }
  }

  componentDidMount() {
    if (!this.props.onSelectionChange) return

    if (this.component) {
      document.addEventListener('selectionchange', this.handleSelectionChange)
    }
  }

  componentWillUnmount() {
    if (this.props.onSelectionChange && this.component) {
      document.removeEventListener('selectionchange', this.handleSelectionChange)
    }
  }

  render() {
    return (
      <FormGroupContext.Consumer>
        {({ $bs_formGroup }) => {
          const formGroup = $bs_formGroup
          const controlId = formGroup && formGroup.controlId

          const {
            componentClass: Component,
            type,
            id = controlId,
            className,
            bsSize,
            ...props
          } = this.props

          const [bsProps, elementProps] = splitBsProps(props)

          warning(
            controlId == null || id === controlId,
            '`controlId` is ignored on `<FormControl>` when `id` is specified.'
          )

          // input[type="file"] should not have .form-control.
          let classes
          if (type !== 'file') {
            classes = getClassSet(bsProps)
          }

          // If user provides a size, make sure to append it to classes as input-
          // e.g. if bsSize is small, it will append input-sm
          if (bsSize) {
            const size = SIZE_MAP[bsSize] || bsSize
            classes[prefix({ bsClass: 'input' }, size)] = true
          }

          return (
            <Component
              {...omit(elementProps, 'inputRef')}
              onMouseDown={this.handleMouseDown}
              type={type}
              id={id}
              ref={this.handleRef}
              className={classNames(className, classes)}
            />
          )
        }}
      </FormGroupContext.Consumer>
    )
  }
}

FormControl.propTypes = propTypes
FormControl.defaultProps = defaultProps

FormControl.Feedback = FormControlFeedback
FormControl.Static = FormControlStatic

export default bsClass('form-control', bsSizes([Size.SMALL, Size.LARGE], FormControl))
