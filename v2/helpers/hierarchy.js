import { DASHED, DOTTED, NONE, SOLID } from '../store/borderStyle'
import { t } from 'plottr_locales'

import { getTextColor } from './colors'

export const borderStyleToCss = (borderStyle) => {
  switch (borderStyle) {
    case NONE:
      return 'solid'
    case DASHED:
      return 'dashed'
    case SOLID:
      return 'solid'
    case DOTTED:
      return 'dotted'
    default:
      return 'none'
  }
}

const nullIfNone = (color) => (color === 'none' ? null : color)

const noneIsTransparent = (borderStyle, borderColor) => {
  return borderStyle === NONE || borderColor === 'none' ? 'transparent' : borderColor
}

export const hierarchyToStyles = (
  { level, textSize, borderStyle, backgroundColor },
  timelineSize,
  hovering,
  theme,
  isDarkMode
) => ({
  ...{
    color: nullIfNone(getTextColor(theme.textColor, isDarkMode)),
    lineHeight: `${textSize}px`,
    backgroundColor: nullIfNone(backgroundColor),
  },
  ...(!hovering
    ? {
        border: `3px ${borderStyleToCss(borderStyle)} ${noneIsTransparent(
          borderStyle,
          theme.borderColor
        )}`,
      }
    : {}),
  ...(timelineSize === 'large'
    ? {
        fontSize: `${textSize}px`,
      }
    : {}),
})

export const nextLevelName = (depth) => {
  const LEVEL_NAMES = [t('Scene'), t('Chapter'), t('Act')]
  if (depth == 'default') return t('Chapter')
  return LEVEL_NAMES[depth] || `Level-${depth + 1}`
}
