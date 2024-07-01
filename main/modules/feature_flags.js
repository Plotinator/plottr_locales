export const makeFeatureFlagsModule = (localClient, log) => {
  const featureFlags = () => {
    return localClient
      .currentAppSettings()
      .then((_settings) => {
        return {}
      })
      .catch((error) => {
        log.error('Could not read current settings for feature flags', error)
        return Promise.reject(error)
      })
  }

  return {
    featureFlags,
  }
}
