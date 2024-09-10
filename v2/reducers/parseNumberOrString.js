export const parseNumberOrString = (x) => {
  if (x.match(/^[0-9]+$/)) {
    return parseInt(x)
  } else {
    return x
  }
}
