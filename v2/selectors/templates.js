import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

import { isLoggedInSelector } from './client'

const unsortedStarterTemplatesSelector = (state) => state.templates.templates
export const templatesSelector = createSelector(unsortedStarterTemplatesSelector, (templates) =>
  sortBy(Object.values(templates), 'name')
)
export const allCustomTemplatesSelector = (state) => state.templates.customTemplates
export const customTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  isLoggedInSelector,
  (allCustomTemplates, isLoggedIn) => {
    // Produce cloud templates when logged in and non-cloud templates
    // when not logged in.
    return sortBy(
      allCustomTemplates.filter(({ isCloudTemplate }) => !!isCloudTemplate === !!isLoggedIn),
      'name'
    )
  }
)
export const fileSystemCustomTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  (customTemplates) => {
    return customTemplates.filter(({ isCloudTemplate }) => !isCloudTemplate)
  }
)
export const templateManifestSelector = (state) => state.templates.templateManifets
const templateIdSelector = (state, templateId) => templateId
export const templateByIdSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  templateIdSelector,
  (templates, customTemplates, templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)
export const templateByIdFnSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  (templates, customTemplates) => (templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)
const templateTypeSelector = (state, type) => type
const templateSearchTermSelector = (state, _, searchTerm) => searchTerm
export const filteredSortedStarterTemplatesSelector = createSelector(
  templatesSelector,
  templateTypeSelector,
  templateSearchTermSelector,
  (templates, type, searchTerm) => {
    return sortBy(
      templates.filter((t) => {
        if (searchTerm && searchTerm.length > 1) {
          return t.name.toLowerCase().includes(searchTerm) && t.type == type
        } else if (type) {
          return t.type == type
        } else {
          return true
        }
      }),
      'name'
    )
  }
)
export const filteredSortedCustomTemplatesSelector = createSelector(
  customTemplatesSelector,
  templateTypeSelector,
  templateSearchTermSelector,
  (templates, type, searchTerm) => {
    return sortBy(
      templates.filter((t) => {
        if (searchTerm && searchTerm.length > 1) {
          return t.name.toLowerCase().includes(searchTerm) && t.type == type
        } else if (type) {
          return t.type == type
        } else {
          return true
        }
      }),
      'name'
    )
  }
)
