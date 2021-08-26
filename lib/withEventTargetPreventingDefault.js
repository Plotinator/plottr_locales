import { preventingDefault } from './preventingDefault'

const withEventTarget = (f) => (event) => {
  return f(event.target)
}

export const withEventTargetPreventingDefault = (f) => (event) =>
  preventingDefault(withEventTarget(f))(event)
