import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import Glyphicon from '../Glyphicon'
import RichText from '../rce/RichText'
import Image from '../images/Image'

const CharacterDetails = ({
  getTemplateById,
  templateAttributeValue,
  startEditing,
  character,
  customAttributes,
  categories,
}) => {
  const customAttrNotes = customAttributes.map((attr, idx) => {
    const { name, type, value } = attr
    let desc
    if (type == 'paragraph') {
      desc = (
        <dd>
          <RichText id={`character-${character.id}-custom-attribute-${name}`} description={value} />
        </dd>
      )
    } else {
      desc = <dd>{value}</dd>
    }
    return (
      <dl key={idx} className="dl-horizontal">
        <dt>{name}</dt>
        {desc}
      </dl>
    )
  })
  const templateNotes = character.templates.map((thisTemplate) => {
    const templateData = getTemplateById(thisTemplate.id)
    const attrs = thisTemplate.attributes.map((attr) => {
      const attributeValue = templateAttributeValue(thisTemplate.id, attr.name)
      let val
      if (attr.type == 'paragraph') {
        val = (
          <dd>
            <RichText
              id={`character-${character.id}-template-${thisTemplate.id}-attribute-${attr.name}`}
              description={attributeValue}
            />
          </dd>
        )
      } else {
        val = <dd>{attributeValue}</dd>
      }
      return (
        <dl key={attr.name} className="dl-horizontal">
          <dt>{attr.name}</dt>
          {val}
        </dl>
      )
    })
    return (
      <React.Fragment key={thisTemplate.id}>
        <p>{templateData?.name || thisTemplate.name || t('Template')}</p>
        {attrs}
      </React.Fragment>
    )
  })

  const category = categories.find((cat) => cat.id == character.categoryId)

  return (
    <div className="character-list__character-wrapper">
      <div className="character-list__character" onClick={startEditing}>
        <h4 className="secondary-text">{character.name || t('New Character')}</h4>
        <div className="character-list__character-notes">
          <div>
            <Image size="large" shape="circle" imageId={character.imageId} />
            <dl className="dl-horizontal">
              <dt>{t('Description')}</dt>
              <dd>{character.description}</dd>
            </dl>
            <dl className="dl-horizontal">
              <dt>{t('Category')}</dt>
              <dd>{(category && category.name) || t('Uncategorized')}</dd>
            </dl>
            <dl className="dl-horizontal">
              <dt>{t('Notes')}</dt>
              <dd>
                <RichText id={`character-${character.id}-notes`} description={character.notes} />
              </dd>
            </dl>
            {customAttributes.length ? <p>{t('Attributes')}</p> : null}
            {customAttrNotes}
            {templateNotes}
          </div>
          <div className="character-list__right-side">
            <Glyphicon glyph="pencil" />
          </div>
        </div>
      </div>
    </div>
  )
}

CharacterDetails.propTypes = {
  characterId: PropTypes.number.isRequired,
  character: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  startEditing: PropTypes.func.isRequired,
  getTemplateById: PropTypes.func.isRequired,
  templateAttributeValue: PropTypes.func.isRequired,
}

const mapStateToProps = (state, ownProps) => {
  return {
    character: selectors.displayedSingleCharacterSelector(
      state,
      // @ts-ignore
      ownProps.characterId
    ),
    categories: selectors.characterCategoriesSelector(state),
    customAttributes: selectors.characterAttributesSelector(
      state,
      // @ts-ignore
      ownProps.characterId
    ),
    getTemplateById: (templateId) =>
      selectors.templateByIdSelector(
        state,
        // @ts-ignore
        templateId
      ),
    templateAttributeValue: (templateId, attributeName) => {
      return selectors.characterTemplateAttributeValueSelector(
        state,
        // @ts-ignore
        ownProps.characterId,
        templateId,
        attributeName
      )
    },
  }
}

export default connect(mapStateToProps)(CharacterDetails)
