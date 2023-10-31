import { cardFocusPath, outlineCardFocusPath } from '../cards'

describe('cardFocusPath', () => {
  describe('given a card id', () => {
    describe('when the card id is not valid', () => {
      it('should produce the unknown path', () => {
        expect(cardFocusPath('2z', { baseAttributeName: 'name' })).toEqual(['unknown'])
      })
    })
    describe('when the card id is valid', () => {
      describe('and no options are supplied', () => {
        it('should produce an unknown path', () => {
          expect(cardFocusPath('3')).toEqual(['unknown'])
        })
      })
      describe('and a base attribute name', () => {
        describe('and the name is not a string', () => {
          it('should produce the unknown path', () => {
            expect(cardFocusPath('3', { baseAttributeName: undefined })).toEqual(['unknown'])
            expect(cardFocusPath('3', { baseAttributeName: null })).toEqual(['unknown'])
            expect(cardFocusPath('3', { baseAttributeName: 4 })).toEqual(['unknown'])
          })
        })
        describe('when name is not valid', () => {
          it('should produce the unknown path', () => {
            expect(cardFocusPath('3', { baseAttributeName: 'titlezzz' })).toEqual(['unknown'])
          })
        })
        describe('when the name is valid', () => {
          it('should produce the path to a base attribute', () => {
            expect(cardFocusPath('3', { baseAttributeName: 'title' })).toEqual(['card', 3, 'title'])
          })
        })
      })
      describe('and a customAttributeName', () => {
        describe('and the attribute name is not a string', () => {
          it('should produce the unknown path', () => {
            expect(cardFocusPath('3', { customAttributeName: 4 })).toEqual(['unknown'])
            expect(cardFocusPath('3', { customAttributeName: null })).toEqual(['unknown'])
            expect(cardFocusPath('3', { customAttributeName: undefined })).toEqual(['unknown'])
          })
        })
        describe('and an attribute name that is a string', () => {
          it('should produce a path to a custom attribute', () => {
            expect(cardFocusPath('3', { customAttributeName: 'test' })).toEqual(['card', 3, 'test'])
          })
        })
      })
      describe('and a template descriptor', () => {
        describe('and the template is not an object', () => {
          it('should produce the unknown path', () => {
            expect(cardFocusPath('3', { template: 'hi' })).toEqual(['unknown'])
            expect(cardFocusPath('3', { template: 4 })).toEqual(['unknown'])
            expect(cardFocusPath('3', { template: null })).toEqual(['unknown'])
            expect(cardFocusPath('3', { template: undefined })).toEqual(['unknown'])
          })
        })
        describe('nad the template is an object', () => {
          describe('but the id or attribute name are not strings', () => {
            it('should produce the unknown path', () => {
              expect(cardFocusPath('3', { template: { id: 4, attributeName: 'test' } })).toEqual([
                'unknown',
              ])
              expect(cardFocusPath('3', { template: { id: null, attributeName: 'test' } })).toEqual(
                ['unknown']
              )
              expect(
                cardFocusPath('3', { template: { id: undefined, attributeName: 'test' } })
              ).toEqual(['unknown'])

              expect(cardFocusPath('3', { template: { id: 'c3', attributeName: 4 } })).toEqual([
                'unknown',
              ])
              expect(cardFocusPath('3', { template: { id: 'c3', attributeName: null } })).toEqual([
                'unknown',
              ])
              expect(
                cardFocusPath('3', { template: { id: 'c3', attributeName: undefined } })
              ).toEqual(['unknown'])
            })
          })
          describe('and the id and attribute names are strings', () => {
            it('should produce a card focus path', () => {
              expect(cardFocusPath('3', { template: { id: 'c3', attributeName: 'test' } })).toEqual(
                ['card', 3, 'template', 'c3', 'test']
              )
            })
          })
        })
      })
    })
  })
})

describe('outlineCardFocusPath', () => {
  describe('given a card id', () => {
    describe('when the card id is not valid', () => {
      it('should produce the unknown path', () => {
        expect(outlineCardFocusPath('2z', 'title')).toEqual(['unknown'])
        expect(outlineCardFocusPath(undefined, 'title')).toEqual(['unknown'])
        expect(outlineCardFocusPath(null, 'title')).toEqual(['unknown'])
      })
    })
    describe('and the card id is valid', () => {
      describe('but the hit type is not valid', () => {
        it('should produce the unknown path', () => {
          expect(outlineCardFocusPath('2', 'titlez')).toEqual(['unknown'])
          expect(outlineCardFocusPath('2', undefined)).toEqual(['unknown'])
          expect(outlineCardFocusPath('2', null)).toEqual(['unknown'])
        })
      })
      describe('and the hit type is valid', () => {
        it('should produce an outline card path', () => {
          expect(outlineCardFocusPath('2', 'title')).toEqual(['card', 2, 'title'])
          expect(outlineCardFocusPath('2', 'description')).toEqual(['card', 2, 'description'])
        })
      })
    })
  })
})
