import { t } from 'plottr_locales'

export function attachmentHeaderTitles (type) {
  switch (type) {
    case 'characters':
      return t('Attach Characters')
    case 'places':
      return t('Attach Places')
    case 'tags':
      return t('Attach Tags')
    case 'books':
    case 'bookIds':
      return t('Attach Books')
  }
}

export function attachmentItemText (type) {
  switch (type) {
    case 'characters':
      return t('Characters')
    case 'places':
      return t('Places')
    case 'tags':
      return t('Tags')
    case 'books':
    case 'bookIds':
      return t('Books')
  }
}