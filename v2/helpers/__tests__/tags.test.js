import { tagFocusPath } from '../tags'

describe('tagFocusPath', () => {
  describe('given an invalid tag id', () => {
    it('should produce the unknown path', () => {
      expect(tagFocusPath('21z')).toEqual(['unknown'])
      expect(tagFocusPath(undefined)).toEqual(['unknown'])
      expect(tagFocusPath(null)).toEqual(['unknown'])
    })
  })
  describe('given a valid tag id', () => {
    describe('and an invalid type', () => {
      it('should produce the unknown path', () => {
        expect(tagFocusPath('2', 3)).toEqual(['unknown'])
        expect(tagFocusPath('2', 'test')).toEqual(['unknown'])
        expect(tagFocusPath('2', null)).toEqual(['unknown'])
        expect(tagFocusPath('2', undefined)).toEqual(['unknown'])

        expect(tagFocusPath(2, 3)).toEqual(['unknown'])
        expect(tagFocusPath(2, 'test')).toEqual(['unknown'])
        expect(tagFocusPath(2, null)).toEqual(['unknown'])
        expect(tagFocusPath(2, undefined)).toEqual(['unknown'])
      })
    })
    describe('and a valid type', () => {
      it('should produce a tag focus path', () => {
        expect(tagFocusPath(2, 'title')).toEqual(['tag', 2, 'title'])
        expect(tagFocusPath('2', 'title')).toEqual(['tag', 2, 'title'])
      })
    })
  })
})
