import { repeat } from 'lodash'
import { createSelector } from 'reselect'

import { isSeries } from '../helpers/books'
import { depth } from '../reducers/tree'
import { noEntityHasLegacyAttributeBound } from './noEntitiyHasValueBound'

// Other selector dependencies
import { allCardsSelector, singleCardSelector } from './cardsFirstOrder'
import { allBeatsSelector } from './beatsFirstOrder'
import { previouslyLoggedIntoProSelector } from './settingsFirstOrder'
import { isLoggedInSelector, isOnWebSelector, userIdSelector } from './clientFirstOrder'
import { permissionSelector } from './permissionFirstOrder'
import { allBookIdsSelector } from './booksFirstOrder'
import {
  cardsCustomAttributesSelector,
  noteCustomAttributesSelector,
  placeCustomAttributesSelector,
} from './customAttributesFirstOrder'
import { allNotesSelector } from './notesFirstOrder'
import { allLinesSelector } from './linesFirstOrder'
import { fullFileStateSelector } from './fullFileFirstOrder'
import {
  hasActiveProLicenseSelector,
  needsToCheckPlottrLicense,
  needsToCheckProLicense,
} from './licenseFirstOrder'

export const shouldBeInProSelector = createSelector(
  previouslyLoggedIntoProSelector,
  isOnWebSelector,
  (previouslyLoggedIntoPro, isOnWeb) => {
    return previouslyLoggedIntoPro || isOnWeb
  }
)

export const rootUiSelector = createSelector(fullFileStateSelector, ({ ui }) => ui ?? {})
export const uiCollaboratorsSelector = createSelector(rootUiSelector, (rootUi) => {
  return rootUi.collaborators
})
export const uiSelector = createSelector(
  shouldBeInProSelector,
  userIdSelector,
  permissionSelector,
  rootUiSelector,
  (shouldBeLoggedIn, userId, permission, ui) => {
    if (!shouldBeLoggedIn) {
      return ui
    } else if (!userId || !permission) {
      return ui
    } else if (permission === 'owner') {
      return ui
    } else if (permission === 'collaborator') {
      const existingUI = ui.collaborators?.collaborators?.find((collaborator) => {
        return collaborator?.id === userId
      })

      return existingUI ?? ui
    } else if (permission === 'viewer') {
      const existingUI = ui.collaborators?.viewers?.find((viewer) => {
        return viewer?.id === userId
      })

      return existingUI ?? ui
    } else {
      return ui
    }
  }
)

export const currentTimelineSelector = createSelector(
  uiSelector,
  allBookIdsSelector,
  (ui, bookIds) => {
    const currentTimeline = ui.currentTimeline
    if (currentTimeline == 'series') return currentTimeline
    if (bookIds.includes(currentTimeline)) {
      return currentTimeline
    } else {
      return bookIds[0] ?? 1
    }
  }
)

export const characterFilterSelector = createSelector(uiSelector, ({ characterFilter }) => {
  return characterFilter
})
export const characterSortSelector = createSelector(uiSelector, ({ characterSort }) => {
  return characterSort
})
export const noteFilterSelector = createSelector(uiSelector, ({ noteFilter }) => {
  return noteFilter
})
export const noteSortSelector = createSelector(uiSelector, ({ noteSort }) => {
  return noteSort
})
export const placeFilterSelector = createSelector(uiSelector, ({ placeFilter }) => {
  return placeFilter
})
export const placeSortSelector = createSelector(uiSelector, ({ placeSort }) => {
  return placeSort
})
export const timelineFilterSelector = createSelector(uiSelector, ({ timelineFilter }) => {
  return timelineFilter
})
export const outlineFilterSelector = createSelector(uiSelector, ({ outlineFilter }) => {
  return outlineFilter
})
export const timelineSelector = createSelector(uiSelector, ({ timeline }) => {
  return timeline ?? {}
})
export const editingBeatTitleIdSelector = createSelector(timelineSelector, ({ editingBeatId }) => {
  return editingBeatId
})
export const contextMenuBeatTimelineSelector = createSelector(
  timelineSelector,
  ({ contextMenuBeat }) => {
    return contextMenuBeat
  }
)
export const timelineBeatToDeleteSelector = createSelector(timelineSelector, ({ beatToDelete }) => {
  return beatToDelete
})
export const timelineSizeSelector = createSelector(timelineSelector, ({ size }) => {
  return size
})
export const isSmallSelector = createSelector(timelineSizeSelector, (size) => {
  return size == 'small'
})
export const isMediumSelector = createSelector(timelineSizeSelector, (size) => {
  return size === 'medium'
})
export const isLargeSelector = createSelector(timelineSizeSelector, (size) => {
  return size == 'large'
})
export const timelineScrollPositionSelector = createSelector(
  uiSelector,
  ({ timelineScrollPosition }) => {
    return timelineScrollPosition
  }
)
export const isNotesManuallySortedSelector = createSelector(noteSortSelector, (sort) => {
  return sort == 'manual'
})
export const isCharactersManuallySortedSelector = createSelector(characterSortSelector, (sort) => {
  return sort == 'manual'
})
export const isPlacesManuallySortedSelector = createSelector(placeSortSelector, (sort) => {
  return sort == 'manual'
})

