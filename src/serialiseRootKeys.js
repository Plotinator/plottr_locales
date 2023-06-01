export const serialiseRootKeys = (key) => (object) => {
  switch (key) {
    case 'cards': {
      return Object.entries(object).reduce((acc, entry) => {
        const [key, value] = entry
        return {
          ...acc,
          [key]: JSON.stringify(value),
        }
      }, {})
    }
    default: {
      return object
    }
  }
}

export const deserialiseRootKeys = (key) => (object) => {
  switch (key) {
    case 'cards': {
      return Object.entries(object).reduce((acc, entry) => {
        const [key, value] = entry
        try {
          return {
            ...acc,
            [key]: JSON.parse(value),
          }
        } catch (error) {
          return {
            ...acc,
            [key]: value,
          }
        }
      }, {})
    }
    default: {
      return object
    }
  }
}
