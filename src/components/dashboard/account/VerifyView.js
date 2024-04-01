import React from 'react'

import { t } from 'plottr_locales'

const VerifyViewConnector = (connector) => {
  const VerifyView = () => {
    return (
      <div className="verify__wrapper text-center">
        <h1>{t('THIS IS A PLACEHOLDER AND WILL DISSAPEAR WHEN THE UX GOES VIA LOGIN')}</h1>
      </div>
    )
  }

  return VerifyView
}

export default VerifyViewConnector
