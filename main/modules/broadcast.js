import { BrowserWindow } from 'electron'

const broadcastToAllWindows = (event, payload) => {
  BrowserWindow.getAllWindows().forEach((bw) => {
    if (typeof bw?.webContents !== 'function') {
      bw.webContents.send(event, payload)
    }
  })
}

export { broadcastToAllWindows }
