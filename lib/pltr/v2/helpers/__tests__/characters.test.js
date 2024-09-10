import { characterFocusPath } from '../characters'

describe('characterFocusPath', () => {
  describe('given an invalid character id', () => {
    it('should produce the unknown path', () => {
      expect(
        characterFocusPath(
          '2z',
          2,
          // @ts-ignore
          { type: 'name' }
        )
      ).toEqual(['unknown'])
      expect(
        characterFocusPath(
          undefined,
          2, // @ts-ignore
          { type: 'name' }
        )
      ).toEqual(['unknown'])
      expect(
        characterFocusPath(
          null,
          2,
          // @ts-ignore
          { type: 'name' }
        )
      ).toEqual(['unknown'])
    })
  })
  describe('given a valid character id', () => {
    describe('and an invalid book id', () => {
      it('should produce the unknown path', () => {
        expect(
          characterFocusPath(
            '2',
            undefined,
            // @ts-ignore
            { type: 'name' }
          )
        ).toEqual(['unknown'])
        expect(
          characterFocusPath(
            '2',
            null,
            // @ts-ignore
            { type: 'name' }
          )
        ).toEqual(['unknown'])
      })
    })
    describe('and a valid book id', () => {
      describe('and an invalid templateId or attributeName', () => {
        it('should produce the unknown path', () => {
          expect(
            characterFocusPath(
              '2',
              'series',
              // @ts-ignore
              { attributeName: 'name', templateId: 3 }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '2',
              'series',
              // @ts-ignore
              { attributeName: 'name', templateId: undefined }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '2',
              'series',
              // @ts-ignore
              { attributeName: 'name', templateId: null }
            )
          ).toEqual(['unknown'])

          expect(
            characterFocusPath(
              '2',
              'series',
              // @ts-ignore
              { attributeName: 4, templateId: 'c3' }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '2',
              'series',
              // @ts-ignore
              { attributeName: undefined, templateId: 'c3' }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '2',
              'series',
              // @ts-ignore
              { attributeName: null, templateId: 'c3' }
            )
          ).toEqual(['unknown'])
        })
      })
      describe('and a valid templateId and attributeName', () => {
        it('should produce a character focus path', () => {
          expect(
            characterFocusPath(
              '2',
              5,
              // @ts-ignore
              { attributeName: 'name', templateId: 'c56' }
            )
          ).toEqual(['character', 2, 'template', 'c56', 'name', 5])
        })
      })
      describe('and an invalid attributeId', () => {
        it('should produce the unknown path', () => {
          expect(
            characterFocusPath(
              '1',
              '8',
              // @ts-ignore
              { attributeId: null }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '1',
              '8',
              // @ts-ignore
              { attributeId: undefined }
            )
          ).toEqual(['unknown'])
        })
      })
      describe('and a string attributeId', () => {
        it('should produce a path to a legacy attribute', () => {
          expect(
            characterFocusPath(
              '1',
              8,
              // @ts-ignore
              { attributeId: 'blah' }
            )
          ).toEqual(['character', 1, 'customAttribute', 'blah', 8])
        })
      })
      describe('and a valid attribute id', () => {
        it('should produce a character focus path', () => {
          expect(
            characterFocusPath(
              '1',
              '8',
              // @ts-ignore
              { attributeId: '2' }
            )
          ).toEqual(['character', 1, 'customAttribute', 2, 8])
          expect(
            characterFocusPath(
              '1',
              '8',
              // @ts-ignore
              { attributeId: 2 }
            )
          ).toEqual(['character', 1, 'customAttribute', 2, 8])
        })
      })
      describe('and an inalid type', () => {
        it('should produce the unknown path', () => {
          expect(
            characterFocusPath(
              '1',
              'series',
              // @ts-ignore
              { type: 3 }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '1',
              'series',
              // @ts-ignore
              { type: undefined }
            )
          ).toEqual(['unknown'])
          expect(
            characterFocusPath(
              '1',
              'series',
              // @ts-ignore
              { type: null }
            )
          ).toEqual(['unknown'])
        })
      })
      describe('and a type of "name"', () => {
        it('should produce a character focus path', () => {
          expect(
            characterFocusPath(
              '1',
              'series',
              // @ts-ignore
              { type: 'name' }
            )
          ).toEqual(['character', 1, 'name'])
          expect(
            characterFocusPath(
              1,
              'series',
              // @ts-ignore
              { type: 'name' }
            )
          ).toEqual(['character', 1, 'name'])
        })
      })
    })
  })
})
