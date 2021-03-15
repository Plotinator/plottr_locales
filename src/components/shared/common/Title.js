import React from 'react'
import Text from './Text'
import { t } from 'plottr_locales'

const Title = ({ title }) => {
  return (
    <Text fontStyle={'bold'} color={null}>
      {title}
    </Text>
  )
}

export const RenderTitle = name => <Title title={t(name)} />

export default Title
