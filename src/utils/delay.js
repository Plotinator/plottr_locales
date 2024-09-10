export const delay = (f) => {
  const id = setTimeout(f, 0)
  return () => {
    clearTimeout(id)
  }
}
