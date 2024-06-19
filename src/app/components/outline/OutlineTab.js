import React from 'react'
import { ErrorBoundary, OutlineView } from 'plottr_components'

export default function OutlineTab() {
  return (
    <ErrorBoundary>
      <OutlineView />
    </ErrorBoundary>
  )
}
