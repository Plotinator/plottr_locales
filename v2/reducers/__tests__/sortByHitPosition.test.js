import { sortByHitPosition } from '../sortByHitPosition'

describe('sortByHitPosition', () => {
  describe('given an empty array', () => {
    it('should produce the empty arary', () => {
      expect(sortByHitPosition([])).toEqual([])
    })
  })
  describe('given a singleton array', () => {
    it('should produce the given array', () => {
      expect(
        sortByHitPosition([
          {
            hit: 'Builder',
            path: '/project/series/name/22',
          },
        ])
      ).toEqual([
        {
          hit: 'Builder',
          path: '/project/series/name/22',
        },
      ])
    })
  })
  describe('given a multi-element array', () => {
    it('should sort them with the latest hit first', () => {
      expect(
        sortByHitPosition([
          {
            hit: 'Builder',
            path: '/project/series/name/5',
          },
          {
            hit: 'Builder',
            path: '/project/series/name/0',
          },
          {
            hit: 'Builder',
            path: '/project/series/name/9',
          },
        ])
      ).toEqual([
        {
          hit: 'Builder',
          path: '/project/series/name/9',
        },
        {
          hit: 'Builder',
          path: '/project/series/name/5',
        },
        {
          hit: 'Builder',
          path: '/project/series/name/0',
        },
      ])
    })
    describe('when the path has numbers in it before the end', () => {
      it('should still sort by the last number', () => {
        expect(
          sortByHitPosition([
            {
              hit: 'Builder',
              path: '/project/series/name0/5',
            },
            {
              hit: 'Builder',
              path: '/project/series/name9/0',
            },
            {
              hit: 'Builder',
              path: '/project/series/name2/9',
            },
          ])
        ).toEqual([
          {
            hit: 'Builder',
            path: '/project/series/name2/9',
          },
          {
            hit: 'Builder',
            path: '/project/series/name0/5',
          },
          {
            hit: 'Builder',
            path: '/project/series/name9/0',
          },
        ])
      })
    })
  })
})
