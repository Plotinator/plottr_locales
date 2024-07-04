import Resizer from 'react-image-file-resizer'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { dataURLtoFile, filetoDataURL } from 'image-conversion'

const maxWidth = 700
const maxHeight = 500
const format = 'WEBP' // PNG or WEBP
const quality = 50 // out of 100
const rotation = 0
const output = 'base64'

export function readImage(file, callback) {
  Resizer.imageFileResizer(file, maxWidth, maxHeight, format, quality, rotation, callback, output)
}

export function isImageUrl(url) {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  // @ts-ignore
  return imageExtensions.includes(ext)
}

export function webpURLToJpeg(url) {
  return dataURLtoFile(
    url,
    // @ts-ignore
    'image/jpeg'
  ).then((image) => {
    return filetoDataURL(image)
  })
}

export function readImageFromURL(url, callback) {
  // TODO: be able to resize this
  return fetch(url)
    .then((response) => {
      return response.blob()
    })
    .then((blob) => {
      const fileReader = new FileReader()
      fileReader.onload = function () {
        callback(this.result)
      }
      fileReader.readAsDataURL(blob)
    })
}
