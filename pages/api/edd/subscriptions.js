import axios from 'axios'
import { subscriptionsURL } from '../../../lib/eddAPI'

export default async (req, res) => {
  const { email, auth } = req.body

  // TODO:
  // we need to figure out auth for these endpoints
  if (auth != '*otterbeartreepale*') return res.status(500).send('wrong!')

  try {
    const response = await axios.get(subscriptionsURL(email))

    return res.status(200).send(response.data)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}
