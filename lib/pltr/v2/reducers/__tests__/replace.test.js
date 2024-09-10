import { replacePlainTextHit, replaceInSlateDatastructure } from '../replace'

const EXAMPLE_SLATE_DATA = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'The old man hands Link a wooden sword',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "what's going on here.",
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'that was very strange.',
      },
    ],
  },
  {
    type: 'bulleted-list',
    children: [
      {
        type: 'list-item',
        children: [
          {
            text: 'haha',
          },
        ],
      },
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                text: 'test',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'heading-one',
    children: [
      {
        text: 'Hmmm',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'interesting.',
        italic: true,
      },
    ],
  },
]

describe('replacePlainTextHit', () => {
  describe('given an empty string', () => {
    it('should produce the empty string', () => {
      expect(replacePlainTextHit('', 0, 'test', 'blah')).toEqual('')
    })
  })
  describe('given a string without the hit in it', () => {
    it('should not replace the hit', () => {
      const sampleText = 'This is a test'
      expect(replacePlainTextHit(sampleText, 5, 'haha!', 'dundundun')).toBe(sampleText)
    })
  })
  describe('given a string with the hit in it in two places', () => {
    describe('and a start that matches the first hit', () => {
      it('should only replace the first hit', () => {
        const sampleText = 'This is a test, and this is another test.'
        expect(replacePlainTextHit(sampleText, 5, 'is', 'replaced')).toEqual(
          'This replaced a test, and this is another test.'
        )
      })
    })
    describe('and a start that matches the second hit', () => {
      it('should only replace the second hit', () => {
        const sampleText = 'This is a test, and this is another test.'
        expect(replacePlainTextHit(sampleText, 25, 'is', 'replaced')).toEqual(
          'This is a test, and this replaced another test.'
        )
      })
    })
    describe('and a start that does not point at the replacement text', () => {
      it('should not replace the string', () => {
        const sampleText = 'This is a test, and this is another test.'
        expect(replacePlainTextHit(sampleText, 6, 'is', 'replaced')).toBe(sampleText)
      })
    })
  })
})

