function migrate(data) {
  if (data.file && data.file.version === '2022.5.18') return data

  // Web files might not have a `ui` key.
  if (data.ui && !data.ui.searchTerms) {
    return {
      ...data,
      ui: {
        ...data.ui,
        searchTerms: {
          notes: null,
          characters: null,
          places: null,
          tags: null,
        },
      },
    }
  }
  return data
}

module.exports = migrate
