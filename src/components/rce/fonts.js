let allFonts = [
  'American Typewriter',
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Bradley Hand',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier New',
  'Didot',
  'Garamond',
  'Georgia',
  'Helvetica',
  'Impact',
  'Luminari',
  'Monaco',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
]

let plottrFonts = ['Forum', 'IBM Plex Serif', 'Lato', 'OpenDyslexic', 'Yellowtail']
let recentlyUsed = ['Forum']

export function getFonts() {
  return [...plottrFonts, ...allFonts]
}

export function getRecent() {
  return recentlyUsed
}

export function addRecent(name) {
  if (recentlyUsed.includes(name)) return

  recentlyUsed.unshift(name)
  if (recentlyUsed.length > 3) {
    recentlyUsed.pop()
  }
}
