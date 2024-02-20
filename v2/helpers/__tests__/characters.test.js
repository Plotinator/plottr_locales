import { characterFocusPath } from '../characters'

describe('characterFocusPath', () => {
  describe('given an invalid character id', () => {
    it('should produce the unknown path', () => {
      expect(characterFocusPath('2z', 2, { type: 'name' })).toEqual(['unknown'])
      expect(characterFocusPath(undefined, 2, { type: 'name' })).toEqual(['unknown'])
      expect(characterFocusPath(null, 2, { type: 'name' })).toEqual(['unknown'])
    })
  })
  describe('given a valid character id', () => {
    describe('and an invalid book id', () => {
      it('should produce the unknown path', () => {
        expect(characterFocusPath('2', undefined, { type: 'name' })).toEqual(['unknown'])
        expect(characterFocusPath('2', null, { type: 'name' })).toEqual(['unknown'])
      })
    })
    describe('and a valid book id', () => {
      describe('and an invalid templateId or attributeName', () => {
        it('should produce the unknown path', () => {
          expect(
            characterFocusPath('2', 'series', { attributeName: 'name', templateId: 3 })
          ).toEqual(['unknown'])
          expect(
            characterFocusPath('2', 'series', { attributeName: 'name', templateId: undefined })
          ).toEqual(['unknown'])
          expect(
            characterFocusPath('2', 'series', { attributeName: 'name', templateId: null })
          ).toEqual(['unknown'])

          expect(characterFocusPath('2', 'series', { attributeName: 4, templateId: 'c3' })).toEqual(
            ['unknown']
          )
          expect(
            characterFocusPath('2', 'series', { attributeName: undefined, templateId: 'c3' })
          ).toEqual(['unknown'])
          expect(
            characterFocusPath('2', 'series', { attributeName: null, templateId: 'c3' })
          ).toEqual(['unknown'])
        })
      })
      describe('and a valid templateId and attributeName', () => {
        it('should produce a character focus path', () => {
          expect(characterFocusPath('2', 5, { attributeName: 'name', templateId: 'c56' })).toEqual([
            'character',
            2,
            'template',
            'c56',
            'name',
            5,
          ])
        })
      })
      describe('and an invalid attributeId', () => {
        it('should produce the unknown path', () => {
          expect(characterFocusPath('1', '8', { attributeId: null })).toEqual(['unknown'])
          expect(characterFocusPath('1', '8', { attributeId: undefined })).toEqual(['unknown'])
        })
      })
      describe('and a string attributeId', () => {
        it('should produce a path to a legacy attribute', () => {
          expect(characterFocusPath('1', 8, { attributeId: 'blah' })).toEqual([
            'character',
            1,
            'customAttribute',
            'blah',
            8,
          ])
        })
      })
      describe('and a valid attribute id', () => {
        it('should produce a character focus path', () => {
          expect(characterFocusPath('1', '8', { attributeId: '2' })).toEqual([
            'character',
            1,
            'customAttribute',
            2,
            8,
          ])
          expect(characterFocusPath('1', '8', { attributeId: 2 })).toEqual([
            'character',
            1,
            'customAttribute',
            2,
            8,
          ])
        })
      })
      describe('and an inalid type', () => {
        it('should produce the unknown path', () => {
          expect(characterFocusPath('1', 'series', { type: 3 })).toEqual(['unknown'])
          expect(characterFocusPath('1', 'series', { type: undefined })).toEqual(['unknown'])
          expect(characterFocusPath('1', 'series', { type: null })).toEqual(['unknown'])
        })
      })
      describe('and a type of "name"', () => {
        it('should produce a character focus path', () => {
          expect(characterFocusPath('1', 'series', { type: 'name' })).toEqual([
            'character',
            1,
            'name',
          ])
          expect(characterFocusPath(1, 'series', { type: 'name' })).toEqual([
            'character',
            1,
            'name',
          ])
        })
      })
    })
  })
})
