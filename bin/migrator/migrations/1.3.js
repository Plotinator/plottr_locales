var _ = require('lodash')

function migrate (data) {
  if (data.file && data.file.version === '1.3.0') return

  var obj = _.cloneDeep(data)

  // characterSort
  obj.ui.characterSort = 'name~asc'
  // characterFilter
  obj.ui.characterFilter = null
  // placeSort
  obj.ui.placeSort = 'name~asc'
  // placeFilter
  obj.ui.placeFilter = null
  // noteSort
  obj.ui.noteSort = 'title'
  // noteFilter
  obj.ui.noteFilter = null

  return obj
}

module.exports = migrate