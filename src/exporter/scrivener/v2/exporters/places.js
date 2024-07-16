import { omit, capitalize } from 'lodash'

import { t } from 'plottr_locales'

import {
  createFolderBinderItem,
  createTextBinderItem,
  buildTemplateProperties,
  buildDescriptionFromObject,
} from '../utils'

const PLACE_BASE_ATTRIBUTES_EXCLUDING_NAME = ['description', 'notes', 'tags', 'category']

function namesInsteadOfIds(place, key, tags, categories) {
  switch (key) {
    case 'tags': {
      return place.tags
        .map((tagId) => {
          return tags.find(({ id }) => {
            return id === tagId
          })?.title
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'notes': {
      return place.notes
    }
    case 'description': {
      return place.description
    }
    case 'category': {
      return categories.find(({ id }) => {
        // NOTE: One or the other id might be a string integer!
        return id == place.categoryId
      })?.name
    }
    default: {
      return []
    }
  }
}

function placeBaseAttributes(place, tags, categories) {
  return PLACE_BASE_ATTRIBUTES_EXCLUDING_NAME.reduce((attributes, next) => {
    const value = namesInsteadOfIds(place, next, tags, categories)
    const key = capitalize(next)
    if (value) {
      return {
        ...attributes,
        [key]: value,
      }
    } else {
      return attributes
    }
  }, {})
}

export default function exportPlaces(state, documentContents, options, selectors) {
  const {
    placesSortedInBookSelector,
    allTagsSelector,
    placeCategoriesSelector,
    placeCustomAttributesSelector,
  } = selectors
  const { binderItem } = createFolderBinderItem(t('Places'))
  const places = placesSortedInBookSelector(state)
  const tags = allTagsSelector(state)
  const categories = placeCategoriesSelector(state)
  const customAttributes = placeCustomAttributesSelector(state)
  places.forEach((place) => {
    const name = place.name
    const { id, binderItem: placeBinderItem } = createTextBinderItem(name)
    binderItem.Children.BinderItem.push(
      // @ts-ignore
      placeBinderItem
    )

    const placeProperties = placeBaseAttributes(place, tags, categories)
    const withoutTagsIfDisabled = !options.places.tags
      ? omit(placeProperties, 'Tags')
      : placeProperties
    const withCustomAttributesIfEnabled = options.places.customAttributes
      ? customAttributes.reduce((acc, attribute) => {
          return {
            ...acc,
            ...(place[attribute.name] ? { [attribute.name]: place[attribute.name] } : {}),
          }
        }, withoutTagsIfDisabled)
      : withoutTagsIfDisabled

    const withTemplatesIfEnabled = options.places.templates
      ? [
          ...buildDescriptionFromObject(withCustomAttributesIfEnabled, options.places),
          ...buildDescriptionFromObject(buildTemplateProperties(place.templates), true),
        ]
      : buildDescriptionFromObject(withCustomAttributesIfEnabled, options.places)

    documentContents[id] = {
      body: {
        docTitle: options.places.heading ? name : null,
        description: withTemplatesIfEnabled,
      },
    }
  })

  return binderItem
}
