export const serverOnlySessionCookie = (req) => {
  if (typeof window === 'undefined') {
    // TODO: check that the cookie was signed by us(!)
    return req.cookies.session
  }
  return false
}
