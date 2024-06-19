import React from 'react'
import { ErrorBoundary, TimelineWrapper } from 'plottr_components'

const TimelineTab = () => {
  return (
    <ErrorBoundary>
      <TimelineWrapper />
    </ErrorBoundary>
  )
}

export default React.memo(TimelineTab)
