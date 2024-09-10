import {
  CUSTOM_ATTRIBUTE_ERROR,
  ADD_PLACES_ATTRIBUTE,
  ADD_CARDS_ATTRIBUTE,
  ADD_NOTES_ATTRIBUTE,
} from '../../constants/ActionTypes'
import { addPlaceAttr, addCardAttr, addNoteAttr } from '../customAttributes'

describe('addPlaceAttr', () => {
  describe('given an object that lacks a name', () => {
    it('should dispatch an error', () => {
      addPlaceAttr({ type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that lacks a type', () => {
    it('should dispatch an error', () => {
      addPlaceAttr({ name: 'height' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a name property of the incorrect type', () => {
    it('should dispatch an error', () => {
      addPlaceAttr({ name: 5, type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a type property of the incorrect type', () => {
    it('should dispatch an error', () => {
      addPlaceAttr({ name: 'height', type: 5 })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a type property that is invalid', () => {
    it('should dispatch an error', () => {
      addPlaceAttr({ name: 'height', type: 'omni-input' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object with a name that overlaps with base place attributes', () => {
    it('should dispatch an error', () => {
      addPlaceAttr({ name: 'id', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'name', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'description', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'notes', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'color', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'cards', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'noteIds', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'templates', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'tags', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'imageId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'bookIds', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addPlaceAttr({ name: 'position', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object with a valid name and type', () => {
    it('should dispatch a create attribute action', () => {
      addPlaceAttr({ name: 'height', type: 'text' })((action) => {
        expect(action.type).toEqual(ADD_PLACES_ATTRIBUTE)
      })
    })
  })
})

describe('addCardAttr', () => {
  describe('given an object that lacks a name', () => {
    it('should dispatch an error', () => {
      addCardAttr({ type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that lacks a type', () => {
    it('should dispatch an error', () => {
      addCardAttr({ name: 'height' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a name property of the incorrect type', () => {
    it('should dispatch an error', () => {
      addCardAttr({ name: 5, type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a type property of the incorrect type', () => {
    it('should dispatch an error', () => {
      addCardAttr({ name: 'height', type: 5 })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a type property that is invalid', () => {
    it('should dispatch an error', () => {
      addCardAttr({ name: 'height', type: 'omni-input' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object with a name that overlaps with base card attributes', () => {
    it('should dispatch an error', () => {
      addCardAttr({ name: 'id', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'lineId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'beatId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'bookId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'positionWithinLine', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'positionInBeat', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'title', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'description', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'tags', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'characters', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'places', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'templates', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'imageId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'fromTemplateId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addCardAttr({ name: 'color', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object with a valid name and type', () => {
    it('should dispatch a create attribute action', () => {
      addCardAttr({ name: 'height', type: 'text' })((action) => {
        expect(action.type).toEqual(ADD_CARDS_ATTRIBUTE)
      })
    })
  })
})

describe('addNoteAttr', () => {
  describe('given an object that lacks a name', () => {
    it('should dispatch an error', () => {
      addNoteAttr({ type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that lacks a type', () => {
    it('should dispatch an error', () => {
      addNoteAttr({ name: 'height' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a name property of the incorrect type', () => {
    it('should dispatch an error', () => {
      addNoteAttr({ name: 5, type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a type property of the incorrect type', () => {
    it('should dispatch an error', () => {
      addNoteAttr({ name: 'height', type: 5 })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object that has a type property that is invalid', () => {
    it('should dispatch an error', () => {
      addNoteAttr({ name: 'height', type: 'omni-input' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object with a name that overlaps with base note attributes', () => {
    it('should dispatch an error', () => {
      addNoteAttr({ name: 'id', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'title', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'content', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'categoryId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'tags', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'characters', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'places', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'lastEdited', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'templates', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'imageId', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'bookIds', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
      addNoteAttr({ name: 'position', type: 'text' })((action) => {
        expect(action.type).toEqual(CUSTOM_ATTRIBUTE_ERROR)
      })
    })
  })
  describe('given an object with a valid name and type', () => {
    it('should dispatch a create attribute action', () => {
      addNoteAttr({ name: 'height', type: 'text' })((action) => {
        expect(action.type).toEqual(ADD_NOTES_ATTRIBUTE)
      })
    })
  })
})
