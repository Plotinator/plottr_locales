import React from 'react'
import { ErrorBoundary, PlaceListView } from 'plottr_components'

export default function PlacesTab() {
  return (
    <ErrorBoundary>
      <PlaceListView />
    </ErrorBoundary>
  )
}
