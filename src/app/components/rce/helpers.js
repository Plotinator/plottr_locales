import { useState } from 'react'
import { RCE_INITIAL_VALUE } from '../../../../shared/initialState'

export function useTextConverter (text) {
  let rceText = text
  if (!text || !text.length) {
    rceText = RCE_INITIAL_VALUE
  }
  const [value, setValue] = useState(rceText)

  return value
}