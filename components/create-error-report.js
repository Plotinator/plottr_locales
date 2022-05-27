import { upperFirst, camelCase, keys } from 'lodash'
import { DateTime } from 'luxon'
import { applicationStateSelector } from 'pltr/v2/selectors/applicationState'
import { allBeatsSelector } from 'pltr/v2/selectors/beats'
import { allBookIdsSelector } from 'pltr/v2/selectors/books'
import { hierarchyLevelCount } from 'pltr/v2/selectors/hierarchy'

export function createWebReport(state) {
  const locale = state.settings.appSettings.locale
  const stateStartTime = state.actions.startTimestamp
  const file = state.project.selectedFile
  const totalCards = state.cards.length
  const totalLines = state.lines.length
  const totalCharacters = state.characters.length
  const totalNotes = state.notes.length
  const totalTags = state.tags.length
  const totalPlaces = state.places.length
  const client = state.client
  const totalBooks = allBookIdsSelector(state).length
  const applicationState = applicationStateSelector(state)
  const allBeats = allBeatsSelector(state)
  const hierarchyLevel = hierarchyLevelCount(state)

  const clientArr = getStateValue(client)
  const selectedFile = getStateValue(file)
  const applicationStateObj = getStateValue(applicationState)
  const currentTimeStamp = DateTime.local()
    .setLocale(locale)
    .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
  const sessionTimeStamp = DateTime.fromMillis(stateStartTime)
    .setLocale(locale)
    .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)

  const totalBeats = Object.values(allBeats).reduce((acc, curr) => {
    if (curr.index && keys(curr.index) && keys(curr.index).length) {
      return acc + keys(curr.index).length
    }
    return acc
  }, 0)

  const report = `Date: ${currentTimeStamp}
Session start: ${sessionTimeStamp}
\n
----------------------------------
CLIENT INFO
----------------------------------
\n${clientArr && clientArr.length ? clientArr.join('\n') : ''}
\n
----------------------------------
FILE INFO
----------------------------------
\n${
    selectedFile && selectedFile.length
      ? selectedFile.filter((i) => !i.startsWith('{') && !i.endsWith('}')).join('\n')
      : 'No file selected'
  }
\n
----------------------------------
AGGREGATIONS
----------------------------------
\n
Hierarchy Level: ${hierarchyLevel}
Books: ${totalBooks}
Beats: ${totalBeats}
Plotlines: ${totalLines}
Cards: ${totalCards}
Characters: ${totalCharacters}
Notes: ${totalNotes}
Places: ${totalPlaces}
Tags: ${totalTags}
\n
----------------------------------
GENERIC INFO
----------------------------------
\n
${applicationStateObj}
`
  return download('plottr-user-report.txt', report)
}

const download = (fileName, report) => {
  const data = new Blob([report], { type: 'text/plain' })
  const link = document.createElement('a')
  link.download = fileName
  link.href = window.URL.createObjectURL(data)
  link.dataset.downloadurl = `text/plain:${link.download}:${link.href}`
  link.dispatchEvent(new MouseEvent('click'), {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  link.remove()
}

const camelSnakeCaseToCapitalizedWords = (string) => {
  const f = (str) =>
    camelCase(str).replace(/(?<=[a-z\d])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])(?=[_])/g, ' ')
  const words = f(string)
  return upperFirst(words)
}

const extractObjectValues = (root, obj) => {
  const key = camelSnakeCaseToCapitalizedWords(obj)
  if (isAnObject(root[obj])) {
    const stateObj = getStateValue(root[obj])

    return JSON.stringify({ [key]: stateObj }, null, 2)
  }
  return `${key}: ${root[obj] || 'false'}`
}

const isAnObject = (obj) => {
  return obj && typeof obj === 'object' && obj.constructor === Object
}

const getStateValue = (obj) => {
  if (isAnObject(obj)) {
    return Object.keys(obj).map((i) => {
      if (isAnObject(i)) {
        return getStateValue(i)
      }
      return extractObjectValues(obj, i)
    })
  }
}
