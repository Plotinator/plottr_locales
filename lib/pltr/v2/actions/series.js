import {
  EDIT_SERIES,
  LOAD_SERIES,
  SET_SERIES_GENRE,
  SET_SERIES_NAME,
  SET_SERIES_PREMISE,
  SET_SERIES_THEME,
} from '../constants/ActionTypes'

// Deprecated!
export function editSeries(attributes) {
  return { type: EDIT_SERIES, attributes }
}

export function setSeriesName(name, selection) {
  return { type: SET_SERIES_NAME, name, selection }
}

export function setSeriesPremise(premise, selection) {
  return { type: SET_SERIES_PREMISE, premise, selection }
}

export function setSeriesGenre(genre, selection) {
  return { type: SET_SERIES_GENRE, genre, selection }
}

export function setSeriesTheme(theme, selection) {
  return { type: SET_SERIES_THEME, theme, selection }
}

export function load(patching, series) {
  return { type: LOAD_SERIES, patching, series }
}
