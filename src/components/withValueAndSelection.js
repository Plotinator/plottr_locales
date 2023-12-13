export const withValueAndSelection = (f) => (event) => {
  return f(event.target.value, {
    start: event.target.selectionStart,
    end: event.target.selectionEnd,
    direction: event.target.selectionDirection,
  })
}
