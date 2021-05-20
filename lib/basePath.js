export const basePath = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.slice(1)
  }

  return ''
}
