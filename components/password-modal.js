import React, { useState } from 'react'
import { PlottrModal } from 'connected-components'

const modalStyles = {
  overlay: {
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 0,
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    left: '0',
    top: '0',
    minHeight: '100vh',
    maxHeight: '100vh',
  },
}

const DashboardModal = () => {
  const [passwordEntered, setPasswordEntered] = useState(
    window.localStorage.getItem('robot-preventor') === process.env.NEXT_PUBLIC_ROBOT
  )

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
    <PlottrModal isOpen={true} style={modalStyles}>
      <div>
        <h1>Please enter testing password</h1>
        <p>This will only be here while we&apos;re under development</p>
        <input type="text" onKeyDown={handleKeyDown} />
      </div>
    </PlottrModal>
  )
}

export default DashboardModal
