import React, { useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { helpers } from 'pltr/v2'
import cx from 'classnames'

const {
  orientedClassName: { orientedClassName },
} = helpers

const measurements = {
  horizontal: {
    medium: {
      first: 0,
      last: 0,
    },
    large: {
      first: 0,
      last: 50,
    },
  },
  vertical: {
    medium: {
      first: 0,
      last: 50,
    },
    large: {
      first: 0,
      last: 0,
    },
  },
}

const getMargins = (orientation, isMedium) => {
  const sizeKey = isMedium ? 'medium' : 'large'
  const entry = measurements[orientation][sizeKey]
  return entry.first + entry.last
}

export default function VisualLine({
  color,
  orientation,
  isMedium,
  tableLength,
  beatHeadingCount,
  disableAnimation,
}) {
  const margins = useMemo(() => {
    return getMargins(orientation, isMedium)
  }, [orientation, isMedium])
  const transitionSeconds = useMemo(() => {
    const TRANSITION_TIMES = [1, 3, 4, 5]
    const index = Math.max(
      0,
      Math.min(TRANSITION_TIMES.length - 1, Math.floor(beatHeadingCount / 20))
    )
    return TRANSITION_TIMES[index]
  }, [beatHeadingCount])
  const maxLength = tableLength - margins
  const currentLength = Math.max(0, maxLength ?? 0)

  const lineStyle = {
    borderColor: color,
  }

  if (orientation == 'horizontal') {
    lineStyle.width = `${currentLength}px`
  } else {
    lineStyle.height = `${currentLength}px`
  }
  if (!disableAnimation) {
    lineStyle.transitionDuration = `${transitionSeconds}s`
  }

  const lineKlass = cx(orientedClassName('line-title__line-line', orientation), {
    'medium-timeline': isMedium,
  })

  return <div className={lineKlass} style={lineStyle}></div>
}

VisualLine.propTypes = {
  color: PropTypes.string,
  orientation: PropTypes.string,
  tableLength: PropTypes.number,
  isMedium: PropTypes.bool,
  isPinned: PropTypes.bool,
  beatHeadingCount: PropTypes.number,
  disableAnimation: PropTypes.bool,
}
