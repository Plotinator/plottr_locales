import React from 'react'
import PropTypes from 'prop-types'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'

import { helpers } from 'pltr'

import ToolTip from '../../ToolTip'
import RichText from '../../rce/RichText'

const {
  card: { richContentIsNonEmpty },
} = helpers

const TitleHint = (props) => {
  const { cardId, cardDescription } = props

  if (richContentIsNonEmpty(cardDescription)) {
    return (
      <ToolTip
        id={`plan-view-card-${cardId}`}
        // @ts-ignore
        text={
          <div className="outline__card__popover-wrapper">
            <RichText
              id={`plan-view__card-${cardId}-description`}
              description={cardDescription}
              className="outline__card__description plan"
            />
          </div>
        }
      >
        <FaInfoCircle />
      </ToolTip>
    )
  }
  return <div></div>
}

TitleHint.propTypes = {
  cardDescription: PropTypes.array,
  cardId: PropTypes.number,
}

export default TitleHint