export const attributesDialogIsOpenSelector = createSelector(
  uiSelector,
  ({ attributesDialogIsOpen }) => {
    return attributesDialogIsOpen
  }
)
export const currentViewSelector = createSelector(uiSelector, ({ currentView }) => {
  return currentView
})

export const isSeriesSelector = createSelector(currentTimelineSelector, isSeries)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) => filter == null || Object.keys(filter).every((key) => !filter[key].length)
)

export const searchTermSelector = createSelector(uiSelector, ({ searchTerms }) => {
  return searchTerms ?? {}
})
export const notesSearchTermSelector = createSelector(searchTermSelector, ({ notes }) => {
  return notes
})
export const charactersSearchTermSelector = createSelector(searchTermSelector, ({ characters }) => {
  return characters
})
export const placesSearchTermSelector = createSelector(searchTermSelector, ({ places }) => {
  return places
})
export const tagsSearchTermSelector = createSelector(searchTermSelector, ({ tags }) => {
  return tags
})
export const outlineSearchTermSelector = createSelector(searchTermSelector, ({ outline }) => {
  return outline
})
export const timelineSearchTermSelector = createSelector(searchTermSelector, ({ timeline }) => {
  return timeline
})

export const selectedTimelineViewSelector = createSelector(timelineSelector, ({ view }) => {
  return view ?? 'default'
})

const countPinnedLines = (lines, bookId) => {
  return lines.reduce((pinnedCount, line) => {
    return pinnedCount + (line.bookId === bookId && line.isPinned ? 1 : 0)
  }, 0)
}

const bookIdSelector = (_state, id) => id
export const pinnedPlotlinesForAnotherBookSelector = createSelector(
  allLinesSelector,
  bookIdSelector,
  countPinnedLines
)

export const pinnedPlotlinesSelector = createSelector(
  allLinesSelector,
  currentTimelineSelector,
  countPinnedLines
)

export const allHierarchyLevelsSelector = createSelector(
  fullFileStateSelector,
  ({ hierarchyLevels }) => hierarchyLevels ?? {}
)
export const hierarchyLevelsSelector = createSelector(
  allHierarchyLevelsSelector,
  currentTimelineSelector,
  (allLevels, timeline) => {
    return allLevels[timeline]
  }
)
export const hierarchyLevelCount = createSelector(hierarchyLevelsSelector, (hierarchyLevels) => {
  return hierarchyLevels ? Object.keys(hierarchyLevels).length : 1
})
export const timelineViewSelector = createSelector(
  selectedTimelineViewSelector,
  hierarchyLevelCount,
  (selectedView, levelsOfHierarchy) => {
    if (selectedView === 'tabbed' && levelsOfHierarchy < 2) {
      return 'default'
    }
    return selectedView
  }
)
export const timelineViewIsTabbedSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'tabbed'
})
export const timelineViewIsStackedSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'stacked'
})
export const timelineSelectedTabSelector = createSelector(timelineSelector, ({ actTab }) => {
  return actTab ?? 0
})
export const timelineViewIsDefaultSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'default'
})
export const timelineViewIsntDefaultSelector = createSelector(timelineViewSelector, (view) => {
  return view !== 'default'
})

const selectedOrientationSelector = createSelector(
  uiSelector,
  ({ orientation }) => orientation ?? 'horizontal'
)

export const stickyHeaderCountSelector = createSelector(
  pinnedPlotlinesSelector,
  timelineViewIsStackedSelector,
  hierarchyLevelCount,
  selectedOrientationSelector,
  (pinnedPlotlines, timelineViewIsStacked, hierarchyLevelCount, selectedOrientation) => {
    if (selectedOrientation == 'vertical') {
      return 1
    }
    if (timelineViewIsStacked) {
      return hierarchyLevelCount + pinnedPlotlines
    } else if (pinnedPlotlines) {
      return pinnedPlotlines + 1
    } else {
      return 1
    }
  }
)

