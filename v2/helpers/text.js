import { capitalize } from 'lodash'

export const screamingSnakeCaseToHumanReadable = (s) => {
  return s
    .split('_')
    .map((sub) => {
      return capitalize(sub.toLowerCase())
    })
    .join(' ')
}
