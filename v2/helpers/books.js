export const isSeries = (id) => id === 'series'

export const getCopyName = (arr, name, entity, counter = 0) => {
  let copyName = counter ? `${name} ${counter}` : name
  const hasDuplicate = arr.some((item) => {
    return item[entity] && item[entity]?.indexOf(copyName) !== -1
  })
  if (hasDuplicate) {
    return getCopyName(arr, name, entity, counter + 1)
  }
  return copyName
}
