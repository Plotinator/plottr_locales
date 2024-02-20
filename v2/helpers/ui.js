export const escapeUIPathElement = (s) => {
  return s.replace(/\//g, '%2F')
}

export const unescapeUIPathElement = (s) => {
  return s.replace(/%2F/g, '/')
}
