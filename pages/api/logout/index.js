const logout = (req, res) => {
  const secure = process.env.NODE_ENV === 'development' ? '' : 'Secure; '
  res.setHeader('Set-Cookie', [
    `session=deleted; Domain=${process.env.DOMAIN}; Path=/; ${secure}HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `userid=deleted; Domain=${process.env.DOMAIN}; Path=/; ${secure}Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  ])
  res.writeHead(302, {
    Location: '/login',
  })
  res.end()
}

export default logout
