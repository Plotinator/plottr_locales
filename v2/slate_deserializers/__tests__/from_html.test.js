import { convertHTMLString, parseStyleAttribute } from '../from_html'

describe('parseStyleAttribute', () => {
  describe('given the empty string', () => {
    it('should produce the empty object', () => {
      expect(parseStyleAttribute('')).toEqual({})
    })
  })
  describe('given a string with no colon', () => {
    it('should produce the empty object', () => {
      expect(parseStyleAttribute('blarg')).toEqual({})
    })
  })
  describe('given a string with a colon but nothing after it', () => {
    it('should produce an object with a key pointing to an empty string', () => {
      expect(parseStyleAttribute('blarg:')).toEqual({ blarg: '' })
    })
  })
  describe('given a string with a colon and something after it', () => {
    it('should produce an object with a key and value', () => {
      expect(parseStyleAttribute('blarg:test')).toEqual({ blarg: 'test' })
    })
  })
  describe('given a string with a lone semicolon', () => {
    it('should produce an empty object', () => {
      expect(parseStyleAttribute(';')).toEqual({})
    })
  })
  describe('given a string with a colon and spaces around a value and key', () => {
    it('should produce the key-value object without whitespace padding', () => {
      expect(parseStyleAttribute(' 	blarg :  test    ')).toEqual({ blarg: 'test' })
    })
  })
  describe('given a string with colons and semi colons', () => {
    it('should produce an object with all the keys and values in the string', () => {
      expect(parseStyleAttribute('blarg: test; haha: hehe')).toEqual({
        blarg: 'test',
        haha: 'hehe',
      })
    })
  })
})

