const date = new Date()
const VERSION = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`

export const appVersion = () => {
  return VERSION
}
