import React from 'react'
import { identity } from 'lodash'

import * as rawPltr from 'pltr'

import fileState from './example-state'

const selectors = rawPltr.selectors(identity)
const actions = rawPltr.actions(identity)

const pltr = {
  ...rawPltr,
  selectors,
  actions,
}

const state = fileState

const connector = {
  redux: {
    connect: (mapStateToProps, mapDispatchToProps) => (Component) => {
      const TheComponent = (props) => {
        return (
          <Component
            {...(mapStateToProps ? mapStateToProps(state, props) : {})}
            {...(mapDispatchToProps && typeof mapDispatchToProps === 'function'
              ? mapDispatchToProps(identity, props)
              : mapDispatchToProps)}
            {...props}
          />
        )
      }
      return TheComponent
    },
    bindActionCreators: identity,
  },
  pltr,
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

export default connector