describe('convertHTMLString', () => {
  describe('given the empty string', () => {
    it('should produce empty content', () => {
      expect(convertHTMLString('')).toEqual([
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given an empty div', () => {
    it('should produce empty content', () => {
      expect(convertHTMLString('<div></div>')).toEqual([
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone span', () => {
    it('should produce a single paragraph', () => {
      expect(convertHTMLString('<span>testing</span>')).toEqual([
        {
          children: [
            {
              text: 'testing',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone <i> tag', () => {
    it('should produce a single paragraph with a formatted italic text section', () => {
      expect(convertHTMLString('<i>testing</i>')).toEqual([
        {
          children: [
            {
              text: 'testing',
              italic: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone <b> tag', () => {
    it('should produce a single paragraph with a formatted bold text section', () => {
      expect(convertHTMLString('<b>testing</b>')).toEqual([
        {
          children: [
            {
              text: 'testing',
              bold: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone <u> tag', () => {
    it('should produce a single paragraph with a formatted underline text section', () => {
      expect(convertHTMLString('<u>testing</u>')).toEqual([
        {
          children: [
            {
              text: 'testing',
              underline: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone <s> tag', () => {
    it('should produce a single paragraph with a formatted strike text section', () => {
      expect(convertHTMLString('<s>testing</s>')).toEqual([
        {
          children: [
            {
              text: 'testing',
              strike: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone <del> tag', () => {
    it('should produce a single paragraph with a formatted strike text section', () => {
      expect(convertHTMLString('<del>testing</del>')).toEqual([
        {
          children: [
            {
              text: 'testing',
              strike: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone <strike> tag', () => {
    it('should produce a single paragraph with a formatted strike text section', () => {
      expect(convertHTMLString('<strike>testing</strike>')).toEqual([
        {
          children: [
            {
              text: 'testing',
              strike: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given any other random tag', () => {
    it('should produce an unformatted text section with the tags text', () => {
      expect(convertHTMLString('<zzz>testing</zzz>')).toEqual([
        {
          children: [
            {
              text: 'testing',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given a lone block quote', () => {
    it('should produce a block quote with a paragraph containing the quoted text', () => {
      expect(convertHTMLString('<blockquote><span>testing</span></blockquote>')).toEqual([
        {
          type: 'block-quote',
          children: [
            {
              children: [
                {
                  text: 'testing',
                },
              ],
              type: 'paragraph',
            },
          ],
        },
      ])
    })
  })
  describe('given a singleton numbered list', () => {
    it('should produce the slate equivelant list', () => {
      const expectedResult = [
        {
          type: 'numbered-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'testing',
                },
              ],
            },
          ],
        },
      ]
      expect(convertHTMLString('<ol><li>testing</li></ol>')).toEqual(expectedResult)
      expect(convertHTMLString('<ol><li><span>testing</span></li></ol>')).toEqual(expectedResult)
    })
    describe("that's indented once", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'numbered-list',
            children: [
              {
                type: 'numbered-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'testing',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(convertHTMLString('<ol><ol><li>testing</li></ol></ol>')).toEqual(expectedResult)
        expect(convertHTMLString('<ol><ol><li><span>testing</span></li></ol></ol>')).toEqual(
          expectedResult
        )
      })
    })
    describe("that's indented twice", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'numbered-list',
            children: [
              {
                type: 'numbered-list',
                children: [
                  {
                    type: 'numbered-list',
                    children: [
                      {
                        type: 'list-item',
                        children: [
                          {
                            text: 'testing',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(convertHTMLString('<ol><ol><ol><li>testing</li></ol></ol></ol>')).toEqual(
          expectedResult
        )
        expect(
          convertHTMLString('<ol><ol><ol><li><span>testing</span></li></ol></ol></ol>')
        ).toEqual(expectedResult)
      })
    })
    describe("that's indented three times", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'numbered-list',
            children: [
              {
                type: 'numbered-list',
                children: [
                  {
                    type: 'numbered-list',
                    children: [
                      {
                        type: 'numbered-list',
                        children: [
                          {
                            type: 'list-item',
                            children: [
                              {
                                text: 'testing',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(convertHTMLString('<ol><ol><ol><ol><li>testing</li></ol></ol></ol></ol>')).toEqual(
          expectedResult
        )
        expect(
          convertHTMLString('<ol><ol><ol><ol><li><span>testing</span></li></ol></ol></ol></ol>')
        ).toEqual(expectedResult)
      })
    })
    describe("that's indented four times", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'numbered-list',
            children: [
              {
                type: 'numbered-list',
                children: [
                  {
                    type: 'numbered-list',
                    children: [
                      {
                        type: 'numbered-list',
                        children: [
                          {
                            type: 'numbered-list',
                            children: [
                              {
                                type: 'list-item',
                                children: [
                                  {
                                    text: 'testing',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(
          convertHTMLString('<ol><ol><ol><ol><ol><li>testing</li></ol></ol></ol></ol></ol>')
        ).toEqual(expectedResult)
        expect(
          convertHTMLString(
            '<ol><ol><ol><ol><ol><li><span>testing</span></li></ol></ol></ol></ol></ol>'
          )
        ).toEqual(expectedResult)
      })
    })
  })
  describe('given a singleton unordered list', () => {
    it('should produce the slate equivelant Slate', () => {
      const expectedResult = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'testing',
                },
              ],
            },
          ],
        },
      ]
      expect(convertHTMLString('<ul><li>testing</li></ul>')).toEqual(expectedResult)
      expect(convertHTMLString('<ul><li><span>testing</span></li></ul>')).toEqual(expectedResult)
    })
    describe("that's indented once", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'testing',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(convertHTMLString('<ul><ul><li>testing</li></ul></ul>')).toEqual(expectedResult)
        expect(convertHTMLString('<ul><ul><li><span>testing</span></li></ul></ul>')).toEqual(
          expectedResult
        )
      })
    })
    describe("that's indented twice", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'bulleted-list',
                    children: [
                      {
                        type: 'list-item',
                        children: [
                          {
                            text: 'testing',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(convertHTMLString('<ul><ul><ul><li>testing</li></ul></ul></ul>')).toEqual(
          expectedResult
        )
        expect(
          convertHTMLString('<ul><ul><ul><li><span>testing</span></li></ul></ul></ul>')
        ).toEqual(expectedResult)
      })
    })
    describe("that's indented three times", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'bulleted-list',
                    children: [
                      {
                        type: 'bulleted-list',
                        children: [
                          {
                            type: 'list-item',
                            children: [
                              {
                                text: 'testing',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(convertHTMLString('<ul><ul><ul><ul><li>testing</li></ul></ul></ul></ul>')).toEqual(
          expectedResult
        )
        expect(
          convertHTMLString('<ul><ul><ul><ul><li><span>testing</span></li></ul></ul></ul></ul>')
        ).toEqual(expectedResult)
      })
    })
    describe("that's indented four times", () => {
      it('should produce the equivelant Slate', () => {
        const expectedResult = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'bulleted-list',
                    children: [
                      {
                        type: 'bulleted-list',
                        children: [
                          {
                            type: 'bulleted-list',
                            children: [
                              {
                                type: 'list-item',
                                children: [
                                  {
                                    text: 'testing',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]
        expect(
          convertHTMLString('<ul><ul><ul><ul><ul><li>testing</li></ul></ul></ul></ul></ul>')
        ).toEqual(expectedResult)
        expect(
          convertHTMLString(
            '<ul><ul><ul><ul><ul><li><span>testing</span></li></ul></ul></ul></ul></ul>'
          )
        ).toEqual(expectedResult)
      })
    })
  })
  describe('given a list with nested list items of different types', () => {
    it('should produce the equivelant Slate', () => {
      const expectedResult = [
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
                  text: 'blarg',
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
              ],
            },
          ],
        },
      ]
      expect(
        convertHTMLString('<ol><li>test</li><li>blarg</li><ul><li>haha</li></ul></ol>')
      ).toEqual(expectedResult)
      expect(
        convertHTMLString(
          '<ol><li><span>test</span></li><li><span>blarg</span></li><ul><li><span>haha</span></li></ul></ol>'
        )
      ).toEqual(expectedResult)
    })
  })
  describe('given a nested set of bullet points', () => {
    describe("that aren't canonical", () => {
      it('should convert the bullet points as though they were in the expected format', () => {
        const html = `<ul><li>First item<ul><li><b>test 3</b>: Sub-item 1</li><li><b>test 4</b>: Sub-item 2</li></ul></li><li>Second item<ul><li><b>test</b>Sub-item 1</li><li><b>test2</b>: Sub-item 2</li></ul></li></ul>`
        expect(convertHTMLString(html)).toEqual([
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [
                  {
                    text: 'First item',
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
                        text: 'test 3',
                        bold: true,
                      },
                      {
                        text: ': Sub-item 1',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'test 4',
                        bold: true,
                      },
                      {
                        text: ': Sub-item 2',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'list-item',
                children: [
                  {
                    text: 'Second item',
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
                        text: 'test',
                        bold: true,
                      },
                      {
                        text: 'Sub-item 1',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'test2',
                        bold: true,
                      },
                      {
                        text: ': Sub-item 2',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ])
      })
    })
  })
  // FIXME: Known limitation.  Mobile RCE doesn't produce the same as
  // Desktop/Web in this instance.
  // eslint-disable-next-line no-undef
  xdescribe('given a lone anchor tag', () => {
    it('should produce empty paragraphs surrounding a link', () => {
      expect(convertHTMLString('<a href="www.google.com">URL</a>')).toEqual([
        {
          text: '',
        },
        {
          type: 'link',
          url: 'www.google.com',
          children: [
            {
              text: 'URL',
            },
          ],
        },
        {
          text: '',
        },
      ])
    })
  })
  describe('given three paragraphs where one is an anchor tag', () => {
    it('should not wrap the link in Slate', () => {
      expect(
        convertHTMLString(`<p>Here's a line</p><a href="www.google.com">URL</a><p>Another line</p>`)
      ).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: "Here's a line",
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'www.google.com',
              children: [
                {
                  text: 'URL',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Another line',
            },
          ],
        },
      ])
    })
  })
  describe('given a span with a colour set', () => {
    it('should produce coloured slate text', () => {
      expect(
        convertHTMLString('<span style="color:#78be20">this is some green text</span>')
      ).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'this is some green text',
              color: '#78be20',
            },
          ],
        },
      ])
    })
  })
  describe('given a span with a font set', () => {
    it('should produce slate with a font set', () => {
      expect(
        convertHTMLString('<span style="font-family: IBM Plex Serif">this is some text</span>')
      ).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'this is some text',
              font: 'IBM Plex Serif',
            },
          ],
        },
      ])
    })
    describe('when the strip font option is supplied', () => {
      it('should not interpret the font from the html', () => {
        expect(
          convertHTMLString('<span style="font-family: IBM Plex Serif">this is some text</span>', {
            stripFont: true,
          })
        ).toEqual([
          {
            type: 'paragraph',
            children: [
              {
                text: 'this is some text',
              },
            ],
          },
        ])
      })
    })
  })
  describe('given an img with a data URL', () => {
    const testImageData = 'data:image/jpeg;base64,dummy-image-data'
    it('should produce an equivelant slate image', () => {
      expect(convertHTMLString(`<img src="${testImageData}" />`)).toEqual([
        {
          type: 'image-data',
          data: testImageData,
          children: [
            {
              text: '',
            },
          ],
        },
      ])
    })
  })
  describe('given an img with a storage URL', () => {
    const testImageData = 'data:image/jpeg;base64,dummy-image-data'
    it('should produce an equivelant slate image', () => {
      expect(
        convertHTMLString(
          `<img src="${testImageData}" class="slate-editor__image-link" data-storageUrl="storage://dummy-path.webp" />`
        )
      ).toEqual([
        {
          type: 'image-link',
          storageUrl: 'storage://dummy-path.webp',
          children: [
            {
              text: '',
            },
          ],
        },
      ])
    })
  })
  describe('given some html with sized text', () => {
    it('should interpret the font size into the slate representation', () => {
      expect(
        convertHTMLString(
          '<p><span style="font-family: Arial Black;color: #e5554f;font-size: 25px">Goldilocks is hungry, and she really wants food.</span></p>'
        )
      ).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Goldilocks is hungry, and she really wants food.',
              font: 'Arial Black',
              color: '#e5554f',
              fontSize: 25,
            },
          ],
        },
      ])
    })
  })
  describe('given some html discovered from a property test', () => {
    it('should produce the correct slate', () => {
      expect(
        convertHTMLString(
          '<ol><li><img src="data:image/jpeg;base64,          " /><h1><span>          </span></h1></li></ol>'
        )
      ).toEqual([
        {
          type: 'numbered-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  type: 'image-data',
                  data: 'data:image/jpeg;base64,          ',
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'heading-one',
                  children: [
                    {
                      text: '          ',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
    })
  })
  describe('given a heading with underlined blank text inside', () => {
    it('should produce the slate equivelant with the underline and blank text', () => {
      expect(convertHTMLString('<h1><u><span>          </span></u></h1>')).toEqual([
        { type: 'heading-one', children: [{ text: '          ', underline: true }] },
      ])
    })
  })
  describe('given a nested emphasised, italicised etc span of text with all formatting', () => {
    it('should produce the equivelant slate', () => {
      expect(
        convertHTMLString(
          '<i><b><u><s><span style="color:red;font-family:IBM">Hi</span></s></u></b></i>'
        )
      ).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'Hi',
              italic: true,
              bold: true,
              underline: true,
              strike: true,
              color: 'red',
              font: 'IBM',
            },
          ],
        },
      ])
    })
  })
  describe('given html with escaped angle brackets and other escaped html characters', () => {
    it('should produce Slate with unescaped equivelant characters', () => {
      expect(convertHTMLString('<p>&lt;&gt;&quot;&apos;&amp;&nbsp;</p>')).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: `<>"'& `,
            },
          ],
        },
      ])
    })
  })
  describe('given html with a meta tag at the start of the body', () => {
    const input = `<meta http-equiv="content-type" content="text/html; charset=utf-8"><span>Why you should do it regularly:</span>`
    it('should remove the meta tag', () => {
      const expected = [
        {
          type: 'paragraph',
          children: [
            {
              text: 'Why you should do it regularly:',
            },
          ],
        },
      ]
      expect(convertHTMLString(input)).toEqual(expected)
    })
  })
  // TODO!!! Check what HTML the editor produces for indented
  // bullets/numbered lists
  describe('given some HTML content with new lines', () => {
    it('should produce Slate equivelant content ', () => {
      expect(
        convertHTMLString(`<h1><span>Test</span></h1>
<h1><span>Hmmm</span></h1>
<ul>
  <li>
    <span>Ahj</span>
  </li>
  <li>
    <span>This is a test.</span>
  </li>
</ul>
<p><span><br/></span></p>
<p><span>undefined</span></p>
<p><span>other stuff</span></p>
<p><span>Some stuff!</span></p>
<p>
  <span>A list</span>
</p>
<ol>
  <li>
    <span>blah</span>
  </li>
  <li>
    <span>blah</span>
  </li>
  <li>
    <span>Another item</span>
  </li>
</ol>`)
      ).toEqual([
        {
          type: 'heading-one',
          children: [
            {
              text: 'Test',
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
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'Ahj',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'This is a test.',
                },
              ],
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
          type: 'paragraph',
          children: [
            {
              text: 'undefined',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'other stuff',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Some stuff!',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'A list',
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
                  text: 'blah',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'blah',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'Another item',
                },
              ],
            },
          ],
        },
      ])
    })
  })
  describe('given some html that the editor produced', () => {
    it('should be able to transform it to slate', () => {
      expect(
        convertHTMLString(
          '<h2>Goldilocks is hungry, and she really wants food...</h2><div><br></div><h3>Hi there!</h3><div><br></div><p>This is a paragraph<br><p><strike>this is struck</strike><br><u>this is underlined</u><br><i>this is italicised</i><br><b>this is bold</b><br><b><i><u><strike>this is everything</strike></u></i></b><br><ol><li><span style="font-size: 14.8px;">this is numbered</span><br></li></ol><ul><li><span style="font-size: 14.8px;">this is bulletted</span><br></li></ul></p></p><li>Item A</li><ul><li>Item B<ol><li><span style="font-size: 14.8px;">Item 1</span><br></li><li><span style="font-size: 14.8px;">Item 2</span><br></li></ol></li><li>Item C</li></ul><div>This is a very strange way of doing this.</div>'
        )
      ).toEqual([
        {
          children: [
            {
              text: 'Goldilocks is hungry, and she really wants food...',
            },
          ],
          type: 'heading-two',
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
              text: 'Hi there!',
            },
          ],
          type: 'heading-two',
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
              text: 'This is a paragraph',
            },
            {
              text: '',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              strike: true,
              text: 'this is struck',
            },
            {
              text: '',
            },
            {
              text: 'this is underlined',
              underline: true,
            },
            {
              text: '',
            },
            {
              italic: true,
              text: 'this is italicised',
            },
            {
              text: '',
            },
            {
              bold: true,
              text: 'this is bold',
            },
            {
              text: '',
            },
            {
              bold: true,
              italic: true,
              strike: true,
              text: 'this is everything',
              underline: true,
            },
            {
              text: '',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                {
                  fontSize: 14,
                  text: 'this is numbered',
                },
                {
                  text: '',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'numbered-list',
        },
        {
          children: [
            {
              children: [
                {
                  fontSize: 14,
                  text: 'this is bulletted',
                },
                {
                  text: '',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'bulleted-list',
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
              children: [
                {
                  text: 'Item A',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'Item B',
                },
              ],
              type: 'list-item',
            },
            {
              children: [
                {
                  children: [
                    {
                      fontSize: 14,
                      text: 'Item 1',
                    },
                    {
                      text: '',
                    },
                  ],
                  type: 'list-item',
                },
                {
                  children: [
                    {
                      fontSize: 14,
                      text: 'Item 2',
                    },
                    {
                      text: '',
                    },
                  ],
                  type: 'list-item',
                },
              ],
              type: 'numbered-list',
            },
            {
              children: [
                {
                  text: 'Item C',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'bulleted-list',
        },
        {
          children: [
            {
              text: 'This is a very strange way of doing this.',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given some html that copy-pasting from Firefox created on Windows', () => {
    const fromFirefoxOnWindows = `<html><body>
<!--StartFragment--><li data-layout="organic" class="wLL07_0Xnd1QZpzpfR4W"><article id="r1-0" data-handled-by-react="true" data-testid="result" data-nrn="result" class="yQDlj3B5DI5YO8c8Ulio CpkrTDP54mqzpuCSn1Fa SKlplDuh9FjtDprgoMxk"><div class="OQ_6vPwNhCeusNiEDcGp"><div class="mwuQiMOjmFJ5vmN6Vcqw B433VpEfaxl6n8VNRUDy NvMwcsUp56q4W2Z_b8E7 hAeZQDlu0XXeGwL7U722 SgSTKoqQXa0tEszD2zWF LQVY1Jpkk8nyJ6HBWKAk"><span class="DpVR46dTZaePK29PDkz8"><a href="https://duckduckgo.com/?q=disable%20windows%20key%20shortcuts%20in%20emacs+site:emacs.stackexchange.com&amp;t=ffab&amp;atb=v323-1" rel="noopener" title="Search domain emacs.stackexchange.com" data-testid="result-extras-site-search-link" data-handled-by-react="true"><img src="https://external-content.duckduckgo.com/ip3/emacs.stackexchange.com.ico" height="16" width="16" loading="lazy"></a></span><a href="https://emacs.stackexchange.com/questions/48720/disable-left-win-key-in-emacs-for-windows" rel="noopener" target="_self" data-testid="result-extras-url-link" data-handled-by-react="true" class="Rn_JXVtoPVAFyGkcaXyK"><span class="Wo6ZAEmESLNUuWBkbMxx">https://emacs.stackexchange.com</span><span class="oaxCunrdbQs3WQDCq3Ls"> › questions › 48720 › disable-left-win-key-in-emacs-for-windows</span></a></div></div><div class="ikg2IXiCD14iVX7AdZo1"><h2 class="LnpumSThxEWMIsDdAT17 BrPN5UiFwJN5HlfRhga9 CXMyPcQ6nDv47DKFeywM"><a href="https://emacs.stackexchange.com/questions/48720/disable-left-win-key-in-emacs-for-windows" rel="noopener" target="_self" data-testid="result-title-a" data-handled-by-react="true" class="eVNpHGjtxRBq_gLOfGDr LQNqh2U1kzYxREs65IJu"><span class="EKtkFWMYpwzMKOYr0GYm LQVY1Jpkk8nyJ6HBWKAk">Disable left win key in Emacs for Windows</span></a></h2></div><div class="E2eLOJr8HctVnDOTM8fs"><div data-result="snippet" class="OgdwYG6KE2qthn9XQWFC"><span style="-webkit-line-clamp: 3;" class="kY2IgmnCmOGjharHErah"><span>1 Answer Sorted by: 1 So firstly, I assume you mean you've set your <b>Windows</b> <b>key</b> to do nothing in AHK with something like: LWin::Return. If this is the case, the <b>Windows</b> menu certainly shouldn't be opening in <b>Emacs</b>.</span></span></div></div></article></li><!--EndFragment-->
</body>
</html>`
    it('should produce appropriate Slate content', () => {
      expect(convertHTMLString(fromFirefoxOnWindows)).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'link',
                      url: 'https://duckduckgo.com/?q=disable%20windows%20key%20shortcuts%20in%20emacs+site:emacs.stackexchange.com&t=ffab&atb=v323-1',
                      children: [
                        {
                          text: '',
                        },
                      ],
                    },
                    {
                      type: 'link',
                      url: 'https://emacs.stackexchange.com/questions/48720/disable-left-win-key-in-emacs-for-windows',
                      children: [
                        {
                          text: 'https://emacs.stackexchange.com',
                        },
                        {
                          text: ' › questions › 48720 › disable-left-win-key-in-emacs-for-windows',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'heading-two',
                      children: [
                        {
                          type: 'link',
                          url: 'https://emacs.stackexchange.com/questions/48720/disable-left-win-key-in-emacs-for-windows',
                          children: [
                            {
                              text: 'Disable left win key in Emacs for Windows',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: "1 Answer Sorted by: 1 So firstly, I assume you mean you've set your ",
                    },
                    {
                      text: 'Windows',
                      bold: true,
                    },
                    {
                      text: ' ',
                    },
                    {
                      text: 'key',
                      bold: true,
                    },
                    {
                      text: ' to do nothing in AHK with something like: LWin::Return. If this is the case, the ',
                    },
                    {
                      text: 'Windows',
                      bold: true,
                    },
                    {
                      text: " menu certainly shouldn't be opening in ",
                    },
                    {
                      text: 'Emacs',
                      bold: true,
                    },
                    {
                      text: '.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
    })
  })
  describe('given some HTML with a doctype', () => {
    const HTML_STARTS_WITH_DOCTYPE = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Content-Style-Type" content="text/css">
<title></title>
<meta name="Generator" content="Cocoa HTML Writer">
<meta name="CocoaVersion" content="2487.2">
<style type="text/css">
p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'}
p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'; min-height: 15.0px}
li.li1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'}
span.s1 {font: 9.0px Menlo}
span.Apple-tab-span {white-space:pre}
ul.ul1 {list-style-type: disc}
</style>
</head>
<body>
<p class="p1">This channel will track the next release of Plottr.</p>
<p class="p1">There are<b> two features </b>in this release:</p>
<ul class="ul1">
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"RCE Word Counter" i.e. count total and selected words in editors, and</li>
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"Fonts Everywhere" i.e. customise any font family and size across Plottr.</li>
</ul>
<p class="p2"><br></p>
<p class="p1">Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.</p>
</body>
</html>`
    it('should produce slate content', () => {
      expect(convertHTMLString(HTML_STARTS_WITH_DOCTYPE)).toEqual([
        {
          children: [{ text: 'This channel will track the next release of Plottr.' }],
          type: 'paragraph',
        },
        {
          children: [
            { text: 'There are' },
            { bold: true, text: ' two features ' },
            { text: 'in this release:' },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                { text: '"RCE Word Counter" i.e. count total and selected words in editors, and' },
              ],
              type: 'list-item',
            },
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                {
                  text: '"Fonts Everywhere" i.e. customise any font family and size across Plottr.',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'bulleted-list',
        },
        { children: [{ text: '' }], type: 'paragraph' },
        {
          children: [
            {
              text: 'Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given some html that starts with a meta tag', () => {
    const HTML_STARTS_WITH_META = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Content-Style-Type" content="text/css">
<title></title>
<meta name="Generator" content="Cocoa HTML Writer">
<meta name="CocoaVersion" content="2487.2">
<style type="text/css">
p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'}
p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'; min-height: 15.0px}
li.li1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'}
span.s1 {font: 9.0px Menlo}
span.Apple-tab-span {white-space:pre}
ul.ul1 {list-style-type: disc}
</style>
</head>
<body>
<p class="p1">This channel will track the next release of Plottr.</p>
<p class="p1">There are<b> two features </b>in this release:</p>
<ul class="ul1">
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"RCE Word Counter" i.e. count total and selected words in editors, and</li>
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"Fonts Everywhere" i.e. customise any font family and size across Plottr.</li>
</ul>
<p class="p2"><br></p>
<p class="p1">Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.</p>
</body>
`
    it('should produce slate content', () => {
      expect(convertHTMLString(HTML_STARTS_WITH_META)).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
        {
          children: [{ text: 'This channel will track the next release of Plottr.' }],
          type: 'paragraph',
        },
        {
          children: [
            { text: 'There are' },
            { bold: true, text: ' two features ' },
            { text: 'in this release:' },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                { text: '"RCE Word Counter" i.e. count total and selected words in editors, and' },
              ],
              type: 'list-item',
            },
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                {
                  text: '"Fonts Everywhere" i.e. customise any font family and size across Plottr.',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'bulleted-list',
        },
        { children: [{ text: '' }], type: 'paragraph' },
        {
          children: [
            {
              text: 'Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given some html that starts with "body"', () => {
    const HTML_STARTS_WITH_BODY = `
<body>
<p class="p1">This channel will track the next release of Plottr.</p>
<p class="p1">There are<b> two features </b>in this release:</p>
<ul class="ul1">
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"RCE Word Counter" i.e. count total and selected words in editors, and</li>
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"Fonts Everywhere" i.e. customise any font family and size across Plottr.</li>
</ul>
<p class="p2"><br></p>
<p class="p1">Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.</p>
</body>
`
    it('should produce slate content', () => {
      expect(convertHTMLString(HTML_STARTS_WITH_BODY)).toEqual([
        {
          children: [{ text: 'This channel will track the next release of Plottr.' }],
          type: 'paragraph',
        },
        {
          children: [
            { text: 'There are' },
            { bold: true, text: ' two features ' },
            { text: 'in this release:' },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                { text: '"RCE Word Counter" i.e. count total and selected words in editors, and' },
              ],
              type: 'list-item',
            },
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                {
                  text: '"Fonts Everywhere" i.e. customise any font family and size across Plottr.',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'bulleted-list',
        },
        { children: [{ text: '' }], type: 'paragraph' },
        {
          children: [
            {
              text: 'Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
  describe('given some html that starts without a body', () => {
    const HTML_STARTS_WITHOUT_BODY = `
<p class="p1">This channel will track the next release of Plottr.</p>
<p class="p1">There are<b> two features </b>in this release:</p>
<ul class="ul1">
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"RCE Word Counter" i.e. count total and selected words in editors, and</li>
<li class="li1"><span class="s1"></span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span>"Fonts Everywhere" i.e. customise any font family and size across Plottr.</li>
</ul>
<p class="p2"><br></p>
<p class="p1">Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.</p>
`
    it('should produce slate content', () => {
      expect(convertHTMLString(HTML_STARTS_WITHOUT_BODY)).toEqual([
        {
          children: [{ text: 'This channel will track the next release of Plottr.' }],
          type: 'paragraph',
        },
        {
          children: [
            { text: 'There are' },
            { bold: true, text: ' two features ' },
            { text: 'in this release:' },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                { text: '"RCE Word Counter" i.e. count total and selected words in editors, and' },
              ],
              type: 'list-item',
            },
            {
              children: [
                { text: '' },
                { text: '	' },
                { text: '	' },
                {
                  text: '"Fonts Everywhere" i.e. customise any font family and size across Plottr.',
                },
              ],
              type: 'list-item',
            },
          ],
          type: 'bulleted-list',
        },
        { children: [{ text: '' }], type: 'paragraph' },
        {
          children: [
            {
              text: 'Additionally, we have a couple of important bug fixes; some are in already and some need to be done before we release.',
            },
          ],
          type: 'paragraph',
        },
      ])
    })
  })
})
