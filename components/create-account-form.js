import { useState } from 'react'
import { PropTypes } from 'prop-types'

import { withEventTargetValue } from '../lib/withEventTargetValue'

const CreateAccountForm = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form onSubmit={withEventTargetValue(onSubmit)} className="login__form">
      <label htmlFor="first-name">First Name</label>
      <input
        id="first-name"
        type="text"
        value={firstName}
        onChange={withEventTargetValue(setFirstName)}
      />
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={withEventTargetValue(setEmail)} />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={withEventTargetValue(setPassword)}
      />
      <input type="submit" className="login__button" value="Create Account" />
    </form>
  )
}

CreateAccountForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default CreateAccountForm
