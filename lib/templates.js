import axios from 'axios'
import semverGt from 'semver/functions/gt'
import { sortBy } from 'lodash'

const manifestURL =
  'https://raw.githubusercontent.com/Plotinator/plottr_templates/master/v2/manifest.json'
// FIXME: when the beat hierarchy becomes non-beta then we can just
// use manifest URL.
const betaManifestURL =
  'https://raw.githubusercontent.com/Plotinator/plottr_templates/project-hierarchy/v2/manifest.json'

const TEMPLATE_PREFIX = 'templates__'
const TEMPLATE_MANIFEST_KEY = 'template_manifest'

const safeParse = (string) => {
  try {
    return JSON.parse(string)
  } catch (error) {
    console.error(`Error parsing ${string} from JSON`, error)
    return null
  }
}

const sessionStorageValue = (key) => {
  const valueString = window.sessionStorage.getItem(key)
  if (!valueString) return null
  return safeParse(valueString)
}

const manifest = () => {
  return sessionStorageValue(TEMPLATE_MANIFEST_KEY)
}

const fetchedManifestIsNewer = (fetchedManifest) => {
  const existingManifest = manifest()
  if (!existingManifest) return true

  return semverGt(fetchedManifest.version, existingManifest.version)
}

const templateKey = (templateId) => {
  return `templates__${templateId}`
}

const saveTemplate = (template) => {
  window.sessionStorage.setItem(templateKey(template.id), JSON.stringify(template))
}

const saveManifest = (manifest) => {
  window.sessionStorage.setItem(TEMPLATE_MANIFEST_KEY, JSON.stringify(manifest))
}

export const seedTemplates = (force = false, projectStructureEnabled = false) => {
  axios
    .get(projectStructureEnabled ? betaManifestURL : manifestURL)
    .then((response) => {
      if (response.status == 200) {
        const manifest = response.data
        if (force || fetchedManifestIsNewer(manifest)) {
          saveManifest(manifest)
          console.log('new templates found', manifest.version)
          return fetchTemplates(force, manifest)
        } else {
          console.log('No new template manifest', manifest.version)
          return []
        }
      } else {
        return Promise.reject(`Non 200 response for fetching the manifest ${response}`)
      }
    })
    .then((templates) => {
      console.log(
        'Fetched template with ids',
        templates.map(({ id }) => id)
      )
      templates.forEach(saveTemplate)
    })
    .catch((error) => {
      console.error('Error fetching templates', error)
    })
}

const fetchTemplate = (id, url) => {
  return axios.get(url).then((response) => {
    if (response.status == 200) {
      return response.data
    } else {
      return Promise.reject(`Non 200 code in ${response}`)
    }
  })
}

const templateById = (templateId) => {
  return sessionStorageValue(templateKey(templateId))
}

const templateIsNewer = (templateId, templateVersion) => {
  const existingTemplate = templateById(templateId)
  if (!existingTemplate) return true

  return semverGt(templateVersion, existingTemplate.version)
}

const fetchTemplates = (force, manifest) => {
  return Promise.all(
    manifest.templates.map((template) => {
      if (force || templateIsNewer(template.id, template.version)) {
        return fetchTemplate(template.id, template.url)
      } else {
        return templateById(template.id)
      }
    })
  )
}

const isTemplateKey = (key) => {
  return key.startsWith('templates__')
}

export const allTemplates = () => {
  return Object.entries(window.sessionStorage).reduce((acc, [key, templateString]) => {
    if (isTemplateKey(key)) {
      const template = safeParse(templateString)
      if (template) return [...acc, template]
    }
    return acc
  }, [])
}

export const listTemplates = (type) => {
  return sortBy(
    allTemplates().filter((template) => template.type === type),
    'name'
  )
}
