// From: https://github.com/tbluemel/rtf.js/blob/HEAD/GETTING_STARTED.md
function stringToArrayBuffer(string) {
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

function stripListTable(rtfString) {
  const startListTable = rtfString.indexOf('{\\*\\listtable')
  if (startListTable === -1) {
    return rtfString
  } else {
    // 12 is the length of the string that starts the list table.
    let endListTable = startListTable + 12
    for (let depth = 1; endListTable < rtfString.length && depth > 0; ++endListTable) {
      if (rtfString[endListTable] === '}') {
        --depth
      } else if (rtfString[endListTable] === '{') {
        ++depth
      }
    }
    return rtfString.slice(0, startListTable) + rtfString.slice(endListTable)
  }
}

// String -> Promise<NodeList>
export const rtfToHTML = (string) => {
  return import('rtf.js').then(({ RTFJS }) => {
    RTFJS.loggingEnabled(false)

    // @ts-ignore
    const doc = new RTFJS.Document(stringToArrayBuffer(stripListTable(string)))
    return doc.render().catch((error) => {
      // FIXME: this wont work on the web :/
      console.error('rtfjs', error)
      return []
    })
  })
}
