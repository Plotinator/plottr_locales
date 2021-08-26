import React from 'react'

import { EditSeries, ErrorBoundary, BookList } from 'connected-components'

export default function Project() {
  return (
    <ErrorBoundary>
      <div className="series__container container-with-sub-nav">
        <div className="tab-body">
          <EditSeries />
          <BookList />
        </div>
      </div>
    </ErrorBoundary>
  )
}
