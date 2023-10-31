import { projectFocusPath } from '../project'

describe('projectFocusPath', () => {
  describe('given a book id is not supplied', () => {
    describe('and an invalid attribute type is supplied', () => {
      it('should produce the unknown path', () => {
        expect(projectFocusPath(null, 3)).toEqual(['unknown'])
        expect(projectFocusPath(undefined, 3)).toEqual(['unknown'])

        expect(projectFocusPath(null, null)).toEqual(['unknown'])
        expect(projectFocusPath(undefined, null)).toEqual(['unknown'])

        expect(projectFocusPath(null, undefined)).toEqual(['unknown'])
        expect(projectFocusPath(undefined, undefined)).toEqual(['unknown'])

        expect(projectFocusPath(null, 'themes')).toEqual(['unknown'])
        expect(projectFocusPath(undefined, 'themez')).toEqual(['unknown'])
      })
    })
    describe('and a valid attribute type is supplied', () => {
      it('should produce a project focus path', () => {
        expect(projectFocusPath(null, 'name')).toEqual(['name'])
        expect(projectFocusPath(undefined, 'name')).toEqual(['name'])

        expect(projectFocusPath(null, 'premise')).toEqual(['premise'])
        expect(projectFocusPath(undefined, 'premise')).toEqual(['premise'])

        expect(projectFocusPath(null, 'genre')).toEqual(['genre'])
        expect(projectFocusPath(undefined, 'genre')).toEqual(['genre'])

        expect(projectFocusPath(null, 'theme')).toEqual(['theme'])
        expect(projectFocusPath(undefined, 'theme')).toEqual(['theme'])
      })
    })
  })
  describe('given a valid bookId', () => {
    describe('and an invalid attributeType', () => {
      it('should produce the unknown path', () => {
        expect(projectFocusPath('series', 3)).toEqual(['unknown'])
        expect(projectFocusPath(2, 3)).toEqual(['unknown'])

        expect(projectFocusPath('series', null)).toEqual(['unknown'])
        expect(projectFocusPath(2, undefined)).toEqual(['unknown'])

        expect(projectFocusPath('series', null)).toEqual(['unknown'])
        expect(projectFocusPath(2, undefined)).toEqual(['unknown'])

        expect(projectFocusPath('series', 'blarg')).toEqual(['unknown'])
        expect(projectFocusPath(2, 'blarg')).toEqual(['unknown'])
      })
    })
    describe('and a valid attributeType', () => {
      it('should produce a project focus path', () => {
        expect(projectFocusPath('series', 'title')).toEqual(['book', 'series', 'title'])
        expect(projectFocusPath(2, 'title')).toEqual(['book', 2, 'title'])

        expect(projectFocusPath('series', 'premise')).toEqual(['book', 'series', 'premise'])
        expect(projectFocusPath(2, 'premise')).toEqual(['book', 2, 'premise'])

        expect(projectFocusPath('series', 'genre')).toEqual(['book', 'series', 'genre'])
        expect(projectFocusPath(2, 'genre')).toEqual(['book', 2, 'genre'])

        expect(projectFocusPath('series', 'theme')).toEqual(['book', 'series', 'theme'])
        expect(projectFocusPath(2, 'theme')).toEqual(['book', 2, 'theme'])
      })
    })
  })
})
