// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'

const unsortedStarterTemplatesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.templates.templates
)
export const templatesSelector = createSelector(unsortedStarterTemplatesSelector, (templates) =>
  sortBy(Object.values(templates), 'name')
)
export const allCustomTemplatesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.templates.customTemplates
)
export const fileSystemCustomTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  (customTemplates) => {
    return customTemplates.filter(({ isCloudTemplate }) => !isCloudTemplate)
  }
)
export const templateManifestSelector = createSelector(
  fullFileStateSelector,
  (state) => state.templates.templateManifets
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
