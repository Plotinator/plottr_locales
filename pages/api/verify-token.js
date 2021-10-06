export const verifyToken = (auth, req) => {
  const sessionCookie = req.cookies.session || ''
  console.log('Checking cookie: ', sessionCookie)
  return auth.verifySessionCookie(sessionCookie, true)
}
