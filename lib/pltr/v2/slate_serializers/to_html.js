import { EMFJS, RTFJS, WMFJS } from 'rtf.js'

RTFJS.loggingEnabled(false)
WMFJS.loggingEnabled(false)
EMFJS.loggingEnabled(false)

// String -> Promise<NodeList>
export const rtfToHTML = (arrayBuffer) => {
  const doc = new RTFJS.Document(arrayBuffer)
  return doc
    .render()
    .then((htmlElements) => {
      const nodeLists = htmlElements.map((el) => el.querySelectorAll('span'))
      const result = []
      for (let i = 0; i < nodeLists.length; ++i) {
        const nodeList = nodeLists[i]
        for (let j = 0; j < nodeList.length; ++j) {
          result.push(nodeList[j])
        }

        if (!nodeList.length) {
          const span = document.createElement('span')
          const node = document.createTextNode('...')
          result.push(span.appendChild(node))
        }
      }
      return result
    })
    .catch((error) => {
      // FIXME: this wont work on the web :/
      console.error('rtfjs', error)
      return []
    })
}
