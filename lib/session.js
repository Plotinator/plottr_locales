import Cookies from 'js-cookie'

export const userIdFromCookie = () => {
  return Cookies.get('userid')
}

const parseWithoutErrors = (string) => {
  try {
    return JSON.parse(string)
  } catch (_e) {
    return {}
  }
}

export const serverOnlySessionCookie = (req) => {
  // TODO: check that the cookie was signed by us(!)
  return parseWithoutErrors(req.cookies.session)
}

export const encodeSession = (email, userId) =>
  JSON.stringify({
    email,
    userId,
  })
