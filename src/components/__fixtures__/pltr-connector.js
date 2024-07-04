import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { rootReducer } from 'pltr'

import fileState from './example-state'
import { PlottrComponentsContext } from '../../connections/'

const state = fileState

const connector = {
  platform: {
    os: () => 'unknown',
    undo: () => {},
    redo: () => {},
    appVersion: '2021.4.6',
    template: {
      deleteTemplate: () => {},
      editTemplateDetails: () => {},
      startSaveAsTemplate: () => {},
      saveTemplate: () => {},
    },
    isDevelopment: true,
    settings: {},
    openExternal: () => {},
    createErrorReport: () => {},
    log: {
      error: () => {},
      warn: () => {},
      info: () => {},
    },
    listenForRCELock: (a, b, c, cb) => {
      cb({})
    },
    lockRCE: () => Promise.resolve({}),
    storage: {
      // TODO: update when the firebase sync PR is merged!
      imagePublicURL: () => Promise.resolve(''),
      isStorageURL: () => false,
      resolveToPublicUrl: () => {},
      saveImageToStorageBlob: () => {},
      saveImageToStorageFromURL: () => {},
    },
    errorReporter: {
      getInstance: () => {
        return {}
      },
    },
  },
}

export const connect = (Component) => {
  const reducer = rootReducer({ normalizeRCEContent: () => {} })

  return (
    <Provider
      store={createStore(reducer, {
        // @ts-ignore
        user: state,
        system: {},
      })}
    >
      {/* @ts-ignore */}
      <PlottrComponentsContext.Provider value={connector}>
        {Component()}
      </PlottrComponentsContext.Provider>
    </Provider>
  )
}

export default connector
