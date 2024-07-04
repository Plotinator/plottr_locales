import React, { useRef, useState } from 'react'

import { t } from 'plottr_locales'

import FormControl from '../../FormControl'
import CustomTemplates from './CustomTemplates'
import StarterTemplates from './StarterTemplates'

const TemplatesHome = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const type = useRef('plotlines').current

  return (
    <div className="dashboard__templates">
      <FormControl
        type="search"
        placeholder={t('Search')}
        className="dashboard__search"
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <CustomTemplates type={type} searchTerm={searchTerm} />
      <StarterTemplates type={type} searchTerm={searchTerm} />
    </div>
  )
}

export default TemplatesHome
