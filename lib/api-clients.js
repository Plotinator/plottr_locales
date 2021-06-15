import axios from 'axios'

const logIn = (email, password) => {
  return axios.post('/api/login', {
    email,
    password,
  })
}

export const authentication = {
  logIn,
}
