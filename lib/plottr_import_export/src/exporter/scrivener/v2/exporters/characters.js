import { t as i18n } from 'plottr_locales'

import {
  createFolderBinderItem,
  createTextBinderItem,
  buildTagsString,
  buildCharacterTemplateProperties,
  buildDescriptionFromObject,
} from '../utils'

const seriesToAll = (timelineName) => {
  if (timelineName === 'series') {
    return 'all'
  }
  return timelineName
}

export default function exportCharacters(state, documentContents, options, selectors) {
  const { characterCategoriesSelector } = selectors
  const { binderItem } = createFolderBinderItem(i18n('Characters'))
  const showBookTabs = selectors.showBookTabsSelector(state)
  const bookToExport = !showBookTabs ? 'all' : seriesToAll(selectors.currentTimelineSelector(state))
  const characters = selectors.allDisplayedCharactersForCurrentBookSelector(
    state,
    null,
    bookToExport
  )
  const allCharacterCategories = Object.values(characterCategoriesSelector(state))
  characters.forEach((character) => {
    const {
      // these attributes are not being used
      /* eslint-disable */
      cards,
      color,
      id: characterId,
      imageId,
      noteIds,
      bookIds,
      clientId,
      fileId,
      fileURL,
      isCloudFile,
      /* eslint-enable */

      // used for the export
      name,
      categoryId,
      tags,
      templates,
      ...remainingCharacterProperties
    } = character
    const attributes = selectors.characterAttributesSelector(state, characterId, bookToExport)
    const characterProperties = attributes.reduce((acc, next) => {
      return {
        ...acc,
        [next.name]: next.value,
      }
    }, remainingCharacterProperties)
    const { id, binderItem: characterBinderItem } = createTextBinderItem(name)
    binderItem.Children.BinderItem.push(
      // @ts-ignore
      characterBinderItem
    )

    // handle tags
    if (options.characters.tags) {
      characterProperties.Tags = buildTagsString(tags, state, selectors)
    }

    // handle categories
    if (options.characters.category) {
      if (categoryId != null) {
        const category = allCharacterCategories.find(
          (category) => String(category.id) == String(categoryId)
        )
        characterProperties.Category = category.name
      }
    }

    let description = buildDescriptionFromObject(characterProperties, options.characters)

    // handle template properties
    if (options.characters.templates) {
      description = [
        ...description,
        ...buildDescriptionFromObject(
          buildCharacterTemplateProperties(state, templates, selectors, characterId),
          true
        ),
      ]
    }

    documentContents[id] = {
      body: {
        docTitle: options.characters.heading ? name : null,
        description,
      },
    }
  })
  return binderItem
}
