export const serverOnlySessionCookie = (req) => {
  // TODO: check that the cookie was signed by us(!)
  return req.cookies.session
}

export const encodeSession = (email, userId) =>
  JSON.stringify({
    email,
    userId,
  })
