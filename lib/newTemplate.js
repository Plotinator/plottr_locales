import { cloneDeep } from 'lodash'

import { tree, helpers } from 'pltr/v2'
import { saveCustomTemplate } from './firebase'

export const addNewCustomTemplate = (pltrData, { type, data, userId }) => {
  if (type === 'plotlines') {
    createPlotlineTemplate(pltrData, userId, data)
  } else if (type === 'characters') {
    createCharacterTemplate(pltrData, userId, data)
  } else if (type === 'scenes') {
    createScenesTemplate(pltrData, userId, data)
  } else {
    console.error('Unsupported template type', type)
    return
  }

  console.log('Template saved...')
}

const createPlotlineTemplate = (pltrData, userId, { name, description, link }) => {
  const data = cloneDeep(pltrData)
  const id = makeNewId('pl')
  const bookId = data.ui.currentTimeline

  let template = {
    id: id,
    version: process.env.NEXT_PUBLIC_VERSION,
    type: 'plotlines',
    name: name,
    description: description,
    link: link,
    templateData: {},
  }

  // only the beats in current book
  const beats = data.beats[bookId]
  // change bookId to 1
  template.templateData.beats = {
    1: tree.map(beats, (book) => {
      book.bookId = 1
      return book
    }),
  }

  // only the lines in current book
  const bookLines = data.lines.filter((line) => line.bookId === bookId)
  // change bookId to 1
  template.templateData.lines = bookLines.map((l) => {
    l.bookId = 1
    return l
  })

  // only cards in beats
  if (data.cards.length) {
    const beatIds = helpers.beats.beatIds(beats)
    let cards = []

    bookLines.forEach((line) => {
      const cardsInLine = data.cards.filter(
        ({ beatId, lineId }) => beatIds.includes(beatId) && lineId == line.id
      )
      cards = cards.concat(cardsInLine)
    })

    template.templateData.cards = cards
  }

  saveCustomTemplate(userId, template)
}

const createCharacterTemplate = (pltrData, userId, { name, description, link }) => {
  const data = cloneDeep(pltrData)

  let id = makeNewId('ch')
  const template = {
    id: id,
    version: process.env.NEXT_PUBLIC_VERSION,
    type: 'characters',
    name: name,
    description: description,
    link: link,
    attributes: data.customAttributes.characters,
  }
  saveCustomTemplate(userId, template)
}

const createScenesTemplate = (pltrData, userId, { name, description, link }) => {
  const data = cloneDeep(pltrData)

  let id = makeNewId('sc')
  const template = {
    id: id,
    version: process.env.NEXT_PUBLIC_VERSION,
    type: 'scenes',
    name: name,
    description: description,
    link: link,
    attributes: data.customAttributes.scenes,
  }
  saveCustomTemplate(userId, template)
}

const makeNewId = (prefix) => {
  return Math.random().toString(16).replace('0.', `${prefix}`).substr(0, 8)
}
