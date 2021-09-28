const CURRENT_PROJECT_KEY = 'CURRENT_PROJECT'

export const currentProject = () => window.sessionStorage.getItem(CURRENT_PROJECT_KEY)

export const setCurrentProject = (id) => {
  window.sessionStorage._setItem(CURRENT_PROJECT_KEY, id)
}
