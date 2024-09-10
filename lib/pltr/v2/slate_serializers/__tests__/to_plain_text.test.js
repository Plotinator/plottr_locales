import { serializeNoFormatting } from '../to_plain_text'

describe('serializeNoFormatting', () => {
  describe('given the empty array', () => {
    it('should produce the empty string', () => {
      const result = serializeNoFormatting([])
      expect(result).toEqual('')
    })
  })
  describe('given a single paragraph array', () => {
    it('should produce a single line of text', () => {
      const result = serializeNoFormatting([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Hi there!',
            },
          ],
        },
      ])
      expect(result).toEqual(`Hi there!
`)
    })
  })
  describe('given a two pragraph array', () => {
    it('should produce two lines of text', () => {
      const result = serializeNoFormatting([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Hi there!',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: "I'm Bob the builder.",
            },
          ],
        },
      ])
      expect(result).toEqual(`Hi there!
I'm Bob the builder.
`)
    })
  })
  describe('given a pragraph with runs of text that have formatting', () => {
    it('should produce a single line of text sans formatting', () => {
      const result = serializeNoFormatting([
        {
          type: 'paragraph',
          children: [
            {
              text: "I'm ",
            },
            {
              text: 'wondering',
              color: '#78be20',
            },
            {
              text: ' how ',
            },
            {
              text: 'it',
              strike: true,
            },
            {
              text: ' looks.',
            },
          ],
        },
      ])
      expect(result).toEqual(`I'm wondering how it looks.
`)
    })
  })
  describe('given a nested series of bullet points', () => {
    it('should write the bullet points left-aligned, with newlines between them', () => {
      const result = serializeNoFormatting([
        {
          type: 'paragraph',
          children: [
            {
              type: 'bulleted-list',
              children: [
                {
                  type: 'list-item',
                  children: [
                    {
                      text: 'Hi there.',
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
                          text: 'woah!',
                        },
                      ],
                    },
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
                {
                  type: 'list-item',
                  children: [
                    {
                      text: 'Test',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
      expect(result).toEqual(`Hi there.
woah!
haha
Test
`)
    })
  })
  describe('given a real-world example with many nested types', () => {
    it('should produce the expected output', () => {
      const result = serializeNoFormatting([
        {
          type: 'paragraph',
          children: [
            {
              text: "here's some text.",
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: "I'm ",
            },
            {
              text: 'wondering',
              color: '#78be20',
            },
            {
              text: ' how ',
            },
            {
              text: 'it',
              strike: true,
            },
            {
              text: ' looks.',
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
                  text: 'Hi there.',
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
                      text: 'woah!',
                    },
                  ],
                },
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
            {
              type: 'list-item',
              children: [
                {
                  text: 'Test',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Blah blah.',
            },
          ],
        },
        {
          type: 'block-quote',
          children: [
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
                {
                  type: 'list-item',
                  children: [
                    {
                      text: 'Hmmmm',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
      const expectedResult = `here's some text.
I'm wondering how it looks.
Hi there.
woah!
haha
Test
Blah blah.
test
Hmmmm
`
      expect(result).toEqual(expectedResult)
    })
  })
})