export const stickyLeftColumnCountSelector = createSelector(
  pinnedPlotlinesSelector,
  timelineViewIsStackedSelector,
  hierarchyLevelCount,
  selectedOrientationSelector,
  (pinnedPlotlines, timelineViewIsStacked, hierarchyLevelCount, selectedOrientation) => {
    if (selectedOrientation == 'horizontal' || timelineViewIsStacked) {
      return 1
    } else if (pinnedPlotlines) {
      return pinnedPlotlines + 1
    } else {
      return 1
    }
  }
)

export const actConfigModalSelector = createSelector(uiSelector, ({ actConfigModal }) => {
  return actConfigModal ?? {}
})
export const actConfigModalIsOpenSelector = createSelector(actConfigModalSelector, ({ open }) => {
  return open
})

export const characterTabSelector = createSelector(uiSelector, ({ characterTab }) => {
  return characterTab ?? {}
})
export const selectedCharacterSelector = createSelector(
  characterTabSelector,
  ({ selectedCharacter }) => {
    if (selectedCharacter || selectedCharacter === 0) {
      return selectedCharacter
    }

    return null
  }
)
export const customAttributeOrderSelector = createSelector(
  uiSelector,
  ({ customAttributeOrder }) => {
    return customAttributeOrder ?? {}
  }
)
export const characterCustomAttributeOrderSelector = createSelector(
  customAttributeOrderSelector,
  ({ characters }) => characters ?? []
)

const templateModalSelector = createSelector(uiSelector, ({ templateModal }) => {
  return templateModal ?? {}
})
export const templateModalAdvancedPanelOpenSelector = createSelector(
  templateModalSelector,
  ({ expanded }) => {
    return !!expanded
  }
)

const cardDialogSelector = createSelector(uiSelector, ({ cardDialog }) => {
  return cardDialog
})
export const isCardDialogDeletingSelector = createSelector(cardDialogSelector, ({ deleting }) => {
  return deleting
})
export const isCardDialogColorPickerOpenSelector = createSelector(
  cardDialogSelector,
  ({ showColorPicker }) => {
    return showColorPicker
  }
)
export const isCardDialogTemplatePickerOpenSelector = createSelector(
  cardDialogSelector,
  ({ showTemplatePicker }) => {
    return showTemplatePicker
  }
)
export const isCardDialogTemplateBeingRemoved = createSelector(
  cardDialogSelector,
  ({ removeWhichTemplate }) => {
    return !!removeWhichTemplate
  }
)
export const whichTemplateIsBeingRemovedViaCardDialogSelector = createSelector(
  cardDialogSelector,
  ({ removeWhichTemplate }) => {
    return removeWhichTemplate
  }
)
export const cardDialogTabSelector = createSelector(cardDialogSelector, ({ activeTab }) => {
  return activeTab ?? 1
})

export const cardsCustomAttributesThatCanChangeSelector = createSelector(
  allCardsSelector,
  cardsCustomAttributesSelector,
  noEntityHasLegacyAttributeBound
)

export const notesCustomAttributesThatCanChangeSelector = createSelector(
  allNotesSelector,
  noteCustomAttributesSelector,
  noEntityHasLegacyAttributeBound
)

export const beatsByBookSelector = createSelector(
  allBeatsSelector,
  currentTimelineSelector,
  (beats, bookId) => {
    return beats[bookId]
  }
)

export const sortedHierarchyLevels = createSelector(
  hierarchyLevelCount,
  hierarchyLevelsSelector,
  (levels, hierarchyLevels) => {
    const sortedLevels = []
    for (let i = 0; i < levels; ++i) {
      sortedLevels.push(hierarchyLevels[i])
    }
    return sortedLevels
  }
)
const beatIdSelector = (state, beatId) => beatId
export const beatExistsSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  (beats, beatId) => {
    return typeof beats.index[beatId] === 'object'
  }
)
export const hierarchyLevelSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  beatExistsSelector,
  (beats, beatId, hierarchyLevels, beatExists) => {
    return (
      (beatExists && hierarchyLevels[depth(beats, beatId)]) ||
      hierarchyLevels[hierarchyLevels.length - 1]
    )
  }
)
export const hierarchyLevelsForAnotherBookSelector = createSelector(
  allHierarchyLevelsSelector,
  bookIdSelector,
  (hierarchies, bookId) => {
    return hierarchies[bookId]
  }
)

export const atMaximumHierarchyDepthSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  beatExistsSelector,
  (beats, beatId, hierarchyLevels, beatExists) => {
    return beatExists && depth(beats, beatId) === hierarchyLevels.length - 1
  }
)

export const hierarchyLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  beatExistsSelector,
  (beats, beatId, hierarchyLevels, beatExists) => {
    if (!beatId || !beatExists) return hierarchyLevels[0]?.name
    return (
      (hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1])
        ?.name ?? hierarchyLevels[0]?.name
    )
  }
)

export const beatInsertControlHierarchyLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  timelineViewIsTabbedSelector,
  timelineViewIsDefaultSelector,
  beatExistsSelector,
  (beats, beatId, hierarchyLevels, timelineViewIsTabbed, timelineViewIsDefault, beatExists) => {
    if (timelineViewIsTabbed) {
      if (!beatExists || depth(beats, beatId) === 0) {
        return (hierarchyLevels[1] || hierarchyLevels[0]).name
      } else if (!beatId) {
        return (hierarchyLevels[2] || hierarchyLevels[1] || hierarchyLevels[0]).name
      }
    }

    if (!beatExists || (timelineViewIsDefault && !beatId)) {
      return hierarchyLevels[0].name
    } else {
      return (hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1])
        ?.name
    }
  }
)

export const hierarchyChildLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  beatExistsSelector,
  (beats, beatId, hierarchyLevels, beatExists) => {
    if (!beatId || !beatExists) return (hierarchyLevels[1] || hierarchyLevels[0]).name
    const newDepth = depth(beats, beatId) + 1
    const level = hierarchyLevels[newDepth]
    if (level) {
      return level.name
    } else {
      return `${repeat('Sub-', newDepth - hierarchyLevels.length + 1)}${
        (hierarchyLevels[hierarchyLevels.length - 1] || { name: '' })?.name
      }`
    }
  }
)

export const placeFilterIsEmptySelector = createSelector(
  placeFilterSelector,
  placeCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, ...attributes]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
  }
)

export const noteFilterIsEmptySelector = createSelector(
  noteFilterSelector,
  noteCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [
      { name: 'place' },
      { name: 'tag' },
      { name: 'book' },
      { name: 'noteCategory' },
      { name: 'character' },
      ...attributes,
    ]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
  }
)

export const topLevelBeatNameSelector = createSelector(sortedHierarchyLevels, (levels) => {
  return levels[0].name
})

export const filteredItemsSelector = createSelector(
  currentViewSelector,
  timelineFilterSelector,
  characterFilterSelector,
  placeFilterSelector,
  outlineFilterSelector,
  noteFilterSelector,
  (currentView, timelineFilter, characterFilter, placeFilter, outlineFilter, noteFilter) => {
    switch (currentView) {
      case 'timeline':
        return timelineFilter
      case 'outline':
        return outlineFilter
      case 'places':
        return placeFilter
      case 'characters':
        return characterFilter
      case 'notes':
        return noteFilter
      default:
        return []
    }
  }
)

export const cardsLineSelector = createSelector(
  singleCardSelector,
  allLinesSelector,
  (card, lines) => {
    if (!card) {
      return null
    }

    return (
      lines.find(({ id }) => {
        return card.lineId === id
      }) || {}
    )
  }
)

export const cardsLineOrDefaultSelector = createSelector(
  cardsLineSelector,
  allLinesSelector,
  (line, lines) => {
    return line || lines[0]
  }
)

export const isLoggedIntoProWithActiveLicenseSelector = createSelector(
  isLoggedInSelector,
  previouslyLoggedIntoProSelector,
  hasActiveProLicenseSelector,
  isOnWebSelector,
  (isLoggedIn, shouldBeInPro, hasActiveProLicense, isOnWeb) => {
    return isLoggedIn && (isOnWeb || (shouldBeInPro && hasActiveProLicense))
  }
)

export const needsToCheckALicenseType = createSelector(
  needsToCheckPlottrLicense,
  needsToCheckProLicense,
  isLoggedInSelector,
  (needsToCheckPlottr, needsToCheckPro, isLoggedIn) => {
    return needsToCheckPlottr || needsToCheckPro || (!needsToCheckPro && !isLoggedIn)
  }
)