describe('replaceInSlateDatastructure', () => {
  describe('given an empty array', () => {
    it('should produce a new empty array', () => {
      const input = []
      const result = replaceInSlateDatastructure(input, 0, 'test', 'haha')
      expect(result).not.toBe(input)
      expect(result).toEqual([])
    })
  })
  describe('given an empty object', () => {
    it('should produce a new empty object', () => {
      const input = {}
      const result = replaceInSlateDatastructure(input, 0, 'test', 'haha')
      expect(result).not.toBe(input)
      expect(result).toEqual({})
    })
  })
  describe('given an empty string', () => {
    it('should produce a new empty string', () => {
      const input = ''
      const result = replaceInSlateDatastructure(input, 0, 'test', 'haha')
      expect(result).toEqual('')
    })
  })
  describe('given an object with just a text node', () => {
    describe('and a replacement that appears in the text node', () => {
      describe('but the position is after the length of the text', () => {
        it('should produce the input object', () => {
          const input = {
            text: 'this is a test',
          }
          const result = replaceInSlateDatastructure(input, 50, 'test', 'haha')
          expect(result).not.toBe(input)
          expect(result).toEqual(input)
        })
      })
      describe('and the start position is in the text', () => {
        describe('but the end position is after the end of the text', () => {
          it('should produce the input object', () => {
            const input = {
              text: 'this is a test',
            }
            const result = replaceInSlateDatastructure(input, 13, 'test', 'haha')
            expect(result).not.toBe(input)
            expect(result).toEqual(input)
          })
        })
        describe('and the end position is in the text', () => {
          it('should replace the text', () => {
            const input = {
              text: 'this is a test',
            }
            const result = replaceInSlateDatastructure(input, 10, 'test', 'haha')
            expect(result).not.toBe(input)
            expect(result).toEqual({
              text: 'this is a haha',
            })
          })
        })
      })
    })
  })
  describe('given an object with one child', () => {
    const exampleWithOneChild = {
      children: [
        {
          text: 'this is a test',
        },
      ],
    }
    describe('and a search string that is not in the child text', () => {
      it('should produce the input object', () => {
        const result = replaceInSlateDatastructure(exampleWithOneChild, 10, 'haha', 'blah')
        expect(result).not.toBe(exampleWithOneChild)
        expect(result).toEqual(exampleWithOneChild)
      })
    })
    describe('and a search string that is in the child text', () => {
      it('should replace the searh string', () => {
        const result = replaceInSlateDatastructure(exampleWithOneChild, 10, 'test', 'haha')
        expect(result).not.toBe(exampleWithOneChild)
        expect(result).toEqual({
          children: [
            {
              text: 'this is a haha',
            },
          ],
        })
      })
    })
  })
  describe('given an object with two children', () => {
    const exampleWithTwoChildren = {
      children: [
        {
          text: 'this is a test',
        },
        {
          text: 'and another test in the second slot',
        },
      ],
    }
    describe('and a search string that is not in any child text', () => {
      it('should produce the input object', () => {
        const result = replaceInSlateDatastructure(exampleWithTwoChildren, 10, 'haha', 'blah')
        expect(result).not.toBe(exampleWithTwoChildren)
        expect(result).toEqual(exampleWithTwoChildren)
      })
    })
    describe('and a search string that is in the first child text', () => {
      it('should replace the searh string in the first child but not second', () => {
        const result = replaceInSlateDatastructure(exampleWithTwoChildren, 10, 'test', 'haha')
        expect(result).not.toBe(exampleWithTwoChildren)
        expect(result).toEqual({
          children: [
            {
              text: 'this is a haha',
            },
            {
              text: 'and another test in the second slot',
            },
          ],
        })
      })
    })
    describe('and a search string that is in the second child text', () => {
      it('should replace the searh string in the second child but not first', () => {
        const result = replaceInSlateDatastructure(exampleWithTwoChildren, 26, 'test', 'haha')
        expect(result).not.toBe(exampleWithTwoChildren)
        expect(result).toEqual({
          children: [
            {
              text: 'this is a test',
            },
            {
              text: 'and another haha in the second slot',
            },
          ],
        })
      })
    })
  })
  describe('given some example slate data with various elements', () => {
    describe('and a string that exists in the first child', () => {
      it('should replace that string', () => {
        const result = replaceInSlateDatastructure(EXAMPLE_SLATE_DATA, 4, 'old', 'young')
        expect(result).not.toBe(EXAMPLE_SLATE_DATA)
        expect(result).toEqual([
          {
            type: 'paragraph',
            children: [
              {
                text: 'The young man hands Link a wooden sword',
              },
            ],
          },
          ...EXAMPLE_SLATE_DATA.slice(1),
        ])
      })
    })
    describe('and a string that much further on nested deeply', () => {
      it('should replace that string', () => {
        const result = replaceInSlateDatastructure(EXAMPLE_SLATE_DATA, 88, 'test', 'haha')
        expect(result).not.toBe(EXAMPLE_SLATE_DATA)
        expect(result).toEqual([
          ...EXAMPLE_SLATE_DATA.slice(0, 3),
          {
            ...EXAMPLE_SLATE_DATA[3],
            children: [
              EXAMPLE_SLATE_DATA[3].children[0],
              {
                type: 'numbered-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'haha',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          ...EXAMPLE_SLATE_DATA.slice(4),
        ])
      })
    })
    describe('and an instruction to replace the string "hmmm"', () => {
      it('should be able to replace it', () => {
        const result = replaceInSlateDatastructure(EXAMPLE_SLATE_DATA, 93, 'hmmm', 'woah')
        expect(result).not.toBe(EXAMPLE_SLATE_DATA)
        expect(result).toEqual([
          ...EXAMPLE_SLATE_DATA.slice(0, 4),
          {
            type: 'heading-one',
            children: [
              {
                text: 'woah',
              },
            ],
          },
          ...EXAMPLE_SLATE_DATA.slice(5),
        ])
      })
    })
  })
})
