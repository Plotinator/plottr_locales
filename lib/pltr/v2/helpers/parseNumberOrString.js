export const parseNumberOrString = (x) => {
  if (typeof x === 'number') {
    return x
  } else if (typeof x !== 'string') {
    return null
  } else if (x.match(/^[0-9]+$/)) {
    return parseInt(x)
  } else {
    return x
  }
}
