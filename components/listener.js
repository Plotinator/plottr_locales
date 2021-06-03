import { useEffect } from 'react'

import { listen } from '../lib/firebase'

const Listener = ({ userId, selectedFile }) => {
  useEffect(() => {
    if (!userId || !selectedFile || !selectedFile.id) return
    listen(userId, selectedFile.id)
  }, [selectedFile, userId])

  return null
}

export default Listener
