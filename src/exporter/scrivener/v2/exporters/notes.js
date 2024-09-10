import { capitalize } from 'lodash'

import { t as i18n } from 'plottr_locales'

import { createFolderBinderItem, createTextBinderItem, buildDescriptionFromObject } from '../utils'

const NOTE_BASE_ATTRIBUTES_EXCLUDING_TITLE = ['content', 'tags', 'characters', 'places', 'category']

function namesInsteadOfIds(note, key, characters, places, tags, categories) {
  switch (key) {
    case 'characters': {
      return note.characters
        .map((characterId) => {
          return characters.find(({ id }) => {
            return id === characterId
          })?.name
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'places': {
      return note.places
        .map((placeId) => {
          return places.find(({ id }) => {
            return id === placeId
          })?.name
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'tags': {
      return note.tags
        .map((tagId) => {
          return tags.find(({ id }) => {
            return id === tagId
          })?.title
        })
        .filter(Boolean)
        .join(', ')
    }
    case 'content': {
      return note.content
    }
    case 'category': {
      return categories.find(({ id }) => {
        // NOTE: One or the other id might be a string integer!
        return id == note.categoryId
      })?.name
    }
    default: {
      return []
    }
  }
}

function noteBaseAttributes(note, characters, places, tags, categories) {
  return NOTE_BASE_ATTRIBUTES_EXCLUDING_TITLE.reduce((attributes, next) => {
    const value = namesInsteadOfIds(note, next, characters, places, tags, categories)
    if (value) {
      return {
        ...attributes,
        [capitalize(next)]: value,
      }
    } else {
      return attributes
    }
  }, {})
}

export default function exportNotes(state, documentContents, options, selectors) {
  const {
    allNotesInBookSelector,
    allTagsSelector,
    allPlacesSelector,
    allCharactersSelector,
    noteCustomAttributesSelector,
    noteCategoriesSelector,
  } = selectors
  const { binderItem } = createFolderBinderItem(i18n('Notes'))
  const notes = allNotesInBookSelector(state)
  const tags = allTagsSelector(state)
  const places = allPlacesSelector(state)
  const characters = allCharactersSelector(state)
  const customAttributes = noteCustomAttributesSelector(state)
  const categories = noteCategoriesSelector(state)

  notes.forEach((note) => {
    const { title } = note

    const { id, binderItem: noteBinderItem } = createTextBinderItem(title)
    binderItem.Children.BinderItem.push(
      // @ts-ignore
      noteBinderItem
    )

    const baseAttributes = noteBaseAttributes(note, characters, places, tags, categories)
    const withCustomAttributes = customAttributes.reduce((attributes, next) => {
      return {
        ...baseAttributes,
        [next.name]: note[next.name],
      }
    }, baseAttributes)

    documentContents[id] = {
      body: {
        docTitle: options.notes.heading ? title : null,
        description: buildDescriptionFromObject(withCustomAttributes, true),
      },
    }
  })

  return binderItem
}
