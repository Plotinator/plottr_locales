import { Node } from 'slate'

export const serialize = (nodes, isWindows) => {
  const joiner = isWindows ? '\r\n' : '\n'

  if (!nodes || !nodes.map) return ''
  if (typeof nodes === 'string') return isWindows ? nodes.replace(/\n/g, joiner) : nodes

  return nodes
    .map((n) => {
      const nodeString = Node.string(n)

      switch (n.type) {
        case 'numbered-list':
          return n.children.map((li) => `- ${Node.string(li)}`).join(joiner)
        case 'bulleted-list':
          return n.children.map((li, idx) => `${idx + 1}. ${Node.string(li)}`).join(joiner)
        case 'heading-one':
        case 'heading-two':
          return nodeString + joiner
        case 'link':
          return n.url
        case 'image-link':
          return n.url || nodeString
        case 'image-data':
        case 'list-item':
        case 'block-quote':
        case 'paragraph':
        default:
          return nodeString
      }
    })
    .join(joiner)
}

export const serializeNoFormatting = (nodes, isWindows) => {
  const joiner = isWindows ? '\r\n' : '\n'

  if (!nodes || !nodes.map) return ''
  if (typeof nodes === 'string') return isWindows ? nodes.replace(/\n/g, joiner) : nodes

  const serialiseNode = (node) => {
    if (typeof node.text === 'string') {
      return Node.string(node)
    } else {
      const nodeString = Node.string(node)
      switch (node.type) {
        case 'block-quote':
        case 'numbered-list':
        case 'bulleted-list': {
          return node.children.map((li) => `${serialiseNode(li)}`).join('')
        }
        case 'heading-one':
        case 'heading-two':
          return nodeString + joiner
        case 'link':
          return node.url
        case 'image-link':
          return node.url || nodeString
        case 'image-data':
        case 'list-item':
        case 'paragraph':
        default: {
          if (typeof node.children[0]?.text === 'string') {
            return nodeString + joiner
          } else {
            return node.children.map((li) => `${serialiseNode(li)}`).join('')
          }
        }
      }
    }
  }

  return nodes.map(serialiseNode).join('')
}
