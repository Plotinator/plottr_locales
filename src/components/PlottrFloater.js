import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Popover, ArrowContainer } from 'react-tiny-popover'
import cx from 'classnames'
import { omit, isEqual } from 'lodash'

import { selectors } from 'wired-up-pltr'

const nonComponentsPropsAreEqual = (prevProps, newProps) => {
  const withoutChildrenOrComponent = (props) => omit(props, ['component'])
  return isEqual(withoutChildrenOrComponent(prevProps), withoutChildrenOrComponent(newProps))
}

const PlottrFloater = ({
  containerPadding,
  open,
  placement,
  align,
  contentLocation,
  component,
  onClose,
  rootClose,
  children,
  hideArrow,
  zIndex,
  darkMode,
  positionLeftMost,
}) => {
  const SuppliedComponent = component

  const Component = useCallback(
    ({ position, childRect, popoverRect, boundaryRect }) => {
      return hideArrow ? (
        <SuppliedComponent />
      ) : (
        <ArrowContainer
          position={position}
          childRect={childRect}
          popoverRect={popoverRect}
          arrowColor={darkMode ? '#555' : 'white'}
          arrowSize={10}
          arrowStyle={{}}
          className={cx('popover-arrow-container', position, {
            resize:
              (boundaryRect.height == boundaryRect.bottom &&
                boundaryRect.width == boundaryRect.right) ||
              (boundaryRect.height == boundaryRect.top &&
                boundaryRect.width == boundaryRect.right) ||
              (boundaryRect.height == boundaryRect.bottom &&
                boundaryRect.width == boundaryRect.left) ||
              (boundaryRect.height == boundaryRect.top && boundaryRect.width == boundaryRect.left),
          })}
          arrowClassName="popover-arrow"
        >
          <SuppliedComponent />
        </ArrowContainer>
      )
    },
    [component]
  )

  const getPositions = () => {
    if (positionLeftMost) {
      return ['bottom']
    } else if (placement) {
      return [placement, ...['left', 'right', 'bottom', 'top']]
    } else {
      return ['left', 'right', 'bottom', 'top']
    }
  }

  return (
    <Popover
      isOpen={open}
      positions={getPositions()}
      align={positionLeftMost ? 'start' : align || 'center'}
      contentLocation={contentLocation}
      padding={containerPadding}
      // FIXME: Root close on SelectLists is a bit finicky
      onClickOutside={rootClose ? onClose : () => {}}
      // @ts-ignore
      content={Component}
      containerStyle={{ zIndex: zIndex || 1200 }}
    >
      {children}
    </Popover>
  )
}

PlottrFloater.propTypes = {
  elementId: PropTypes.string,
  containerPadding: PropTypes.number,
  open: PropTypes.bool,
  placement: PropTypes.string,
  align: PropTypes.string,
  contentLocation: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  component: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  rootClose: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  hideArrow: PropTypes.bool,
  zIndex: PropTypes.number,
  darkMode: PropTypes.bool,
  positionLeftMost: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    darkMode: selectors.isDarkModeSelector(state),
  }
}

export default connect(mapStateToProps)(React.memo(PlottrFloater, nonComponentsPropsAreEqual))
