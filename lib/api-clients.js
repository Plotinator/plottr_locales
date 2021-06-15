import axios from 'axios'

const logIn = (email, password) => {
  return axios.post('/api/login', {
    email,
    password,
  })
}

const createAccount = (userName, email, password) => {
  return axios.post('/api/createAccount', {
    userName,
    email,
    password,
  })
}

export const authentication = {
  logIn,
  createAccount,
}
