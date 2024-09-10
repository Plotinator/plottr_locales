const fs = require('fs')

const enTranslationsExtracted = fs.statSync('./src/en-extracted.json')
  ? JSON.parse(fs.readFileSync('./src/en-extracted.json').toString('utf8'))
  : []
const enTranslations = JSON.parse(fs.readFileSync('./src/en.json').toString('utf8'))
const frTranslations = JSON.parse(fs.readFileSync('./src/fr.json').toString('utf8'))
const esTranslations = JSON.parse(fs.readFileSync('./src/es.json').toString('utf8'))
const faTranslations = JSON.parse(fs.readFileSync('./src/fa.json').toString('utf8'))
const ruTranslations = JSON.parse(fs.readFileSync('./src/ru.json').toString('utf8'))
const deTranslations = JSON.parse(fs.readFileSync('./src/de.json').toString('utf8'))
const itTranslations = JSON.parse(fs.readFileSync('./src/it.json').toString('utf8'))
const ptTranslations = JSON.parse(fs.readFileSync('./src/pt.json').toString('utf8'))
const elTranslations = JSON.parse(fs.readFileSync('./src/el.json').toString('utf8'))
const zhTranslations = JSON.parse(fs.readFileSync('./src/zh.json').toString('utf8'))
const hiTranslations = JSON.parse(fs.readFileSync('./src/hi.json').toString('utf8'))

const enKeys = new Set(Object.keys(enTranslations))
const frKeys = new Set(Object.keys(frTranslations))
const esKeys = new Set(Object.keys(esTranslations))
const faKeys = new Set(Object.keys(faTranslations))
const ruKeys = new Set(Object.keys(ruTranslations))
const deKeys = new Set(Object.keys(deTranslations))
const itKeys = new Set(Object.keys(itTranslations))
const ptKeys = new Set(Object.keys(ptTranslations))
const elKeys = new Set(Object.keys(elTranslations))
const zhKeys = new Set(Object.keys(zhTranslations))
const hiKeys = new Set(Object.keys(hiTranslations))

const all_keys = new Set(
  Object.keys(enTranslationsExtracted)
    .concat(Object.keys(enTranslations))
    .concat(Object.keys(frTranslations))
    .concat(Object.keys(esTranslations))
    .concat(Object.keys(faTranslations))
    .concat(Object.keys(ruTranslations))
    .concat(Object.keys(deTranslations))
    .concat(Object.keys(itTranslations))
    .concat(Object.keys(ptTranslations))
    .concat(Object.keys(elTranslations))
    .concat(Object.keys(zhTranslations))
    .concat(Object.keys(hiTranslations))
)

const newEnTranslations = Object.assign({}, enTranslations)
const newFrTranslations = Object.assign({}, frTranslations)
const newEsTranslations = Object.assign({}, esTranslations)
const newFaTranslations = Object.assign({}, faTranslations)
const newRuTranslations = Object.assign({}, ruTranslations)
const newDeTranslations = Object.assign({}, deTranslations)
const newItTranslations = Object.assign({}, itTranslations)
const newPtTranslations = Object.assign({}, ptTranslations)
const newElTranslations = Object.assign({}, elTranslations)
const newZhTranslations = Object.assign({}, zhTranslations)
const newHiTranslations = Object.assign({}, hiTranslations)

all_keys.forEach((key) => {
  if (!enKeys.has(key)) {
    newEnTranslations[key] = {
      message: key,
    }
  }
  if (!frKeys.has(key)) {
    newFrTranslations[key] = {
      message: key,
    }
  }
  if (!esKeys.has(key)) {
    newEsTranslations[key] = {
      message: key,
    }
  }
  if (!faKeys.has(key)) {
    newFaTranslations[key] = {
      message: key,
    }
  }
  if (!ruKeys.has(key)) {
    newRuTranslations[key] = {
      message: key,
    }
  }
  if (!deKeys.has(key)) {
    newDeTranslations[key] = {
      message: key,
    }
  }
  if (!itKeys.has(key)) {
    newItTranslations[key] = {
      message: key,
    }
  }
  if (!ptKeys.has(key)) {
    newPtTranslations[key] = {
      message: key,
    }
  }
  if (!elKeys.has(key)) {
    newElTranslations[key] = {
      message: key,
    }
  }
  if (!zhKeys.has(key)) {
    newZhTranslations[key] = {
      message: key,
    }
  }
  if (!hiKeys.has(key)) {
    newHiTranslations[key] = {
      message: key,
    }
  }
})

fs.writeFileSync('./src/fr.json', JSON.stringify(newFrTranslations, null, 2))
fs.writeFileSync('./src/es.json', JSON.stringify(newEsTranslations, null, 2))
fs.writeFileSync('./src/en.json', JSON.stringify(newEnTranslations, null, 2))
fs.writeFileSync('./src/fa.json', JSON.stringify(newFaTranslations, null, 2))
fs.writeFileSync('./src/ru.json', JSON.stringify(newRuTranslations, null, 2))
fs.writeFileSync('./src/de.json', JSON.stringify(newDeTranslations, null, 2))
fs.writeFileSync('./src/it.json', JSON.stringify(newItTranslations, null, 2))
fs.writeFileSync('./src/pt.json', JSON.stringify(newPtTranslations, null, 2))
fs.writeFileSync('./src/el.json', JSON.stringify(newElTranslations, null, 2))
fs.writeFileSync('./src/zh.json', JSON.stringify(newZhTranslations, null, 2))
fs.writeFileSync('./src/hi.json', JSON.stringify(newHiTranslations, null, 2))
