import React from 'react'
import { NoteListView, ErrorBoundary } from 'plottr_components'

export default function NotesTab() {
  return (
    <ErrorBoundary>
      <NoteListView />
    </ErrorBoundary>
  )
}
