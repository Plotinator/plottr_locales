import { useState } from 'react'
import { PropTypes } from 'prop-types'

import { withEventTargetValue } from '../lib/withEventTargetValue'
import { withEventTargetPreventingDefault } from '../lib/withEventTargetPreventingDefault'

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form onSubmit={withEventTargetPreventingDefault(onSubmit)} className="login__form">
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={withEventTargetValue(setEmail)} />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={withEventTargetValue(setPassword)}
      />
      <input type="submit" className="login__button" value="Login" />
    </form>
  )
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default LoginForm
