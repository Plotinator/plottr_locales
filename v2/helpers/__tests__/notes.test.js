import { noteFocusPath } from '../notes'

describe('noteFocusPath', () => {
  describe('given an invalid note id', () => {
    it('should produce the unknown path', () => {
      expect(noteFocusPath('3z', { contentOrTitle: 'content' })).toEqual(['unknown'])
      expect(noteFocusPath(null, { contentOrTitle: 'content' })).toEqual(['unknown'])
      expect(noteFocusPath(undefined, { contentOrTitle: 'content' })).toEqual(['unknown'])
    })
  })
  describe('given a valid note id', () => {
    describe('and an invalid contentOrTitle', () => {
      it('should produce the unknown path', () => {
        expect(noteFocusPath('3', { contentOrTitle: 'descriptionzszz' })).toEqual(['unknown'])
        expect(noteFocusPath('3', { contentOrTitle: null })).toEqual(['unknown'])
        expect(noteFocusPath('3', { contentOrTitle: undefined })).toEqual(['unknown'])
      })
    })
    describe('and a valid contentOrTitle', () => {
      it('should produce a note focus path', () => {
        expect(noteFocusPath('3', { contentOrTitle: 'content' })).toEqual(['note', 3, 'content'])
        expect(noteFocusPath(3, { contentOrTitle: 'content' })).toEqual(['note', 3, 'content'])
        expect(noteFocusPath('3', { contentOrTitle: 'title' })).toEqual(['note', 3, 'title'])
        expect(noteFocusPath(3, { contentOrTitle: 'title' })).toEqual(['note', 3, 'title'])
      })
    })
    describe('and an invalid attributeName', () => {
      it('should produce the unknown path', () => {
        expect(noteFocusPath('3', { attributeName: null })).toEqual(['unknown'])
        expect(noteFocusPath('3', { attributeName: undefined })).toEqual(['unknown'])
      })
    })
    describe('and a valid attributeName', () => {
      it('should produce a note focus path', () => {
        expect(noteFocusPath(3, { attributeName: 'testing...' })).toEqual(['note', 3, 'testing...'])
      })
    })
  })
})
