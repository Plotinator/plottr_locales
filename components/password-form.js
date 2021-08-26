import React, { useState } from 'react'

export const passwordSet = () => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('robot-preventor') === process.env.NEXT_PUBLIC_ROBOT
}

const PasswordForm = () => {
  const [passwordEntered, setPasswordEntered] = useState(passwordSet())

  const handleKeyDown = (event) => {
    if (event.which === 13) {
      if (event.target.value === process.env.NEXT_PUBLIC_ROBOT) {
        window.localStorage.setItem('robot-preventor', process.env.NEXT_PUBLIC_ROBOT)
        setPasswordEntered(true)
      }
    }
  }

  if (passwordEntered) return null

  return (
    <div>
      <h1>Please enter testing password</h1>
      <p>This will only be here while we&apos;re under development</p>
      <input type="text" onKeyDown={handleKeyDown} />
    </div>
  )
}

export default PasswordForm
