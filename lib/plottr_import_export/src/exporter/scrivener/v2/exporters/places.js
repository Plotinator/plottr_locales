import { t } from 'plottr_locales'
import {
  createFolderBinderItem,
  createTextBinderItem,
  buildTagsString,
  buildTemplateProperties,
  buildDescriptionFromObject,
} from '../utils'

export default function exportPlaces(state, documentContents, options, selectors) {
  const { placesSortedInBookSelector } = selectors
  const { binderItem } = createFolderBinderItem(t('Places'))
  const places = placesSortedInBookSelector(state)
  places.forEach((place) => {
    const {
      // these attributes are not being used
      /* eslint-disable */
      cards,
      colors,
      id: placeId,
      imageId,
      noteIds,
      bookIds,
      /* eslint-enable */

      //used for the export
      name,
      tags,
      templates,
      ...placeProperties
    } = place
    const { id, binderItem: placeBinderItem } = createTextBinderItem(name)
    binderItem.Children.BinderItem.push(placeBinderItem)

    // handle tags
    if (options.places.tags) {
      placeProperties.Tags = buildTagsString(tags, state, selectors)
    }

    let description = buildDescriptionFromObject(placeProperties, options.places)
    // handle template properties
    if (options.places.templates) {
      description = [
        ...description,
        ...buildDescriptionFromObject(buildTemplateProperties(templates), true),
      ]
    }

    documentContents[id] = {
      body: {
        docTitle: options.places.heading ? name : null,
        description,
      },
    }
  })

  return binderItem
}
