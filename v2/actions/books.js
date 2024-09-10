import {
  ADD_BOOK,
  EDIT_BOOK,
  DELETE_BOOK,
  REORDER_BOOKS,
  LOAD_BOOKS,
  ADD_BOOK_FROM_TEMPLATE,
  EDIT_BOOK_IMAGE,
  SET_BOOK_TITLE,
  SET_BOOK_PREMISE,
  SET_BOOK_GENRE,
  SET_BOOK_THEME,
  DUPLICATE_BOOK,
} from '../constants/ActionTypes'
import { book } from '../store/initialState'

export function addBook(title, premise, genre, theme) {
  return { type: ADD_BOOK, book, title, premise, genre, theme }
}

export function addBookFromTemplate(templateData) {
  return { type: ADD_BOOK_FROM_TEMPLATE, book, templateData }
}

export function editBook(id, title, premise, genre, theme) {
  return { type: EDIT_BOOK, id, title, premise, genre, theme }
}

export function editBookContent(bookContent = book) {
  return { type: EDIT_BOOK, ...bookContent }
}

export function setBookTitle(id, title, selection) {
  return { type: SET_BOOK_TITLE, id, title, selection }
}

export function setBookPremise(id, premise, selection) {
  return { type: SET_BOOK_PREMISE, id, premise, selection }
}

export function setBookGenre(id, genre, selection) {
  return { type: SET_BOOK_GENRE, id, genre, selection }
}

export function setBookTheme(id, theme, selection) {
  return { type: SET_BOOK_THEME, id, theme, selection }
}

export function editBookImage(id, imageId) {
  return { type: EDIT_BOOK_IMAGE, id, imageId }
}

export function deleteBook(id) {
  return { type: DELETE_BOOK, id }
}

export function reorderBooks(ids) {
  return { type: REORDER_BOOKS, ids }
}

export function load(patching, books) {
  return { type: LOAD_BOOKS, patching, books }
}

export function duplicateBook(id) {
  return { type: DUPLICATE_BOOK, id }
}
