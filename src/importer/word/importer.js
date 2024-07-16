import importHTML from '../html/importer'

const importFromWord = (pathToImport, convertDocxTohtml, version, name) => {
  return convertDocxTohtml(pathToImport).then((htmlString) => {
    return importHTML(htmlString, version, name)
  })
}

export default importFromWord
