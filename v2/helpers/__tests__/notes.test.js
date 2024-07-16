import { noteFocusPath } from '../notes'

describe('noteFocusPath', () => {
  describe('given an invalid note id', () => {
    it('should produce the unknown path', () => {
      expect(
        noteFocusPath(
          '3z',
          // @ts-ignore
          { contentOrTitle: 'content' }
        )
      ).toEqual(['unknown'])
      expect(
        noteFocusPath(
          null,
          // @ts-ignore
          { contentOrTitle: 'content' }
        )
      ).toEqual(['unknown'])
      expect(
        noteFocusPath(
          undefined,
          // @ts-ignore
          { contentOrTitle: 'content' }
        )
      ).toEqual(['unknown'])
    })
  })
  describe('given a valid note id', () => {
    describe('and an invalid contentOrTitle', () => {
      it('should produce the unknown path', () => {
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { contentOrTitle: 'descriptionzszz' }
          )
        ).toEqual(['unknown'])
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { contentOrTitle: null }
          )
        ).toEqual(['unknown'])
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { contentOrTitle: undefined }
          )
        ).toEqual(['unknown'])
      })
    })
    describe('and a valid contentOrTitle', () => {
      it('should produce a note focus path', () => {
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { contentOrTitle: 'content' }
          )
        ).toEqual(['note', 3, 'content'])
        expect(
          noteFocusPath(
            3,
            // @ts-ignore
            { contentOrTitle: 'content' }
          )
        ).toEqual(['note', 3, 'content'])
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { contentOrTitle: 'title' }
          )
        ).toEqual(['note', 3, 'title'])
        expect(
          noteFocusPath(
            3,
            // @ts-ignore
            { contentOrTitle: 'title' }
          )
        ).toEqual(['note', 3, 'title'])
      })
    })
    describe('and an invalid attributeName', () => {
      it('should produce the unknown path', () => {
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { attributeName: null }
          )
        ).toEqual(['unknown'])
        expect(
          noteFocusPath(
            '3',
            // @ts-ignore
            { attributeName: undefined }
          )
        ).toEqual(['unknown'])
      })
    })
    describe('and a valid attributeName', () => {
      it('should produce a note focus path', () => {
        expect(
          noteFocusPath(
            3,
            // @ts-ignore
            { attributeName: 'testing...' }
          )
        ).toEqual(['note', 3, 'testing...'])
      })
    })
  })
})
