import { ADD_CHARACTER, EDIT_CHARACTER, FILE_LOADED, NEW_FILE, RESET,
  ADD_CHARACTER_TO_CARD, REMOVE_CHARACTER_FROM_CARD,
  ADD_CHARACTER_TO_NOTE, REMOVE_CHARACTER_FROM_NOTE } from '../constants/ActionTypes'
import { character } from 'store/initialState'
import { newFileCharacters } from 'store/newFileState'
import { characterId } from 'store/newIds'

const initialState = [character]

export default function characters (state = initialState, action) {
  switch (action.type) {
    case ADD_CHARACTER:
      return [...state, {
        id: characterId(state),
        name: action.name,
        description: action.description,
        notes: action.notes,
        color: character.color,
        cards: []
      }]

    case EDIT_CHARACTER:
      return state.map(character =>
        character.id === action.id ? Object.assign({}, character, action.attributes) : character
      )

    case ADD_CHARACTER_TO_CARD:
      return state.map(character => {
        let cards = _.cloneDeep(character.cards)
        cards.push(action.id)
        return character.id === action.characterId ? Object.assign({}, character, {cards: cards}) : character
      })

    case REMOVE_CHARACTER_FROM_CARD:
      return state.map(character => {
        let cards = _.cloneDeep(character.cards)
        cards.splice(cards.indexOf(action.id), 1)
        return character.id === action.characterId ? Object.assign({}, character, {cards: cards}) : character
      })

    case ADD_CHARACTER_TO_NOTE:
      return state.map(character => {
        let notes = _.cloneDeep(character.noteIds)
        notes.push(action.id)
        return character.id === action.characterId ? Object.assign({}, character, {noteIds: notes}) : character
      })

    case REMOVE_CHARACTER_FROM_NOTE:
      return state.map(character => {
        let notes = _.cloneDeep(character.noteIds)
        notes.splice(notes.indexOf(action.id), 1)
        return character.id === action.characterId ? Object.assign({}, character, {noteIds: notes}) : character
      })

    case RESET:
    case FILE_LOADED:
      return action.data.characters

    case NEW_FILE:
      return newFileCharacters

    default:
      return state
  }
}
