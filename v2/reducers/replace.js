import { isObject } from 'lodash'

export const replacePlainTextHit = (text, start, hit, replacement) => {
  if (text.slice(start).toLowerCase().startsWith(hit.toLowerCase())) {
    return text.slice(0, start) + replacement + text.slice(start + hit.length)
  } else {
    return text
  }
}

export const replaceInSlateDatastructure = (data, start, hit, replacement) => {
  function iter(position, node) {
    if (Array.isArray(node)) {
      if (node.length === 0) {
        return [position, []]
      } else {
        const [newPosition, replaced] = iter(position, node[0])
        if (newPosition > start) {
          return [newPosition, [replaced, ...node.slice(1)]]
        } else {
          const [finalPosition, rest] = iter(newPosition, node.slice(1))
          return [finalPosition, [node[0], ...rest]]
        }
      }
    } else if (isObject(node)) {
      if (typeof node.text === 'string') {
        const positionAtEndOfText = position + node.text.length
        const isInThisText =
          positionAtEndOfText > start && start + hit.length <= positionAtEndOfText
        if (isInThisText) {
          return [
            positionAtEndOfText,
            {
              ...node,
              text: replacePlainTextHit(node.text, start - position, hit, replacement),
            },
          ]
        } else {
          return [positionAtEndOfText, { ...node }]
        }
      } else if (Array.isArray(node.children)) {
        const [newPosition, replaced] = iter(position, node.children)
        const positionAdjustment = typeof node.children[0]?.text === 'string' ? 1 : 0
        return [
          newPosition + positionAdjustment,
          {
            ...node,
            children: replaced,
          },
        ]
      } else {
        return [position, {}]
      }
    } else if (typeof node === 'string') {
      const positionAtEndOfText = position + node.length
      const isInThisText = positionAtEndOfText > start && start + hit.length <= positionAtEndOfText
      if (isInThisText) {
        return [positionAtEndOfText, replacePlainTextHit(node, start - position, hit, replacement)]
      } else {
        return [positionAtEndOfText, '']
      }
    } else {
      throw new Error(`Failed to parse slate at ${position}, ${JSON.stringify(node)}`)
    }
  }

  return iter(0, data)[1]
}
