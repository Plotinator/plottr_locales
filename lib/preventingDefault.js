export const preventingDefault = (f) => (event) => {
  event.preventDefault()
  return f(event)
}
