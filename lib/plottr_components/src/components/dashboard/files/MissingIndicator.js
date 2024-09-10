import React from 'react'
import { t } from 'plottr_locales'

import Glyphicon from '../../Glyphicon'

export default function MissingIndicator() {
  return <Glyphicon glyph="warning-sign" title={t("File can't be found. Did it move?")} />
}
