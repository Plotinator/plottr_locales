import testState from './test_state.json'
import goldilocks from './goldilocks.json'
import file_with_two_characters_and_two_books_with_book_associations from './file-with-two-characters-and-two-books-with-book-associations.json'
import file_with_templates_characters_and_books from './file-with-templates-characters-and-books.json'

export const state = testState

export function headingOne(text = '') {
  return {
    type: 'heading-one',
    children: [
      {
        text,
      },
    ],
  }
}

export function headingTwo(text = '') {
  return {
    type: 'heading-two',
    children: [
      {
        text,
      },
    ],
  }
}

export function paragraph(text = '') {
  return {
    type: 'paragraph',
    children: [
      {
        text,
      },
    ],
  }
}

export function list(type, listItems) {
  return {
    type,
    children: listItems,
  }
}

export function bulletedList(listItems = [listItem()]) {
  return list('bulleted-list', listItems)
}

export function numberedList(listItems = [listItem()]) {
  return list('numbered-list', listItems)
}

export function listItem(text = '') {
  return {
    type: 'list-item',
    children: [{ text }],
  }
}

export function blockQuote(children = [{ text: '' }]) {
  return {
    type: 'block-quote',
    children,
  }
}

export {
  goldilocks,
  file_with_two_characters_and_two_books_with_book_associations,
  file_with_templates_characters_and_books,
}
