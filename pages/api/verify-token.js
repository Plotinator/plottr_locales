export const verifyToken = (auth, req, res) => {
  const sessionCookie = req.cookies.session || ''
  return auth.verifySessionCookie(sessionCookie, true).catch((error) => {
    console.error('Error authenticating request.', error.message, error)
    res.status(401)
    res.setHeader('Set-Cookie', `session=; Max-Age=0; HttpOnly`)
    res.end()
  })
}
