import { isObject } from 'lodash'

const unescapeHTML = (escapedHTMLText) => {
  const replace = (hit) => {
    switch (hit) {
      case '&lt;':
        return '<'
      case '&gt;':
        return '>'
      case '&quot;':
        return '"'
      case '&apos;':
        return "'"
      case '&amp;':
        return '&'
      case ' ':
      case '&nbsp;':
        return ' '
      default:
        return hit
    }
  }

  function iter(node) {
    if (Array.isArray(node)) {
      return node.map(iter)
    } else if (isObject(node)) {
      return Object.entries(node).reduce((acc, nextKeyValue) => {
        const [_key, value] = nextKeyValue
        return {
          ...acc,
          key: iter(value),
        }
      }, {})
    } else if (typeof node === 'string') {
      // We want to turn non breaking spaces back into spaces because
      // those are difficult to enter by a user.
      //
      // eslint-disable-next-line no-irregular-whitespace
      return node.replace(/&lt;|&gt;|&quot;|&apos;|&amp;|&nbsp;| /g, replace)
    } else {
      return node
    }
  }

  return iter(escapedHTMLText)
}

export default unescapeHTML
