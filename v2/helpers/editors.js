export const cardDescriptionEditorPath = (cardId) => `cards__${cardId}__description`
export const cardCustomAttributeEditorPath = (cardId, attributeName) =>
  `cards__${cardId}__customAttributes__${attributeName}`
export const cardTemplateAttributeEditorPath = (cardId, templateId, attributeName) =>
  `cards__${cardId}__templates__${templateId}__${attributeName}`

export const noteContentEditorPath = (noteId) => `notes__${noteId}__content`
export const noteCustomAttributeEditorPath = (noteId, attributeName) =>
  `cards__${noteId}__customAttributes__${attributeName}`
export const noteTemplateAttributeEditorPath = (noteId, templateId, attributeName) =>
  `cards__${noteId}__templates__${templateId}__${attributeName}`

export const characterNotesEditorPath = (characterId) => `characters__${characterId}__notes`
export const characterCustomAttributeEditorPath = (characterId, attributeName) =>
  `characters__${characterId}__customAttributes__${attributeName}`
export const characterTemplateAttributeEditorPath = (characterId, templateId, attributeName) =>
  `characters__${characterId}__templates__${templateId}__${attributeName}`

export const placeNotesEditorPath = (placeId) => `places__${placeId}__notes`
export const placeCustomAttributeEditorPath = (placeId, attributeName) =>
  `places__${placeId}__customAttributes__${attributeName}`
export const placeTemplateAttributeEditorPath = (placeId, templateId, attributeName) =>
  `places__${placeId}__templates__${templateId}__${attributeName}`

export const editorPathforType = (entityType, entityId) => {
  switch (entityType) {
    case 'card':
      return cardDescriptionEditorPath(entityId)
    case 'note':
      return noteContentEditorPath(entityId)
    case 'character':
      return characterNotesEditorPath(entityId)
    case 'place':
      return placeNotesEditorPath(entityId)
    default:
      return cardDescriptionEditorPath(entityId)
  }
}

export const editorPathforTypesAttribute = (entityType, entityId, attributeName) => {
  switch (entityType) {
    case 'card':
      return cardCustomAttributeEditorPath(entityId, attributeName)
    case 'note':
      return noteCustomAttributeEditorPath(entityId, attributeName)
    case 'character':
      return characterCustomAttributeEditorPath(entityId, attributeName)
    case 'place':
      return placeCustomAttributeEditorPath(entityId, attributeName)
    default:
      return cardCustomAttributeEditorPath(entityId, attributeName)
  }
}

export const editorPathforTypesTemplateAttribute = (entityType, entityId, templateId, attributeName) => {
  switch (entityType) {
    case 'card':
      return cardTemplateAttributeEditorPath(entityId, templateId, attributeName)
    case 'note':
      return noteTemplateAttributeEditorPath(entityId, templateId, attributeName)
    case 'character':
      return characterTemplateAttributeEditorPath(entityId, templateId, attributeName)
    case 'place':
      return placeTemplateAttributeEditorPath(entityId, templateId, attributeName)
    default:
      return cardTemplateAttributeEditorPath(entityId, templateId, attributeName)
  }
}

export const attrIfPresent = (attrName, value) =>
  value || value === ''
    ? {
        [attrName]: value,
      }
    : {}

export const editorMetadataIfPresent = (editorPath, selection) => {
  if (editorPath && selection) {
    return {
      editorMetadata: {
        editorPath,
        selection,
      },
    }
  }

  return {}
}
