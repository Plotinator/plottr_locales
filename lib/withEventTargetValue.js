export const withEventTargetValue = (f) => (event) => {
  return f(event.target.value)
}
