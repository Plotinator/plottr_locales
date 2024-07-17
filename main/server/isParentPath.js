import { sep, dirname } from 'path'
import { isEqual } from 'lodash'

import { helpers } from 'pltr'

export const isParentPath = (childPath, parentPath) => {
  const childComponents = childPath.split(sep)
  const parentComponents = parentPath.split(sep)
  return (
    childComponents.length >= parentComponents.length &&
    isEqual(childComponents.slice(0, parentComponents.length), parentComponents)
  )
}

export const isParentURL = (childURL, parentURL) => {
  const childProtocol = helpers.file.isProtocolString(childURL)?.[0]
  const parentProtocol = helpers.file.isProtocolString(parentURL)?.[0]
  if (
    typeof childProtocol === 'string' &&
    typeof parentProtocol === 'string' &&
    childProtocol === parentProtocol
  ) {
    return isParentPath(
      helpers.file.withoutProtocol(childURL),
      helpers.file.withoutProtocol(parentURL)
    )
  } else {
    return false
  }
}

export const isParentPathOfFile = (childFileURL, parentURL) => {
  const childProtocol = helpers.file.isProtocolString(childFileURL)?.[0]
  if (typeof childProtocol === 'string') {
    const childDirectory = dirname(helpers.file.withoutProtocol(childFileURL))
    const parentDirectory = helpers.file.withoutProtocol(parentURL)
    return isParentPath(childDirectory, parentDirectory)
  } else {
    return false
  }
}
