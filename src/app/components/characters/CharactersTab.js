import React from 'react'
import { CharacterListView, ErrorBoundary } from 'plottr_components'

export default function CharactersTab() {
  return (
    <ErrorBoundary>
      <CharacterListView />
    </ErrorBoundary>
  )
}
