import { capitalize } from 'lodash'

export const screamingSnakeCaseToHumanReadable = (s) => {
  return s
    .split('_')
    .map((sub) => {
      return capitalize(sub.toLowerCase())
    })
    .join(' ')
}

export const isEmpty = (children) => {
  if (!children) return true

  function anyText(node) {
    if (Array.isArray(node)) {
      return node.some(anyText)
    } else if (!node) {
      return false
    } else if (node && typeof node === 'object') {
      return Object.entries(node).some(([key, value]) => {
        return (key === 'text' && typeof value === 'string' && value !== '') || anyText(value)
      })
    } else {
      return false
    }
  }

  return !anyText(children)
}
