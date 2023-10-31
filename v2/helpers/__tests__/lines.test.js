import { lineFocusPath } from '../lines'

describe('lineFocusPath', () => {
  describe('given an invalid line id', () => {
    it('should produce the unknown path', () => {
      expect(lineFocusPath('21z')).toEqual(['unknown'])
      expect(lineFocusPath(undefined)).toEqual(['unknown'])
      expect(lineFocusPath(null)).toEqual(['unknown'])
    })
  })
  describe('given a valid line id', () => {
    describe('and an invalid type', () => {
      it('should produce the unknown path', () => {
        expect(lineFocusPath('2', 3)).toEqual(['unknown'])
        expect(lineFocusPath('2', 'test')).toEqual(['unknown'])
        expect(lineFocusPath('2', null)).toEqual(['unknown'])
        expect(lineFocusPath('2', undefined)).toEqual(['unknown'])

        expect(lineFocusPath(2, 3)).toEqual(['unknown'])
        expect(lineFocusPath(2, 'test')).toEqual(['unknown'])
        expect(lineFocusPath(2, null)).toEqual(['unknown'])
        expect(lineFocusPath(2, undefined)).toEqual(['unknown'])
      })
    })
    describe('and a valid type', () => {
      it('should produce a line focus path', () => {
        expect(lineFocusPath(2, 'title')).toEqual(['line', 2, 'title'])
        expect(lineFocusPath('2', 'title')).toEqual(['line', 2, 'title'])
      })
    })
  })
})
