import { placeFocusPath } from '../places'

describe('placeFocusPath', () => {
  describe('given an invalid place id', () => {
    it('should produce the unknown path', () => {
      expect(placeFocusPath('2zz', { type: 'name' })).toEqual(['unknown'])
      expect(placeFocusPath(null, { type: 'name' })).toEqual(['unknown'])
      expect(placeFocusPath(undefined, { type: 'name' })).toEqual(['unknown'])
    })
  })
  describe('given a valid place id', () => {
    describe('and an invalid customAttributeName', () => {
      it('should produce the unknown path', () => {
        expect(placeFocusPath('2', { customAttributeName: 3 })).toEqual(['unknown'])
        expect(placeFocusPath('2', { customAttributeName: null })).toEqual(['unknown'])
        expect(placeFocusPath('2', { customAttributeName: undefined })).toEqual(['unknown'])
      })
    })
    describe('and a valid customAttributeName', () => {
      it('should produce a place focus path', () => {
        expect(placeFocusPath(2, { customAttributeName: 'blarg' })).toEqual(['place', 2, 'blarg'])
      })
    })
    describe('and an invalid type', () => {
      it('should produce the unknown path', () => {
        expect(placeFocusPath(2, { type: 'namezz' })).toEqual(['unknown'])
      })
    })
    describe('and a valid type', () => {
      it('should produce a place focus path', () => {
        expect(placeFocusPath(2, { type: 'name' })).toEqual(['place', 2, 'name'])
        expect(placeFocusPath(2, { type: 'description' })).toEqual(['place', 2, 'description'])
        expect(placeFocusPath(2, { type: 'notes' })).toEqual(['place', 2, 'notes'])
      })
    })
  })
})
