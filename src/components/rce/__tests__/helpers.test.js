import { countWords } from '../helpers'

const sampleTextWithLink = [
  {
    children: [{ text: '"A single man in possession of good fortune must be in want of a wife."' }],
    type: 'paragraph',
  },
  {
    children: [{ text: 'https://www.google.com' }],
    type: 'link',
    url: 'https://www.google.com',
  },
]

const TEST_CASE_FROM_THE_WILD = [
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'paragraph',
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'ff',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    children: [
      {
        text: 'dvvs',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: '',
      },
      {
        type: 'link',
        url: 'https://getplottr.com/our-roadmap',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        text: '',
      },
    ],
  },
]

describe('countWords', () => {
  describe('given a null or undefined text value', () => {
    it('should produce true', () => {
      expect(countWords(null)).toBe(0)
      expect(countWords(undefined)).toBe(0)
    })
  })
  describe('given an empty array', () => {
    it('should produce true', () => {
      expect(countWords([])).toBe(0)
    })
  })
  describe('given an array with an empty first paragraph', () => {
    describe('and a subsequent paragraph that has text', () => {
      it('should produce false', () => {
        expect(countWords(TEST_CASE_FROM_THE_WILD)).toBe(2)
      })
    })
  })

  describe('given a node with link', () => {
    it('should produce true', () => {
      expect(countWords(sampleTextWithLink)).toBe(16)
    })
  })
})
