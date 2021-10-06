export const verifyToken = (auth, req) => {
  const sessionCookie = req.cookies.session || ''
  return auth.verifySessionCookie(sessionCookie, true)
}
