import { signIn } from '../../../lib/firebase'
import { encodeSession } from '../../../lib/session'

const login = (req, res) => {
  const { email, password } = req.body
  return signIn(email, password)
    .then((userCredentials) => {
      const user = userCredentials.user
      const secure = process.env.NODE_ENV === 'development' ? '' : 'Secure; '
      res.setHeader('Set-Cookie', [
        `session=${encodeSession(email, user.uid)}; ${secure}HttpOnly; Domain=${
          process.env.DOMAIN
        }; Path=/`,
        `userid=${user.uid}; ${secure} Domain=${process.env.DOMAIN}; Path=/`,
      ])
      return res.status(200).json({ status: 'success' })
    })
    .catch((error) => {
      console.error(error)
      return res.status(500).json({ message: `Couldn't log in ${error}` })
    })
}

export default login
