import semverCoerce from 'semver/functions/coerce'

/**
 * @param {String} version
 * @returns {object}
 */
export const toSemver = (version) => {
  const cleanedVersion = version.replace('m', '').replace(/_/g, '.').replace('*', '')
  const result = semverCoerce(cleanedVersion)
  if (!result) {
    throw new Error(
      `Invalid semver version: ${version} (${cleanedVersion}) [${typeof semverCoerce(
        cleanedVersion
      )}]`
    )
  } else {
    return result
  }
}
