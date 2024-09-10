import {
  containsBullet,
  stripBullet,
  joinNeighbouringLists,
  inferLists,
  rawTagsFromEntity,
  matchToClosestEntity,
  inferCategories,
  extractInlinePropertyFromTxtByName,
  createNewLine,
  extractSingleLineAttribute,
  regexifyForFlexiSearch,
  normaliseHeading,
  attributeHeading,
  filesEntityId,
  extractNonAttributePreamble,
  findAndExtractAttributes,
  createCharacterAttributesPerBook,
  replaceRawCardAttributeIds,
  replaceRawNoteAttributeIds,
  replaceRawCharacterAttributeIds,
  replaceRawPlaceAttributeIds,
  linkTagsCharactersAndPlaces,
  transformNotes,
  transformCharacters,
  transformPlaces,
  transformCards,
  extractPlotlines,
  extractBeats,
  transformToPlottrFile,
  processResearchNotesItems,
  processManuscript,
  EMPTY_SCRIVENER_STRUCTURE,
  processNotesFolder,
  interpretScrivenerStructure,
} from '../importer.js'

describe('containsBullet', () => {
  describe('given a slate node', () => {
    describe('that is of type "paragraph"', () => {
      describe('and has an empty array of children', () => {
        it('should produce false', () => {
          expect(containsBullet({ type: 'paragraph', children: [] })).toBeFalsy()
        })
      })
      describe('and has an array of children', () => {
        describe('where none of them contains a literal bullet point after a tab at the start of the line', () => {
          it('should produce false', () => {
            expect(
              // Note that the bullets aren't the first things on
              // either line.
              containsBullet({
                type: 'paragraph',
                children: [{ text: 'blah' }, { text: 'hi ◦' }, { text: 'hi \t•' }],
              })
            ).toBeFalsy()
          })
        })
        describe('where a child contains a literal bullet point after a tab at the start of the line', () => {
          it('should produce true', () => {
            expect(
              containsBullet({
                type: 'paragraph',
                children: [{ text: 'blah' }, { text: '\t◦\t some other text' }, { text: 'hi \t•' }],
              })
            ).toBeTruthy()
          })
        })
      })
    })
    describe('that is of type "text"', () => {
      describe('does not contain a literal bullet point at the start of the line', () => {
        it('should produce false', () => {
          expect(
            containsBullet({
              text: 'this text is not a bullet point',
            })
          ).toBeFalsy()
        })
      })
      describe('contains a literal bullet point at the start of the line', () => {
        it('should produce true', () => {
          expect(
            containsBullet({
              type: 'paragraph',
              children: [{ text: '\t◦\t some other text' }],
            })
          ).toBeTruthy()
        })
      })
    })
  })
})

describe('stripBullet', () => {
  describe('given an empty string', () => {
    it('should produce the empty string', () => {
      expect(stripBullet('')).toEqual('')
    })
  })
  describe('given a string without a tab then bullet point at the start', () => {
    it('should produce false', () => {
      expect(stripBullet(' blah blah')).toEqual(' blah blah')
      expect(stripBullet(' \t◦\t some ')).toEqual(' \t◦\t some ')
      expect(stripBullet('blah \t◦\t some ')).toEqual('blah \t◦\t some ')
    })
  })
  describe('given a string with a tab and then a bullet point at the start', () => {
    it('should produce true', () => {
      expect(stripBullet('\t◦\t some')).toEqual(' some')
    })
  })
})

describe('joinNeighbouringLists', () => {
  describe('given an empty array', () => {
    it('should produce an empty array', () => {
      expect(joinNeighbouringLists([])).toEqual([])
    })
  })
  describe('given a singleton array', () => {
    describe('where the sole element is a paragraph', () => {
      it('should produce the same array', () => {
        expect(
          joinNeighbouringLists([
            {
              type: 'paragraph',
              children: [{ text: 'test' }],
            },
          ])
        )
      })
    })
    describe('where the sole element is a bullet-list', () => {
      it('should produce the same array', () => {
        const slateArray = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
        ]
        expect(joinNeighbouringLists(slateArray)).toEqual(slateArray)
      })
    })
  })
  describe('given a two element array', () => {
    describe('where one element is a bullet list and the other is a paragraph', () => {
      it('should produce the array unchanged', () => {
        const slateArray = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: 'a paragraph' }],
          },
        ]
        expect(joinNeighbouringLists(slateArray)).toEqual(slateArray)
        const slateArray2 = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: 'a paragraph' }],
          },
        ]
        expect(joinNeighbouringLists(slateArray2)).toEqual(slateArray2)
      })
    })
    describe('where both elements are bullet lists', () => {
      it('should combine the children', () => {
        const slateArray = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
        ]
        expect(joinNeighbouringLists(slateArray)).toEqual([
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
        ])
      })
    })
  })
  describe('given a three-element array', () => {
    describe('where there are bullet lists that are not neighbours', () => {
      it('should leave the array unchanged', () => {
        const slateArrayEdges = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: 'haha!' }],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
        ]
        expect(joinNeighbouringLists(slateArrayEdges)).toEqual(slateArrayEdges)

        const slateArrayMiddle = [
          {
            type: 'paragraph',
            children: [{ text: 'haha!' }],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: 'hehe!' }],
          },
        ]
        expect(joinNeighbouringLists(slateArrayMiddle)).toEqual(slateArrayMiddle)
      })
    })
    describe('where two elements are bullet lists and are in subsequent indices', () => {
      it('should join the consecutive bullet points', () => {
        const slateArrayAtStart = [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: 'haha!' }],
          },
        ]
        expect(joinNeighbouringLists(slateArrayAtStart)).toEqual([
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: 'haha!' }],
          },
        ])

        const slateArrayAtEnd = [
          {
            type: 'paragraph',
            children: [{ text: 'haha!' }],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
            ],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
        ]
        expect(joinNeighbouringLists(slateArrayAtEnd)).toEqual([
          {
            type: 'paragraph',
            children: [{ text: 'haha!' }],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'blah' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'blah 2' }],
              },
            ],
          },
        ])
      })
    })
  })
})

describe('inferLists', () => {
  describe('given empty slate content', () => {
    it('should produce empty slate content', () => {
      expect(inferLists([])).toEqual([])
    })
  })
  describe('given a slate array with one element', () => {
    describe('that is a paragraph', () => {
      describe('when the paragraph has no children', () => {
        it('should produce the paragraph unchanged', () => {
          const input = [{ type: 'paragraph', children: [] }]
          expect(inferLists(input)).toEqual(input)
        })
      })
      describe('when the paragraph has children', () => {
        describe('and one child contains a literal bullet in the right format', () => {
          it('should transform the parent of that bullet point into a bulleted list and wrap the child', () => {
            const input = [
              {
                type: 'paragraph',
                children: [{ text: 'haha' }, { text: '\t◦\t some other text' }, { text: 'hehe' }],
              },
            ]
            expect(inferLists(input)).toEqual([
              {
                type: 'paragraph',
                children: [
                  { text: 'haha' },
                  {
                    type: 'bulleted-list',
                    children: [{ type: 'list-item', children: [{ text: ' some other text' }] }],
                  },
                  { text: 'hehe' },
                ],
              },
            ])
          })
        })
      })
    })
    describe('that is text', () => {
      describe('and that text is a literal bullet point', () => {
        it('should create a bullet point structure with that text', () => {
          const input = [{ text: '\t◦\t some other text' }]
          expect(inferLists(input)).toEqual([
            {
              type: 'bulleted-list',
              children: [
                {
                  type: 'list-item',
                  children: [{ text: ' some other text' }],
                },
              ],
            },
          ])
        })
      })
      describe('and that text is not a literal bullet point', () => {
        it('should produce the input unchanged', () => {
          const input = [{ text: 'some starting text \t◦\t some other text' }]
          expect(inferLists(input)).toEqual(input)
        })
      })
    })
  })
})

describe('rawTagsFromEntity', () => {
  describe('given an empty object', () => {
    it('should produce the empty array', () => {
      // @ts-ignore
      expect(rawTagsFromEntity({})).toEqual([])
    })
  })
  describe('given an object with a rawTags field', () => {
    describe('that is the empty string', () => {
      it('should produce the empty array', () => {
        expect(rawTagsFromEntity({ rawTags: '' })).toEqual([])
      })
    })
    describe('that is a string without commas in it', () => {
      it('should produce a singleton array with that string as the element', () => {
        expect(rawTagsFromEntity({ rawTags: 'test blah blah' })).toEqual(['test blah blah'])
      })
    })
    describe('that is a string with commas in it', () => {
      it('should produce a single entry for each comma', () => {
        expect(rawTagsFromEntity({ rawTags: 'test,blah,blah' })).toEqual(['test', 'blah', 'blah'])
      })
    })
    describe('taht is a string with commas in it and space after each comma', () => {
      it('should produce a single entry for each comma with whitespace removed', () => {
        expect(rawTagsFromEntity({ rawTags: 'test,  blah,\t blah' })).toEqual([
          'test',
          'blah',
          'blah',
        ])
      })
    })
  })
})

describe('matchToClosestEntity', () => {
  describe('given a "file" with no entities in it', () => {
    describe('and any entity type', () => {
      describe('and any property', () => {
        it('should produce a function that never matches anything', () => {
          const matcher = matchToClosestEntity({}, 'cats', 'name')
          expect(matcher('hi')).toEqual(null)
          expect(matcher('bi')).toEqual(null)
          expect(matcher('')).toEqual(null)
          expect(matcher('haha')).toEqual(null)
        })
      })
    })
  })
  describe('given a "file" with "cats" that have "names"', () => {
    const file = {
      cats: [
        {
          name: 'Furball',
          height: '0.2m',
          id: 1,
        },
        {
          name: 'Fuzzy',
          height: '1Km',
          id: 2,
        },
        {
          name: 'Thom',
          height: '3microns',
          id: 3,
        },
      ],
    }
    describe('and an entity type of "dog"', () => {
      describe('and any property', () => {
        it('should produce a function that never matches anything', () => {
          const matcher = matchToClosestEntity(file, 'dogs', 'name')
          expect(matcher('Fuzzy')).toEqual(null)
          expect(matcher('Furball')).toEqual(null)
          expect(matcher('')).toEqual(null)
          expect(matcher('Thom')).toEqual(null)
        })
      })
    })
    describe('and an entity type of "cat"', () => {
      describe('and a property that is not in any cat', () => {
        it('should produce a function that never matches anything', () => {
          const matcher = matchToClosestEntity(file, 'cats', 'weight')
          expect(matcher('Fuzzy')).toEqual(null)
          expect(matcher('Furball')).toEqual(null)
          expect(matcher('')).toEqual(null)
          expect(matcher('Thom')).toEqual(null)
        })
      })
      describe('and a property of "name"', () => {
        it('should produce a function that matches names that exist within 5 insertions', () => {
          const matcher = matchToClosestEntity(file, 'cats', 'name')
          expect(matcher('Fuzzy wuz')).toEqual(2)
          expect(matcher('Furzbaell')).toEqual(1)
          expect(matcher('')).toEqual(null)
          expect(matcher('Tho')).toEqual(null)
          expect(matcher('Thommmmmmmmmmmmmmmmmmmmmmm')).toEqual(null)
          expect(matcher('naotehunt')).toEqual(null)
          expect(matcher('Thiiiiiom')).toEqual(3)
        })
      })
    })
  })
})

describe('inferCategories', () => {
  describe('given an empty collection of entities', () => {
    it('should produce the empty array', () => {
      expect(inferCategories([])).toEqual([])
    })
  })
  describe('given a collection of entities', () => {
    describe('where none of them has a "rawCategory"', () => {
      it('should produce the empty array', () => {
        expect(
          inferCategories([
            { name: 'bob', color: 'green' },
            { name: 'sarah', color: 'red' },
            { name: 'roger', color: 'blue' },
          ])
        ).toEqual([])
      })
    })
    describe('where one has a "rawCategory" and others do not', () => {
      it('should produce a single-category array', () => {
        expect(
          inferCategories([
            { name: 'bob', color: 'green' },
            { name: 'sarah', color: 'red', rawCategory: 'good students' },
            { name: 'roger', color: 'blue' },
          ])
        ).toEqual([
          {
            id: 1,
            name: 'good students',
            position: 0,
            type: 'text',
          },
        ])
      })
    })
    describe('where two have the same "rawCategory"', () => {
      it('should produce a single-category array', () => {
        expect(
          inferCategories([
            { name: 'bob', color: 'green', rawCategory: 'good students' },
            { name: 'sarah', color: 'red', rawCategory: 'good students' },
            { name: 'roger', color: 'blue' },
          ])
        ).toEqual([
          {
            id: 1,
            name: 'good students',
            position: 0,
            type: 'text',
          },
        ])
      })
    })
    describe('where two have the same "rawCategory" and a third has another', () => {
      it('should produce a two-category array', () => {
        expect(
          inferCategories([
            { name: 'bob', color: 'green', rawCategory: 'bad students' },
            { name: 'sarah', color: 'red', rawCategory: 'good students' },
            { name: 'roger', color: 'blue', rawCategory: 'good students' },
          ])
        ).toEqual([
          {
            id: 1,
            name: 'bad students',
            position: 0,
            type: 'text',
          },
          {
            id: 2,
            name: 'good students',
            position: 1,
            type: 'text',
          },
        ])
      })
    })
  })
})

describe('extractInlinePropertyFromTxtByName', () => {
  describe('given the empty string', () => {
    describe('and any attribute name', () => {
      it('should produce null', () => {
        expect(extractInlinePropertyFromTxtByName('name', '')).toEqual(null)
      })
    })
  })
  describe('given a string with no inline property in it (i.e. it lacks a colon)', () => {
    describe('and any attribute name', () => {
      it('should produce null', () => {
        expect(extractInlinePropertyFromTxtByName('name', 'name bob')).toEqual(null)
        expect(extractInlinePropertyFromTxtByName('bob', 'name bob')).toEqual(null)
        expect(extractInlinePropertyFromTxtByName('', 'name bob')).toEqual(null)
      })
    })
  })
  describe('given a strung with an inline property in it', () => {
    describe('and the wrong property name', () => {
      it('should produce null', () => {
        expect(extractInlinePropertyFromTxtByName('zarg', 'name: bob')).toEqual(null)
        expect(extractInlinePropertyFromTxtByName('bob', 'name: bob')).toEqual(null)
        expect(extractInlinePropertyFromTxtByName('', 'name: bob')).toEqual(null)
      })
    })
    describe('and the right property name', () => {
      describe('and the text has an empty property value', () => {
        it('should produce null', () => {
          expect(extractInlinePropertyFromTxtByName('name', 'name: ')).toEqual(null)
          expect(extractInlinePropertyFromTxtByName('name', 'name:')).toEqual(null)
        })
      })
      describe('and the text has a property value', () => {
        it('should produce the property value', () => {
          expect(extractInlinePropertyFromTxtByName('name', 'name: bob')).toEqual('bob')
          expect(extractInlinePropertyFromTxtByName('name', 'name: bob hey')).toEqual('bob hey')
          expect(
            extractInlinePropertyFromTxtByName('name', 'name: \t bob hey with spaces  \t')
          ).toEqual('bob hey with spaces')
        })
      })
    })
  })
})

describe('createNewLine', () => {
  describe('given an empty collection of new lines', () => {
    it('should produce a new line with an id of 1', () => {
      expect(createNewLine('A Book', 1, [])).toEqual({
        line: {
          id: 1,
          position: 0,
          bookId: 1,
          title: 'A Book',
          characterId: null,
          color: '#6cace4',
          expanded: null,
          fromTemplateId: null,
          isPinned: false,
        },
        existed: false,
      })
    })
  })
  describe('given a collection of new lines', () => {
    describe('and the title does not appear in the list', () => {
      it('should produce a new line with an id equal to number of lines + 1', () => {
        expect(
          createNewLine('A Book', 1, [
            {
              id: 1,
              position: 0,
              bookId: 1,
              title: 'One Book',
              characterId: null,
              color: '#e5554f',
              expanded: null,
              fromTemplateId: null,
            },
            {
              id: 2,
              position: 1,
              bookId: 1,
              title: 'Another Book',
              characterId: null,
              color: '#e5554f',
              expanded: null,
              fromTemplateId: null,
            },
          ])
        ).toEqual({
          line: {
            id: 3,
            position: 2,
            bookId: 1,
            title: 'A Book',
            characterId: null,
            color: '#e5554f',
            expanded: null,
            fromTemplateId: null,
            isPinned: false,
          },
          existed: false,
        })
      })
    })
    describe('and the title does appear in the list', () => {
      it('should produce the line with the same title', () => {
        expect(
          createNewLine('A Book', 1, [
            {
              id: 1,
              position: 0,
              bookId: 1,
              title: 'A Book',
              characterId: null,
              color: '#e5554f',
              expanded: null,
              fromTemplateId: null,
            },
            {
              id: 2,
              position: 1,
              bookId: 1,
              title: 'Another Book',
              characterId: null,
              color: '#e5554f',
              expanded: null,
              fromTemplateId: null,
            },
          ])
        ).toEqual({
          line: {
            id: 1,
            position: 0,
            bookId: 1,
            title: 'A Book',
            characterId: null,
            color: '#e5554f',
            expanded: null,
            fromTemplateId: null,
          },
          existed: true,
        })
      })
    })
  })
})

describe('extractSingleLineAttribute', () => {
  describe('given a slate node that is a paragraph', () => {
    describe('without children', () => {
      it('should produce null', () => {
        expect(extractSingleLineAttribute({ type: 'paragraph', children: [] })).toEqual(null)
      })
    })
    describe('with children', () => {
      describe('but none have a single line attribute in them', () => {
        it('should produce null', () => {
          expect(
            extractSingleLineAttribute({
              type: 'paragraph',
              children: [
                { text: 'hey there' },
                { text: ':you may think there is an attribute here' },
                { text: 'or perhaps here:' },
              ],
            })
          ).toEqual(null)
        })
      })
      describe('and one of them has a single line attribute', () => {
        it('should produce a key value array for that attribute', () => {
          expect(
            extractSingleLineAttribute({
              type: 'paragraph',
              children: [
                { text: 'hey: there' },
                { text: ':you may think there is an attribute here' },
                { text: 'or perhaps here:' },
              ],
            })
          ).toEqual(['hey', 'there'])
        })
      })
      describe('and many of them have a single line attributes', () => {
        it('should produce a key value array for the first attribute', () => {
          expect(
            extractSingleLineAttribute({
              type: 'paragraph',
              children: [
                { text: 'hey: there' },
                { text: 'you: may think there is an attribute here' },
                { text: 'or perhaps here:' },
              ],
            })
          ).toEqual(['hey', 'there'])
        })
      })
    })
  })
  describe('given a slate node with type "text"', () => {
    describe('when it does not contain a single line attribute', () => {
      it('should produce null', () => {
        expect(extractSingleLineAttribute({ text: 'hey there' })).toEqual(null)
        expect(extractSingleLineAttribute({ text: ':hey there' })).toEqual(null)
        expect(extractSingleLineAttribute({ text: ':hey there:' })).toEqual(null)
        expect(extractSingleLineAttribute({ text: 'hey there:' })).toEqual(null)
        expect(extractSingleLineAttribute({ text: 'hey there: ' })).toEqual(null)
        expect(extractSingleLineAttribute({ text: 'hey: ' })).toEqual(null)
      })
    })
    describe('when it does contain a single line attribute', () => {
      it('should produce that attribute as a two-element array', () => {
        expect(extractSingleLineAttribute({ text: 'hey: \tthere ' })).toEqual(['hey', 'there'])
        expect(extractSingleLineAttribute({ text: 'hey: there ' })).toEqual(['hey', 'there'])
        expect(extractSingleLineAttribute({ text: "hey: there's a snake in my boots! " })).toEqual([
          'hey',
          "there's a snake in my boots!",
        ])
      })
    })
  })
})

describe('regexifyForFlexiSearch', () => {
  describe('given the empty string', () => {
    it('should produce a regular expression that never matches anything', () => {
      expect(regexifyForFlexiSearch('')).toEqual(/$a/)
      expect(regexifyForFlexiSearch('  ')).toEqual(/$a/)
      expect(regexifyForFlexiSearch('\t')).toEqual(/$a/)
      expect(regexifyForFlexiSearch('\n')).toEqual(/$a/)
      expect('test'.match(regexifyForFlexiSearch(''))).toEqual(null)
    })
  })
  describe('given a string with many characters', () => {
    it('should produce a regex that is the string with dot stars between characetrs', () => {
      expect(regexifyForFlexiSearch('test')).toEqual(/.*t.*e.*s.*t.*/i)
    })
  })
})

describe('normaliseHeading', () => {
  describe('given the empty heading', () => {
    describe('and any knownBaseAttributes', () => {
      it('should produce null', () => {
        expect(normaliseHeading('', ['test', 'hi'])).toEqual(null)
        expect(normaliseHeading('   ', ['test', 'hi'])).toEqual(null)
        expect(normaliseHeading('\t\t', ['test', 'hi'])).toEqual(null)
        expect(normaliseHeading('\n \t', ['test', 'hi'])).toEqual(null)
      })
    })
  })
  describe('and a heading', () => {
    describe('that does not match any known attribute closely enough', () => {
      it('should produce the supplied heading', () => {
        expect(normaliseHeading('hi there', ['test', 'hi'])).toEqual('hi there')
        expect(normaliseHeading('s', ['test', 'hi'])).toEqual('s')
        expect(normaliseHeading('h', ['test', 'hi'])).toEqual('h')
        expect(normaliseHeading('i', ['test', 'hi'])).toEqual('i')
      })
    })
    describe('that is an exact match for a known attribute and differs in casing', () => {
      it('should produce that known attribute with known casing', () => {
        expect(normaliseHeading('hI', ['test', 'hi'])).toEqual('hi')
        expect(normaliseHeading('HI', ['test', 'hi'])).toEqual('hi')
        expect(normaliseHeading('hI', ['test', 'hi'])).toEqual('hi')
      })
    })
    describe('that contains the same characters in the same order with up to 2 additions', () => {
      it('should produce the known attribute', () => {
        expect(normaliseHeading('hi a', ['test', 'hi'])).toEqual('hi')
        expect(normaliseHeading('hzzi', ['test', 'hi'])).toEqual('hi')
        expect(normaliseHeading('a hi', ['test', 'hi'])).toEqual('hi')
      })
    })
    describe('that contains the same characters in the same order with more than 2 additions', () => {
      it('should produce null', () => {
        expect(normaliseHeading('hi there', ['test', 'hi'])).toEqual('hi there')
        expect(normaliseHeading('hzzzi', ['test', 'hi'])).toEqual('hzzzi')
        expect(normaliseHeading('a generous hi', ['test', 'hi'])).toEqual('a generous hi')
      })
    })
  })
})

describe('attributeHeading', () => {
  describe('given a slate node of type text', () => {
    describe('that is not bold', () => {
      it('should produce null', () => {
        expect(attributeHeading({ text: 'hey yo!' }, [])).toEqual(null)
        expect(attributeHeading({ text: 'hey yo!', isBold: false }, [])).toEqual(null)
      })
    })
    describe('that is empty', () => {
      it('should produce null', () => {
        expect(attributeHeading({ text: '' }, [])).toEqual(null)
        expect(attributeHeading({ text: '  ' }, [])).toEqual(null)
        expect(attributeHeading({ text: ' \t\t ' }, [])).toEqual(null)
        expect(attributeHeading({ text: '\n' }, [])).toEqual(null)
      })
    })
    describe('that is bold and has content', () => {
      describe('and there are no known base attributes', () => {
        it('should produce the given value', () => {
          expect(attributeHeading({ text: 'hi', isBold: true }, [])).toEqual('hi')
          expect(attributeHeading({ text: '\they  ', isBold: true }, [])).toEqual('hey')
          expect(attributeHeading({ text: '  hi', isBold: true }, [])).toEqual('hi')
        })
      })
      describe('and it matches a known base attribute', () => {
        it('should produce that known base attribute', () => {
          expect(attributeHeading({ text: 'hiit', isBold: true }, ['Hit'])).toEqual('Hit')
          expect(attributeHeading({ text: '\they  a', isBold: true }, ['heyA'])).toEqual('heyA')
          expect(attributeHeading({ text: '  hi', isBold: true }, ['hi'])).toEqual('hi')
        })
      })
    })
  })
})

describe('filesEntityId', () => {
  describe('given the empty string', () => {
    it('should produce the empty string', () => {
      expect(filesEntityId('')).toEqual('')
    })
  })
  describe('given a string that contains an expected file suffix', () => {
    it('should produce the name preceding the suffix', () => {
      expect(filesEntityId('1_synopsis.txt')).toEqual('1')
      expect(filesEntityId('1_notes.rtf')).toEqual('1')
      expect(filesEntityId('1.txt')).toEqual('1')
      expect(filesEntityId('1.rtf')).toEqual('1')
      expect(filesEntityId('lovely bunch of coconuts.rtf')).toEqual('lovely bunch of coconuts')
    })
  })
})

describe('extractNonAttributePreamble', () => {
  describe('given an empty array of slate nodes', () => {
    it('should produce the empty array', () => {
      expect(extractNonAttributePreamble([])).toEqual([])
    })
  })
  describe('given an array of slate nodes', () => {
    describe('where none are attribute headings (single or paragraph)', () => {
      it('should produce the given array', () => {
        const content = [
          [
            { type: 'paragraph', children: [{ text: 'hi there!' }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
        ]
        expect(extractNonAttributePreamble(content)).toEqual(content[0])
      })
    })
    describe('where there is an attribute heading immediately', () => {
      it('should produce an empty array', () => {
        const content = [
          [
            { type: 'paragraph', children: [{ text: 'hi there!', isBold: true }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
        ]
        expect(extractNonAttributePreamble(content)).toEqual([])
      })
    })
    describe('where there is an attribute heading after a few elements', () => {
      it('should produce the elements leading to the heading', () => {
        const content = [
          [
            { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
            { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
            { type: 'paragraph', children: [{ text: 'hi there!', isBold: true }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
        ]
        expect(extractNonAttributePreamble(content)).toEqual([
          { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
          { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
        ])
        const content2 = [
          [
            { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
            { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
            { type: 'paragraph', children: [{ text: 'hi: there' }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
        ]
        expect(extractNonAttributePreamble(content2)).toEqual([
          { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
          { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
        ])
      })
    })
    describe('where several collections of content are given', () => {
      describe('and some have content while others do not', () => {
        const content = [
          [
            { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
            { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
            { type: 'paragraph', children: [{ text: 'hi there!', isBold: true }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
          [
            { type: 'paragraph', children: [{ text: 'Why are we challenged?' }] },
            { type: 'paragraph', children: [{ text: 'This: is some other text.' }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
          [],
          [{ type: 'paragraph', children: [{ text: 'Questions to live by.' }] }],
        ]
        expect(extractNonAttributePreamble(content)).toEqual([
          { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
          { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
          { type: 'paragraph', children: [{ text: 'Why are we challenged?' }] },
          { type: 'paragraph', children: [{ text: 'Questions to live by.' }] },
        ])
      })
    })
  })
})

describe('findAndExtractAttributes', () => {
  describe('given an empty array of contents', () => {
    it('should produce an empty object', () => {
      expect(findAndExtractAttributes([], [])).toEqual({})
    })
  })
  describe('given an array of contents', () => {
    describe('which are all empty', () => {
      it('should produce an empty object', () => {
        expect(findAndExtractAttributes([[], [], []], [])).toEqual({})
      })
    })
    describe('where none of the slate nodes represent attributes', () => {
      it('should produce the empty object', () => {
        const content = [
          [
            { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
            { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
            { type: 'paragraph', children: [{ text: 'hi there!' }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
          [
            { type: 'paragraph', children: [{ text: 'Why are we challenged?' }] },
            { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
            { type: 'paragraph', children: [{ text: 'yo!' }] },
          ],
          [],
          [{ type: 'paragraph', children: [{ text: 'Questions to live by.' }] }],
        ]
        expect(findAndExtractAttributes(content, [])).toEqual({})
      })
    })
    describe('where there are some paragraph headings and single-line attributes', () => {
      describe('but no single line attribute before a paragraph attribute', () => {
        it('should produce only paragraphs', () => {
          const content = [
            [
              { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
              { type: 'paragraph', children: [{ text: 'heading', isBold: true }] },
              { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
              { type: 'paragraph', children: [{ text: 'hi there!' }] },
              { type: 'paragraph', children: [{ text: 'yo!' }] },
              { type: 'paragraph', children: [{ text: 'another: yowzers!' }] },
              { type: 'paragraph', children: [{ text: 'at end' }] },
            ],
            [
              { type: 'paragraph', children: [{ text: 'Why are we challenged?' }] },
              { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
              { type: 'paragraph', children: [{ text: 'yo!' }] },
            ],
            [],
            [
              { type: 'paragraph', children: [{ text: 'blah', isBold: true }] },
              { type: 'paragraph', children: [{ text: 'to live by.' }] },
              { type: 'paragraph', children: [{ text: 'blah blah.' }] },
              { type: 'paragraph', children: [{ text: 'Another-attribute', isBold: true }] },
              { type: 'paragraph', children: [{ text: 'Questions to live by.' }] },
            ],
          ]
          expect(findAndExtractAttributes(content, ['HeAding'])).toEqual({
            HeAding: [
              { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
              { type: 'paragraph', children: [{ text: 'hi there!' }] },
              { type: 'paragraph', children: [{ text: 'yo!' }] },
              { type: 'paragraph', children: [{ text: 'another: yowzers!' }] },
              { type: 'paragraph', children: [{ text: 'at end' }] },
            ],
            blah: [
              { type: 'paragraph', children: [{ text: 'to live by.' }] },
              { type: 'paragraph', children: [{ text: 'blah blah.' }] },
            ],
            'Another-attribute': [
              { type: 'paragraph', children: [{ text: 'Questions to live by.' }] },
            ],
          })
        })
      })
      describe('and some single line attributes come before a paragraph attributes', () => {
        it('should produce only paragraphs', () => {
          const content = [
            [
              { type: 'paragraph', children: [{ text: 'another: yowzers!' }] },
              { type: 'paragraph', children: [{ text: 'in mid' }] },
              { type: 'paragraph', children: [{ text: 'Why are things difficult?' }] },
              { type: 'paragraph', children: [{ text: 'heading', isBold: true }] },
              { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
              { type: 'paragraph', children: [{ text: 'hi there!' }] },
              { type: 'paragraph', children: [{ text: 'yo!' }] },
              { type: 'paragraph', children: [{ text: 'another: yowzers!' }] },
              { type: 'paragraph', children: [{ text: 'at end' }] },
            ],
            [
              { type: 'paragraph', children: [{ text: 'Why are we challenged?' }] },
              { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
              { type: 'paragraph', children: [{ text: 'yo!' }] },
            ],
            [],
            [
              { type: 'paragraph', children: [{ text: 'blah', isBold: true }] },
              { type: 'paragraph', children: [{ text: 'to live by.' }] },
              { type: 'paragraph', children: [{ text: 'blah blah.' }] },
              { type: 'paragraph', children: [{ text: 'Another-attribute', isBold: true }] },
              { type: 'paragraph', children: [{ text: 'Questions to live by.' }] },
            ],
          ]
          expect(findAndExtractAttributes(content, ['HeAding', 'AnOther'])).toEqual({
            AnOther: 'yowzers!',
            HeAding: [
              { type: 'paragraph', children: [{ text: 'This is some other text.' }] },
              { type: 'paragraph', children: [{ text: 'hi there!' }] },
              { type: 'paragraph', children: [{ text: 'yo!' }] },
              { type: 'paragraph', children: [{ text: 'another: yowzers!' }] },
              { type: 'paragraph', children: [{ text: 'at end' }] },
            ],
            blah: [
              { type: 'paragraph', children: [{ text: 'to live by.' }] },
              { type: 'paragraph', children: [{ text: 'blah blah.' }] },
            ],
            'Another-attribute': [
              { type: 'paragraph', children: [{ text: 'Questions to live by.' }] },
            ],
          })
        })
      })
    })
  })
})

describe('createCharacterAttributesPerBook', () => {
  const baseCharacterAttributes = [
    {
      id: 1,
      name: 'category',
      type: 'base-attribute',
    },
    {
      id: 2,
      name: 'shortDescription',
      type: 'base-attribute',
    },
    {
      id: 3,
      name: 'tags',
      type: 'base-attribute',
    },
    {
      id: 4,
      name: 'description',
      type: 'base-attribute',
    },
  ]
  describe('given a file with no characters', () => {
    const file = {
      test: 5,
      characters: [],
    }
    it('should produce that file untouched with the base character attributes', () => {
      expect(createCharacterAttributesPerBook(file)).toEqual({
        ...file,
        attributes: {
          characters: baseCharacterAttributes,
        },
      })
    })
  })
  describe('given a file with characters', () => {
    describe('but all the characters have empty "rawAttributes"', () => {
      const file = {
        test: 5,
        characters: [
          {
            rawAttributes: {},
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '1',
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            rawAttributes: {},
            id: 2,
            name: 'Ganondorf',
            description: 'Villain',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Refuses to go away. Wants the triforce',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '2',
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
          {
            rawAttributes: {},
            id: 3,
            name: 'Zelda',
            description: 'The princess',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Sometimes a lot less helpless than others',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: null,
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
        ],
      }
      it('should produce that file without rawAttributes on each character, with base attributes migrated to new attributes and with base character attributes', () => {
        expect(createCharacterAttributesPerBook(file)).toEqual({
          attributes: {
            characters: [
              { id: 1, name: 'category', type: 'base-attribute' },
              { id: 2, name: 'shortDescription', type: 'base-attribute' },
              { id: 3, name: 'tags', type: 'base-attribute' },
              { id: 4, name: 'description', type: 'base-attribute' },
            ],
          },
          characters: [
            {
              attributes: [
                { bookId: 'all', id: 1, value: '1' },
                { bookId: 'all', id: 2, value: 'Protagonist' },
                { bookId: 'all', id: 3, value: [] },
                {
                  bookId: 'all',
                  id: 4,
                  value: [{ children: [{ text: 'Off to save the princess' }], type: 'paragraph' }],
                },
              ],
              bookIds: [1, 8, 6, 9, 5],
              cards: [],
              categoryId: '1',
              color: null,
              description: 'Protagonist',
              id: 1,
              imageId: null,
              name: 'Link',
              noteIds: [],
              notes: [{ children: [{ text: 'Off to save the princess' }], type: 'paragraph' }],
              tags: [],
              templates: [],
            },
            {
              attributes: [
                { bookId: 'all', id: 1, value: '2' },
                { bookId: 'all', id: 2, value: 'Villain' },
                { bookId: 'all', id: 3, value: [] },
                {
                  bookId: 'all',
                  id: 4,
                  value: [
                    {
                      children: [{ text: 'Refuses to go away. Wants the triforce' }],
                      type: 'paragraph',
                    },
                  ],
                },
              ],
              bookIds: [8, 1, 5, 6, 7],
              cards: [],
              categoryId: '2',
              color: null,
              description: 'Villain',
              id: 2,
              imageId: null,
              name: 'Ganondorf',
              noteIds: [],
              notes: [
                {
                  children: [{ text: 'Refuses to go away. Wants the triforce' }],
                  type: 'paragraph',
                },
              ],
              tags: [],
              templates: [],
            },
            {
              attributes: [
                { bookId: 'all', id: 1, value: null },
                { bookId: 'all', id: 2, value: 'The princess' },
                { bookId: 'all', id: 3, value: [] },
                {
                  bookId: 'all',
                  id: 4,
                  value: [
                    {
                      children: [{ text: 'Sometimes a lot less helpless than others' }],
                      type: 'paragraph',
                    },
                  ],
                },
              ],
              bookIds: [8, 1, 5, 6, 7],
              cards: [],
              categoryId: null,
              color: null,
              description: 'The princess',
              id: 3,
              imageId: null,
              name: 'Zelda',
              noteIds: [],
              notes: [
                {
                  children: [{ text: 'Sometimes a lot less helpless than others' }],
                  type: 'paragraph',
                },
              ],
              tags: [],
              templates: [],
            },
          ],
          test: 5,
        })
      })
    })
    describe('where characters have rawAttributes', () => {
      const file = {
        test: 5,
        characters: [
          {
            rawAttributes: {
              height: '10cm',
            },
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '1',
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            rawAttributes: {
              weight: '5 stone',
            },
            id: 2,
            name: 'Ganondorf',
            description: 'Villain',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Refuses to go away. Wants the triforce',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '2',
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
          {
            rawAttributes: {
              weight: '2 pebbles',
              'Back Story': [
                {
                  type: 'paragraph',
                  children: [{ text: 'Grew up on the streets' }],
                },
              ],
            },
            id: 3,
            name: 'Zelda',
            description: 'The princess',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Sometimes a lot less helpless than others',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: null,
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
        ],
      }
      it('should extract the raw attributes into new attributes', () => {
        expect(createCharacterAttributesPerBook(file)).toEqual({
          attributes: {
            characters: [
              { id: 1, name: 'category', type: 'base-attribute' },
              { id: 2, name: 'shortDescription', type: 'base-attribute' },
              { id: 3, name: 'tags', type: 'base-attribute' },
              { id: 4, name: 'description', type: 'base-attribute' },
              { id: 5, name: 'height', type: 'text' },
              { id: 6, name: 'weight', type: 'text' },
              { id: 7, name: 'Back Story', type: 'paragraph' },
            ],
          },
          characters: [
            {
              attributes: [
                { bookId: 'all', id: 1, value: '1' },
                { bookId: 'all', id: 2, value: 'Protagonist' },
                { bookId: 'all', id: 3, value: [] },
                {
                  bookId: 'all',
                  id: 4,
                  value: [{ children: [{ text: 'Off to save the princess' }], type: 'paragraph' }],
                },
                { bookId: 'all', id: 5, value: '10cm' },
              ],
              bookIds: [1, 8, 6, 9, 5],
              cards: [],
              categoryId: '1',
              color: null,
              description: 'Protagonist',
              id: 1,
              imageId: null,
              name: 'Link',
              noteIds: [],
              notes: [{ children: [{ text: 'Off to save the princess' }], type: 'paragraph' }],
              tags: [],
              templates: [],
            },
            {
              attributes: [
                { bookId: 'all', id: 1, value: '2' },
                { bookId: 'all', id: 2, value: 'Villain' },
                { bookId: 'all', id: 3, value: [] },
                {
                  bookId: 'all',
                  id: 4,
                  value: [
                    {
                      children: [{ text: 'Refuses to go away. Wants the triforce' }],
                      type: 'paragraph',
                    },
                  ],
                },
                { bookId: 'all', id: 6, value: '5 stone' },
              ],
              bookIds: [8, 1, 5, 6, 7],
              cards: [],
              categoryId: '2',
              color: null,
              description: 'Villain',
              id: 2,
              imageId: null,
              name: 'Ganondorf',
              noteIds: [],
              notes: [
                {
                  children: [{ text: 'Refuses to go away. Wants the triforce' }],
                  type: 'paragraph',
                },
              ],
              tags: [],
              templates: [],
            },
            {
              attributes: [
                { bookId: 'all', id: 1, value: null },
                { bookId: 'all', id: 2, value: 'The princess' },
                { bookId: 'all', id: 3, value: [] },
                {
                  bookId: 'all',
                  id: 4,
                  value: [
                    {
                      children: [{ text: 'Sometimes a lot less helpless than others' }],
                      type: 'paragraph',
                    },
                  ],
                },
                { bookId: 'all', id: 6, value: '2 pebbles' },
                {
                  bookId: 'all',
                  id: 7,
                  value: [{ children: [{ text: 'Grew up on the streets' }], type: 'paragraph' }],
                },
              ],
              bookIds: [8, 1, 5, 6, 7],
              cards: [],
              categoryId: null,
              color: null,
              description: 'The princess',
              id: 3,
              imageId: null,
              name: 'Zelda',
              noteIds: [],
              notes: [
                {
                  children: [{ text: 'Sometimes a lot less helpless than others' }],
                  type: 'paragraph',
                },
              ],
              tags: [],
              templates: [],
            },
          ],
          test: 5,
        })
      })
    })
  })
})

describe('replaceRawCardAttributeIds', () => {
  describe('given a file with no cards', () => {
    const file = {
      cards: [],
    }
    it('should produce the empty array', () => {
      expect(replaceRawCardAttributeIds(file)).toEqual([])
    })
  })
  describe('given a file with cards', () => {
    describe('and those cards have no characters, places or tags', () => {
      const file = {
        cards: [
          {
            id: 35,
            lineId: 13,
            beatId: 33,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Vah Ruta',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            rawTags: '',
            rawCharacters: '',
            rawPlaces: '',
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 34,
            lineId: 13,
            beatId: 32,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Lynel',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            rawTags: '',
            rawCharacters: '',
            rawPlaces: '',
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
        ],
      }
      it('should produce the file cards with raw references replaced by empty arrays', () => {
        expect(replaceRawCardAttributeIds(file)).toEqual([
          {
            id: 35,
            lineId: 13,
            beatId: 33,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Vah Ruta',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            tags: [],
            characters: [],
            places: [],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 34,
            lineId: 13,
            beatId: 32,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Lynel',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            tags: [],
            characters: [],
            places: [],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
        ])
      })
    })
    describe('and those cards have characters, places & tags that cards reference', () => {
      const file = {
        tags: [
          {
            id: 1,
            title: 'its a tag',
            color: null,
          },
          {
            id: 2,
            title: 'tag2',
            color: null,
          },
        ],
        places: [
          {
            id: 1,
            name: 'Hyrule Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The castle',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
          {
            id: 2,
            name: 'My Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The better castle',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
        ],
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '1',
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            id: 2,
            name: 'Ganondorf',
            description: 'Villain',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Refuses to go away. Wants the triforce',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '2',
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
        ],
        cards: [
          {
            id: 35,
            lineId: 13,
            beatId: 33,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Vah Ruta',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            rawTags: 'its a tag,tag2',
            rawCharacters: 'link,GanOndorff',
            rawPlaces: 'Hyrule castle',
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 34,
            lineId: 13,
            beatId: 32,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Lynel',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            rawTags: 'tag2',
            rawCharacters: 'ganondorf',
            rawPlaces: 'My Castle,Hyrule Castle',
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
        ],
      }
      it('should produce the file cards with raw references replaced by empty arrays', () => {
        expect(replaceRawCardAttributeIds(file)).toEqual([
          {
            id: 35,
            lineId: 13,
            beatId: 33,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Vah Ruta',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            tags: [1, 2],
            characters: [1, 2],
            places: [1],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 34,
            lineId: 13,
            beatId: 32,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Lynel',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            tags: [2],
            characters: [2],
            places: [2, 1],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
        ])
      })
    })
  })
})

describe('replaceRawNoteAttributeIds', () => {
  describe('given a file with no notes', () => {
    const file = {
      notes: [],
    }
    it('should produce the empty array', () => {
      expect(replaceRawNoteAttributeIds(file)).toEqual({ noteCategories: [], notes: [] })
    })
  })
  describe('given a file with notes', () => {
    describe('and those notes have no characters places or tags', () => {
      const file = {
        notes: [
          {
            id: 1,
            title: 'The first note',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'heres a note',
                  },
                ],
              },
            ],
            rawCharacters: '',
            rawPlaces: '',
            rawTags: '',
            tags: [],
            characters: [],
            places: [],
            lastEdited: 1617071347633,
            templates: [],
            imageId: null,
            bookIds: [],
          },
          {
            id: 2,
            title: 'This is another note',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This one is better than the first note.',
                  },
                ],
              },
            ],
            rawCharacters: '',
            rawPlaces: '',
            rawTags: '',
            tags: [],
            characters: [],
            places: [],
            lastEdited: 1617071347655,
            templates: [],
            imageId: null,
            bookIds: [],
          },
        ],
      }
      it('should remove the raw attributes and leave the notes otherwise unchanged', () => {
        expect(replaceRawNoteAttributeIds(file)).toEqual({
          noteCategories: [],
          notes: [
            {
              id: 1,
              category: null,
              title: 'The first note',
              content: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'heres a note',
                    },
                  ],
                },
              ],
              tags: [],
              characters: [],
              places: [],
              lastEdited: 1617071347633,
              templates: [],
              imageId: null,
              bookIds: [],
            },
            {
              id: 2,
              category: null,
              title: 'This is another note',
              content: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'This one is better than the first note.',
                    },
                  ],
                },
              ],
              tags: [],
              characters: [],
              places: [],
              lastEdited: 1617071347655,
              templates: [],
              imageId: null,
              bookIds: [],
            },
          ],
        })
      })
    })
    describe('and those notes have characters places and tags', () => {
      const file = {
        tags: [
          {
            id: 1,
            title: 'its a tag',
            color: null,
          },
          {
            id: 2,
            title: 'tag2',
            color: null,
          },
        ],
        places: [
          {
            id: 1,
            name: 'Hyrule Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The castle',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
          {
            id: 2,
            name: 'My Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The better castle',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
        ],
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '1',
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            id: 2,
            name: 'Ganondorf',
            description: 'Villain',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Refuses to go away. Wants the triforce',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: '2',
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
        ],
        notes: [
          {
            id: 1,
            category: null,
            title: 'The first note',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'heres a note',
                  },
                ],
              },
            ],
            rawCharacters: 'Link',
            rawPlaces: 'My Castle,Hyrule Castle,',
            rawTags: 'tag2',
            tags: [],
            characters: [],
            places: [],
            lastEdited: 1617071347633,
            templates: [],
            imageId: null,
            bookIds: [],
          },
          {
            id: 2,
            category: null,
            title: 'This is another note',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This one is better than the first note.',
                  },
                ],
              },
            ],
            rawCharacters: 'Ganondorf,Link',
            rawPlaces: 'Hyrule Castle',
            rawTags: 'tag2,  \t  its a tag',
            tags: [],
            characters: [],
            places: [],
            lastEdited: 1617071347655,
            templates: [],
            imageId: null,
            bookIds: [],
          },
        ],
      }
      it('should remove the raw attributes and leave the notes otherwise unchanged', () => {
        expect(replaceRawNoteAttributeIds(file)).toEqual({
          noteCategories: [],
          notes: [
            {
              id: 1,
              category: null,
              title: 'The first note',
              content: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'heres a note',
                    },
                  ],
                },
              ],
              tags: [2],
              characters: [1],
              places: [2, 1],
              lastEdited: 1617071347633,
              templates: [],
              imageId: null,
              bookIds: [],
            },
            {
              id: 2,
              category: null,
              title: 'This is another note',
              content: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'This one is better than the first note.',
                    },
                  ],
                },
              ],
              tags: [2, 1],
              characters: [2, 1],
              places: [1],
              lastEdited: 1617071347655,
              templates: [],
              imageId: null,
              bookIds: [],
            },
          ],
        })
      })
    })
  })
})

describe('replaceRawCharacterAttributeIds', () => {
  describe('given a file with no characters', () => {
    const file = {
      characters: [],
    }
    it('should produce the empty array', () => {
      expect(replaceRawCharacterAttributeIds(file)).toEqual({
        characterCategories: [],
        characters: [],
      })
    })
  })
  describe('given a file with characters', () => {
    describe('and those characters have no tags', () => {
      const file = {
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            rawTags: '',
            categoryId: '1',
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            id: 2,
            name: 'Ganondorf',
            description: 'Villain',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Refuses to go away. Wants the triforce',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            rawTags: '',
            categoryId: '2',
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
        ],
      }
      it('should remove the raw attributes and leave the characters otherwise unchanged', () => {
        expect(replaceRawCharacterAttributeIds(file)).toEqual({
          characterCategories: [],
          characters: [
            {
              id: 1,
              name: 'Link',
              description: 'Protagonist',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Off to save the princess',
                    },
                  ],
                },
              ],
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [],
              categoryId: null,
              imageId: null,
              bookIds: [1, 8, 6, 9, 5],
            },
            {
              id: 2,
              name: 'Ganondorf',
              description: 'Villain',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Refuses to go away. Wants the triforce',
                    },
                  ],
                },
              ],
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [],
              categoryId: null,
              imageId: null,
              bookIds: [8, 1, 5, 6, 7],
            },
          ],
        })
      })
    })
    describe('and those characters have characters places and tags', () => {
      const file = {
        tags: [
          {
            id: 1,
            title: 'its a tag',
            color: null,
          },
          {
            id: 2,
            title: 'tag2',
            color: null,
          },
        ],
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            rawTags: 'tag2',
            rawCategory: 'Main',
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            id: 2,
            name: 'Ganondorf',
            description: 'Villain',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Refuses to go away. Wants the triforce',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            rawTags: 'its a tag, tag2',
            rawCategory: 'Secondary',
            imageId: null,
            bookIds: [8, 1, 5, 6, 7],
          },
        ],
      }
      it('should remove the raw attributes and leave the characters otherwise unchanged', () => {
        expect(replaceRawCharacterAttributeIds(file)).toEqual({
          characterCategories: [
            {
              id: 1,
              name: 'Main',
              position: 0,
              type: 'text',
            },
            {
              id: 2,
              name: 'Secondary',
              position: 1,
              type: 'text',
            },
          ],
          characters: [
            {
              id: 1,
              name: 'Link',
              description: 'Protagonist',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Off to save the princess',
                    },
                  ],
                },
              ],
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [2],
              categoryId: 1,
              imageId: null,
              bookIds: [1, 8, 6, 9, 5],
            },
            {
              id: 2,
              name: 'Ganondorf',
              description: 'Villain',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Refuses to go away. Wants the triforce',
                    },
                  ],
                },
              ],
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [1, 2],
              categoryId: 2,
              imageId: null,
              bookIds: [8, 1, 5, 6, 7],
            },
          ],
        })
      })
    })
  })
})

describe('replaceRawPlaceAttributeIds', () => {
  describe('given a file with no places', () => {
    const file = {
      places: [],
    }
    it('should produce the empty array', () => {
      expect(replaceRawPlaceAttributeIds(file)).toEqual({
        placeCategories: [],
        places: [],
      })
    })
  })
  describe('given a file with places', () => {
    describe('and those places have no tags', () => {
      const file = {
        places: [
          {
            id: 1,
            name: 'Hyrule Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The castle',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
          {
            id: 2,
            name: 'My Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The better castle',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
        ],
      }
      it('should remove the raw attributes and leave the places otherwise unchanged', () => {
        expect(replaceRawPlaceAttributeIds(file)).toEqual({
          placeCategories: [],
          places: [
            {
              id: 1,
              name: 'Hyrule Castle',
              description: '',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The castle',
                    },
                  ],
                },
              ],
              categoryId: null,
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [],
              imageId: null,
              bookIds: [],
              sljkfl: '',
            },
            {
              id: 2,
              name: 'My Castle',
              description: '',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The better castle',
                    },
                  ],
                },
              ],
              categoryId: null,
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [],
              imageId: null,
              bookIds: [],
              sljkfl: '',
            },
          ],
        })
      })
    })
    describe('and those places have tags', () => {
      const file = {
        tags: [
          {
            id: 1,
            title: 'its a tag',
            color: null,
          },
          {
            id: 2,
            title: 'tag2',
            color: null,
          },
        ],
        places: [
          {
            id: 1,
            name: 'Hyrule Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The castle',
                  },
                ],
              },
            ],
            rawCategory: 'Main',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            rawTags: 'its a tag',
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
          {
            id: 2,
            name: 'My Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The better castle',
                  },
                ],
              },
            ],
            rawCategory: 'Secondary',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            rawTags: 'tag2',
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
        ],
      }
      it('should remove the raw attributes and leave the places otherwise unchanged', () => {
        expect(replaceRawPlaceAttributeIds(file)).toEqual({
          placeCategories: [
            {
              id: 1,
              name: 'Main',
              position: 0,
              type: 'text',
            },
            {
              id: 2,
              name: 'Secondary',
              position: 1,
              type: 'text',
            },
          ],
          places: [
            {
              id: 1,
              name: 'Hyrule Castle',
              description: '',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The castle',
                    },
                  ],
                },
              ],
              categoryId: 1,
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [1],
              imageId: null,
              bookIds: [],
              sljkfl: '',
            },
            {
              id: 2,
              name: 'My Castle',
              description: '',
              notes: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The better castle',
                    },
                  ],
                },
              ],
              categoryId: 2,
              color: null,
              cards: [],
              noteIds: [],
              templates: [],
              tags: [2],
              imageId: null,
              bookIds: [],
              sljkfl: '',
            },
          ],
        })
      })
    })
  })
})

describe('linkTagsCharactersAndPlaces', () => {
  describe('given a file with cards, characters, notes, places and tags', () => {
    const file = {
      notes: [
        {
          id: 1,
          category: null,
          title: 'The first note',
          content: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'heres a note',
                },
              ],
            },
          ],
          rawCharacters: 'Link',
          rawPlaces: 'My Castle,Hyrule Castle,',
          rawTags: 'tag2',
          tags: [],
          characters: [],
          places: [],
          lastEdited: 1617071347633,
          templates: [],
          imageId: null,
          bookIds: [],
        },
        {
          id: 2,
          category: null,
          title: 'This is another note',
          content: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'This one is better than the first note.',
                },
              ],
            },
          ],
          rawCharacters: 'Ganondorff,Link',
          rawPlaces: 'Hyrule Castle',
          rawTags: 'tag2,  \t  its a tag',
          tags: [],
          characters: [],
          places: [],
          lastEdited: 1617071347655,
          templates: [],
          imageId: null,
          bookIds: [],
        },
      ],
      places: [
        {
          id: 1,
          name: 'Hyrule Castle',
          description: '',
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'The castle',
                },
              ],
            },
          ],
          rawCategory: 'Main',
          color: null,
          cards: [],
          noteIds: [],
          templates: [],
          rawTags: 'its a tag',
          imageId: null,
          bookIds: [],
          sljkfl: '',
        },
        {
          id: 2,
          name: 'My Castle',
          description: '',
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'The better castle',
                },
              ],
            },
          ],
          rawCategory: 'Secondary',
          color: null,
          cards: [],
          noteIds: [],
          templates: [],
          rawTags: 'tag2',
          imageId: null,
          bookIds: [],
          sljkfl: '',
        },
      ],
      characters: [
        {
          id: 1,
          name: 'Link',
          description: 'Protagonist',
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Off to save the princess',
                },
              ],
            },
          ],
          color: null,
          cards: [],
          noteIds: [],
          templates: [],
          rawTags: '',
          categoryId: '1',
          imageId: null,
          bookIds: [1, 8, 6, 9, 5],
        },
        {
          id: 2,
          name: 'Ganondorff',
          description: 'Protagonist',
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Off to save the princess',
                },
              ],
            },
          ],
          color: null,
          cards: [],
          noteIds: [],
          templates: [],
          rawTags: '',
          categoryId: '1',
          imageId: null,
          bookIds: [1, 8, 6, 9, 5],
        },
      ],
      cards: [
        {
          id: 35,
          lineId: 13,
          beatId: 33,
          bookId: null,
          positionWithinLine: 0,
          positionInBeat: 0,
          title: 'Vah Ruta',
          description: [
            {
              type: 'paragraph',
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
          rawTags: 'its a tag,tag2',
          rawCharacters: 'link,GanOndorff',
          rawPlaces: 'Hyrule castle',
          templates: [],
          imageId: null,
          fromTemplateId: null,
          color: null,
        },
        {
          id: 34,
          lineId: 13,
          beatId: 32,
          bookId: null,
          positionWithinLine: 0,
          positionInBeat: 0,
          title: 'Lynel',
          description: [
            {
              type: 'paragraph',
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
          rawTags: 'tag2',
          rawCharacters: 'ganondorff',
          rawPlaces: 'My Castle,Hyrule Castle',
          templates: [],
          imageId: null,
          fromTemplateId: null,
          color: null,
        },
      ],
    }
    it('should replace the raw versions of attributes in all those entities with actual ids', () => {
      expect(linkTagsCharactersAndPlaces(file)).toEqual({
        tags: [
          {
            id: 1,
            title: 'its a tag',
            color: '#6cace4',
          },
          {
            id: 2,
            title: 'tag2',
            color: '#78be20',
          },
        ],
        notes: [
          {
            id: 1,
            category: null,
            title: 'The first note',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'heres a note',
                  },
                ],
              },
            ],
            characters: [1],
            places: [2, 1],
            tags: [2],
            lastEdited: 1617071347633,
            templates: [],
            imageId: null,
            bookIds: [],
          },
          {
            id: 2,
            category: null,
            title: 'This is another note',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This one is better than the first note.',
                  },
                ],
              },
            ],
            characters: [2, 1],
            places: [1],
            tags: [2, 1],
            lastEdited: 1617071347655,
            templates: [],
            imageId: null,
            bookIds: [],
          },
        ],
        places: [
          {
            id: 1,
            name: 'Hyrule Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The castle',
                  },
                ],
              },
            ],
            categoryId: 1,
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [1],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
          {
            id: 2,
            name: 'My Castle',
            description: '',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The better castle',
                  },
                ],
              },
            ],
            categoryId: 2,
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [2],
            imageId: null,
            bookIds: [],
            sljkfl: '',
          },
        ],
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: null,
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
          {
            id: 2,
            name: 'Ganondorff',
            description: 'Protagonist',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Off to save the princess',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            categoryId: null,
            imageId: null,
            bookIds: [1, 8, 6, 9, 5],
          },
        ],
        cards: [
          {
            id: 35,
            lineId: 13,
            beatId: 33,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Vah Ruta',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            tags: [1, 2],
            characters: [1, 2],
            places: [1],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 34,
            lineId: 13,
            beatId: 32,
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Lynel',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            tags: [2],
            characters: [2],
            places: [2, 1],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
        ],
        categories: {
          characters: [],
          notes: [],
          places: [
            {
              id: 1,
              name: 'Main',
              position: 0,
              type: 'text',
            },
            {
              id: 2,
              name: 'Secondary',
              position: 1,
              type: 'text',
            },
          ],
          tags: [],
        },
      })
    })
  })
})

const scrivenerStructure = {
  cards: [
    {
      id: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
      title: 'Act 1',
      kind: 'Folder',
      children: [
        {
          id: 'BB664270-D5D3-4922-92BA-13828AE114CE',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes, Fortinbras, The Ghost, Marcellus, Bernardo, Francisco, Reynaldo',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Exposition, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Madness, THEME: Corruption, THEME: Health of the Nation',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Summary',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'test 1',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'some text',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'test 2',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'some other text',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/BB664270-D5D3-4922-92BA-13828AE114CE/notes.rtf',
            },
            {
              data: () => Promise.resolve(''),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/BB664270-D5D3-4922-92BA-13828AE114CE/synopsis.txt',
            },
          ],
          title: 'Hamlet learns the truth from the ghost of his father',
        },
        {
          id: 'FC30AB95-1AF3-43DF-A33B-8BE3795B931C',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Marcellus, Horatio, The Ghost, Francisco, Bernardo',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Health of the Nation, Foreshadowing, STAGE: Exposition',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/FC30AB95-1AF3-43DF-A33B-8BE3795B931C/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

After a long, cold night on the ramparts guarding Elsinore castle, Bernardo comes to relieve Francisco, and is soon joined by Marcellus. The two of them summon Horatio to join them, because for the past few nights, they have noticed a ghostly apparition walking the ramparts, who they believe to be the ghost of King Hamlet.
Horatio doesn't want to believe them, until suddenly the Ghost appears before them for a few moments, and then vanishes. He points out how much the ghost looks like the slain King, and says that he believes this to be a bad omen for Denmark, alluding to a possible military incursion that could be led by the Prince of Norway.
The Ghost appears again and Horatio tries to talk to it, but it remains silent. He then suggests that they should tell the King's son, Hamlet, about the apparition, because if the ghost is going to speak to anyone, he believes it would be his son.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/FC30AB95-1AF3-43DF-A33B-8BE3795B931C/synopsis.txt',
            },
          ],
          title: 'The guards see a ghost',
        },
        {
          id: 'B26986A0-BB55-4693-852F-E29E8245D723',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Claudius, Gertrude, Hamlet, Polonius, Laertes, Voltimand and Cornelius',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Health of the Nation, STAGE: Exposition, THEME: Corruption, THEME: Mortality, Foreshadowing',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/B26986A0-BB55-4693-852F-E29E8245D723/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

The following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. 
He also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.
Claudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. 
Hamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/B26986A0-BB55-4693-852F-E29E8245D723/synopsis.txt',
            },
          ],
          title: 'Claudius makes an announcement & Hamlet laments',
        },
        {
          id: 'E9861F65-1263-4095-8099-7BCC5889CEFC',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Polonius, Laertes, Ophelia',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'France, Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Exposition, THEME: Corruption, THEME: Health of the Nation, Foreshadowing, THEME: Mortality',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/E9861F65-1263-4095-8099-7BCC5889CEFC/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

As Laertes is preparing to depart for France, he has a conversation with his sister, Ophelia. He cautions her about falling for Hamlet because he believes that Hamlet is too far above Ophelia's station for the two of them to ever be a match. 
Laertes then says goodbye to his father, who gives him a some extensive advice for how to live and behave while he is away in France. 
As Laertes finally leaves, Polonius asks Ophelia what she and her brother talked about. She confesses that it was about Hamlet, and that he claims to love her. Polonius agrees with his son in telling Ophelia that he believes Hamlet to be insincere about his affections, and forbids her from seeing him further. `),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/E9861F65-1263-4095-8099-7BCC5889CEFC/synopsis.txt',
            },
          ],
          title: 'Laertes leaves for France',
        },
        {
          id: '8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, The Ghost, Marcellus, Horatio',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Exposition, Foreshadowing, Character Death, THEME: Madness, THEME: Revenge',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Hamlet waits outside on the castle ramparts with Marcellus and Horatio, hoping to catch a glimpse of the ghost. In the midst of doing so, they hear loud canons and revelry happening, and Hamlet explains it is a Danish custom for the new King. He expresses disdain for it, saying it makes his country look silly to others, and he wishes it would change.
Then they see the ghost and Hamlet tries calling out to it. When it doesn't answer but beckons Hamlet to follow, Marcellus and Horatio warn him that he shouldn't go. But Hamlet articulates that he doesn't care what happens to him and that if his soul is immortal, he has nothing to fear. 
Horatio and Marcellus talk about how they think this is an ill omen for their country, and they debate briefly about whether or not to follow Hamlet, before deciding that they want to make sure their friend is safe.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED/synopsis.txt',
            },
          ],
          title: 'Hamlet goes after the ghost of his father',
        },
        {
          id: '486CEA94-7A6B-457C-A7E1-5554ED61B9E5',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, The Ghost, Marcellus, Horatio',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Exposition, Foreshadowing, THEME: Mortality, Character Death, THEME: Revenge',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/486CEA94-7A6B-457C-A7E1-5554ED61B9E5/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Hamlet finally gets to speak with the ghost of his father, who tells him that he was murdered by Hamlet's uncle Claudius so that he could steal the crown. He tells him how Claudius snuck into their garden and put poison in his ear.
The ghost then asks Hamlet to seek out revenge for his murder. Hamlet is so distraught at learning what's happened and that he was right about his evil uncle all along, that he agrees.
Just as the ghost fades away, Horatio and Marcellus catch up with Hamlet and ask him what happened. He doesn't tell them, but says that he might have to act like he's going mad, and they have to swear not to tell anyone what they saw. Though confused, they promise to keep his secret.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/486CEA94-7A6B-457C-A7E1-5554ED61B9E5/synopsis.txt',
            },
          ],
          title: "Hamlet speaks with his father's ghost",
        },
      ],
    },
    {
      id: '2A163249-3471-4EE5-9F19-C4B856779C9F',
      title: 'Act 2',
      kind: 'Folder',
      children: [
        {
          id: 'E4C16008-9DFB-4F7E-BE1D-E058E68D29B5',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Ophelia, Polonius, Reynaldo, Claudius, Gertrude, Rosencrantz and Guildenstern, Voltimand and Cornelius, Hamlet, The Players',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, Foreshadowing, THEME: Mortality, THEME: Corruption, THEME: Health of the Nation, THEME: Madness',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Summary',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/E4C16008-9DFB-4F7E-BE1D-E058E68D29B5/notes.rtf',
            },
            {
              data: () => Promise.resolve(''),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/E4C16008-9DFB-4F7E-BE1D-E058E68D29B5/synopsis.txt',
            },
          ],
          title: 'Members of court meet & conspire',
        },
        {
          id: '891D8F60-91D7-4D6B-84A5-763AA42BDA78',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Ophelia, Polonius, Reynaldo',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Corruption, STAGE: Exposition, Foreshadowing, THEME: Madness',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/891D8F60-91D7-4D6B-84A5-763AA42BDA78/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Polonius sends his servant Reynaldo to France to spy on his son Laertes, and commands him to report back with what he finds. As the servant leaves, Ophelia comes in, crying and distraught about an interaction with Hamlet.
She tells her father that Hamlet looked "wild eyed" and was breathing heavy, but didn't say anything to her. Polonius believes that Hamlet has gone mad because Ophelia was distancing herself from him, so he rushes off to speak with Claudius about it.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/891D8F60-91D7-4D6B-84A5-763AA42BDA78/synopsis.txt',
            },
          ],
          title: 'Polonius speaks with Ophelia',
        },
        {
          id: 'C107CB2E-DBDC-4C41-8C93-8D99C40173F1',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Gertrude, Claudius, Rosencrantz and Guildenstern, Voltimand and Cornelius, Polonius, Hamlet, The Players',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, Foreshadowing',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/C107CB2E-DBDC-4C41-8C93-8D99C40173F1/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Claudius and Gertrude summon Rosencrantz and Guildenstern, two friends of Hamlet's from when he was at Wittenberg. The King and Queen ask that the two courtiers try to brighten Hamlet's spirits, and in so doing also find out why he has been acting so strangely.
Then Polonius arrives to tell Claudius that his ambassadors he sent to Norway are back with a reply from the King. They tell him that the King has decided not to attack Denmark, and has given his son an army with which to attack the Poles instead of the Danes. Prince Fortinbras asks only that his armies be allowed to pass through Denmark on their way to Poland, which Claudius agrees to.
Polonius then tells Claudius that he believes Hamlet has gone made, and pitches a plan for finding out if he has lost his mind because of his love for Ophelia, or if it is for some other reason. 
Claudius and Gertrude leave when they see Hamlet approaching, but Polonius stays to speak with him. Hamlet acts as if he has gone insane and insults Polonius with a number of jabs that have some truth to them.
When Polonious leaves, Rosencrantz and Guildenstern enter and Hamlet seems happy to see them. But quickly their facade of concern crumbles and Hamlet expresses that he knows they have been sent to spy on him. They then tell him that a troupe of players is coming to the castle and that might cheer him up.
The players arrive and Hamlet demands they present on the history of Troy. He is very impressed with the speech and says that the following night, he wants them to stage the play The Murder of Gonzago. Once Hamlet is alone again, he expresses how he wishes he could experience the depth of emotion that the actors do. 
He then devises a plan for bringing down his uncle, in which he plans to stage a play that is similar to how Claudius killed Hamlet's father. If Claudius reacts negatively, Hamlet can consider that proof that he committed the crime.

`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/C107CB2E-DBDC-4C41-8C93-8D99C40173F1/synopsis.txt',
            },
          ],
          title: 'A busy day at court',
        },
      ],
    },
    {
      id: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
      title: 'Act 3',
      kind: 'Folder',
      children: [
        {
          id: 'B58EB299-35D0-41FD-ABF1-E3E5618FF28C',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Rosencrantz and Guildenstern, Reynaldo, The Players',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Madness, THEME: Revenge, Character Death, THEME: Mortality, THEME: Corruption, Foreshadowing, STAGE: Rising Action',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Summary',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/B58EB299-35D0-41FD-ABF1-E3E5618FF28C/notes.rtf',
            },
            {
              data: () => Promise.resolve(''),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/B58EB299-35D0-41FD-ABF1-E3E5618FF28C/synopsis.txt',
            },
          ],
          title: 'Hamlet carries out his plan to prove Claudius guilty',
        },
        {
          id: '129F3355-D918-4682-A6F0-F031BA866BB8',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Claudius, Ophelia, Polonius, Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, THEME: Mortality, Foreshadowing, THEME: Madness, THEME: Revenge, THEME: Corruption',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/129F3355-D918-4682-A6F0-F031BA866BB8/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Claudius and Gertrude ask Rosencrantz and Guildenstern about their encounter with Hamlet, but the two of them tell the King and Queen that they couldn't figure it out, and that he seemed in good spirits about the players that arrived. Polonius then arrives and Claudius sends the others away so that they can spy on Hamlet and Ophelia.
Hamlet enters, musing on the futility of live and beauty, delivering his "To be or not to be" soliloquy. Then when he encounters Ophelia, things take a turn for the worse. Ophelia tries to give him back the letters and tokens of affection, and he goes off on Ophelia, in a mad rant, declaring her, and all women and mankind to be worthless. He sways between saying he never loved her and that he always will. Ophelia leaves heartbroken.
Polonius and Claudius confer and decide that it doesn't appear to be Ophelia causing his madness, and the two agree to spy on him again after the play to come that night. Polonius says he will spy on Hamlet interacting with Gertrude to root out the cause of his madness.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/129F3355-D918-4682-A6F0-F031BA866BB8/synopsis.txt',
            },
          ],
          title: 'Hamlet denounces Ophelia',
        },
        {
          id: 'F455435C-F2C7-4592-94B1-EFB7AA9F4527',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Ophelia, Claudius, Gertrude, Horatio, Polonius, Rosencrantz and Guildenstern, The Players',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, Foreshadowing, THEME: Mortality, THEME: Madness, THEME: Corruption',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/F455435C-F2C7-4592-94B1-EFB7AA9F4527/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

The court readies for the play, as Hamlet gives the players their parts. He then summons Horatio and tells his friend how highly he thinks of him, and entrusts him with the secret of what the ghost told him. He hopes that Horatio will be able to keep an eye on Claudius to see if he shows any signs of guilt. 
As everyone enters the room to watch the play, Hamlet starts acting mad once again in front of Polonius, and messes with Ophelia by telling her a lot of erotic puns. The play then begins, and Hamlet comments on it throughout, teasing Ophelia as he goes. 
When the play reaches the point where the character poisons the king in the garden, Claudius gets loud, angry, and storms out of the room. Hamlet and Horatio agree that such a reaction was damning. 
Afterwards, Rosencrantz and Guildenstern try again to find out what has been causing him to act crazy, and he gets upset with them. Polonius then enters to escort Hamlet to his mother's chambers, and Hamlet takes a moment to ready himself for the confrontation that's about to ensue.
`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/F455435C-F2C7-4592-94B1-EFB7AA9F4527/synopsis.txt',
            },
          ],
          title: 'Court watches The Murder of Gonzago',
        },
        {
          id: '47F832CE-131E-4E04-9D21-372562C3C4E3',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Claudius, Hamlet, Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, Foreshadowing, THEME: Mortality, THEME: Religion, THEME: Corruption, THEME: Madness',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/47F832CE-131E-4E04-9D21-372562C3C4E3/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Claudius speaks with Rosencrantz and Guildenstern and instructs them to immediately see to it that Hamlet is taken on a journey to England, because he no longer trusts his nephew's intentions. 
Once alone, he begins praying and asking for forgiveness for the evils and wrongs he has done, and Hamlet manages to sneak in unnoticed. Hamlet muses about killing his uncle right then and there, but then realizes he doesn't want to kill him when he is doing something good like praying for forgiveness. He vows to strike his uncle when he is doing something dastardly.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/47F832CE-131E-4E04-9D21-372562C3C4E3/synopsis.txt',
            },
          ],
          title: 'Claudius prays for forgiveness',
        },
        {
          id: '62BFD421-BC83-4219-8A0B-50FA958F4F0A',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Gertrude, Polonius, The Ghost',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, STAGE: Climax, THEME: Mortality, Character Death, THEME: Revenge, THEME: Madness, THEME: Corruption',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/62BFD421-BC83-4219-8A0B-50FA958F4F0A/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Polonius tells Queen Gertrude to be harsh with her son in hopes of coaxing out of him the reason for his recent madness. He then hides behind a tapestry while Hamlet enters to confront his mother.
Hamlet chastises his mother for her betrayal in marrying his uncle, and begins violently yelling at her. When he does this, Polonius cries out from behind the tapestry for help, and Hamlet, not knowing who it is, stabs through the tapestry, killing Polonius. 
As he continues arguing with his mother, the ghost appears once again, but she is unable to see it. Before disappearing, the ghost reminds Hamlet that he must carry out his mission in killing Claudius, and that he should not be as hard on his mother.
Because Gertrude cannot see the ghost, Hamlet assures her that he hasn't been actually going mad, it was all a facade, but that the ghost is real. Before dragging away Polonius's body, he tells his mother that while he will go to England with Rosencrantz and Guildenstern, he doesn't trust either of them.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/62BFD421-BC83-4219-8A0B-50FA958F4F0A/synopsis.txt',
            },
          ],
          title: 'Hamlet confronts his mother & kills Polonius',
        },
      ],
    },
    {
      id: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
      title: 'Act 4',
      kind: 'Folder',
      children: [
        {
          id: 'ACF1C78C-85F1-4188-B26E-AD6E3B4974B8',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Gertrude, Claudius, Rosencrantz and Guildenstern, Fortinbras, Laertes, Ophelia, Horatio, Sailors',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle, Field in Denmark',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Corruption, THEME: Health of the Nation, THEME: Revenge, Foreshadowing, STAGE: Climax, THEME: Madness, STAGE: Rising Action, THEME: Mortality',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Summary',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/ACF1C78C-85F1-4188-B26E-AD6E3B4974B8/notes.rtf',
            },
            {
              data: () => Promise.resolve(''),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/ACF1C78C-85F1-4188-B26E-AD6E3B4974B8/synopsis.txt',
            },
          ],
          title: 'Hamlet is sent away, but Laertes returns',
        },
        {
          id: '4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Gertrude, Claudius, Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Revenge, Foreshadowing, STAGE: Climax, THEME: Corruption, THEME: Health of the Nation',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Gertrude runs in on Claudius when he is with Rosencrantz and Guildenstern and asks to speak to him alone. When they leave, she tells him about everything that happened when Hamlet came to see her, namely that her son has killed Polonius. Claudius is immediately afraid that news of this could ruin his plans to rule Denmark, and so he summons back Rosencrantz and Guildenstern, telling them to get Hamlet to England with all haste so that he can find a way to explain everything that happened to the people without making himself look bad.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2/synopsis.txt',
            },
          ],
          title: "Gertrude tells Claudius of Hamlet's actions",
        },
        {
          id: 'DC6F4DCA-3177-4DBD-A806-44254B0E62AB',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Rising Action, Foreshadowing, STAGE: Climax, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, THEME: Revenge',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/DC6F4DCA-3177-4DBD-A806-44254B0E62AB/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Rosencrantz and Guildenstern arrive to meet with Hamlet, who has just finished disposing of Polonius's body. He refuses to tell them what he did with the body, but reminds them that Polonius's blood is on Claudius's hands. He then accuses them of being spies for the King, but ultimately agrees to be taken by the two old friends to an audience with his uncle.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/DC6F4DCA-3177-4DBD-A806-44254B0E62AB/synopsis.txt',
            },
          ],
          title: 'Rosencrantz and Guildenstern confront Hamlet',
        },
        {
          id: '8A0706CE-0D13-452F-85E0-85F5EEED230C',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Claudius, Hamlet, Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Foreshadowing, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, STAGE: Climax',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/8A0706CE-0D13-452F-85E0-85F5EEED230C/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Claudius is seen informing courtiers of the untimely death of Polonius, when Hamlet is brought before him to be confronted. He asks Hamlet where he has placed Polonius's body, but at first, Hamlet refuses to tell him. Hamlet insults him by saying that Claudius could seek him out in heaven, or join him in hell. But ultimately, he tells Claudius that the body has been hidden under the stairs in the palace.
Claudius then dismisses Hamlet, ordering him to board the ship to England at once, under the supervision of Rosencrantz and Guildenstern. Once they are all gone, Claudius admits that he has sent sealed orders to England to see to it that Hamlet is killed upon his arrival.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/8A0706CE-0D13-452F-85E0-85F5EEED230C/synopsis.txt',
            },
          ],
          title: "Claudius demands to know where Polonius's body is",
        },
        {
          id: '5F1DA39A-2CA5-47FE-B311-1E74270EC7DA',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Fortinbras, Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Field in Denmark',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Climax, Foreshadowing, THEME: Health of the Nation, THEME: Revenge, THEME: Mortality',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/5F1DA39A-2CA5-47FE-B311-1E74270EC7DA/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

While on his way to the ship that will take him to England, Hamlet runs into Fortinbras and his army. Fortinbras has sent word to the castle to confirm that he and his army may pass through Denmark on the way to attacking Poland, which he explains to Hamlet.
Hamlet asks why they are attacking and Fortinbras explains it is over a small patch of land that he must win back. Hamlet muses on how bloody mankind's appetites are, even for something so insignificant, and then vows to himself that he will be more ruthless in seeking out Claudius for his father's revenge.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/5F1DA39A-2CA5-47FE-B311-1E74270EC7DA/synopsis.txt',
            },
          ],
          title: 'Hamlet encounters Fortinbras on the way to England',
        },
        {
          id: 'D7ED53BA-9B02-4734-93D9-D3E6323C76B6',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Gertrude, Claudius, Ophelia, Laertes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Climax, THEME: Revenge, THEME: Madness, THEME: Corruption',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/D7ED53BA-9B02-4734-93D9-D3E6323C76B6/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Gertrude is worried about Ophelia, who appears to have gone mad at the loss of her father. Claudius then enters and sees Ophelia acting strange, and informs Gertrude that there are many suspicious whispers around court about what happened to Polonius. He also tells her that Laertes has returned from France, and then right after that, there is a commotion in the castle. 
A guard tells King Claudius that Laertes has arrived and brought with him a small mob, with whom he plans to potentially try and overthrow the castle to become the new king. Laertes enters in a fit of rage about his father's death, and Claudius attempts to calm him down, but to no avail. When Ophelia comes back in, clearly having lost her mind, it only further fans Laertes's anger. But Claudius finally manages to convince Laertes to listen to him and let him explain what happened to Polonius.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/D7ED53BA-9B02-4734-93D9-D3E6323C76B6/synopsis.txt',
            },
          ],
          title: 'Laertes returns from France in a rage',
        },
        {
          id: 'D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Horatio, Sailors',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Climax, Foreshadowing, THEME: Mortality, THEME: Corruption',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Horatio gets a letter from Hamlet, who lets him know that the ship meant to take him to England was set upon by pirates and he needed to turn back towards Denmark. The sailors bearing the message say they also have messages for Gertrude and Claudius, so they go to see them, before stealing away to find Hamlet in the countryside, not far from the castle.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350/synopsis.txt',
            },
          ],
          title: 'Horatio receives word from Hamlet',
        },
        {
          id: '2EB532B2-49BE-477D-B498-65A696641338',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Claudius, Laertes, Gertrude',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'THEME: Madness, THEME: Corruption, THEME: Revenge, STAGE: Climax, Character Death',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/2EB532B2-49BE-477D-B498-65A696641338/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Claudius finally tells Laertes the truth of what happened between Hamlet and Polonius, and the two determine that Hamlet needs to be taken care of in a way that is not as conspicuous to the people of Denmark. Just then, the sailors and Horatio come to tell the men that Hamlet will be back at the court the next day because of the pirates attacking Hamlet's ship. They then devise to tempt Hamlet into a duel, and Laertes plots to use a sharpened sword that has been dipped in poison, so all he needs to do will be the cut Hamlet quickly and he'll die from the poison. Claudius even proposes a back up plan of giving Hamlet a glass of poisoned wine even if he wins the duel. 

At this point, Gertrude enters to tell them the sad news that Ophelia has fallen into a river and drowned, which further stokes Laertes anger and lust for revenge. He storms from the room, which leaves Claudius feeling uneasy.
`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/2EB532B2-49BE-477D-B498-65A696641338/synopsis.txt',
            },
          ],
          title: 'Claudius and Laertes plan to kill Hamlet',
        },
      ],
    },
    {
      id: '60F2D14C-D834-40C3-AD56-092E1C432341',
      title: 'Act 5',
      kind: 'Folder',
      children: [
        {
          id: 'A6FF729E-8FDD-4551-8486-770A6084C6CC',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes, Fortinbras, Rosencrantz and Guildenstern, Marcellus, Gravediggers, Sailors, Osric',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Climax, THEME: Mortality, Character Death, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, THEME: Revenge',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Summary',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/A6FF729E-8FDD-4551-8486-770A6084C6CC/notes.rtf',
            },
            {
              data: () => Promise.resolve(''),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/A6FF729E-8FDD-4551-8486-770A6084C6CC/synopsis.txt',
            },
          ],
          title: 'Hamlet meets an untimely end',
        },
        {
          id: '04027D06-02A1-4488-B9ED-1CA64981044E',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Horatio, Claudius, Gertrude, Laertes, Ophelia, Gravediggers',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Graveyard',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Falling Action, THEME: Mortality, Foreshadowing, THEME: Corruption, THEME: Religion, THEME: Revenge',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/04027D06-02A1-4488-B9ED-1CA64981044E/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Two gravediggers are readying Ophela's grave and have an exchange about the nature of death, and talk about how the world will always need gravediggers. Then Hamlet and Horatio arrive and watch them silently for a while, with Hamlet musing about how all men die and eventually become dust.
The two approach the gravediggers, asking who it is that will be buried in this particular grave. The diggers dance around the topic before ultimately saying that it was a woman who has died. Hamlet and Horatio then go to hide when they see the funeral procession approaching. 
Among the mourners are the King and Queen and Laertes, who is visibly upset about the loss of his sister. When Hamlet realizes she is the one that died, he bursts onto the scene, raving about how no one, not even her brother, could ever have loved her as much as he did. He and Laertes begin to fight but are pulled apart by other mourners. Hamlet then storms away with Horatio, and while Laertes initially wants to follow him and kill him then and there, Claudius reminds him to stick to their original plan of the duel.`),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/04027D06-02A1-4488-B9ED-1CA64981044E/synopsis.txt',
            },
          ],
          title: "Hamlet and Horatio witness Ophelia's funeral",
        },
        {
          id: '74B99AD9-447B-4968-8351-3CE2A26B090C',
          kind: 'Text',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'characters',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet, Horatio, Osric, Claudius, Gertrude, Laertes, Fortinbras',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'places',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'STAGE: Resolution, THEME: Mortality, Character Death, THEME: Health of the Nation, THEME: Corruption, THEME: Revenge, THEME: Madness',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'plotline',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Scenes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/74B99AD9-447B-4968-8351-3CE2A26B090C/notes.rtf',
            },
            {
              data: () =>
                Promise.resolve(`Description

Back at Elsinore, Hamlet tells Horatio that he swapped the letter meant to kill him and that instead Rosencrantz and Guildenstern will be killed for their betrayal and siding with Claudius. Then, a courtier named Osric enters and tells Hamlet that Laertes wishes to duel him, and starts singing Laertes's praises. Horatio tries to encourage Hamlet not to fight in the duel, but Hamlet decides to anyway. 
They are summoned to court for the duel. Hamlet and Laertes hash things out, and while Laertes says he won't forgive him fully, he'll at least accept his apology. The two men recieve the swords they are to use for the duel, and Claudius says if Hamlet gets the first or second hit, he will drink to Hamlet's health and then offer a cup to Hamlet. (which will actually contain poison) Hamlet gets the first strike in, but refuses to drink from the cup. Then when he hits Laertes again, Gertrude gets up to drink from the cup, even though Claudius tries to warn her not to.. But it is too late. She's already done it.
Before they fight another round, Laertes muses if he should lay down his sword, but decides not to, and on the third one, Laertes manages to cut Hamlet with the poisoned blade. But as they continue to fight, their swords accidentally get mixed up and Hamlet ends up cutting and thus poisoning Laertes. Queen Gertrude proclaims the wine was poisoned and dies, just as Laertes admits the sword was also poisoned, and that is was Claudius's idea for both. Laertes dies too, but not before saying he forgives Hamlet. Hamlet then takes up the poisoned sword and at last, kills his uncle by running Claudius through with the blade and forcing him to drink the last of the poison that killed his wife.
As Fortinbras arrives at the castle, Hamlet clings to Horatio, asking his friend not to die by suicide, but to live on and tell the story of what happened there. He also asks the Fortinbras be made the new king of Denmark. Horatio vows to tell his story, just as Fortinbras enters and asks that Hamlet be given a soldier's send off. `),
              fullPath:
                '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/74B99AD9-447B-4968-8351-3CE2A26B090C/synopsis.txt',
            },
          ],
          title: 'The duel between Laertes and Hamlet',
        },
      ],
    },
  ],
  characters: [
    {
      id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
      title: 'Hamlet',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Hamlet',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Prince of Denmark',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The title character, Hamlet is the 30 year old Prince of Denmark, nephew to King Claudius, and son of Queen Gertrude. He hates his uncle and resents his mother. Studied at the University of Wittenberg, he is a thoughtful and melancholy individual, but who often makes impulsive, rash decisions. ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Protagonist',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Hamlet seeks to get revenge for his father's death",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Too melancholy, acts before thinking it through',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Wants to take his own life AND get revenge for his father's murder",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Cut with a poisoned sword in a duel with Laertes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, THEME: Mortality, THEME: Revenge, THEME: Madness, Character Death',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Main',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/37DF6E83-B710-42A3-B342-D5BECFDC13FA/content.rtf',
        },
      ],
    },
    {
      id: '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
      title: 'Claudius',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Claudius',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'King of Denmark',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Antagonist',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'He wants to be ruler of Denmark so much that he would do anything to get and keep that position',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Power hungry',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Regrets over marrying his brother's wife",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Killed with a poisonous sword & goblet by Hamlet',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Character Death, STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, THEME: Religion, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Main',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D/content.rtf',
        },
      ],
    },
    {
      id: '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
      title: 'Gertrude',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Gertrude',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Queen of Denmark',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Queen of Denmark, wife of Claudius, and mother of Hamlet. While she loves her son very much, her desperation and need for affection leads her to behave selfishly. Has a very gray moral compass.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Self-preservation at all costs',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Female',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Selfish',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Doesn't want to give up her own comfort, but also feels she did wrong by her first husband",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Poisoned wine from Claudius',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Character Death, STAGE: Rising Action, STAGE: Climax, STAGE: Exposition, STAGE: Falling Action, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Main',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8/content.rtf',
        },
      ],
    },
    {
      id: 'CED21C2D-8F73-42C9-91B6-C353E401C48E',
      title: 'Polonius',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Polonius',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Lord Chamberlin',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Serves as Claudius's Lord Chamberlin at court, and is the father of Ophelia and Laertes. ",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Supporting',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To keep his daughter and country safe',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Too eager to destroy Hamlet',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Wants his daughter safe from Hamlet',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Stabbed by Hamlet when hiding behind a tapestry',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, Character Death, THEME: Corruption, THEME: Madness, Foreshadowing',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Supporting',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/CED21C2D-8F73-42C9-91B6-C353E401C48E/content.rtf',
        },
      ],
    },
    {
      id: '4077948F-E161-44A5-8940-7072A70AB086',
      title: 'Horatio',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Horatio',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Hamlet's best friend",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Hamlet's best friend who studied with him at Wittenberg. He's a loyal person who aids Hamlet many times during the play. He is the one who lives to tell Hamlet's story.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Supporting character',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To be a loyal friend and a good countrymen',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'n/a',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Wants to do what is best for Denmark',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'n/a',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, THEME: Mortality',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Supporting',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/4077948F-E161-44A5-8940-7072A70AB086/content.rtf',
        },
      ],
    },
    {
      id: '51E5A516-5FA4-4D15-9BAE-13F92F238307',
      title: 'Ophelia',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Ophelia',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Hamlet's love interest",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Ophelia is the daughter of Polonius, sister to Laertes, and the woman that Hamlet is in love with. She's a sweet girl but who depends on the men around her to tell her what to do, and ultimately, it leads to her untimely death. She eventually goes mad and dies by falling in a river.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Be a good daughter and sister',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Female',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Relies too much on others',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Wants to be with Hamlet, but doesn't want to defy her father",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Falls into a river and drowns',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'THEME: Mortality, THEME: Madness, Character Death, STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, THEME: Revenge',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Supporting',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/51E5A516-5FA4-4D15-9BAE-13F92F238307/content.rtf',
        },
      ],
    },
    {
      id: 'CB68062B-A25C-4BF2-8010-04FC3764AB13',
      title: 'Laertes',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Laertes',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Ophelia's brother",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Son of Polonius and brother to Ophelia, Laertes spends the majority of the play away in France. He's quick to act, and serves as a foil to Hamlet who overthinks everything.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Antagonist',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To study in Paris, and then to get revenge for his father',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Wants revenge so much it leads to his own undoing',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Wants revenge for his father, but regrets hurting Hamlet to do it',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Stabbed in a duel with his own poisoned sword by Hamlet',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, Foreshadowing, THEME: Revenge, Character Death',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Main',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/CB68062B-A25C-4BF2-8010-04FC3764AB13/content.rtf',
        },
      ],
    },
    {
      id: '885591BE-B2B5-44A3-B963-D7135416F0BF',
      title: 'Fortinbras',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Fortinbras',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Prince of Norway',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Son of King Fortinbras of Norway. He wants to attack Denmark to avenge his father, who Hamlet's father killed. ",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Antagonist',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To avenge his own father and take back the plot of land that was stolen from his country.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Wants to get back his plot of land, but is willing to negotiate with the Danes to get it.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Foreshadowing, STAGE: Rising Action, STAGE: Resolution, THEME: Revenge, THEME: Health of the Nation',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/885591BE-B2B5-44A3-B963-D7135416F0BF/content.rtf',
        },
      ],
    },
    {
      id: 'BF678077-63C1-4034-AC2B-7696A04B450A',
      title: 'The Ghost',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The Ghost',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The ghost of Hamlet's father",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The ghost of Hamlet's father who returns to tell his son that he was murdered by Claudius so that Claudius could assume the throne. He wants Hamlet to avenge him. The character is ambiguous—Hamlet wonders if the ghost is a demon trying to deceive him—and there is no definitive resolution in the play to what causes the ghost to appear.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Protagonist's Father",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To warn his son of the fact that his uncle murdered him, and to challenge him to seek vengence for his death.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Fatal Flaws',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Too trusting of his brother',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Wants his son to kill his brother to restore his honor',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Poisoned in the ear while sleeping in a garden',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Falling Action, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Religion, THEME: Corruption, THEME: Health of the Nation, Character Death',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/BF678077-63C1-4034-AC2B-7696A04B450A/content.rtf',
        },
      ],
    },
    {
      id: 'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
      title: 'Rosencrantz and Guildenstern',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Rosencrantz and Guildenstern',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Two courtiers',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "These two courtiers are always seen together, and were friends of Hamlet's when he was at Wittenberg. Claudius and Gertrude task the two of them with spying on Hamlet who has been behaving strangely. ",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Antagonists',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To find out what is wrong with Hamlet',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Inner Conflict',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Want to do their King's bidding, but don't want to betray their friend.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'How They Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Killed by English ambassadors at Hamlet's decree",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Attended Wittenberg',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Royal Family Member',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Yes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, Character Death, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Supporting',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9/content.rtf',
        },
      ],
    },
    {
      id: 'CB2A4035-99C7-4F7F-96E7-956D4EB3A561',
      title: 'Osric',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Osric',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'A courtier',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The courtier who summons Hamlet when he has to duel Laertes.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Resolution, THEME: Mortality, THEME: Madness, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/CB2A4035-99C7-4F7F-96E7-956D4EB3A561/content.rtf',
        },
      ],
    },
    {
      id: '6228C789-C105-4256-88DF-71F69E707707',
      title: 'Voltimand and Cornelius',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Voltimand and Cornelius',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Courtiers',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The two courtiers that Claudius sends to Norway so they can try and persuade Fortinbras not to attack Denmark.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extras',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To deliver a message to Norway from one king to another.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Rising Action, STAGE: Exposition, THEME: Health of the Nation, Foreshadowing',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/6228C789-C105-4256-88DF-71F69E707707/content.rtf',
        },
      ],
    },
    {
      id: 'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
      title: 'Marcellus',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Marcellus',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'A palace guard',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extra',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To protect Elsinore castle.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Rising Action, THEME: Madness, THEME: Health of the Nation',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3/content.rtf',
        },
      ],
    },
    {
      id: '13370158-73A7-4AB8-88CB-DEF2C48CDA98',
      title: 'Francisco',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Francisco',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'An Elsinore guardd',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extra',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Protect Elsinore castle.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, Foreshadowing, THEME: Madness',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/13370158-73A7-4AB8-88CB-DEF2C48CDA98/content.rtf',
        },
      ],
    },
    {
      id: 'B863E330-D577-446B-84A9-A05CD6EBEA9E',
      title: 'Reynaldo',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Reynaldo',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Polonius's servant",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'A servant to Polonius who is sent to France to spy on Laertes.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extra',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "To do his master's bidding in fetching his son back from France.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Rising Action, Foreshadowing, THEME: Corruption, THEME: Health of the Nation',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/B863E330-D577-446B-84A9-A05CD6EBEA9E/content.rtf',
        },
      ],
    },
    {
      id: '054B7E25-09B2-48D0-8695-5378B311FAC7',
      title: 'Bernardo',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Bernardo',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'A palace guard',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extra',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To protect Elsinore castle.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Rising Action, Foreshadowing, THEME: Madness, THEME: Health of the Nation',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/054B7E25-09B2-48D0-8695-5378B311FAC7/content.rtf',
        },
      ],
    },
    {
      id: 'A23C4108-909A-4B0A-A33B-164F66312E2B',
      title: 'The Players',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The Players',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The theater troupe',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The theater troupe that passes through town and delivers speeches about Troy and puts on the play The Murder of Gonzago.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extras',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To put on a play for the royal court of Denmark.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Rising Action, STAGE: Climax, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/A23C4108-909A-4B0A-A33B-164F66312E2B/content.rtf',
        },
      ],
    },
    {
      id: '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
      title: 'Sailors',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Sailors',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'A pair of sailors sent by Hamlet',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "They carry a message from Hamlet to Horatio and the King and Queen after Hamlet's ship is set upon by pirates.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extra',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'To deliver a message from Hamlet to those at Elsinore Castle.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Falling Action, Foreshadowing, THEME: Revenge',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9/content.rtf',
        },
      ],
    },
    {
      id: 'CB494EFC-2AEC-44C8-86C3-3C91D1651D6C',
      title: 'Gravediggers',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Gravediggers',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Two gravediggers who dig Ophelia's grave",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Role',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Extras',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Motivation',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Dig the grave to bury Ophelia in.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Gender',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Male',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Characters That Die',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'No',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Resolution, Foreshadowing, THEME: Mortality, THEME: Religion',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/CB494EFC-2AEC-44C8-86C3-3C91D1651D6C/content.rtf',
        },
      ],
    },
  ],
  places: [
    {
      id: '60421213-B12C-42C2-ABC4-F11C676A4659',
      title: 'Elsinore Castle',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Elsinore Castle',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Denmark palace',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Notes',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Where most of the action takes place in the story.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Resolution, STAGE: Falling Action, STAGE: Climax, Foreshadowing',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Main',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/60421213-B12C-42C2-ABC4-F11C676A4659/content.rtf',
        },
      ],
    },
    {
      id: '1F840806-D9C1-4617-B372-6DEDAA5B5419',
      title: 'Field in Denmark',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Field in Denmark',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Where Hamlet encounters Fortinbras',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/1F840806-D9C1-4617-B372-6DEDAA5B5419/content.rtf',
        },
      ],
    },
    {
      id: 'CB6F018B-3282-46D0-86CA-451C24906191',
      title: 'France',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'France',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Where Laertes spends part of the play',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/CB6F018B-3282-46D0-86CA-451C24906191/content.rtf',
        },
      ],
    },
    {
      id: 'A8A9721D-3C11-4A7E-A429-E81D97ACFF01',
      title: 'Graveyard',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Graveyard',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The graveyard where Ophelia is buried',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Rising Action, THEME: Corruption, THEME: Health of the Nation',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/A8A9721D-3C11-4A7E-A429-E81D97ACFF01/content.rtf',
        },
      ],
    },
    {
      id: '725659E7-A752-4D93-B392-118D8AD7936E',
      title: 'Univerisity of Wittenberg',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Univerisity of Wittenberg',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Description',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Hamlet & Horatio's university",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/725659E7-A752-4D93-B392-118D8AD7936E/content.rtf',
        },
      ],
    },
  ],
  notes: [
    {
      id: 'A6810C7C-D7C2-4B5F-98D6-5DC60EA84678',
      title: 'Character Chart',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Character Chart',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Content',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'From  character chart & worksheet. ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'characters',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes, Fortinbras, The Ghost, Rosencrantz and Guildenstern, Osric, Voltimand and Cornelius, Marcellus, Francisco, Reynaldo, Bernardo, The Players, Sailors, Gravediggers',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'places',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Elsinore Castle, Field in Denmark, Graveyard',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Main',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'note custom attribute 2',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "here's some more content",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/A6810C7C-D7C2-4B5F-98D6-5DC60EA84678/content.rtf',
        },
      ],
    },
    {
      id: 'FC73208C-777D-4598-9A90-E6220D82F723',
      title: 'Death in Hamlet',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Death in Hamlet',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Content',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This infographic, which , maps out the deaths in Hamlet, where they happen in the story, and their meaning. It also unpacks themes, character motivations, and more.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'THEME: Mortality, Character Death, Foreshadowing, THEME: Madness, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'characters',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Hamlet, Claudius, Gertrude, Polonius, Ophelia, Laertes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'places',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Elsinore Castle, Graveyard',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/FC73208C-777D-4598-9A90-E6220D82F723/content.rtf',
        },
      ],
    },
    {
      id: '0C127336-5C69-4895-8827-9C76338E5C30',
      title: 'Thematic Ideas',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Thematic Ideas',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Content',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: ' ',
                    isBold: true,
                  },
                  {
                    text: 'unpacks the main themes of the play, as well as digs deeper into some of the more subtle themes. These include...',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tMadness ',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tRevenge ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tReligion ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tSubversion of Relationships ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tDelay ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tHonor ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tAmbiguity of Language ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tHuman Beings ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tPolitical Intrigues ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '•\tSuicide ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This  also digs more into the complicated themes in Hamlet.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Madness, THEME: Religion, THEME: Corruption, THEME: Health of the Nation',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'characters',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'places',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Elsinore Castle, Graveyard, Field in Denmark',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/0C127336-5C69-4895-8827-9C76338E5C30/content.rtf',
        },
      ],
    },
    {
      id: 'FAB99F63-79EF-44A1-B63E-D71822853051',
      title: 'Character Sketches',
      data: [
        {
          data: () =>
            Promise.resolve([
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Character Sketches',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Content',
                        isBold: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This infographic () breaks down five of the key figures in Hamlet: Ophelia, King Hamlet, Claudius, Gertrude, and Prince Hamlet himself.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'tags',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Character Death, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Corruption',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'characters',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Hamlet, Claudius, Gertrude, Ophelia, The Ghost',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'places',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Elsinore Castle',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'category',
                    isBold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Other',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [],
              },
            ]),
          fullPath:
            '/home/edward/wip/plottr_electron/examples/Hamlet.scriv/Files/Data/FAB99F63-79EF-44A1-B63E-D71822853051/content.rtf',
        },
      ],
    },
  ],
}

describe('transformNotes', () => {
  describe('given a scrivener structure from the Hamlet.scriv example file', () => {
    it('should produce a promise that resolves to all the notes in that structure with raw attributes', async () => {
      const result = await transformNotes(scrivenerStructure)
      expect(result).toEqual([
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            { children: [{ text: 'From  character chart & worksheet. ' }], type: 'paragraph' },
          ],
          id: 'A6810C7C-D7C2-4B5F-98D6-5DC60EA84678',
          imageId: null,
          lastEdited: null,
          'note custom attribute 2': [
            { children: [{ text: "here's some more content" }], type: 'paragraph' },
            { children: [], type: 'paragraph' },
          ],
          places: [],
          position: 0,
          rawCategory: 'Main',
          rawCharacters:
            'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes, Fortinbras, The Ghost, Rosencrantz and Guildenstern, Osric, Voltimand and Cornelius, Marcellus, Francisco, Reynaldo, Bernardo, The Players, Sailors, Gravediggers',
          rawPlaces: 'Elsinore Castle, Field in Denmark, Graveyard',
          rawTags:
            'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution',
          tags: [],
          templates: [],
          title: 'Character Chart',
        },
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            {
              children: [
                {
                  text: 'This infographic, which , maps out the deaths in Hamlet, where they happen in the story, and their meaning. It also unpacks themes, character motivations, and more.',
                },
              ],
              type: 'paragraph',
            },
            { children: [], type: 'paragraph' },
          ],
          id: 'FC73208C-777D-4598-9A90-E6220D82F723',
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          rawCategory: null,
          rawCharacters: 'Hamlet, Claudius, Gertrude, Polonius, Ophelia, Laertes',
          rawPlaces: 'Elsinore Castle, Graveyard',
          rawTags:
            'THEME: Mortality, Character Death, Foreshadowing, THEME: Madness, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Death in Hamlet',
        },
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            {
              children: [
                { isBold: true, text: ' ' },
                {
                  text: 'unpacks the main themes of the play, as well as digs deeper into some of the more subtle themes. These include...',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                { children: [], type: 'paragraph' },
                { children: [{ text: '•	Madness ' }], type: 'paragraph' },
              ],
              type: 'paragraph',
            },
            { children: [{ text: '•	Revenge ' }], type: 'paragraph' },
            { children: [{ text: '•	Religion ' }], type: 'paragraph' },
            { children: [{ text: '•	Subversion of Relationships ' }], type: 'paragraph' },
            { children: [{ text: '•	Delay ' }], type: 'paragraph' },
            { children: [{ text: '•	Honor ' }], type: 'paragraph' },
            { children: [{ text: '•	Ambiguity of Language ' }], type: 'paragraph' },
            { children: [{ text: '•	Human Beings ' }], type: 'paragraph' },
            { children: [{ text: '•	Political Intrigues ' }], type: 'paragraph' },
            { children: [{ text: '•	Suicide ' }], type: 'paragraph' },
            {
              children: [{ text: 'This  also digs more into the complicated themes in Hamlet.' }],
              type: 'paragraph',
            },
          ],
          id: '0C127336-5C69-4895-8827-9C76338E5C30',
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          rawCategory: null,
          rawCharacters: 'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes',
          rawPlaces: 'Elsinore Castle, Graveyard, Field in Denmark',
          rawTags:
            'Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Madness, THEME: Religion, THEME: Corruption, THEME: Health of the Nation',
          tags: [],
          templates: [],
          title: 'Thematic Ideas',
        },
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            {
              children: [
                {
                  text: 'This infographic () breaks down five of the key figures in Hamlet: Ophelia, King Hamlet, Claudius, Gertrude, and Prince Hamlet himself.',
                },
              ],
              type: 'paragraph',
            },
          ],
          id: 'FAB99F63-79EF-44A1-B63E-D71822853051',
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          rawCategory: 'Other',
          rawCharacters: 'Hamlet, Claudius, Gertrude, Ophelia, The Ghost',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'Character Death, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Character Sketches',
        },
      ])
    })
  })
})

describe('transformCharacters', () => {
  describe('given a scrivener structure from the example hamlet file', () => {
    it('should produce a promise that resolves to all the characters in that structure with raw attributes', async () => {
      const result = await transformCharacters(scrivenerStructure)
      expect(result).toEqual([
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'Prince of Denmark',
          id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
          imageId: null,
          name: 'Hamlet',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'The title character, Hamlet is the 30 year old Prince of Denmark, nephew to King Claudius, and son of Queen Gertrude. He hates his uncle and resents his mother. Studied at the University of Wittenberg, he is a thoughtful and melancholy individual, but who often makes impulsive, rash decisions. ',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Too melancholy, acts before thinking it through',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Cut with a poisoned sword in a duel with Laertes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: "Wants to take his own life AND get revenge for his father's murder",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: "Hamlet seeks to get revenge for his father's death",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Protagonist',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Main',
          rawTags:
            'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, THEME: Mortality, THEME: Revenge, THEME: Madness, Character Death',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'King of Denmark',
          id: '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
          imageId: null,
          name: 'Claudius',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Power hungry',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Killed with a poisonous sword & goblet by Hamlet',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: "Regrets over marrying his brother's wife",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'He wants to be ruler of Denmark so much that he would do anything to get and keep that position',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Antagonist',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Main',
          rawTags:
            'Character Death, STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, THEME: Religion, THEME: Corruption',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'The Queen of Denmark',
          id: '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
          imageId: null,
          name: 'Gertrude',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'The Queen of Denmark, wife of Claudius, and mother of Hamlet. While she loves her son very much, her desperation and need for affection leads her to behave selfishly. Has a very gray moral compass.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Selfish',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Female',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Poisoned wine from Claudius',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: "Doesn't want to give up her own comfort, but also feels she did wrong by her first husband",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'Self-preservation at all costs',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Main',
          rawTags:
            'Character Death, STAGE: Rising Action, STAGE: Climax, STAGE: Exposition, STAGE: Falling Action, THEME: Corruption',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'Lord Chamberlin',
          id: 'CED21C2D-8F73-42C9-91B6-C353E401C48E',
          imageId: null,
          name: 'Polonius',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "Serves as Claudius's Lord Chamberlin at court, and is the father of Ophelia and Laertes. ",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Too eager to destroy Hamlet',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Stabbed by Hamlet when hiding behind a tapestry',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: 'Wants his daughter safe from Hamlet',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To keep his daughter and country safe',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Supporting',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Supporting',
          rawTags:
            'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, Character Death, THEME: Corruption, THEME: Madness, Foreshadowing',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "Hamlet's best friend",
          id: '4077948F-E161-44A5-8940-7072A70AB086',
          imageId: null,
          name: 'Horatio',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "Hamlet's best friend who studied with him at Wittenberg. He's a loyal person who aids Hamlet many times during the play. He is the one who lives to tell Hamlet's story.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'n/a',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'n/a',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: 'Wants to do what is best for Denmark',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To be a loyal friend and a good countrymen',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Supporting character',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Supporting',
          rawTags:
            'STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, THEME: Mortality',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "Hamlet's love interest",
          id: '51E5A516-5FA4-4D15-9BAE-13F92F238307',
          imageId: null,
          name: 'Ophelia',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "Ophelia is the daughter of Polonius, sister to Laertes, and the woman that Hamlet is in love with. She's a sweet girl but who depends on the men around her to tell her what to do, and ultimately, it leads to her untimely death. She eventually goes mad and dies by falling in a river.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Relies too much on others',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Female',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Falls into a river and drowns',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: "Wants to be with Hamlet, but doesn't want to defy her father",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'Be a good daughter and sister',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Supporting',
          rawTags:
            'THEME: Mortality, THEME: Madness, Character Death, STAGE: Exposition, STAGE: Rising Action, STAGE: Climax, THEME: Revenge',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "Ophelia's brother",
          id: 'CB68062B-A25C-4BF2-8010-04FC3764AB13',
          imageId: null,
          name: 'Laertes',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "Son of Polonius and brother to Ophelia, Laertes spends the majority of the play away in France. He's quick to act, and serves as a foil to Hamlet who overthinks everything.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Wants revenge so much it leads to his own undoing',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Stabbed in a duel with his own poisoned sword by Hamlet',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: 'Wants revenge for his father, but regrets hurting Hamlet to do it',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To study in Paris, and then to get revenge for his father',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Antagonist',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Main',
          rawTags:
            'STAGE: Exposition, STAGE: Climax, STAGE: Falling Action, STAGE: Resolution, Foreshadowing, THEME: Revenge, Character Death',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'The Prince of Norway',
          id: '885591BE-B2B5-44A3-B963-D7135416F0BF',
          imageId: null,
          name: 'Fortinbras',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "Son of King Fortinbras of Norway. He wants to attack Denmark to avenge his father, who Hamlet's father killed. ",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: 'Wants to get back his plot of land, but is willing to negotiate with the Danes to get it.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To avenge his own father and take back the plot of land that was stolen from his country.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Antagonist',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'Foreshadowing, STAGE: Rising Action, STAGE: Resolution, THEME: Revenge, THEME: Health of the Nation',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "The ghost of Hamlet's father",
          id: 'BF678077-63C1-4034-AC2B-7696A04B450A',
          imageId: null,
          name: 'The Ghost',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "The ghost of Hamlet's father who returns to tell his son that he was murdered by Claudius so that Claudius could assume the throne. He wants Hamlet to avenge him. The character is ambiguous—Hamlet wonders if the ghost is a demon trying to deceive him—and there is no definitive resolution in the play to what causes the ghost to appear.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Fatal Flaws': [
              {
                children: [
                  {
                    text: 'Too trusting of his brother',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: 'Poisoned in the ear while sleeping in a garden',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: 'Wants his son to kill his brother to restore his honor',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To warn his son of the fact that his uncle murdered him, and to challenge him to seek vengence for his death.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: "Protagonist's Father",
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'STAGE: Exposition, STAGE: Falling Action, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Religion, THEME: Corruption, THEME: Health of the Nation, Character Death',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'Two courtiers',
          id: 'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
          imageId: null,
          name: 'Rosencrantz and Guildenstern',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "These two courtiers are always seen together, and were friends of Hamlet's when he was at Wittenberg. Claudius and Gertrude task the two of them with spying on Hamlet who has been behaving strangely. ",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Attended Wittenberg': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'How They Die': [
              {
                children: [
                  {
                    text: "Killed by English ambassadors at Hamlet's decree",
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Inner Conflict': [
              {
                children: [
                  {
                    text: "Want to do their King's bidding, but don't want to betray their friend.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To find out what is wrong with Hamlet',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Antagonists',
                  },
                ],
                type: 'paragraph',
              },
            ],
            'Royal Family Member': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Supporting',
          rawTags:
            'STAGE: Rising Action, STAGE: Climax, STAGE: Falling Action, Character Death, THEME: Corruption',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'A courtier',
          id: 'CB2A4035-99C7-4F7F-96E7-956D4EB3A561',
          imageId: null,
          name: 'Osric',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'The courtier who summons Hamlet when he has to duel Laertes.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags: 'STAGE: Resolution, THEME: Mortality, THEME: Madness, THEME: Corruption',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'Courtiers',
          id: '6228C789-C105-4256-88DF-71F69E707707',
          imageId: null,
          name: 'Voltimand and Cornelius',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'The two courtiers that Claudius sends to Norway so they can try and persuade Fortinbras not to attack Denmark.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To deliver a message to Norway from one king to another.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extras',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'STAGE: Rising Action, STAGE: Exposition, THEME: Health of the Nation, Foreshadowing',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'A palace guard',
          id: 'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
          imageId: null,
          name: 'Marcellus',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To protect Elsinore castle.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extra',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'STAGE: Exposition, STAGE: Rising Action, THEME: Madness, THEME: Health of the Nation',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'An Elsinore guardd',
          id: '13370158-73A7-4AB8-88CB-DEF2C48CDA98',
          imageId: null,
          name: 'Francisco',
          noteIds: [],
          notes: '',
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'Protect Elsinore castle.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extra',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags: 'STAGE: Exposition, Foreshadowing, THEME: Madness',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "Polonius's servant",
          id: 'B863E330-D577-446B-84A9-A05CD6EBEA9E',
          imageId: null,
          name: 'Reynaldo',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'A servant to Polonius who is sent to France to spy on Laertes.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: "To do his master's bidding in fetching his son back from France.",
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extra',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'STAGE: Rising Action, Foreshadowing, THEME: Corruption, THEME: Health of the Nation',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'A palace guard',
          id: '054B7E25-09B2-48D0-8695-5378B311FAC7',
          imageId: null,
          name: 'Bernardo',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To protect Elsinore castle.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extra',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'STAGE: Exposition, STAGE: Rising Action, Foreshadowing, THEME: Madness, THEME: Health of the Nation',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'The theater troupe',
          id: 'A23C4108-909A-4B0A-A33B-164F66312E2B',
          imageId: null,
          name: 'The Players',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'The theater troupe that passes through town and delivers speeches about Troy and puts on the play The Murder of Gonzago.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To put on a play for the royal court of Denmark.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extras',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags:
            'STAGE: Rising Action, STAGE: Climax, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Corruption',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: 'A pair of sailors sent by Hamlet',
          id: '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
          imageId: null,
          name: 'Sailors',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: "They carry a message from Hamlet to Horatio and the King and Queen after Hamlet's ship is set upon by pirates.",
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'To deliver a message from Hamlet to those at Elsinore Castle.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extra',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags: 'STAGE: Falling Action, Foreshadowing, THEME: Revenge',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "Two gravediggers who dig Ophelia's grave",
          id: 'CB494EFC-2AEC-44C8-86C3-3C91D1651D6C',
          imageId: null,
          name: 'Gravediggers',
          noteIds: [],
          notes: '',
          position: 0,
          rawAttributes: {
            'Characters That Die': [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Gender: [
              {
                children: [
                  {
                    text: 'Male',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Motivation: [
              {
                children: [
                  {
                    text: 'Dig the grave to bury Ophelia in.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            Role: [
              {
                children: [
                  {
                    text: 'Extras',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          rawCategory: 'Other',
          rawTags: 'STAGE: Resolution, Foreshadowing, THEME: Mortality, THEME: Religion',
          tags: [],
          templates: [],
        },
      ])
    })
  })
})

describe('transformPlaces', () => {
  describe('given a scrivener structure from the example hamlet file', () => {
    it('should produce a promise that resolves to all the places in that structure with raw attributes', async () => {
      const result = await transformPlaces(scrivenerStructure)
      expect(result).toEqual([
        {
          bookIds: [],
          cards: [],
          color: null,
          description: 'The Denmark palace',
          id: '60421213-B12C-42C2-ABC4-F11C676A4659',
          imageId: null,
          name: 'Elsinore Castle',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'Where most of the action takes place in the story.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          rawCategory: 'Main',
          rawTags: 'STAGE: Resolution, STAGE: Falling Action, STAGE: Climax, Foreshadowing',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          color: null,
          description: 'Where Hamlet encounters Fortinbras',
          id: '1F840806-D9C1-4617-B372-6DEDAA5B5419',
          imageId: null,
          name: 'Field in Denmark',
          noteIds: [],
          notes: '',
          position: 0,
          rawCategory: 'Other',
          rawTags: '',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          color: null,
          description: 'Where Laertes spends part of the play',
          id: 'CB6F018B-3282-46D0-86CA-451C24906191',
          imageId: null,
          name: 'France',
          noteIds: [],
          notes: '',
          position: 0,
          rawCategory: null,
          rawTags: '',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          color: null,
          description: 'The graveyard where Ophelia is buried',
          id: 'A8A9721D-3C11-4A7E-A429-E81D97ACFF01',
          imageId: null,
          name: 'Graveyard',
          noteIds: [],
          notes: '',
          position: 0,
          rawCategory: null,
          rawTags: 'STAGE: Rising Action, THEME: Corruption, THEME: Health of the Nation',
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          color: null,
          description: "Hamlet & Horatio's university",
          id: '725659E7-A752-4D93-B392-118D8AD7936E',
          imageId: null,
          name: 'Univerisity of Wittenberg',
          noteIds: [],
          notes: '',
          position: 0,
          rawCategory: null,
          rawTags: '',
          tags: [],
          templates: [],
        },
      ])
    })
  })
})

describe('transformCards', () => {
  describe('given a scrivener structure from the example hamlet file', () => {
    it('should produec a promise that resolves to all the cards in that structure with raw attributes', async () => {
      const plotlines = await extractPlotlines(scrivenerStructure, 1)
      const result = await transformCards(scrivenerStructure, plotlines)
      expect(result).toEqual([
        {
          beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          bookId: null,
          characters: [],
          color: null,
          description: '',
          fromTemplateId: null,
          id: 'BB664270-D5D3-4922-92BA-13828AE114CE',
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes, Fortinbras, The Ghost, Marcellus, Bernardo, Francisco, Reynaldo',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Exposition, Foreshadowing, THEME: Mortality, THEME: Revenge, THEME: Madness, THEME: Corruption, THEME: Health of the Nation',
          tags: [],
          templates: [],
          'test 1': [
            {
              children: [
                {
                  text: 'some text',
                },
              ],
              type: 'paragraph',
            },
          ],
          'test 2': [
            {
              children: [
                {
                  text: 'some other text',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [],
              type: 'paragraph',
            },
          ],
          title: 'Hamlet learns the truth from the ghost of his father',
        },
        {
          beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

After a long, cold night on the ramparts guarding Elsinore castle, Bernardo comes to relieve Francisco, and is soon joined by Marcellus. The two of them summon Horatio to join them, because for the past few nights, they have noticed a ghostly apparition walking the ramparts, who they believe to be the ghost of King Hamlet.
Horatio doesn't want to believe them, until suddenly the Ghost appears before them for a few moments, and then vanishes. He points out how much the ghost looks like the slain King, and says that he believes this to be a bad omen for Denmark, alluding to a possible military incursion that could be led by the Prince of Norway.
The Ghost appears again and Horatio tries to talk to it, but it remains silent. He then suggests that they should tell the King's son, Hamlet, about the apparition, because if the ghost is going to speak to anyone, he believes it would be his son.`,
          fromTemplateId: null,
          id: 'FC30AB95-1AF3-43DF-A33B-8BE3795B931C',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Marcellus, Horatio, The Ghost, Francisco, Bernardo',
          rawPlaces: 'Elsinore Castle',
          rawTags: 'THEME: Health of the Nation, Foreshadowing, STAGE: Exposition',
          tags: [],
          templates: [],
          title: 'The guards see a ghost',
        },
        {
          beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

The following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. 
He also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.
Claudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. 
Hamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.`,
          fromTemplateId: null,
          id: 'B26986A0-BB55-4693-852F-E29E8245D723',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Claudius, Gertrude, Hamlet, Polonius, Laertes, Voltimand and Cornelius',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'THEME: Health of the Nation, STAGE: Exposition, THEME: Corruption, THEME: Mortality, Foreshadowing',
          tags: [],
          templates: [],
          title: 'Claudius makes an announcement & Hamlet laments',
        },
        {
          beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

As Laertes is preparing to depart for France, he has a conversation with his sister, Ophelia. He cautions her about falling for Hamlet because he believes that Hamlet is too far above Ophelia's station for the two of them to ever be a match. 
Laertes then says goodbye to his father, who gives him a some extensive advice for how to live and behave while he is away in France. 
As Laertes finally leaves, Polonius asks Ophelia what she and her brother talked about. She confesses that it was about Hamlet, and that he claims to love her. Polonius agrees with his son in telling Ophelia that he believes Hamlet to be insincere about his affections, and forbids her from seeing him further. `,
          fromTemplateId: null,
          id: 'E9861F65-1263-4095-8099-7BCC5889CEFC',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Polonius, Laertes, Ophelia',
          rawPlaces: 'France, Elsinore Castle',
          rawTags:
            'STAGE: Exposition, THEME: Corruption, THEME: Health of the Nation, Foreshadowing, THEME: Mortality',
          tags: [],
          templates: [],
          title: 'Laertes leaves for France',
        },
        {
          beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Hamlet waits outside on the castle ramparts with Marcellus and Horatio, hoping to catch a glimpse of the ghost. In the midst of doing so, they hear loud canons and revelry happening, and Hamlet explains it is a Danish custom for the new King. He expresses disdain for it, saying it makes his country look silly to others, and he wishes it would change.
Then they see the ghost and Hamlet tries calling out to it. When it doesn't answer but beckons Hamlet to follow, Marcellus and Horatio warn him that he shouldn't go. But Hamlet articulates that he doesn't care what happens to him and that if his soul is immortal, he has nothing to fear. 
Horatio and Marcellus talk about how they think this is an ill omen for their country, and they debate briefly about whether or not to follow Hamlet, before deciding that they want to make sure their friend is safe.`,
          fromTemplateId: null,
          id: '8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, The Ghost, Marcellus, Horatio',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Exposition, Foreshadowing, Character Death, THEME: Madness, THEME: Revenge',
          tags: [],
          templates: [],
          title: 'Hamlet goes after the ghost of his father',
        },
        {
          beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Hamlet finally gets to speak with the ghost of his father, who tells him that he was murdered by Hamlet's uncle Claudius so that he could steal the crown. He tells him how Claudius snuck into their garden and put poison in his ear.
The ghost then asks Hamlet to seek out revenge for his murder. Hamlet is so distraught at learning what's happened and that he was right about his evil uncle all along, that he agrees.
Just as the ghost fades away, Horatio and Marcellus catch up with Hamlet and ask him what happened. He doesn't tell them, but says that he might have to act like he's going mad, and they have to swear not to tell anyone what they saw. Though confused, they promise to keep his secret.`,
          fromTemplateId: null,
          id: '486CEA94-7A6B-457C-A7E1-5554ED61B9E5',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, The Ghost, Marcellus, Horatio',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Exposition, Foreshadowing, THEME: Mortality, Character Death, THEME: Revenge',
          tags: [],
          templates: [],
          title: "Hamlet speaks with his father's ghost",
        },
        {
          beatId: '2A163249-3471-4EE5-9F19-C4B856779C9F',
          bookId: null,
          characters: [],
          color: null,
          description: '',
          fromTemplateId: null,
          id: 'E4C16008-9DFB-4F7E-BE1D-E058E68D29B5',
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Ophelia, Polonius, Reynaldo, Claudius, Gertrude, Rosencrantz and Guildenstern, Voltimand and Cornelius, Hamlet, The Players',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, Foreshadowing, THEME: Mortality, THEME: Corruption, THEME: Health of the Nation, THEME: Madness',
          tags: [],
          templates: [],
          title: 'Members of court meet & conspire',
        },
        {
          beatId: '2A163249-3471-4EE5-9F19-C4B856779C9F',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Polonius sends his servant Reynaldo to France to spy on his son Laertes, and commands him to report back with what he finds. As the servant leaves, Ophelia comes in, crying and distraught about an interaction with Hamlet.
She tells her father that Hamlet looked "wild eyed" and was breathing heavy, but didn't say anything to her. Polonius believes that Hamlet has gone mad because Ophelia was distancing herself from him, so he rushes off to speak with Claudius about it.`,
          fromTemplateId: null,
          id: '891D8F60-91D7-4D6B-84A5-763AA42BDA78',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Ophelia, Polonius, Reynaldo',
          rawPlaces: 'Elsinore Castle',
          rawTags: 'THEME: Corruption, STAGE: Exposition, Foreshadowing, THEME: Madness',
          tags: [],
          templates: [],
          title: 'Polonius speaks with Ophelia',
        },
        {
          beatId: '2A163249-3471-4EE5-9F19-C4B856779C9F',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Claudius and Gertrude summon Rosencrantz and Guildenstern, two friends of Hamlet's from when he was at Wittenberg. The King and Queen ask that the two courtiers try to brighten Hamlet's spirits, and in so doing also find out why he has been acting so strangely.
Then Polonius arrives to tell Claudius that his ambassadors he sent to Norway are back with a reply from the King. They tell him that the King has decided not to attack Denmark, and has given his son an army with which to attack the Poles instead of the Danes. Prince Fortinbras asks only that his armies be allowed to pass through Denmark on their way to Poland, which Claudius agrees to.
Polonius then tells Claudius that he believes Hamlet has gone made, and pitches a plan for finding out if he has lost his mind because of his love for Ophelia, or if it is for some other reason. 
Claudius and Gertrude leave when they see Hamlet approaching, but Polonius stays to speak with him. Hamlet acts as if he has gone insane and insults Polonius with a number of jabs that have some truth to them.
When Polonious leaves, Rosencrantz and Guildenstern enter and Hamlet seems happy to see them. But quickly their facade of concern crumbles and Hamlet expresses that he knows they have been sent to spy on him. They then tell him that a troupe of players is coming to the castle and that might cheer him up.
The players arrive and Hamlet demands they present on the history of Troy. He is very impressed with the speech and says that the following night, he wants them to stage the play The Murder of Gonzago. Once Hamlet is alone again, he expresses how he wishes he could experience the depth of emotion that the actors do. 
He then devises a plan for bringing down his uncle, in which he plans to stage a play that is similar to how Claudius killed Hamlet's father. If Claudius reacts negatively, Hamlet can consider that proof that he committed the crime.

`,
          fromTemplateId: null,
          id: 'C107CB2E-DBDC-4C41-8C93-8D99C40173F1',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Gertrude, Claudius, Rosencrantz and Guildenstern, Voltimand and Cornelius, Polonius, Hamlet, The Players',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, Foreshadowing',
          tags: [],
          templates: [],
          title: 'A busy day at court',
        },
        {
          beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
          bookId: null,
          characters: [],
          color: null,
          description: '',
          fromTemplateId: null,
          id: 'B58EB299-35D0-41FD-ABF1-E3E5618FF28C',
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Rosencrantz and Guildenstern, Reynaldo, The Players',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'THEME: Madness, THEME: Revenge, Character Death, THEME: Mortality, THEME: Corruption, Foreshadowing, STAGE: Rising Action',
          tags: [],
          templates: [],
          title: 'Hamlet carries out his plan to prove Claudius guilty',
        },
        {
          beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Claudius and Gertrude ask Rosencrantz and Guildenstern about their encounter with Hamlet, but the two of them tell the King and Queen that they couldn't figure it out, and that he seemed in good spirits about the players that arrived. Polonius then arrives and Claudius sends the others away so that they can spy on Hamlet and Ophelia.
Hamlet enters, musing on the futility of live and beauty, delivering his "To be or not to be" soliloquy. Then when he encounters Ophelia, things take a turn for the worse. Ophelia tries to give him back the letters and tokens of affection, and he goes off on Ophelia, in a mad rant, declaring her, and all women and mankind to be worthless. He sways between saying he never loved her and that he always will. Ophelia leaves heartbroken.
Polonius and Claudius confer and decide that it doesn't appear to be Ophelia causing his madness, and the two agree to spy on him again after the play to come that night. Polonius says he will spy on Hamlet interacting with Gertrude to root out the cause of his madness.`,
          fromTemplateId: null,
          id: '129F3355-D918-4682-A6F0-F031BA866BB8',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, Claudius, Ophelia, Polonius, Rosencrantz and Guildenstern',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, THEME: Mortality, Foreshadowing, THEME: Madness, THEME: Revenge, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Hamlet denounces Ophelia',
        },
        {
          beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

The court readies for the play, as Hamlet gives the players their parts. He then summons Horatio and tells his friend how highly he thinks of him, and entrusts him with the secret of what the ghost told him. He hopes that Horatio will be able to keep an eye on Claudius to see if he shows any signs of guilt. 
As everyone enters the room to watch the play, Hamlet starts acting mad once again in front of Polonius, and messes with Ophelia by telling her a lot of erotic puns. The play then begins, and Hamlet comments on it throughout, teasing Ophelia as he goes. 
When the play reaches the point where the character poisons the king in the garden, Claudius gets loud, angry, and storms out of the room. Hamlet and Horatio agree that such a reaction was damning. 
Afterwards, Rosencrantz and Guildenstern try again to find out what has been causing him to act crazy, and he gets upset with them. Polonius then enters to escort Hamlet to his mother's chambers, and Hamlet takes a moment to ready himself for the confrontation that's about to ensue.
`,
          fromTemplateId: null,
          id: 'F455435C-F2C7-4592-94B1-EFB7AA9F4527',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Hamlet, Ophelia, Claudius, Gertrude, Horatio, Polonius, Rosencrantz and Guildenstern, The Players',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, Foreshadowing, THEME: Mortality, THEME: Madness, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Court watches The Murder of Gonzago',
        },
        {
          beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Claudius speaks with Rosencrantz and Guildenstern and instructs them to immediately see to it that Hamlet is taken on a journey to England, because he no longer trusts his nephew's intentions. 
Once alone, he begins praying and asking for forgiveness for the evils and wrongs he has done, and Hamlet manages to sneak in unnoticed. Hamlet muses about killing his uncle right then and there, but then realizes he doesn't want to kill him when he is doing something good like praying for forgiveness. He vows to strike his uncle when he is doing something dastardly.`,
          fromTemplateId: null,
          id: '47F832CE-131E-4E04-9D21-372562C3C4E3',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Claudius, Hamlet, Rosencrantz and Guildenstern',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, Foreshadowing, THEME: Mortality, THEME: Religion, THEME: Corruption, THEME: Madness',
          tags: [],
          templates: [],
          title: 'Claudius prays for forgiveness',
        },
        {
          beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Polonius tells Queen Gertrude to be harsh with her son in hopes of coaxing out of him the reason for his recent madness. He then hides behind a tapestry while Hamlet enters to confront his mother.
Hamlet chastises his mother for her betrayal in marrying his uncle, and begins violently yelling at her. When he does this, Polonius cries out from behind the tapestry for help, and Hamlet, not knowing who it is, stabs through the tapestry, killing Polonius. 
As he continues arguing with his mother, the ghost appears once again, but she is unable to see it. Before disappearing, the ghost reminds Hamlet that he must carry out his mission in killing Claudius, and that he should not be as hard on his mother.
Because Gertrude cannot see the ghost, Hamlet assures her that he hasn't been actually going mad, it was all a facade, but that the ghost is real. Before dragging away Polonius's body, he tells his mother that while he will go to England with Rosencrantz and Guildenstern, he doesn't trust either of them.`,
          fromTemplateId: null,
          id: '62BFD421-BC83-4219-8A0B-50FA958F4F0A',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, Gertrude, Polonius, The Ghost',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, STAGE: Climax, THEME: Mortality, Character Death, THEME: Revenge, THEME: Madness, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Hamlet confronts his mother & kills Polonius',
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: '',
          fromTemplateId: null,
          id: 'ACF1C78C-85F1-4188-B26E-AD6E3B4974B8',
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Gertrude, Claudius, Rosencrantz and Guildenstern, Fortinbras, Laertes, Ophelia, Horatio, Sailors',
          rawPlaces: 'Elsinore Castle, Field in Denmark',
          rawTags:
            'THEME: Corruption, THEME: Health of the Nation, THEME: Revenge, Foreshadowing, STAGE: Climax, THEME: Madness, STAGE: Rising Action, THEME: Mortality',
          tags: [],
          templates: [],
          title: 'Hamlet is sent away, but Laertes returns',
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Gertrude runs in on Claudius when he is with Rosencrantz and Guildenstern and asks to speak to him alone. When they leave, she tells him about everything that happened when Hamlet came to see her, namely that her son has killed Polonius. Claudius is immediately afraid that news of this could ruin his plans to rule Denmark, and so he summons back Rosencrantz and Guildenstern, telling them to get Hamlet to England with all haste so that he can find a way to explain everything that happened to the people without making himself look bad.`,
          fromTemplateId: null,
          id: '4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Gertrude, Claudius, Rosencrantz and Guildenstern',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'THEME: Revenge, Foreshadowing, STAGE: Climax, THEME: Corruption, THEME: Health of the Nation',
          tags: [],
          templates: [],
          title: "Gertrude tells Claudius of Hamlet's actions",
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Rosencrantz and Guildenstern arrive to meet with Hamlet, who has just finished disposing of Polonius's body. He refuses to tell them what he did with the body, but reminds them that Polonius's blood is on Claudius's hands. He then accuses them of being spies for the King, but ultimately agrees to be taken by the two old friends to an audience with his uncle.`,
          fromTemplateId: null,
          id: 'DC6F4DCA-3177-4DBD-A806-44254B0E62AB',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, Rosencrantz and Guildenstern',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Rising Action, Foreshadowing, STAGE: Climax, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, THEME: Revenge',
          tags: [],
          templates: [],
          title: 'Rosencrantz and Guildenstern confront Hamlet',
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Claudius is seen informing courtiers of the untimely death of Polonius, when Hamlet is brought before him to be confronted. He asks Hamlet where he has placed Polonius's body, but at first, Hamlet refuses to tell him. Hamlet insults him by saying that Claudius could seek him out in heaven, or join him in hell. But ultimately, he tells Claudius that the body has been hidden under the stairs in the palace.
Claudius then dismisses Hamlet, ordering him to board the ship to England at once, under the supervision of Rosencrantz and Guildenstern. Once they are all gone, Claudius admits that he has sent sealed orders to England to see to it that Hamlet is killed upon his arrival.`,
          fromTemplateId: null,
          id: '8A0706CE-0D13-452F-85E0-85F5EEED230C',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Claudius, Hamlet, Rosencrantz and Guildenstern',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'Foreshadowing, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, STAGE: Climax',
          tags: [],
          templates: [],
          title: "Claudius demands to know where Polonius's body is",
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

While on his way to the ship that will take him to England, Hamlet runs into Fortinbras and his army. Fortinbras has sent word to the castle to confirm that he and his army may pass through Denmark on the way to attacking Poland, which he explains to Hamlet.
Hamlet asks why they are attacking and Fortinbras explains it is over a small patch of land that he must win back. Hamlet muses on how bloody mankind's appetites are, even for something so insignificant, and then vows to himself that he will be more ruthless in seeking out Claudius for his father's revenge.`,
          fromTemplateId: null,
          id: '5F1DA39A-2CA5-47FE-B311-1E74270EC7DA',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, Fortinbras, Rosencrantz and Guildenstern',
          rawPlaces: 'Field in Denmark',
          rawTags:
            'STAGE: Climax, Foreshadowing, THEME: Health of the Nation, THEME: Revenge, THEME: Mortality',
          tags: [],
          templates: [],
          title: 'Hamlet encounters Fortinbras on the way to England',
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Gertrude is worried about Ophelia, who appears to have gone mad at the loss of her father. Claudius then enters and sees Ophelia acting strange, and informs Gertrude that there are many suspicious whispers around court about what happened to Polonius. He also tells her that Laertes has returned from France, and then right after that, there is a commotion in the castle. 
A guard tells King Claudius that Laertes has arrived and brought with him a small mob, with whom he plans to potentially try and overthrow the castle to become the new king. Laertes enters in a fit of rage about his father's death, and Claudius attempts to calm him down, but to no avail. When Ophelia comes back in, clearly having lost her mind, it only further fans Laertes's anger. But Claudius finally manages to convince Laertes to listen to him and let him explain what happened to Polonius.`,
          fromTemplateId: null,
          id: 'D7ED53BA-9B02-4734-93D9-D3E6323C76B6',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Gertrude, Claudius, Ophelia, Laertes',
          rawPlaces: 'Elsinore Castle',
          rawTags: 'STAGE: Climax, THEME: Revenge, THEME: Madness, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Laertes returns from France in a rage',
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Horatio gets a letter from Hamlet, who lets him know that the ship meant to take him to England was set upon by pirates and he needed to turn back towards Denmark. The sailors bearing the message say they also have messages for Gertrude and Claudius, so they go to see them, before stealing away to find Hamlet in the countryside, not far from the castle.`,
          fromTemplateId: null,
          id: 'D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Horatio, Sailors',
          rawPlaces: 'Elsinore Castle',
          rawTags: 'STAGE: Climax, Foreshadowing, THEME: Mortality, THEME: Corruption',
          tags: [],
          templates: [],
          title: 'Horatio receives word from Hamlet',
        },
        {
          beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Claudius finally tells Laertes the truth of what happened between Hamlet and Polonius, and the two determine that Hamlet needs to be taken care of in a way that is not as conspicuous to the people of Denmark. Just then, the sailors and Horatio come to tell the men that Hamlet will be back at the court the next day because of the pirates attacking Hamlet's ship. They then devise to tempt Hamlet into a duel, and Laertes plots to use a sharpened sword that has been dipped in poison, so all he needs to do will be the cut Hamlet quickly and he'll die from the poison. Claudius even proposes a back up plan of giving Hamlet a glass of poisoned wine even if he wins the duel. 

At this point, Gertrude enters to tell them the sad news that Ophelia has fallen into a river and drowned, which further stokes Laertes anger and lust for revenge. He storms from the room, which leaves Claudius feeling uneasy.
`,
          fromTemplateId: null,
          id: '2EB532B2-49BE-477D-B498-65A696641338',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Claudius, Laertes, Gertrude',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'THEME: Madness, THEME: Corruption, THEME: Revenge, STAGE: Climax, Character Death',
          tags: [],
          templates: [],
          title: 'Claudius and Laertes plan to kill Hamlet',
        },
        {
          beatId: '60F2D14C-D834-40C3-AD56-092E1C432341',
          bookId: null,
          characters: [],
          color: null,
          description: '',
          fromTemplateId: null,
          id: 'A6FF729E-8FDD-4551-8486-770A6084C6CC',
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters:
            'Hamlet, Claudius, Gertrude, Polonius, Horatio, Ophelia, Laertes, Fortinbras, Rosencrantz and Guildenstern, Marcellus, Gravediggers, Sailors, Osric',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Climax, THEME: Mortality, Character Death, THEME: Madness, THEME: Corruption, THEME: Health of the Nation, THEME: Revenge',
          tags: [],
          templates: [],
          title: 'Hamlet meets an untimely end',
        },
        {
          beatId: '60F2D14C-D834-40C3-AD56-092E1C432341',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Two gravediggers are readying Ophela's grave and have an exchange about the nature of death, and talk about how the world will always need gravediggers. Then Hamlet and Horatio arrive and watch them silently for a while, with Hamlet musing about how all men die and eventually become dust.
The two approach the gravediggers, asking who it is that will be buried in this particular grave. The diggers dance around the topic before ultimately saying that it was a woman who has died. Hamlet and Horatio then go to hide when they see the funeral procession approaching. 
Among the mourners are the King and Queen and Laertes, who is visibly upset about the loss of his sister. When Hamlet realizes she is the one that died, he bursts onto the scene, raving about how no one, not even her brother, could ever have loved her as much as he did. He and Laertes begin to fight but are pulled apart by other mourners. Hamlet then storms away with Horatio, and while Laertes initially wants to follow him and kill him then and there, Claudius reminds him to stick to their original plan of the duel.`,
          fromTemplateId: null,
          id: '04027D06-02A1-4488-B9ED-1CA64981044E',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, Horatio, Claudius, Gertrude, Laertes, Ophelia, Gravediggers',
          rawPlaces: 'Graveyard',
          rawTags:
            'STAGE: Falling Action, THEME: Mortality, Foreshadowing, THEME: Corruption, THEME: Religion, THEME: Revenge',
          tags: [],
          templates: [],
          title: "Hamlet and Horatio witness Ophelia's funeral",
        },
        {
          beatId: '60F2D14C-D834-40C3-AD56-092E1C432341',
          bookId: null,
          characters: [],
          color: null,
          description: `Description

Back at Elsinore, Hamlet tells Horatio that he swapped the letter meant to kill him and that instead Rosencrantz and Guildenstern will be killed for their betrayal and siding with Claudius. Then, a courtier named Osric enters and tells Hamlet that Laertes wishes to duel him, and starts singing Laertes's praises. Horatio tries to encourage Hamlet not to fight in the duel, but Hamlet decides to anyway. 
They are summoned to court for the duel. Hamlet and Laertes hash things out, and while Laertes says he won't forgive him fully, he'll at least accept his apology. The two men recieve the swords they are to use for the duel, and Claudius says if Hamlet gets the first or second hit, he will drink to Hamlet's health and then offer a cup to Hamlet. (which will actually contain poison) Hamlet gets the first strike in, but refuses to drink from the cup. Then when he hits Laertes again, Gertrude gets up to drink from the cup, even though Claudius tries to warn her not to.. But it is too late. She's already done it.
Before they fight another round, Laertes muses if he should lay down his sword, but decides not to, and on the third one, Laertes manages to cut Hamlet with the poisoned blade. But as they continue to fight, their swords accidentally get mixed up and Hamlet ends up cutting and thus poisoning Laertes. Queen Gertrude proclaims the wine was poisoned and dies, just as Laertes admits the sword was also poisoned, and that is was Claudius's idea for both. Laertes dies too, but not before saying he forgives Hamlet. Hamlet then takes up the poisoned sword and at last, kills his uncle by running Claudius through with the blade and forcing him to drink the last of the poison that killed his wife.
As Fortinbras arrives at the castle, Hamlet clings to Horatio, asking his friend not to die by suicide, but to live on and tell the story of what happened there. He also asks the Fortinbras be made the new king of Denmark. Horatio vows to tell his story, just as Fortinbras enters and asks that Hamlet be given a soldier's send off. `,
          fromTemplateId: null,
          id: '74B99AD9-447B-4968-8351-3CE2A26B090C',
          imageId: null,
          lineId: 2,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          rawCharacters: 'Hamlet, Horatio, Osric, Claudius, Gertrude, Laertes, Fortinbras',
          rawPlaces: 'Elsinore Castle',
          rawTags:
            'STAGE: Resolution, THEME: Mortality, Character Death, THEME: Health of the Nation, THEME: Corruption, THEME: Revenge, THEME: Madness',
          tags: [],
          templates: [],
          title: 'The duel between Laertes and Hamlet',
        },
      ])
    })
  })
})

describe('extractBeats', () => {
  describe('given a scrivener structure from the example hamlet file', () => {
    it('should produce a promise that resolves to all the beats in that structure with UUID ids', async () => {
      const result = await extractBeats(scrivenerStructure, 1)
      expect(result).toEqual({
        1: {
          children: {
            '2A163249-3471-4EE5-9F19-C4B856779C9F': [],
            '60F2D14C-D834-40C3-AD56-092E1C432341': [],
            '619FDFDB-4AC9-4710-9209-8C952ACE8651': [],
            '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3': [],
            'EBCC7260-3D24-432D-A02C-B3456D1D8569': [],
            null: [
              'EBCC7260-3D24-432D-A02C-B3456D1D8569',
              '2A163249-3471-4EE5-9F19-C4B856779C9F',
              '619FDFDB-4AC9-4710-9209-8C952ACE8651',
              '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
              '60F2D14C-D834-40C3-AD56-092E1C432341',
            ],
          },
          heap: {
            '2A163249-3471-4EE5-9F19-C4B856779C9F': null,
            '60F2D14C-D834-40C3-AD56-092E1C432341': null,
            '619FDFDB-4AC9-4710-9209-8C952ACE8651': null,
            '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3': null,
            'EBCC7260-3D24-432D-A02C-B3456D1D8569': null,
          },
          index: {
            '2A163249-3471-4EE5-9F19-C4B856779C9F': {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: '2A163249-3471-4EE5-9F19-C4B856779C9F',
              position: 1,
              time: 0,
              title: 'Act 2',
            },
            '60F2D14C-D834-40C3-AD56-092E1C432341': {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: '60F2D14C-D834-40C3-AD56-092E1C432341',
              position: 4,
              time: 0,
              title: 'Act 5',
            },
            '619FDFDB-4AC9-4710-9209-8C952ACE8651': {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
              position: 2,
              time: 0,
              title: 'Act 3',
            },
            '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3': {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
              position: 3,
              time: 0,
              title: 'Act 4',
            },
            'EBCC7260-3D24-432D-A02C-B3456D1D8569': {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
              position: 0,
              time: 0,
              title: 'Act 1',
            },
          },
        },
        series: { children: { null: [] }, heap: {}, index: {} },
      })
    })
  })
})

describe('transformToPlottrFile', () => {
  describe('given a scrivener structure from the example hamlet file', () => {
    it('should produce a promise that resolves to a plottr file with corrected ids', async () => {
      const result = await transformToPlottrFile(scrivenerStructure)
      expect(result).toEqual({
        lines: [
          {
            id: 2,
            bookId: 1,
            color: '#78be20',
            title: 'Scenes',
            position: 1,
            characterId: null,
            expanded: null,
            fromTemplateId: null,
            isPinned: false,
          },
          {
            id: 1,
            bookId: 1,
            color: '#6cace4',
            title: 'Summary',
            position: 0,
            characterId: null,
            expanded: null,
            fromTemplateId: null,
            isPinned: false,
          },
        ],
        cards: [
          {
            id: 'BB664270-D5D3-4922-92BA-13828AE114CE',
            lineId: 1,
            beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet learns the truth from the ghost of his father',
            description: '',
            tags: [8, 4, 9, 10, 11, 6, 7],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '885591BE-B2B5-44A3-B963-D7135416F0BF',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
              'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
              '054B7E25-09B2-48D0-8695-5378B311FAC7',
              '13370158-73A7-4AB8-88CB-DEF2C48CDA98',
              'B863E330-D577-446B-84A9-A05CD6EBEA9E',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
            'test 1': [{ type: 'paragraph', children: [{ text: 'some text' }] }],
            'test 2': [
              { type: 'paragraph', children: [{ text: 'some other text' }] },
              { type: 'paragraph', children: [] },
            ],
          },
          {
            id: 'FC30AB95-1AF3-43DF-A33B-8BE3795B931C',
            lineId: 2,
            beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'The guards see a ghost',
            description:
              "Description\n\nAfter a long, cold night on the ramparts guarding Elsinore castle, Bernardo comes to relieve Francisco, and is soon joined by Marcellus. The two of them summon Horatio to join them, because for the past few nights, they have noticed a ghostly apparition walking the ramparts, who they believe to be the ghost of King Hamlet.\nHoratio doesn't want to believe them, until suddenly the Ghost appears before them for a few moments, and then vanishes. He points out how much the ghost looks like the slain King, and says that he believes this to be a bad omen for Denmark, alluding to a possible military incursion that could be led by the Prince of Norway.\nThe Ghost appears again and Horatio tries to talk to it, but it remains silent. He then suggests that they should tell the King's son, Hamlet, about the apparition, because if the ghost is going to speak to anyone, he believes it would be his son.",
            tags: [7, 4, 8],
            characters: [
              'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
              '4077948F-E161-44A5-8940-7072A70AB086',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
              '13370158-73A7-4AB8-88CB-DEF2C48CDA98',
              '054B7E25-09B2-48D0-8695-5378B311FAC7',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'B26986A0-BB55-4693-852F-E29E8245D723',
            lineId: 2,
            beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Claudius makes an announcement & Hamlet laments',
            description:
              "Description\n\nThe following morning, King Claudius makes an announcement that he has married Queen Gertrude, wife of the former King. He says he's done this in an attempt to help the nation heal after losing his leader, because the marriage is something to celebrate. \nHe also shares that the Prince of Norway, Fortinbras, has written to him threatening to invade and take back lands that he feels were stolen by Denmark. Claudius then sends Voltimand and Cornelius to try and convince Fortinbras not to invade. He also agrees with Polonius in allowing Laertes to return to France now that the King's coronation ceremonies are over.\nClaudius then addresses Hamlet, asking why he is still so sad over the loss of his father. He encourages Hamlet to move on, but Hamlet refuses and says he will continue to mourn. Claudius then asks Hamlet to stay in Denmark rather than returning to the University of Wittenberg. Hamlet's mother Gertrude also really wants him to stay, and so he begrudgingly agrees. \nHamlet then has a moment where he laments over having lost his father, his mother deciding to marry his uncle and talks about how he wishes he could die.",
            tags: [7, 8, 6, 9, 4],
            characters: [
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '6228C789-C105-4256-88DF-71F69E707707',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'E9861F65-1263-4095-8099-7BCC5889CEFC',
            lineId: 2,
            beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Laertes leaves for France',
            description:
              "Description\n\nAs Laertes is preparing to depart for France, he has a conversation with his sister, Ophelia. He cautions her about falling for Hamlet because he believes that Hamlet is too far above Ophelia's station for the two of them to ever be a match. \nLaertes then says goodbye to his father, who gives him a some extensive advice for how to live and behave while he is away in France. \nAs Laertes finally leaves, Polonius asks Ophelia what she and her brother talked about. She confesses that it was about Hamlet, and that he claims to love her. Polonius agrees with his son in telling Ophelia that he believes Hamlet to be insincere about his affections, and forbids her from seeing him further. ",
            tags: [8, 6, 7, 4, 9],
            characters: [
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
            ],
            places: [
              'CB6F018B-3282-46D0-86CA-451C24906191',
              '60421213-B12C-42C2-ABC4-F11C676A4659',
            ],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED',
            lineId: 2,
            beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet goes after the ghost of his father',
            description:
              "Description\n\nHamlet waits outside on the castle ramparts with Marcellus and Horatio, hoping to catch a glimpse of the ghost. In the midst of doing so, they hear loud canons and revelry happening, and Hamlet explains it is a Danish custom for the new King. He expresses disdain for it, saying it makes his country look silly to others, and he wishes it would change.\nThen they see the ghost and Hamlet tries calling out to it. When it doesn't answer but beckons Hamlet to follow, Marcellus and Horatio warn him that he shouldn't go. But Hamlet articulates that he doesn't care what happens to him and that if his soul is immortal, he has nothing to fear. \nHoratio and Marcellus talk about how they think this is an ill omen for their country, and they debate briefly about whether or not to follow Hamlet, before deciding that they want to make sure their friend is safe.",
            tags: [8, 4, 12, 11, 10],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
              'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
              '4077948F-E161-44A5-8940-7072A70AB086',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '486CEA94-7A6B-457C-A7E1-5554ED61B9E5',
            lineId: 2,
            beatId: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: "Hamlet speaks with his father's ghost",
            description:
              "Description\n\nHamlet finally gets to speak with the ghost of his father, who tells him that he was murdered by Hamlet's uncle Claudius so that he could steal the crown. He tells him how Claudius snuck into their garden and put poison in his ear.\nThe ghost then asks Hamlet to seek out revenge for his murder. Hamlet is so distraught at learning what's happened and that he was right about his evil uncle all along, that he agrees.\nJust as the ghost fades away, Horatio and Marcellus catch up with Hamlet and ask him what happened. He doesn't tell them, but says that he might have to act like he's going mad, and they have to swear not to tell anyone what they saw. Though confused, they promise to keep his secret.",
            tags: [8, 4, 9, 12, 10],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
              'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
              '4077948F-E161-44A5-8940-7072A70AB086',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'E4C16008-9DFB-4F7E-BE1D-E058E68D29B5',
            lineId: 1,
            beatId: '2A163249-3471-4EE5-9F19-C4B856779C9F',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Members of court meet & conspire',
            description: '',
            tags: [5, 4, 9, 6, 7, 11],
            characters: [
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'B863E330-D577-446B-84A9-A05CD6EBEA9E',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              '6228C789-C105-4256-88DF-71F69E707707',
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'A23C4108-909A-4B0A-A33B-164F66312E2B',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '891D8F60-91D7-4D6B-84A5-763AA42BDA78',
            lineId: 2,
            beatId: '2A163249-3471-4EE5-9F19-C4B856779C9F',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Polonius speaks with Ophelia',
            description:
              'Description\n\nPolonius sends his servant Reynaldo to France to spy on his son Laertes, and commands him to report back with what he finds. As the servant leaves, Ophelia comes in, crying and distraught about an interaction with Hamlet.\nShe tells her father that Hamlet looked "wild eyed" and was breathing heavy, but didn\'t say anything to her. Polonius believes that Hamlet has gone mad because Ophelia was distancing herself from him, so he rushes off to speak with Claudius about it.',
            tags: [6, 8, 4, 11],
            characters: [
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'B863E330-D577-446B-84A9-A05CD6EBEA9E',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'C107CB2E-DBDC-4C41-8C93-8D99C40173F1',
            lineId: 2,
            beatId: '2A163249-3471-4EE5-9F19-C4B856779C9F',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'A busy day at court',
            description:
              "Description\n\nClaudius and Gertrude summon Rosencrantz and Guildenstern, two friends of Hamlet's from when he was at Wittenberg. The King and Queen ask that the two courtiers try to brighten Hamlet's spirits, and in so doing also find out why he has been acting so strangely.\nThen Polonius arrives to tell Claudius that his ambassadors he sent to Norway are back with a reply from the King. They tell him that the King has decided not to attack Denmark, and has given his son an army with which to attack the Poles instead of the Danes. Prince Fortinbras asks only that his armies be allowed to pass through Denmark on their way to Poland, which Claudius agrees to.\nPolonius then tells Claudius that he believes Hamlet has gone made, and pitches a plan for finding out if he has lost his mind because of his love for Ophelia, or if it is for some other reason. \nClaudius and Gertrude leave when they see Hamlet approaching, but Polonius stays to speak with him. Hamlet acts as if he has gone insane and insults Polonius with a number of jabs that have some truth to them.\nWhen Polonious leaves, Rosencrantz and Guildenstern enter and Hamlet seems happy to see them. But quickly their facade of concern crumbles and Hamlet expresses that he knows they have been sent to spy on him. They then tell him that a troupe of players is coming to the castle and that might cheer him up.\nThe players arrive and Hamlet demands they present on the history of Troy. He is very impressed with the speech and says that the following night, he wants them to stage the play The Murder of Gonzago. Once Hamlet is alone again, he expresses how he wishes he could experience the depth of emotion that the actors do. \nHe then devises a plan for bringing down his uncle, in which he plans to stage a play that is similar to how Claudius killed Hamlet's father. If Claudius reacts negatively, Hamlet can consider that proof that he committed the crime.\n\n",
            tags: [5, 11, 6, 7, 4],
            characters: [
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              '6228C789-C105-4256-88DF-71F69E707707',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'A23C4108-909A-4B0A-A33B-164F66312E2B',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'B58EB299-35D0-41FD-ABF1-E3E5618FF28C',
            lineId: 1,
            beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet carries out his plan to prove Claudius guilty',
            description: '',
            tags: [11, 10, 12, 9, 6, 4, 5],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              'B863E330-D577-446B-84A9-A05CD6EBEA9E',
              'A23C4108-909A-4B0A-A33B-164F66312E2B',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '129F3355-D918-4682-A6F0-F031BA866BB8',
            lineId: 2,
            beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet denounces Ophelia',
            description:
              'Description\n\nClaudius and Gertrude ask Rosencrantz and Guildenstern about their encounter with Hamlet, but the two of them tell the King and Queen that they couldn\'t figure it out, and that he seemed in good spirits about the players that arrived. Polonius then arrives and Claudius sends the others away so that they can spy on Hamlet and Ophelia.\nHamlet enters, musing on the futility of live and beauty, delivering his "To be or not to be" soliloquy. Then when he encounters Ophelia, things take a turn for the worse. Ophelia tries to give him back the letters and tokens of affection, and he goes off on Ophelia, in a mad rant, declaring her, and all women and mankind to be worthless. He sways between saying he never loved her and that he always will. Ophelia leaves heartbroken.\nPolonius and Claudius confer and decide that it doesn\'t appear to be Ophelia causing his madness, and the two agree to spy on him again after the play to come that night. Polonius says he will spy on Hamlet interacting with Gertrude to root out the cause of his madness.',
            tags: [5, 9, 4, 11, 10, 6],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'F455435C-F2C7-4592-94B1-EFB7AA9F4527',
            lineId: 2,
            beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Court watches The Murder of Gonzago',
            description:
              "Description\n\nThe court readies for the play, as Hamlet gives the players their parts. He then summons Horatio and tells his friend how highly he thinks of him, and entrusts him with the secret of what the ghost told him. He hopes that Horatio will be able to keep an eye on Claudius to see if he shows any signs of guilt. \nAs everyone enters the room to watch the play, Hamlet starts acting mad once again in front of Polonius, and messes with Ophelia by telling her a lot of erotic puns. The play then begins, and Hamlet comments on it throughout, teasing Ophelia as he goes. \nWhen the play reaches the point where the character poisons the king in the garden, Claudius gets loud, angry, and storms out of the room. Hamlet and Horatio agree that such a reaction was damning. \nAfterwards, Rosencrantz and Guildenstern try again to find out what has been causing him to act crazy, and he gets upset with them. Polonius then enters to escort Hamlet to his mother's chambers, and Hamlet takes a moment to ready himself for the confrontation that's about to ensue.\n",
            tags: [5, 4, 9, 11, 6],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '4077948F-E161-44A5-8940-7072A70AB086',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              'A23C4108-909A-4B0A-A33B-164F66312E2B',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '47F832CE-131E-4E04-9D21-372562C3C4E3',
            lineId: 2,
            beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Claudius prays for forgiveness',
            description:
              "Description\n\nClaudius speaks with Rosencrantz and Guildenstern and instructs them to immediately see to it that Hamlet is taken on a journey to England, because he no longer trusts his nephew's intentions. \nOnce alone, he begins praying and asking for forgiveness for the evils and wrongs he has done, and Hamlet manages to sneak in unnoticed. Hamlet muses about killing his uncle right then and there, but then realizes he doesn't want to kill him when he is doing something good like praying for forgiveness. He vows to strike his uncle when he is doing something dastardly.",
            tags: [5, 4, 9, 13, 6, 11],
            characters: [
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '62BFD421-BC83-4219-8A0B-50FA958F4F0A',
            lineId: 2,
            beatId: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet confronts his mother & kills Polonius',
            description:
              "Description\n\nPolonius tells Queen Gertrude to be harsh with her son in hopes of coaxing out of him the reason for his recent madness. He then hides behind a tapestry while Hamlet enters to confront his mother.\nHamlet chastises his mother for her betrayal in marrying his uncle, and begins violently yelling at her. When he does this, Polonius cries out from behind the tapestry for help, and Hamlet, not knowing who it is, stabs through the tapestry, killing Polonius. \nAs he continues arguing with his mother, the ghost appears once again, but she is unable to see it. Before disappearing, the ghost reminds Hamlet that he must carry out his mission in killing Claudius, and that he should not be as hard on his mother.\nBecause Gertrude cannot see the ghost, Hamlet assures her that he hasn't been actually going mad, it was all a facade, but that the ghost is real. Before dragging away Polonius's body, he tells his mother that while he will go to England with Rosencrantz and Guildenstern, he doesn't trust either of them.",
            tags: [5, 3, 9, 12, 10, 11, 6],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'ACF1C78C-85F1-4188-B26E-AD6E3B4974B8',
            lineId: 1,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet is sent away, but Laertes returns',
            description: '',
            tags: [6, 7, 10, 4, 3, 11, 5, 9],
            characters: [
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              '885591BE-B2B5-44A3-B963-D7135416F0BF',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
            ],
            places: [
              '60421213-B12C-42C2-ABC4-F11C676A4659',
              '1F840806-D9C1-4617-B372-6DEDAA5B5419',
            ],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: "Gertrude tells Claudius of Hamlet's actions",
            description:
              'Description\n\nGertrude runs in on Claudius when he is with Rosencrantz and Guildenstern and asks to speak to him alone. When they leave, she tells him about everything that happened when Hamlet came to see her, namely that her son has killed Polonius. Claudius is immediately afraid that news of this could ruin his plans to rule Denmark, and so he summons back Rosencrantz and Guildenstern, telling them to get Hamlet to England with all haste so that he can find a way to explain everything that happened to the people without making himself look bad.',
            tags: [10, 4, 3, 6, 7],
            characters: [
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'DC6F4DCA-3177-4DBD-A806-44254B0E62AB',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Rosencrantz and Guildenstern confront Hamlet',
            description:
              "Description\n\nRosencrantz and Guildenstern arrive to meet with Hamlet, who has just finished disposing of Polonius's body. He refuses to tell them what he did with the body, but reminds them that Polonius's blood is on Claudius's hands. He then accuses them of being spies for the King, but ultimately agrees to be taken by the two old friends to an audience with his uncle.",
            tags: [5, 4, 3, 11, 6, 7, 10],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '8A0706CE-0D13-452F-85E0-85F5EEED230C',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: "Claudius demands to know where Polonius's body is",
            description:
              "Description\n\nClaudius is seen informing courtiers of the untimely death of Polonius, when Hamlet is brought before him to be confronted. He asks Hamlet where he has placed Polonius's body, but at first, Hamlet refuses to tell him. Hamlet insults him by saying that Claudius could seek him out in heaven, or join him in hell. But ultimately, he tells Claudius that the body has been hidden under the stairs in the palace.\nClaudius then dismisses Hamlet, ordering him to board the ship to England at once, under the supervision of Rosencrantz and Guildenstern. Once they are all gone, Claudius admits that he has sent sealed orders to England to see to it that Hamlet is killed upon his arrival.",
            tags: [4, 11, 6, 7, 3],
            characters: [
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '5F1DA39A-2CA5-47FE-B311-1E74270EC7DA',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet encounters Fortinbras on the way to England',
            description:
              "Description\n\nWhile on his way to the ship that will take him to England, Hamlet runs into Fortinbras and his army. Fortinbras has sent word to the castle to confirm that he and his army may pass through Denmark on the way to attacking Poland, which he explains to Hamlet.\nHamlet asks why they are attacking and Fortinbras explains it is over a small patch of land that he must win back. Hamlet muses on how bloody mankind's appetites are, even for something so insignificant, and then vows to himself that he will be more ruthless in seeking out Claudius for his father's revenge.",
            tags: [3, 4, 7, 10, 9],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '885591BE-B2B5-44A3-B963-D7135416F0BF',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            ],
            places: ['1F840806-D9C1-4617-B372-6DEDAA5B5419'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'D7ED53BA-9B02-4734-93D9-D3E6323C76B6',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Laertes returns from France in a rage',
            description:
              "Description\n\nGertrude is worried about Ophelia, who appears to have gone mad at the loss of her father. Claudius then enters and sees Ophelia acting strange, and informs Gertrude that there are many suspicious whispers around court about what happened to Polonius. He also tells her that Laertes has returned from France, and then right after that, there is a commotion in the castle. \nA guard tells King Claudius that Laertes has arrived and brought with him a small mob, with whom he plans to potentially try and overthrow the castle to become the new king. Laertes enters in a fit of rage about his father's death, and Claudius attempts to calm him down, but to no avail. When Ophelia comes back in, clearly having lost her mind, it only further fans Laertes's anger. But Claudius finally manages to convince Laertes to listen to him and let him explain what happened to Polonius.",
            tags: [3, 10, 11, 6],
            characters: [
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Horatio receives word from Hamlet',
            description:
              'Description\n\nHoratio gets a letter from Hamlet, who lets him know that the ship meant to take him to England was set upon by pirates and he needed to turn back towards Denmark. The sailors bearing the message say they also have messages for Gertrude and Claudius, so they go to see them, before stealing away to find Hamlet in the countryside, not far from the castle.',
            tags: [3, 4, 9, 6],
            characters: [
              '4077948F-E161-44A5-8940-7072A70AB086',
              '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '2EB532B2-49BE-477D-B498-65A696641338',
            lineId: 2,
            beatId: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Claudius and Laertes plan to kill Hamlet',
            description:
              "Description\n\nClaudius finally tells Laertes the truth of what happened between Hamlet and Polonius, and the two determine that Hamlet needs to be taken care of in a way that is not as conspicuous to the people of Denmark. Just then, the sailors and Horatio come to tell the men that Hamlet will be back at the court the next day because of the pirates attacking Hamlet's ship. They then devise to tempt Hamlet into a duel, and Laertes plots to use a sharpened sword that has been dipped in poison, so all he needs to do will be the cut Hamlet quickly and he'll die from the poison. Claudius even proposes a back up plan of giving Hamlet a glass of poisoned wine even if he wins the duel. \n\nAt this point, Gertrude enters to tell them the sad news that Ophelia has fallen into a river and drowned, which further stokes Laertes anger and lust for revenge. He storms from the room, which leaves Claudius feeling uneasy.\n",
            tags: [11, 6, 10, 3, 12],
            characters: [
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: 'A6FF729E-8FDD-4551-8486-770A6084C6CC',
            lineId: 1,
            beatId: '60F2D14C-D834-40C3-AD56-092E1C432341',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'Hamlet meets an untimely end',
            description: '',
            tags: [3, 9, 12, 11, 6, 7, 10],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '885591BE-B2B5-44A3-B963-D7135416F0BF',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
              'CB494EFC-2AEC-44C8-86C3-3C91D1651D6C',
              '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
              'CB2A4035-99C7-4F7F-96E7-956D4EB3A561',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '04027D06-02A1-4488-B9ED-1CA64981044E',
            lineId: 2,
            beatId: '60F2D14C-D834-40C3-AD56-092E1C432341',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: "Hamlet and Horatio witness Ophelia's funeral",
            description:
              "Description\n\nTwo gravediggers are readying Ophela's grave and have an exchange about the nature of death, and talk about how the world will always need gravediggers. Then Hamlet and Horatio arrive and watch them silently for a while, with Hamlet musing about how all men die and eventually become dust.\nThe two approach the gravediggers, asking who it is that will be buried in this particular grave. The diggers dance around the topic before ultimately saying that it was a woman who has died. Hamlet and Horatio then go to hide when they see the funeral procession approaching. \nAmong the mourners are the King and Queen and Laertes, who is visibly upset about the loss of his sister. When Hamlet realizes she is the one that died, he bursts onto the scene, raving about how no one, not even her brother, could ever have loved her as much as he did. He and Laertes begin to fight but are pulled apart by other mourners. Hamlet then storms away with Horatio, and while Laertes initially wants to follow him and kill him then and there, Claudius reminds him to stick to their original plan of the duel.",
            tags: [2, 9, 4, 6, 13, 10],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB494EFC-2AEC-44C8-86C3-3C91D1651D6C',
            ],
            places: ['A8A9721D-3C11-4A7E-A429-E81D97ACFF01'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
          {
            id: '74B99AD9-447B-4968-8351-3CE2A26B090C',
            lineId: 2,
            beatId: '60F2D14C-D834-40C3-AD56-092E1C432341',
            bookId: null,
            positionWithinLine: 0,
            positionInBeat: 0,
            title: 'The duel between Laertes and Hamlet',
            description:
              "Description\n\nBack at Elsinore, Hamlet tells Horatio that he swapped the letter meant to kill him and that instead Rosencrantz and Guildenstern will be killed for their betrayal and siding with Claudius. Then, a courtier named Osric enters and tells Hamlet that Laertes wishes to duel him, and starts singing Laertes's praises. Horatio tries to encourage Hamlet not to fight in the duel, but Hamlet decides to anyway. \nThey are summoned to court for the duel. Hamlet and Laertes hash things out, and while Laertes says he won't forgive him fully, he'll at least accept his apology. The two men recieve the swords they are to use for the duel, and Claudius says if Hamlet gets the first or second hit, he will drink to Hamlet's health and then offer a cup to Hamlet. (which will actually contain poison) Hamlet gets the first strike in, but refuses to drink from the cup. Then when he hits Laertes again, Gertrude gets up to drink from the cup, even though Claudius tries to warn her not to.. But it is too late. She's already done it.\nBefore they fight another round, Laertes muses if he should lay down his sword, but decides not to, and on the third one, Laertes manages to cut Hamlet with the poisoned blade. But as they continue to fight, their swords accidentally get mixed up and Hamlet ends up cutting and thus poisoning Laertes. Queen Gertrude proclaims the wine was poisoned and dies, just as Laertes admits the sword was also poisoned, and that is was Claudius's idea for both. Laertes dies too, but not before saying he forgives Hamlet. Hamlet then takes up the poisoned sword and at last, kills his uncle by running Claudius through with the blade and forcing him to drink the last of the poison that killed his wife.\nAs Fortinbras arrives at the castle, Hamlet clings to Horatio, asking his friend not to die by suicide, but to live on and tell the story of what happened there. He also asks the Fortinbras be made the new king of Denmark. Horatio vows to tell his story, just as Fortinbras enters and asks that Hamlet be given a soldier's send off. ",
            tags: [1, 9, 12, 7, 6, 10, 11],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '4077948F-E161-44A5-8940-7072A70AB086',
              'CB2A4035-99C7-4F7F-96E7-956D4EB3A561',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '885591BE-B2B5-44A3-B963-D7135416F0BF',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            templates: [],
            imageId: null,
            fromTemplateId: null,
            color: null,
          },
        ],
        beats: {
          1: {
            children: {
              null: [
                'EBCC7260-3D24-432D-A02C-B3456D1D8569',
                '2A163249-3471-4EE5-9F19-C4B856779C9F',
                '619FDFDB-4AC9-4710-9209-8C952ACE8651',
                '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
                '60F2D14C-D834-40C3-AD56-092E1C432341',
              ],
              'EBCC7260-3D24-432D-A02C-B3456D1D8569': [],
              '2A163249-3471-4EE5-9F19-C4B856779C9F': [],
              '619FDFDB-4AC9-4710-9209-8C952ACE8651': [],
              '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3': [],
              '60F2D14C-D834-40C3-AD56-092E1C432341': [],
            },
            heap: {
              'EBCC7260-3D24-432D-A02C-B3456D1D8569': null,
              '2A163249-3471-4EE5-9F19-C4B856779C9F': null,
              '619FDFDB-4AC9-4710-9209-8C952ACE8651': null,
              '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3': null,
              '60F2D14C-D834-40C3-AD56-092E1C432341': null,
            },
            index: {
              'EBCC7260-3D24-432D-A02C-B3456D1D8569': {
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                id: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
                position: 0,
                time: 0,
                title: 'Act 1',
                expanded: true,
              },
              '2A163249-3471-4EE5-9F19-C4B856779C9F': {
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                id: '2A163249-3471-4EE5-9F19-C4B856779C9F',
                position: 1,
                time: 0,
                title: 'Act 2',
                expanded: true,
              },
              '619FDFDB-4AC9-4710-9209-8C952ACE8651': {
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                id: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
                position: 2,
                time: 0,
                title: 'Act 3',
                expanded: true,
              },
              '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3': {
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                id: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
                position: 3,
                time: 0,
                title: 'Act 4',
                expanded: true,
              },
              '60F2D14C-D834-40C3-AD56-092E1C432341': {
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                id: '60F2D14C-D834-40C3-AD56-092E1C432341',
                position: 4,
                time: 0,
                title: 'Act 5',
                expanded: true,
              },
            },
          },
          series: { children: { null: [] }, heap: {}, index: {} },
        },
        notes: [
          {
            id: 'A6810C7C-D7C2-4B5F-98D6-5DC60EA84678',
            title: 'Character Chart',
            content: [
              { type: 'paragraph', children: [{ text: 'From  character chart & worksheet. ' }] },
            ],
            categoryId: null,
            tags: [8, 5, 3, 2, 1],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
              '885591BE-B2B5-44A3-B963-D7135416F0BF',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
              'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
              'CB2A4035-99C7-4F7F-96E7-956D4EB3A561',
              '6228C789-C105-4256-88DF-71F69E707707',
              'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
              '13370158-73A7-4AB8-88CB-DEF2C48CDA98',
              'B863E330-D577-446B-84A9-A05CD6EBEA9E',
              '054B7E25-09B2-48D0-8695-5378B311FAC7',
              'A23C4108-909A-4B0A-A33B-164F66312E2B',
              '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
              'CB494EFC-2AEC-44C8-86C3-3C91D1651D6C',
            ],
            places: [
              '60421213-B12C-42C2-ABC4-F11C676A4659',
              '1F840806-D9C1-4617-B372-6DEDAA5B5419',
              'A8A9721D-3C11-4A7E-A429-E81D97ACFF01',
            ],
            lastEdited: null,
            templates: [],
            imageId: null,
            bookIds: [],
            position: 0,
            'note custom attribute 2': [
              { type: 'paragraph', children: [{ text: "here's some more content" }] },
              { type: 'paragraph', children: [] },
            ],
            category: 1,
          },
          {
            id: 'FC73208C-777D-4598-9A90-E6220D82F723',
            title: 'Death in Hamlet',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This infographic, which , maps out the deaths in Hamlet, where they happen in the story, and their meaning. It also unpacks themes, character motivations, and more.',
                  },
                ],
              },
              { type: 'paragraph', children: [] },
            ],
            categoryId: null,
            tags: [9, 12, 4, 11, 6],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
            ],
            places: [
              '60421213-B12C-42C2-ABC4-F11C676A4659',
              'A8A9721D-3C11-4A7E-A429-E81D97ACFF01',
            ],
            lastEdited: null,
            templates: [],
            imageId: null,
            bookIds: [],
            position: 0,
            category: null,
          },
          {
            id: '0C127336-5C69-4895-8827-9C76338E5C30',
            title: 'Thematic Ideas',
            content: [
              {
                type: 'paragraph',
                children: [
                  { text: ' ', isBold: true },
                  {
                    text: 'unpacks the main themes of the play, as well as digs deeper into some of the more subtle themes. These include...',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  { type: 'paragraph', children: [] },
                  { type: 'paragraph', children: [{ text: '•\tMadness ' }] },
                ],
              },
              { type: 'paragraph', children: [{ text: '•\tRevenge ' }] },
              { type: 'paragraph', children: [{ text: '•\tReligion ' }] },
              { type: 'paragraph', children: [{ text: '•\tSubversion of Relationships ' }] },
              { type: 'paragraph', children: [{ text: '•\tDelay ' }] },
              { type: 'paragraph', children: [{ text: '•\tHonor ' }] },
              { type: 'paragraph', children: [{ text: '•\tAmbiguity of Language ' }] },
              { type: 'paragraph', children: [{ text: '•\tHuman Beings ' }] },
              { type: 'paragraph', children: [{ text: '•\tPolitical Intrigues ' }] },
              { type: 'paragraph', children: [{ text: '•\tSuicide ' }] },
              {
                type: 'paragraph',
                children: [{ text: 'This  also digs more into the complicated themes in Hamlet.' }],
              },
            ],
            categoryId: null,
            tags: [4, 9, 10, 11, 13, 6, 7],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              'CED21C2D-8F73-42C9-91B6-C353E401C48E',
              '4077948F-E161-44A5-8940-7072A70AB086',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'CB68062B-A25C-4BF2-8010-04FC3764AB13',
            ],
            places: [
              '60421213-B12C-42C2-ABC4-F11C676A4659',
              'A8A9721D-3C11-4A7E-A429-E81D97ACFF01',
              '1F840806-D9C1-4617-B372-6DEDAA5B5419',
            ],
            lastEdited: null,
            templates: [],
            imageId: null,
            bookIds: [],
            position: 0,
            category: null,
          },
          {
            id: 'FAB99F63-79EF-44A1-B63E-D71822853051',
            title: 'Character Sketches',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This infographic () breaks down five of the key figures in Hamlet: Ophelia, King Hamlet, Claudius, Gertrude, and Prince Hamlet himself.',
                  },
                ],
              },
            ],
            categoryId: null,
            tags: [12, 4, 9, 10, 6],
            characters: [
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
              '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
              '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
              '51E5A516-5FA4-4D15-9BAE-13F92F238307',
              'BF678077-63C1-4034-AC2B-7696A04B450A',
            ],
            places: ['60421213-B12C-42C2-ABC4-F11C676A4659'],
            lastEdited: null,
            templates: [],
            imageId: null,
            bookIds: [],
            position: 0,
            category: 2,
          },
        ],
        characters: [
          {
            id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
            name: 'Hamlet',
            description: 'Prince of Denmark',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The title character, Hamlet is the 30 year old Prince of Denmark, nephew to King Claudius, and son of Queen Gertrude. He hates his uncle and resents his mother. Studied at the University of Wittenberg, he is a thoughtful and melancholy individual, but who often makes impulsive, rash decisions. ',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 5, 3, 2, 1, 9, 10, 11, 12],
            categoryId: 1,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 1, id: 1 },
              { bookId: 'all', value: 'Prince of Denmark', id: 2 },
              { bookId: 'all', value: [8, 5, 3, 2, 1, 9, 10, 11, 12], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The title character, Hamlet is the 30 year old Prince of Denmark, nephew to King Claudius, and son of Queen Gertrude. He hates his uncle and resents his mother. Studied at the University of Wittenberg, he is a thoughtful and melancholy individual, but who often makes impulsive, rash decisions. ',
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Protagonist' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: "Hamlet seeks to get revenge for his father's death" }],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Too melancholy, acts before thinking it through' }],
                  },
                ],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Wants to take his own life AND get revenge for his father's murder",
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Cut with a poisoned sword in a duel with Laertes' }],
                  },
                ],
                bookId: 'all',
                id: 10,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 11,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 12,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: '5D0E8F68-07E7-4BAC-BF3A-67C025B1AA0D',
            name: 'Claudius',
            description: 'King of Denmark',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [12, 8, 5, 3, 2, 1, 13, 6],
            categoryId: 1,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 1, id: 1 },
              { bookId: 'all', value: 'King of Denmark', id: 2 },
              { bookId: 'all', value: [12, 8, 5, 3, 2, 1, 13, 6], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Claudius is Hamlet's uncle, and the King of Denmark who dethroned the former King and married his wife, Gertrude. He's the villain, who is calculating and conniving and will do whatever it takes to get ahead.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Antagonist' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'He wants to be ruler of Denmark so much that he would do anything to get and keep that position',
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Power hungry' }] }],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: "Regrets over marrying his brother's wife" }],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Killed with a poisonous sword & goblet by Hamlet' }],
                  },
                ],
                bookId: 'all',
                id: 10,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 11 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 12,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: '4C1AAD33-C8EF-4C9C-8824-9C4C74C433D8',
            name: 'Gertrude',
            description: 'The Queen of Denmark',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Queen of Denmark, wife of Claudius, and mother of Hamlet. While she loves her son very much, her desperation and need for affection leads her to behave selfishly. Has a very gray moral compass.',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [12, 5, 3, 8, 2, 6],
            categoryId: 1,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 1, id: 1 },
              { bookId: 'all', value: 'The Queen of Denmark', id: 2 },
              { bookId: 'all', value: [12, 5, 3, 8, 2, 6], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The Queen of Denmark, wife of Claudius, and mother of Hamlet. While she loves her son very much, her desperation and need for affection leads her to behave selfishly. Has a very gray moral compass.',
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [
                  { type: 'paragraph', children: [{ text: 'Self-preservation at all costs' }] },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Female' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Selfish' }] }],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Doesn't want to give up her own comfort, but also feels she did wrong by her first husband",
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Poisoned wine from Claudius' }] }],
                bookId: 'all',
                id: 10,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 11 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 12,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: 'CED21C2D-8F73-42C9-91B6-C353E401C48E',
            name: 'Polonius',
            description: 'Lord Chamberlin',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Serves as Claudius's Lord Chamberlin at court, and is the father of Ophelia and Laertes. ",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 5, 3, 12, 6, 11, 4],
            categoryId: 2,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 2, id: 1 },
              { bookId: 'all', value: 'Lord Chamberlin', id: 2 },
              { bookId: 'all', value: [8, 5, 3, 12, 6, 11, 4], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Serves as Claudius's Lord Chamberlin at court, and is the father of Ophelia and Laertes. ",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Supporting' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'To keep his daughter and country safe' }],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Too eager to destroy Hamlet' }] }],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Wants his daughter safe from Hamlet' }],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Stabbed by Hamlet when hiding behind a tapestry' }],
                  },
                ],
                bookId: 'all',
                id: 10,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 11 },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 12 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: '4077948F-E161-44A5-8940-7072A70AB086',
            name: 'Horatio',
            description: "Hamlet's best friend",
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Hamlet's best friend who studied with him at Wittenberg. He's a loyal person who aids Hamlet many times during the play. He is the one who lives to tell Hamlet's story.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 5, 3, 2, 1, 9],
            categoryId: 2,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 2, id: 1 },
              { bookId: 'all', value: "Hamlet's best friend", id: 2 },
              { bookId: 'all', value: [8, 5, 3, 2, 1, 9], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Hamlet's best friend who studied with him at Wittenberg. He's a loyal person who aids Hamlet many times during the play. He is the one who lives to tell Hamlet's story.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Supporting character' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'To be a loyal friend and a good countrymen' }],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'n/a' }] }], bookId: 'all', id: 8 },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Wants to do what is best for Denmark' }],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'n/a' }] }],
                bookId: 'all',
                id: 10,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 11,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 12 },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: '51E5A516-5FA4-4D15-9BAE-13F92F238307',
            name: 'Ophelia',
            description: "Hamlet's love interest",
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Ophelia is the daughter of Polonius, sister to Laertes, and the woman that Hamlet is in love with. She's a sweet girl but who depends on the men around her to tell her what to do, and ultimately, it leads to her untimely death. She eventually goes mad and dies by falling in a river.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [9, 11, 12, 8, 5, 3, 10],
            categoryId: 2,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 2, id: 1 },
              { bookId: 'all', value: "Hamlet's love interest", id: 2 },
              { bookId: 'all', value: [9, 11, 12, 8, 5, 3, 10], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Ophelia is the daughter of Polonius, sister to Laertes, and the woman that Hamlet is in love with. She's a sweet girl but who depends on the men around her to tell her what to do, and ultimately, it leads to her untimely death. She eventually goes mad and dies by falling in a river.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [
                  { type: 'paragraph', children: [{ text: 'Be a good daughter and sister' }] },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Female' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Relies too much on others' }] }],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: "Wants to be with Hamlet, but doesn't want to defy her father" },
                    ],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  { type: 'paragraph', children: [{ text: 'Falls into a river and drowns' }] },
                ],
                bookId: 'all',
                id: 10,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 11 },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 12 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: 'CB68062B-A25C-4BF2-8010-04FC3764AB13',
            name: 'Laertes',
            description: "Ophelia's brother",
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Son of Polonius and brother to Ophelia, Laertes spends the majority of the play away in France. He's quick to act, and serves as a foil to Hamlet who overthinks everything.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 3, 2, 1, 4, 10, 12],
            categoryId: 1,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 1, id: 1 },
              { bookId: 'all', value: "Ophelia's brother", id: 2 },
              { bookId: 'all', value: [8, 3, 2, 1, 4, 10, 12], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Son of Polonius and brother to Ophelia, Laertes spends the majority of the play away in France. He's quick to act, and serves as a foil to Hamlet who overthinks everything.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Antagonist' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'To study in Paris, and then to get revenge for his father' },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Wants revenge so much it leads to his own undoing' }],
                  },
                ],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'Wants revenge for his father, but regrets hurting Hamlet to do it' },
                    ],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Stabbed in a duel with his own poisoned sword by Hamlet' }],
                  },
                ],
                bookId: 'all',
                id: 10,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 11 },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 12 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: '885591BE-B2B5-44A3-B963-D7135416F0BF',
            name: 'Fortinbras',
            description: 'The Prince of Norway',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Son of King Fortinbras of Norway. He wants to attack Denmark to avenge his father, who Hamlet's father killed. ",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [4, 5, 1, 10, 7],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'The Prince of Norway', id: 2 },
              { bookId: 'all', value: [4, 5, 1, 10, 7], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Son of King Fortinbras of Norway. He wants to attack Denmark to avenge his father, who Hamlet's father killed. ",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Antagonist' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'To avenge his own father and take back the plot of land that was stolen from his country.',
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Wants to get back his plot of land, but is willing to negotiate with the Danes to get it.',
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: 'BF678077-63C1-4034-AC2B-7696A04B450A',
            name: 'The Ghost',
            description: "The ghost of Hamlet's father",
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The ghost of Hamlet's father who returns to tell his son that he was murdered by Claudius so that Claudius could assume the throne. He wants Hamlet to avenge him. The character is ambiguous—Hamlet wonders if the ghost is a demon trying to deceive him—and there is no definitive resolution in the play to what causes the ghost to appear.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 2, 4, 9, 10, 13, 6, 7, 12],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: "The ghost of Hamlet's father", id: 2 },
              { bookId: 'all', value: [8, 2, 4, 9, 10, 13, 6, 7, 12], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "The ghost of Hamlet's father who returns to tell his son that he was murdered by Claudius so that Claudius could assume the throne. He wants Hamlet to avenge him. The character is ambiguous—Hamlet wonders if the ghost is a demon trying to deceive him—and there is no definitive resolution in the play to what causes the ghost to appear.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: "Protagonist's Father" }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'To warn his son of the fact that his uncle murdered him, and to challenge him to seek vengence for his death.',
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Too trusting of his brother' }] }],
                bookId: 'all',
                id: 8,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Wants his son to kill his brother to restore his honor' }],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Poisoned in the ear while sleeping in a garden' }],
                  },
                ],
                bookId: 'all',
                id: 10,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: 'BD9B46FC-A226-4FFB-ABAD-8F192EBD2AE9',
            name: 'Rosencrantz and Guildenstern',
            description: 'Two courtiers',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "These two courtiers are always seen together, and were friends of Hamlet's when he was at Wittenberg. Claudius and Gertrude task the two of them with spying on Hamlet who has been behaving strangely. ",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [5, 3, 2, 12, 6],
            categoryId: 2,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 2, id: 1 },
              { bookId: 'all', value: 'Two courtiers', id: 2 },
              { bookId: 'all', value: [5, 3, 2, 12, 6], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "These two courtiers are always seen together, and were friends of Hamlet's when he was at Wittenberg. Claudius and Gertrude task the two of them with spying on Hamlet who has been behaving strangely. ",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Antagonists' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'To find out what is wrong with Hamlet' }],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "Want to do their King's bidding, but don't want to betray their friend.",
                      },
                    ],
                  },
                ],
                bookId: 'all',
                id: 9,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: "Killed by English ambassadors at Hamlet's decree" }],
                  },
                ],
                bookId: 'all',
                id: 10,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 11,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 12 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Yes' }] }],
                bookId: 'all',
                id: 13,
              },
            ],
          },
          {
            id: 'CB2A4035-99C7-4F7F-96E7-956D4EB3A561',
            name: 'Osric',
            description: 'A courtier',
            notes: [
              {
                type: 'paragraph',
                children: [
                  { text: 'The courtier who summons Hamlet when he has to duel Laertes.' },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [1, 9, 11, 6],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'A courtier', id: 2 },
              { bookId: 'all', value: [1, 9, 11, 6], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'The courtier who summons Hamlet when he has to duel Laertes.' },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: '6228C789-C105-4256-88DF-71F69E707707',
            name: 'Voltimand and Cornelius',
            description: 'Courtiers',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The two courtiers that Claudius sends to Norway so they can try and persuade Fortinbras not to attack Denmark.',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [5, 8, 7, 4],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'Courtiers', id: 2 },
              { bookId: 'all', value: [5, 8, 7, 4], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The two courtiers that Claudius sends to Norway so they can try and persuade Fortinbras not to attack Denmark.',
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extras' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'To deliver a message to Norway from one king to another.' },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: 'EA4D8C8B-5E7D-4AF2-9F06-6772E4BA19B3',
            name: 'Marcellus',
            description: 'A palace guard',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 5, 11, 7],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'A palace guard', id: 2 },
              { bookId: 'all', value: [8, 5, 11, 7], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extra' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'To protect Elsinore castle.' }] }],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: '13370158-73A7-4AB8-88CB-DEF2C48CDA98',
            name: 'Francisco',
            description: 'An Elsinore guardd',
            notes: '',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 4, 11],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'An Elsinore guardd', id: 2 },
              { bookId: 'all', value: [8, 4, 11], id: 3 },
              { bookId: 'all', value: '', id: 4 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extra' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Protect Elsinore castle.' }] }],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: 'B863E330-D577-446B-84A9-A05CD6EBEA9E',
            name: 'Reynaldo',
            description: "Polonius's servant",
            notes: [
              {
                type: 'paragraph',
                children: [
                  { text: 'A servant to Polonius who is sent to France to spy on Laertes.' },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [5, 4, 6, 7],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: "Polonius's servant", id: 2 },
              { bookId: 'all', value: [5, 4, 6, 7], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'A servant to Polonius who is sent to France to spy on Laertes.' },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extra' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: "To do his master's bidding in fetching his son back from France." },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: '054B7E25-09B2-48D0-8695-5378B311FAC7',
            name: 'Bernardo',
            description: 'A palace guard',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [8, 5, 4, 11, 7],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'A palace guard', id: 2 },
              { bookId: 'all', value: [8, 5, 4, 11, 7], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "One of the two guards who see the ghost of Hamlet's father walking around Elsinore castle, and who ask Horatio if he sees the ghost too.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extra' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'To protect Elsinore castle.' }] }],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: 'A23C4108-909A-4B0A-A33B-164F66312E2B',
            name: 'The Players',
            description: 'The theater troupe',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The theater troupe that passes through town and delivers speeches about Troy and puts on the play The Murder of Gonzago.',
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [5, 3, 4, 9, 10, 6],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'The theater troupe', id: 2 },
              { bookId: 'all', value: [5, 3, 4, 9, 10, 6], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The theater troupe that passes through town and delivers speeches about Troy and puts on the play The Murder of Gonzago.',
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extras' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'To put on a play for the royal court of Denmark.' }],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: '4C00D327-ABE2-4F96-AEF3-7BD9FB69BCE9',
            name: 'Sailors',
            description: 'A pair of sailors sent by Hamlet',
            notes: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: "They carry a message from Hamlet to Horatio and the King and Queen after Hamlet's ship is set upon by pirates.",
                  },
                ],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [2, 4, 10],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: 'A pair of sailors sent by Hamlet', id: 2 },
              { bookId: 'all', value: [2, 4, 10], id: 3 },
              {
                bookId: 'all',
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: "They carry a message from Hamlet to Horatio and the King and Queen after Hamlet's ship is set upon by pirates.",
                      },
                    ],
                  },
                ],
                id: 4,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extra' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'To deliver a message from Hamlet to those at Elsinore Castle.' },
                    ],
                  },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
          {
            id: 'CB494EFC-2AEC-44C8-86C3-3C91D1651D6C',
            name: 'Gravediggers',
            description: "Two gravediggers who dig Ophelia's grave",
            notes: '',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [1, 4, 9, 13],
            categoryId: 3,
            imageId: null,
            bookIds: [],
            position: 0,
            attributes: [
              { bookId: 'all', value: 3, id: 1 },
              { bookId: 'all', value: "Two gravediggers who dig Ophelia's grave", id: 2 },
              { bookId: 'all', value: [1, 4, 9, 13], id: 3 },
              { bookId: 'all', value: '', id: 4 },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Extras' }] }],
                bookId: 'all',
                id: 5,
              },
              {
                value: [
                  { type: 'paragraph', children: [{ text: 'Dig the grave to bury Ophelia in.' }] },
                ],
                bookId: 'all',
                id: 6,
              },
              {
                value: [{ type: 'paragraph', children: [{ text: 'Male' }] }],
                bookId: 'all',
                id: 7,
              },
              { value: [{ type: 'paragraph', children: [{ text: 'No' }] }], bookId: 'all', id: 13 },
            ],
          },
        ],
        places: [
          {
            id: '60421213-B12C-42C2-ABC4-F11C676A4659',
            name: 'Elsinore Castle',
            description: 'The Denmark palace',
            notes: [
              {
                type: 'paragraph',
                children: [{ text: 'Where most of the action takes place in the story.' }],
              },
            ],
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [1, 2, 3, 4],
            imageId: null,
            bookIds: [],
            position: 0,
            categoryId: 1,
          },
          {
            id: '1F840806-D9C1-4617-B372-6DEDAA5B5419',
            name: 'Field in Denmark',
            description: 'Where Hamlet encounters Fortinbras',
            notes: '',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            position: 0,
            categoryId: 2,
          },
          {
            id: 'CB6F018B-3282-46D0-86CA-451C24906191',
            name: 'France',
            description: 'Where Laertes spends part of the play',
            notes: '',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            position: 0,
            categoryId: null,
          },
          {
            id: 'A8A9721D-3C11-4A7E-A429-E81D97ACFF01',
            name: 'Graveyard',
            description: 'The graveyard where Ophelia is buried',
            notes: '',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [5, 6, 7],
            imageId: null,
            bookIds: [],
            position: 0,
            categoryId: null,
          },
          {
            id: '725659E7-A752-4D93-B392-118D8AD7936E',
            name: 'Univerisity of Wittenberg',
            description: "Hamlet & Horatio's university",
            notes: '',
            color: null,
            cards: [],
            noteIds: [],
            templates: [],
            tags: [],
            imageId: null,
            bookIds: [],
            position: 0,
            categoryId: null,
          },
        ],
        tags: [
          { id: 1, title: 'STAGE: Resolution', color: '#6cace4' },
          { id: 2, title: 'STAGE: Falling Action', color: '#78be20' },
          { id: 3, title: 'STAGE: Climax', color: '#e5554f' },
          { id: 4, title: 'Foreshadowing', color: '#ff7f32' },
          { id: 5, title: 'STAGE: Rising Action', color: '#ffc72c' },
          { id: 6, title: 'THEME: Corruption', color: '#0b1117' },
          { id: 7, title: 'THEME: Health of the Nation', color: '#6cace4' },
          { id: 8, title: 'STAGE: Exposition', color: '#78be20' },
          { id: 9, title: 'THEME: Mortality', color: '#e5554f' },
          { id: 10, title: 'THEME: Revenge', color: '#ff7f32' },
          { id: 11, title: 'THEME: Madness', color: '#ffc72c' },
          { id: 12, title: 'Character Death', color: '#0b1117' },
          { id: 13, title: 'THEME: Religion', color: '#6cace4' },
        ],
        categories: {
          characters: [
            { id: 1, name: 'Main', position: 0, type: 'text' },
            { id: 2, name: 'Supporting', position: 1, type: 'text' },
            { id: 3, name: 'Other', position: 2, type: 'text' },
          ],
          places: [
            { id: 1, name: 'Main', position: 0, type: 'text' },
            { id: 2, name: 'Other', position: 1, type: 'text' },
          ],
          notes: [
            { id: 1, name: 'Main', position: 0, type: 'text' },
            { id: 2, name: 'Other', position: 1, type: 'text' },
          ],
          tags: [],
        },
        attributes: {
          characters: [
            { name: 'category', type: 'base-attribute', id: 1 },
            { name: 'shortDescription', type: 'base-attribute', id: 2 },
            { name: 'tags', type: 'base-attribute', id: 3 },
            { name: 'description', type: 'base-attribute', id: 4 },
            { name: 'Role', type: 'paragraph', id: 5 },
            { name: 'Motivation', type: 'paragraph', id: 6 },
            { name: 'Gender', type: 'paragraph', id: 7 },
            { name: 'Fatal Flaws', type: 'paragraph', id: 8 },
            { name: 'Inner Conflict', type: 'paragraph', id: 9 },
            { name: 'How They Die', type: 'paragraph', id: 10 },
            { name: 'Attended Wittenberg', type: 'paragraph', id: 11 },
            { name: 'Royal Family Member', type: 'paragraph', id: 12 },
            { name: 'Characters That Die', type: 'paragraph', id: 13 },
          ],
        },
      })
    })
  })
  describe('given a scrivener structure that it failed to import', () => {
    const failingStructure = {
      cards: [
        {
          id: '1AA77D7E-F025-4715-974E-BE92BE347A1A',
          title: 'Exposition',
          data: [],
          kind: 'Folder',
          children: [
            {
              id: 'A413F0CE-0B8A-4DAC-8AC0-F9796C106F6C',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'She knocks on the door and walks right in when nobody answers.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/A413F0CE-0B8A-4DAC-8AC0-F9796C106F6C/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 1',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'places',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Forest',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Trust, Status: To Do',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 1',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/A413F0CE-0B8A-4DAC-8AC0-F9796C106F6C/notes.rtf',
                },
              ],
              title: 'Goldilocks takes a walk in the forest and finds a cottage',
            },
          ],
        },
        {
          id: '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20',
          title: 'Rising Action',
          data: [],
          kind: 'Folder',
          children: [
            {
              id: 'D4616BC5-8BBF-4C67-901E-FA1837FA48D9',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks is hungry.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/D4616BC5-8BBF-4C67-901E-FA1837FA48D9/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 1',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'places',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Bear Cottage',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Greed, Item: Porridge',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 1',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/D4616BC5-8BBF-4C67-901E-FA1837FA48D9/notes.rtf',
                },
              ],
              title: 'Goldilocks enters and finds three bowls of porridge',
            },
            {
              id: '2E1C52EE-C664-43DA-9E88-FB1ED0DE14EE',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'The first bowl is too hot. ',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'The second bowl is too cold.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'The third bowl is just right!',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/2E1C52EE-C664-43DA-9E88-FB1ED0DE14EE/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 2',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Greed, Item: Porridge',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 2',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/2E1C52EE-C664-43DA-9E88-FB1ED0DE14EE/notes.rtf',
                },
              ],
              title: 'She tries each bowl until she finds the right one',
            },
            {
              id: '85F5A315-BDE4-4DF4-802E-2714DBA9D805',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Tired, Golidocks decides to sit on a chair...',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'The first chair is too big. ',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'The second chair is also too big.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'The third (and smallest) chair is just right!',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'But as she sits on the chair, it breaks into pieces.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/85F5A315-BDE4-4DF4-802E-2714DBA9D805/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 3',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'places',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Bear Cottage',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Greed, Item: Chair',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 3',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/85F5A315-BDE4-4DF4-802E-2714DBA9D805/notes.rtf',
                },
              ],
              title: 'She tries three chairs until she finds the right one',
            },
          ],
        },
        {
          id: 'A6D820B7-35AC-4B54-9919-D4A6FE640B8C',
          title: 'Climax',
          data: [],
          kind: 'Folder',
          children: [
            {
              id: 'EAF5D5D4-E71A-4BEA-82EE-ED8C467AF865',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'They are not pleased by what they discover.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/EAF5D5D4-E71A-4BEA-82EE-ED8C467AF865/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 1',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks, Mama Bear, Papa Bear, Baby Bear',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'places',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Bear Cottage',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Stranger Danger',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 1',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/EAF5D5D4-E71A-4BEA-82EE-ED8C467AF865/notes.rtf',
                },
              ],
              title: 'The three bears come home',
            },
            {
              id: 'CE14D6B6-6F03-4A68-9095-36F6BFD01F17',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/CE14D6B6-6F03-4A68-9095-36F6BFD01F17/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 3',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'tags',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Item: Chair, Theme: Stranger Danger',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 3',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/CE14D6B6-6F03-4A68-9095-36F6BFD01F17/notes.rtf',
                },
              ],
              title: 'They discover their chairs have been used',
            },
            {
              id: '1AE7ED86-FD70-4716-A3FD-1304EECDC6BE',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/1AE7ED86-FD70-4716-A3FD-1304EECDC6BE/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 2',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'tags',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Item: Porridge, Theme: Stranger Danger',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 2',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/1AE7ED86-FD70-4716-A3FD-1304EECDC6BE/notes.rtf',
                },
              ],
              title: 'They discover their porridge has been eaten',
            },
          ],
        },
        {
          id: '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D',
          title: 'Falling Action',
          data: [],
          kind: 'Folder',
          children: [
            {
              id: '7C3F35D8-B87E-4033-862A-57AB4BC38D05',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'She sees the bears, screams for help, and runs out of the room.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/7C3F35D8-B87E-4033-862A-57AB4BC38D05/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 1',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks, Baby Bear, Mama Bear, Papa Bear',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'places',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Bear Cottage',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Stranger Danger',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 1',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/7C3F35D8-B87E-4033-862A-57AB4BC38D05/notes.rtf',
                },
              ],
              title: "Goldilocks wakes up to realize she's in the bears' home",
            },
          ],
        },
        {
          id: 'BEF98F2E-89E7-4FAF-8B33-942A5413B499',
          title: 'Resolution',
          data: [],
          kind: 'Folder',
          children: [
            {
              id: '4C3D7D73-C238-4726-973B-11A4BD03F788',
              kind: 'Text',
              data: [
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'She runs out the door, into the forest.',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/4C3D7D73-C238-4726-973B-11A4BD03F788/content.rtf',
                },
                {
                  data: () =>
                    Promise.resolve([
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'Plotline: Scene 1',
                              },
                            ],
                          },
                          {
                            type: 'paragraph',
                            children: [],
                          },
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'characters',
                                isBold: true,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'places',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Bear Cottage, Forest',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'tags',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Stranger Danger, Status: Completed',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'plotline',
                            isBold: true,
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Scene 1',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                    ]),
                  fullPath:
                    '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/4C3D7D73-C238-4726-973B-11A4BD03F788/notes.rtf',
                },
              ],
              title: 'Goldilocks runs away, never to return again',
            },
          ],
        },
      ],
      characters: [
        {
          id: '0536DA6D-124E-4933-AAFE-32905A834AC2',
          title: 'Goldilocks',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Goldilocks',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Species',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Human',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Notes',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Category',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Main',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/0536DA6D-124E-4933-AAFE-32905A834AC2/content.rtf',
            },
          ],
        },
        {
          id: '1386766B-0321-4EA3-A0F2-1A0D096401C2',
          title: 'Baby Bear',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Baby Bear',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Species',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Notes',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Category',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Main',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/1386766B-0321-4EA3-A0F2-1A0D096401C2/content.rtf',
            },
          ],
        },
        {
          id: '7723D310-CC87-4791-96E1-02A41498E9F8',
          title: 'Papa Bear',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Papa Bear',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Species',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Notes',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Category',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Supporting',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/7723D310-CC87-4791-96E1-02A41498E9F8/content.rtf',
            },
          ],
        },
        {
          id: '682D1995-3A0A-4B8A-A945-BE1361A0CFDE',
          title: 'Mama Bear',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Mama Bear',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Species',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Notes',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Category',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Supporting',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/682D1995-3A0A-4B8A-A945-BE1361A0CFDE/content.rtf',
            },
          ],
        },
      ],
      places: [
        {
          id: '823B0522-4AF8-4A60-89D3-AEEC6798F538',
          title: 'Bear Cottage',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Bear Cottage',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Where the bears live',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Notes',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'The home Goldilocks enters',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/823B0522-4AF8-4A60-89D3-AEEC6798F538/content.rtf',
            },
          ],
        },
        {
          id: '1337A3AE-5C09-4760-8712-E0F8049294E0',
          title: 'Forest',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Forest',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Description',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Surrounds the bear cottage',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Notes',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/1337A3AE-5C09-4760-8712-E0F8049294E0/content.rtf',
            },
          ],
        },
      ],
      notes: [
        {
          id: '665E1852-1C38-4A5D-A2E4-F9F546A322B6',
          title: 'Rule of Threes',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Rule of Threes',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Content',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '•\tThree bears ',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tThree bowls of porridge ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tThree chairs ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tThree beds  ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tThree indiscretions  ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Status: Completed',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/665E1852-1C38-4A5D-A2E4-F9F546A322B6/content.rtf',
            },
          ],
        },
        {
          id: '200D8428-4DD4-487E-929B-6106D31C8645',
          title: 'Theme: Trust',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Trust',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Content',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '•\tThe bears leave their door unlocked, trusting no one will enter.  ',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tGoldilocks breaks their trust and runs away before she has to suffer repercussions.  ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Theme: Trust',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/200D8428-4DD4-487E-929B-6106D31C8645/content.rtf',
            },
          ],
        },
        {
          id: 'D461D732-F3E0-4B8D-81B0-4274E140BFFB',
          title: 'Theme: Stranger Danger',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Stranger Danger',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Content',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Strangers can be dangerous: ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: "•\tGoldilocks (a stranger) entered and caused damaged to the bears' home. ",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tGoldilocks could be seriously harmed if the bears (strangers to her) find her. ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Theme: Stranger Danger',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/D461D732-F3E0-4B8D-81B0-4274E140BFFB/content.rtf',
            },
          ],
        },
        {
          id: '3BBA10B4-1353-4AD3-BA0D-81249982BF54',
          title: 'Theme: Greed',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Theme: Greed',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Content',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: "•\tGoldilocks invites herself into their house, disrespecting the bears' space.  ",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tFurthermore, she invites herself to their food and furniture.  ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Theme: Greed',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/3BBA10B4-1353-4AD3-BA0D-81249982BF54/content.rtf',
            },
          ],
        },
        {
          id: '28E781BD-56E7-4A88-BA85-63C91C456275',
          title: 'Brainstorm: Animals?',
          data: [
            {
              data: () =>
                Promise.resolve([
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Brainstorm: Animals?',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Content',
                            isBold: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'paragraph',
                        children: [],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '•\tGoldilocks & The Three Pigs ',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tGoldilocks & The Three Wolves ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: '•\tGoldilocks & The Three Bears ',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Tags',
                        isBold: true,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'Status: To Do',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [],
                  },
                ]),
              fullPath:
                '/home/edward/Downloads/Goldilocks and The Three Bears.scriv/Goldilocks and The Three Bears.scriv/Files/Data/28E781BD-56E7-4A88-BA85-63C91C456275/content.rtf',
            },
          ],
        },
      ],
    }
    it('should import it', async () => {
      const result = await transformToPlottrFile(failingStructure, {})
      expect(result).toEqual({
        attributes: {
          characters: [
            {
              id: 1,
              name: 'category',
              type: 'base-attribute',
            },
            {
              id: 2,
              name: 'shortDescription',
              type: 'base-attribute',
            },
            {
              id: 3,
              name: 'tags',
              type: 'base-attribute',
            },
            {
              id: 4,
              name: 'description',
              type: 'base-attribute',
            },
            {
              id: 5,
              name: 'Species',
              type: 'paragraph',
            },
          ],
        },
        beats: {
          1: {
            children: {
              '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20': [],
              '1AA77D7E-F025-4715-974E-BE92BE347A1A': [],
              '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D': [],
              'A6D820B7-35AC-4B54-9919-D4A6FE640B8C': [],
              'BEF98F2E-89E7-4FAF-8B33-942A5413B499': [],
              null: [
                '1AA77D7E-F025-4715-974E-BE92BE347A1A',
                '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20',
                'A6D820B7-35AC-4B54-9919-D4A6FE640B8C',
                '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D',
                'BEF98F2E-89E7-4FAF-8B33-942A5413B499',
              ],
            },
            heap: {
              '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20': null,
              '1AA77D7E-F025-4715-974E-BE92BE347A1A': null,
              '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D': null,
              'A6D820B7-35AC-4B54-9919-D4A6FE640B8C': null,
              'BEF98F2E-89E7-4FAF-8B33-942A5413B499': null,
            },
            index: {
              '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20': {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20',
                position: 1,
                time: 0,
                title: 'Rising Action',
              },
              '1AA77D7E-F025-4715-974E-BE92BE347A1A': {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: '1AA77D7E-F025-4715-974E-BE92BE347A1A',
                position: 0,
                time: 0,
                title: 'Exposition',
              },
              '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D': {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D',
                position: 3,
                time: 0,
                title: 'Falling Action',
              },
              'A6D820B7-35AC-4B54-9919-D4A6FE640B8C': {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 'A6D820B7-35AC-4B54-9919-D4A6FE640B8C',
                position: 2,
                time: 0,
                title: 'Climax',
              },
              'BEF98F2E-89E7-4FAF-8B33-942A5413B499': {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 'BEF98F2E-89E7-4FAF-8B33-942A5413B499',
                position: 4,
                time: 0,
                title: 'Resolution',
              },
            },
          },
          series: {
            children: {
              null: [],
            },
            heap: {},
            index: {},
          },
        },
        cards: [
          {
            beatId: '1AA77D7E-F025-4715-974E-BE92BE347A1A',
            bookId: null,
            characters: ['0536DA6D-124E-4933-AAFE-32905A834AC2'],
            color: null,
            description: '',
            fromTemplateId: null,
            id: 'A413F0CE-0B8A-4DAC-8AC0-F9796C106F6C',
            imageId: null,
            lineId: 1,
            places: ['1337A3AE-5C09-4760-8712-E0F8049294E0'],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [2, 5],
            templates: [],
            title: 'Goldilocks takes a walk in the forest and finds a cottage',
          },
          {
            beatId: '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20',
            bookId: null,
            characters: ['0536DA6D-124E-4933-AAFE-32905A834AC2'],
            color: null,
            description: '',
            fromTemplateId: null,
            id: 'D4616BC5-8BBF-4C67-901E-FA1837FA48D9',
            imageId: null,
            lineId: 1,
            places: ['823B0522-4AF8-4A60-89D3-AEEC6798F538'],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [4, 6],
            templates: [],
            title: 'Goldilocks enters and finds three bowls of porridge',
          },
          {
            beatId: '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20',
            bookId: null,
            characters: ['0536DA6D-124E-4933-AAFE-32905A834AC2'],
            color: null,
            description: '',
            fromTemplateId: null,
            id: '2E1C52EE-C664-43DA-9E88-FB1ED0DE14EE',
            imageId: null,
            lineId: 2,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [4, 6],
            templates: [],
            title: 'She tries each bowl until she finds the right one',
          },
          {
            beatId: '0BDAADDC-6E72-4672-84A4-EF3DB50ECA20',
            bookId: null,
            characters: ['0536DA6D-124E-4933-AAFE-32905A834AC2'],
            color: null,
            description: '',
            fromTemplateId: null,
            id: '85F5A315-BDE4-4DF4-802E-2714DBA9D805',
            imageId: null,
            lineId: 3,
            places: ['823B0522-4AF8-4A60-89D3-AEEC6798F538'],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [4, 7],
            templates: [],
            title: 'She tries three chairs until she finds the right one',
          },
          {
            beatId: 'A6D820B7-35AC-4B54-9919-D4A6FE640B8C',
            bookId: null,
            characters: [
              '0536DA6D-124E-4933-AAFE-32905A834AC2',
              '682D1995-3A0A-4B8A-A945-BE1361A0CFDE',
              '7723D310-CC87-4791-96E1-02A41498E9F8',
              '1386766B-0321-4EA3-A0F2-1A0D096401C2',
            ],
            color: null,
            description: '',
            fromTemplateId: null,
            id: 'EAF5D5D4-E71A-4BEA-82EE-ED8C467AF865',
            imageId: null,
            lineId: 1,
            places: ['823B0522-4AF8-4A60-89D3-AEEC6798F538'],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [3],
            templates: [],
            title: 'The three bears come home',
          },
          {
            beatId: 'A6D820B7-35AC-4B54-9919-D4A6FE640B8C',
            bookId: null,
            characters: [],
            color: null,
            description: '',
            fromTemplateId: null,
            id: 'CE14D6B6-6F03-4A68-9095-36F6BFD01F17',
            imageId: null,
            lineId: 3,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [7, 3],
            templates: [],
            title: 'They discover their chairs have been used',
          },
          {
            beatId: 'A6D820B7-35AC-4B54-9919-D4A6FE640B8C',
            bookId: null,
            characters: [],
            color: null,
            description: '',
            fromTemplateId: null,
            id: '1AE7ED86-FD70-4716-A3FD-1304EECDC6BE',
            imageId: null,
            lineId: 2,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [6, 3],
            templates: [],
            title: 'They discover their porridge has been eaten',
          },
          {
            beatId: '76A28FEC-69C4-4158-AE12-B3EFD60EBE6D',
            bookId: null,
            characters: [
              '0536DA6D-124E-4933-AAFE-32905A834AC2',
              '1386766B-0321-4EA3-A0F2-1A0D096401C2',
              '682D1995-3A0A-4B8A-A945-BE1361A0CFDE',
              '7723D310-CC87-4791-96E1-02A41498E9F8',
            ],
            color: null,
            description: '',
            fromTemplateId: null,
            id: '7C3F35D8-B87E-4033-862A-57AB4BC38D05',
            imageId: null,
            lineId: 1,
            places: ['823B0522-4AF8-4A60-89D3-AEEC6798F538'],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [3],
            templates: [],
            title: "Goldilocks wakes up to realize she's in the bears' home",
          },
          {
            beatId: 'BEF98F2E-89E7-4FAF-8B33-942A5413B499',
            bookId: null,
            characters: ['0536DA6D-124E-4933-AAFE-32905A834AC2'],
            color: null,
            description: '',
            fromTemplateId: null,
            id: '4C3D7D73-C238-4726-973B-11A4BD03F788',
            imageId: null,
            lineId: 1,
            places: [
              '823B0522-4AF8-4A60-89D3-AEEC6798F538',
              '1337A3AE-5C09-4760-8712-E0F8049294E0',
            ],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [3, 1],
            templates: [],
            title: 'Goldilocks runs away, never to return again',
          },
        ],
        categories: {
          characters: [
            {
              id: 1,
              name: 'Main',
              position: 0,
              type: 'text',
            },
            {
              id: 2,
              name: 'Supporting',
              position: 1,
              type: 'text',
            },
          ],
          notes: [],
          places: [],
          tags: [],
        },
        characters: [
          {
            attributes: [
              {
                bookId: 'all',
                id: 1,
                value: 1,
              },
              {
                bookId: 'all',
                id: 2,
                value: '',
              },
              {
                bookId: 'all',
                id: 3,
                value: [],
              },
              {
                bookId: 'all',
                id: 4,
                value: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                ],
              },
              {
                bookId: 'all',
                id: 5,
                value: [
                  {
                    children: [
                      {
                        text: 'Human',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
              },
            ],
            bookIds: [],
            cards: [],
            color: null,
            id: '0536DA6D-124E-4933-AAFE-32905A834AC2',
            imageId: null,
            name: 'Goldilocks',
            noteIds: [],
            position: 0,
            templates: [],
            categoryId: 1,
            description: '',
            notes: [
              {
                children: [],
                type: 'paragraph',
              },
            ],
            tags: [],
          },
          {
            attributes: [
              {
                bookId: 'all',
                id: 1,
                value: 1,
              },
              {
                bookId: 'all',
                id: 2,
                value: '',
              },
              {
                bookId: 'all',
                id: 3,
                value: [],
              },
              {
                bookId: 'all',
                id: 4,
                value: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                ],
              },
              {
                bookId: 'all',
                id: 5,
                value: [
                  {
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
              },
            ],
            bookIds: [],
            cards: [],
            color: null,
            id: '1386766B-0321-4EA3-A0F2-1A0D096401C2',
            imageId: null,
            name: 'Baby Bear',
            noteIds: [],
            position: 0,
            templates: [],
            categoryId: 1,
            description: '',
            notes: [
              {
                children: [],
                type: 'paragraph',
              },
            ],
            tags: [],
          },
          {
            attributes: [
              {
                bookId: 'all',
                id: 1,
                value: 2,
              },
              {
                bookId: 'all',
                id: 2,
                value: '',
              },
              {
                bookId: 'all',
                id: 3,
                value: [],
              },
              {
                bookId: 'all',
                id: 4,
                value: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                ],
              },
              {
                bookId: 'all',
                id: 5,
                value: [
                  {
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
              },
            ],
            bookIds: [],
            cards: [],
            color: null,
            id: '7723D310-CC87-4791-96E1-02A41498E9F8',
            imageId: null,
            name: 'Papa Bear',
            noteIds: [],
            position: 0,
            templates: [],
            categoryId: 2,
            description: '',
            notes: [
              {
                children: [],
                type: 'paragraph',
              },
            ],
            tags: [],
          },
          {
            attributes: [
              {
                bookId: 'all',
                id: 1,
                value: 2,
              },
              {
                bookId: 'all',
                id: 2,
                value: '',
              },
              {
                bookId: 'all',
                id: 3,
                value: [],
              },
              {
                bookId: 'all',
                id: 4,
                value: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                ],
              },
              {
                bookId: 'all',
                id: 5,
                value: [
                  {
                    children: [
                      {
                        text: 'Bear',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
              },
            ],
            bookIds: [],
            cards: [],
            color: null,
            id: '682D1995-3A0A-4B8A-A945-BE1361A0CFDE',
            imageId: null,
            name: 'Mama Bear',
            noteIds: [],
            position: 0,
            templates: [],
            categoryId: 2,
            description: '',
            notes: [
              {
                children: [],
                type: 'paragraph',
              },
            ],
            tags: [],
          },
        ],
        lines: [
          {
            bookId: 1,
            characterId: null,
            color: '#e5554f',
            expanded: null,
            fromTemplateId: null,
            id: 3,
            isPinned: false,
            position: 2,
            title: 'Scene 3',
          },
          {
            bookId: 1,
            characterId: null,
            color: '#78be20',
            expanded: null,
            fromTemplateId: null,
            id: 2,
            isPinned: false,
            position: 1,
            title: 'Scene 2',
          },
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            isPinned: false,
            position: 0,
            title: 'Scene 1',
          },
        ],
        notes: [
          {
            bookIds: [],
            category: null,
            categoryId: null,
            characters: [],
            content: [
              {
                children: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: '•	Three bears ',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Three bowls of porridge ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Three chairs ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Three beds  ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Three indiscretions  ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: '665E1852-1C38-4A5D-A2E4-F9F546A322B6',
            imageId: null,
            lastEdited: null,
            places: [],
            position: 0,
            tags: [1],
            templates: [],
            title: 'Rule of Threes',
          },
          {
            bookIds: [],
            category: null,
            categoryId: null,
            characters: [],
            content: [
              {
                children: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: '•	The bears leave their door unlocked, trusting no one will enter.  ',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Goldilocks breaks their trust and runs away before she has to suffer repercussions.  ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: '200D8428-4DD4-487E-929B-6106D31C8645',
            imageId: null,
            lastEdited: null,
            places: [],
            position: 0,
            tags: [2],
            templates: [],
            title: 'Theme: Trust',
          },
          {
            bookIds: [],
            category: null,
            categoryId: null,
            characters: [],
            content: [
              {
                children: [
                  {
                    text: 'Strangers can be dangerous: ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: "•	Goldilocks (a stranger) entered and caused damaged to the bears' home. ",
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Goldilocks could be seriously harmed if the bears (strangers to her) find her. ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: 'D461D732-F3E0-4B8D-81B0-4274E140BFFB',
            imageId: null,
            lastEdited: null,
            places: [],
            position: 0,
            tags: [3],
            templates: [],
            title: 'Theme: Stranger Danger',
          },
          {
            bookIds: [],
            category: null,
            categoryId: null,
            characters: [],
            content: [
              {
                children: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: "•	Goldilocks invites herself into their house, disrespecting the bears' space.  ",
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Furthermore, she invites herself to their food and furniture.  ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: '3BBA10B4-1353-4AD3-BA0D-81249982BF54',
            imageId: null,
            lastEdited: null,
            places: [],
            position: 0,
            tags: [4],
            templates: [],
            title: 'Theme: Greed',
          },
          {
            bookIds: [],
            category: null,
            categoryId: null,
            characters: [],
            content: [
              {
                children: [
                  {
                    children: [],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        text: '•	Goldilocks & The Three Pigs ',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Goldilocks & The Three Wolves ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: '•	Goldilocks & The Three Bears ',
                  },
                ],
                type: 'paragraph',
              },
            ],
            id: '28E781BD-56E7-4A88-BA85-63C91C456275',
            imageId: null,
            lastEdited: null,
            places: [],
            position: 0,
            tags: [5],
            templates: [],
            title: 'Brainstorm: Animals?',
          },
        ],
        places: [
          {
            bookIds: [],
            cards: [],
            categoryId: null,
            color: null,
            description: 'Where the bears live',
            id: '823B0522-4AF8-4A60-89D3-AEEC6798F538',
            imageId: null,
            name: 'Bear Cottage',
            noteIds: [],
            notes: [
              {
                children: [
                  {
                    text: 'The home Goldilocks enters',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [],
                type: 'paragraph',
              },
            ],
            position: 0,
            tags: [],
            templates: [],
          },
          {
            bookIds: [],
            cards: [],
            categoryId: null,
            color: null,
            description: 'Surrounds the bear cottage',
            id: '1337A3AE-5C09-4760-8712-E0F8049294E0',
            imageId: null,
            name: 'Forest',
            noteIds: [],
            notes: [
              {
                children: [],
                type: 'paragraph',
              },
              {
                children: [],
                type: 'paragraph',
              },
            ],
            position: 0,
            tags: [],
            templates: [],
          },
        ],
        tags: [
          {
            color: '#6cace4',
            id: 1,
            title: 'Status: Completed',
          },
          {
            color: '#78be20',
            id: 2,
            title: 'Theme: Trust',
          },
          {
            color: '#e5554f',
            id: 3,
            title: 'Theme: Stranger Danger',
          },
          {
            color: '#ff7f32',
            id: 4,
            title: 'Theme: Greed',
          },
          {
            color: '#ffc72c',
            id: 5,
            title: 'Status: To Do',
          },
          {
            color: '#0b1117',
            id: 6,
            title: 'Item: Porridge',
          },
          {
            color: '#6cace4',
            id: 7,
            title: 'Item: Chair',
          },
        ],
      })
    })
  })
})

function thunkData(entity) {
  return Promise.all(
    entity.data.map(({ data, fullPath }) => {
      return data().then((data) => {
        return {
          data,
          fullPath,
        }
      })
    })
  ).then((data) => {
    return {
      ...entity,
      data,
    }
  })
}

describe('processResearchNotesItems', () => {
  describe('given an empty array of notes nodes', () => {
    it('should produce the empty array', () => {
      expect(processResearchNotesItems([])).toEqual([])
    })
  })
  describe('given an object that is a single notes node', () => {
    describe('and an empty fileIndex', () => {
      it('should produce an array containing that node with the id, title and no files', () => {
        expect(
          processResearchNotesItems(
            {
              _attributes: {
                UUID: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: {
                _text: 'Hamlet',
              },
              TextSettings: {
                TextSelection: {
                  _text: '0,0',
                },
              },
            },
            {}
          )
        ).toEqual([
          {
            id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
            title: 'Hamlet',
          },
        ])
      })
    })
    describe('and a file index without the note id in it', () => {
      it('should produce a node with the file id and title but no data', () => {
        expect(
          processResearchNotesItems(
            {
              _attributes: {
                UUID: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: {
                _text: 'Hamlet',
              },
              TextSettings: {
                TextSelection: {
                  _text: '0,0',
                },
              },
            },
            {
              '37DF6E83-B710-42A3-B342-ZZZZZZZZZZZ': [
                {
                  fullPath: 'some-file.rtf',
                  data: () => Promise.resolve('some data'),
                },
              ],
            }
          )
        ).toEqual([
          {
            id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
            title: 'Hamlet',
          },
        ])
      })
    })
    describe('and a file index with the note id in it', () => {
      it('should produce the file node with the id, title and data', async () => {
        const result = await Promise.all(
          processResearchNotesItems(
            {
              _attributes: {
                UUID: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: {
                _text: 'Hamlet',
              },
              TextSettings: {
                TextSelection: {
                  _text: '0,0',
                },
              },
            },
            {
              '37DF6E83-B710-42A3-B342-D5BECFDC13FA': [
                {
                  fullPath: 'some-file.rtf',
                  data: () => Promise.resolve('some data'),
                },
              ],
            }
          ).map(thunkData)
        )
        expect(result).toEqual([
          {
            id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
            title: 'Hamlet',
            data: [
              {
                fullPath: 'some-file.rtf',
                data: 'some data',
              },
            ],
          },
        ])
      })
    })
  })
  describe('given an array of nodes', () => {
    it('should produce an array of appropriate result nodes', () => {
      expect(
        processResearchNotesItems(
          [
            {
              _attributes: {
                UUID: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: {
                _text: 'Hamlet',
              },
              TextSettings: {
                TextSelection: {
                  _text: '0,0',
                },
              },
            },
            {
              _attributes: {
                UUID: '37DF6E83-AAAA-42A3-B342-D5BECFDC13FA',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: {
                _text: 'Horatio',
              },
              TextSettings: {
                TextSelection: {
                  _text: '0,0',
                },
              },
            },
          ],
          {}
        )
      ).toEqual([
        {
          id: '37DF6E83-B710-42A3-B342-D5BECFDC13FA',
          title: 'Hamlet',
        },
        {
          id: '37DF6E83-AAAA-42A3-B342-D5BECFDC13FA',
          title: 'Horatio',
        },
      ])
    })
  })
})

describe('processManuscript', () => {
  describe('given an empty array of card nodes', () => {
    describe('and an empty accumulator', () => {
      it('should produce the empty scrivener structure', () => {
        expect(processManuscript([], {}, EMPTY_SCRIVENER_STRUCTURE)).toEqual(
          EMPTY_SCRIVENER_STRUCTURE
        )
      })
    })
    describe('and an accumulator with dummy data for other entities', () => {
      it('should maintain the dummy data', () => {
        expect(
          processManuscript(
            [],
            {},
            {
              cards: [],
              characters: 'dummy',
              notes: 'data',
              places: 'here',
            }
          )
        ).toEqual({
          cards: [],
          characters: 'dummy',
          notes: 'data',
          places: 'here',
        })
      })
    })
  })
  describe('given an array of manuscript binder items', () => {
    const manuscript = [
      {
        _attributes: {
          UUID: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
          Type: 'Folder',
          Created: '2023-08-10 15:54:39 +0200',
          Modified: '2023-08-10 15:54:39 +0200',
        },
        Title: { _text: 'Act 1' },
        TextSettings: { TextSelection: { _text: '0,0' } },
        Children: {
          BinderItem: [
            {
              _attributes: {
                UUID: 'BB664270-D5D3-4922-92BA-13828AE114CE',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet learns the truth from the ghost of his father' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'FC30AB95-1AF3-43DF-A33B-8BE3795B931C',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'The guards see a ghost' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'B26986A0-BB55-4693-852F-E29E8245D723',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Claudius makes an announcement & Hamlet laments' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'E9861F65-1263-4095-8099-7BCC5889CEFC',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Laertes leaves for France' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet goes after the ghost of his father' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '486CEA94-7A6B-457C-A7E1-5554ED61B9E5',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: "Hamlet speaks with his father's ghost" },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
          ],
        },
      },
      {
        _attributes: {
          UUID: '2A163249-3471-4EE5-9F19-C4B856779C9F',
          Type: 'Folder',
          Created: '2023-08-10 15:54:39 +0200',
          Modified: '2023-08-10 15:54:39 +0200',
        },
        Title: { _text: 'Act 2' },
        TextSettings: { TextSelection: { _text: '0,0' } },
        Children: {
          BinderItem: [
            {
              _attributes: {
                UUID: 'E4C16008-9DFB-4F7E-BE1D-E058E68D29B5',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Members of court meet & conspire' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '891D8F60-91D7-4D6B-84A5-763AA42BDA78',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Polonius speaks with Ophelia' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'C107CB2E-DBDC-4C41-8C93-8D99C40173F1',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'A busy day at court' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
          ],
        },
      },
      {
        _attributes: {
          UUID: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
          Type: 'Folder',
          Created: '2023-08-10 15:54:39 +0200',
          Modified: '2023-08-10 15:54:39 +0200',
        },
        Title: { _text: 'Act 3' },
        TextSettings: { TextSelection: { _text: '0,0' } },
        Children: {
          BinderItem: [
            {
              _attributes: {
                UUID: 'B58EB299-35D0-41FD-ABF1-E3E5618FF28C',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet carries out his plan to prove Claudius guilty' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '129F3355-D918-4682-A6F0-F031BA866BB8',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet denounces Ophelia' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'F455435C-F2C7-4592-94B1-EFB7AA9F4527',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Court watches The Murder of Gonzago' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '47F832CE-131E-4E04-9D21-372562C3C4E3',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Claudius prays for forgiveness' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '62BFD421-BC83-4219-8A0B-50FA958F4F0A',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet confronts his mother & kills Polonius' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
          ],
        },
      },
      {
        _attributes: {
          UUID: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
          Type: 'Folder',
          Created: '2023-08-10 15:54:39 +0200',
          Modified: '2023-08-10 15:54:39 +0200',
        },
        Title: { _text: 'Act 4' },
        TextSettings: { TextSelection: { _text: '0,0' } },
        Children: {
          BinderItem: [
            {
              _attributes: {
                UUID: 'ACF1C78C-85F1-4188-B26E-AD6E3B4974B8',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet is sent away, but Laertes returns' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: "Gertrude tells Claudius of Hamlet's actions" },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'DC6F4DCA-3177-4DBD-A806-44254B0E62AB',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Rosencrantz and Guildenstern confront Hamlet' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '8A0706CE-0D13-452F-85E0-85F5EEED230C',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: "Claudius demands to know where Polonius's body is" },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '5F1DA39A-2CA5-47FE-B311-1E74270EC7DA',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet encounters Fortinbras on the way to England' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'D7ED53BA-9B02-4734-93D9-D3E6323C76B6',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Laertes returns from France in a rage' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: 'D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Horatio receives word from Hamlet' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '2EB532B2-49BE-477D-B498-65A696641338',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Claudius and Laertes plan to kill Hamlet' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
          ],
        },
      },
      {
        _attributes: {
          UUID: '60F2D14C-D834-40C3-AD56-092E1C432341',
          Type: 'Folder',
          Created: '2023-08-10 15:54:39 +0200',
          Modified: '2023-08-10 15:54:39 +0200',
        },
        Title: { _text: 'Act 5' },
        TextSettings: { TextSelection: { _text: '0,0' } },
        Children: {
          BinderItem: [
            {
              _attributes: {
                UUID: 'A6FF729E-8FDD-4551-8486-770A6084C6CC',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'Hamlet meets an untimely end' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '04027D06-02A1-4488-B9ED-1CA64981044E',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: "Hamlet and Horatio witness Ophelia's funeral" },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
            {
              _attributes: {
                UUID: '74B99AD9-447B-4968-8351-3CE2A26B090C',
                Type: 'Text',
                Created: '2023-08-10 15:54:39 +0200',
                Modified: '2023-08-10 15:54:39 +0200',
              },
              Title: { _text: 'The duel between Laertes and Hamlet' },
              TextSettings: { TextSelection: { _text: '0,0' } },
            },
          ],
        },
      },
    ]
    it('should recreate a tree of cards from the scrivener binder items', () => {
      // NOTE: this isn't how file indexes should look!!!
      const dummyFileIndex = { 'FC30AB95-1AF3-43DF-A33B-8BE3795B931C': 'test' }
      const result = processManuscript(manuscript, dummyFileIndex, EMPTY_SCRIVENER_STRUCTURE)
      expect(result).toEqual({
        cards: [
          {
            children: [
              {
                data: undefined,
                id: 'BB664270-D5D3-4922-92BA-13828AE114CE',
                kind: 'Text',
                title: 'Hamlet learns the truth from the ghost of his father',
              },
              {
                data: 'test',
                id: 'FC30AB95-1AF3-43DF-A33B-8BE3795B931C',
                kind: 'Text',
                title: 'The guards see a ghost',
              },
              {
                data: undefined,
                id: 'B26986A0-BB55-4693-852F-E29E8245D723',
                kind: 'Text',
                title: 'Claudius makes an announcement & Hamlet laments',
              },
              {
                data: undefined,
                id: 'E9861F65-1263-4095-8099-7BCC5889CEFC',
                kind: 'Text',
                title: 'Laertes leaves for France',
              },
              {
                data: undefined,
                id: '8DEF5C0D-D7E7-4516-AF78-EAC2ECBB18ED',
                kind: 'Text',
                title: 'Hamlet goes after the ghost of his father',
              },
              {
                data: undefined,
                id: '486CEA94-7A6B-457C-A7E1-5554ED61B9E5',
                kind: 'Text',
                title: "Hamlet speaks with his father's ghost",
              },
            ],
            data: undefined,
            id: 'EBCC7260-3D24-432D-A02C-B3456D1D8569',
            kind: 'Folder',
            title: 'Act 1',
          },
          {
            children: [
              {
                data: undefined,
                id: 'E4C16008-9DFB-4F7E-BE1D-E058E68D29B5',
                kind: 'Text',
                title: 'Members of court meet & conspire',
              },
              {
                data: undefined,
                id: '891D8F60-91D7-4D6B-84A5-763AA42BDA78',
                kind: 'Text',
                title: 'Polonius speaks with Ophelia',
              },
              {
                data: undefined,
                id: 'C107CB2E-DBDC-4C41-8C93-8D99C40173F1',
                kind: 'Text',
                title: 'A busy day at court',
              },
            ],
            data: undefined,
            id: '2A163249-3471-4EE5-9F19-C4B856779C9F',
            kind: 'Folder',
            title: 'Act 2',
          },
          {
            children: [
              {
                data: undefined,
                id: 'B58EB299-35D0-41FD-ABF1-E3E5618FF28C',
                kind: 'Text',
                title: 'Hamlet carries out his plan to prove Claudius guilty',
              },
              {
                data: undefined,
                id: '129F3355-D918-4682-A6F0-F031BA866BB8',
                kind: 'Text',
                title: 'Hamlet denounces Ophelia',
              },
              {
                data: undefined,
                id: 'F455435C-F2C7-4592-94B1-EFB7AA9F4527',
                kind: 'Text',
                title: 'Court watches The Murder of Gonzago',
              },
              {
                data: undefined,
                id: '47F832CE-131E-4E04-9D21-372562C3C4E3',
                kind: 'Text',
                title: 'Claudius prays for forgiveness',
              },
              {
                data: undefined,
                id: '62BFD421-BC83-4219-8A0B-50FA958F4F0A',
                kind: 'Text',
                title: 'Hamlet confronts his mother & kills Polonius',
              },
            ],
            data: undefined,
            id: '619FDFDB-4AC9-4710-9209-8C952ACE8651',
            kind: 'Folder',
            title: 'Act 3',
          },
          {
            children: [
              {
                data: undefined,
                id: 'ACF1C78C-85F1-4188-B26E-AD6E3B4974B8',
                kind: 'Text',
                title: 'Hamlet is sent away, but Laertes returns',
              },
              {
                data: undefined,
                id: '4F5CC3D8-592A-42E3-98E5-6E8CB318A2A2',
                kind: 'Text',
                title: "Gertrude tells Claudius of Hamlet's actions",
              },
              {
                data: undefined,
                id: 'DC6F4DCA-3177-4DBD-A806-44254B0E62AB',
                kind: 'Text',
                title: 'Rosencrantz and Guildenstern confront Hamlet',
              },
              {
                data: undefined,
                id: '8A0706CE-0D13-452F-85E0-85F5EEED230C',
                kind: 'Text',
                title: "Claudius demands to know where Polonius's body is",
              },
              {
                data: undefined,
                id: '5F1DA39A-2CA5-47FE-B311-1E74270EC7DA',
                kind: 'Text',
                title: 'Hamlet encounters Fortinbras on the way to England',
              },
              {
                data: undefined,
                id: 'D7ED53BA-9B02-4734-93D9-D3E6323C76B6',
                kind: 'Text',
                title: 'Laertes returns from France in a rage',
              },
              {
                data: undefined,
                id: 'D9DD64D3-ABAB-4DF1-97A2-E0F23E76F350',
                kind: 'Text',
                title: 'Horatio receives word from Hamlet',
              },
              {
                data: undefined,
                id: '2EB532B2-49BE-477D-B498-65A696641338',
                kind: 'Text',
                title: 'Claudius and Laertes plan to kill Hamlet',
              },
            ],
            data: undefined,
            id: '62FDCFD2-2F5C-4208-85CC-6D4B0D57CCC3',
            kind: 'Folder',
            title: 'Act 4',
          },
          {
            children: [
              {
                data: undefined,
                id: 'A6FF729E-8FDD-4551-8486-770A6084C6CC',
                kind: 'Text',
                title: 'Hamlet meets an untimely end',
              },
              {
                data: undefined,
                id: '04027D06-02A1-4488-B9ED-1CA64981044E',
                kind: 'Text',
                title: "Hamlet and Horatio witness Ophelia's funeral",
              },
              {
                data: undefined,
                id: '74B99AD9-447B-4968-8351-3CE2A26B090C',
                kind: 'Text',
                title: 'The duel between Laertes and Hamlet',
              },
            ],
            data: undefined,
            id: '60F2D14C-D834-40C3-AD56-092E1C432341',
            kind: 'Folder',
            title: 'Act 5',
          },
        ],
        characters: [],
        notes: [],
        places: [],
      })
    })
  })
  describe('given an array of binder items that describes a hierarchical collection of beats', () => {
    const manuscript = {
      _attributes: { ID: '3', Type: 'Folder' },
      Title: { _text: 'Container' },
      Children: {
        BinderItem: [
          { _attributes: { ID: '4', Type: 'Text' }, Title: { _text: 'container card' } },
          {
            _attributes: { ID: '5', Type: 'Text' },
            Title: { _text: 'container card for scenes' },
          },
          {
            _attributes: { ID: '6', Type: 'Folder' },
            Title: { _text: 'Act 1' },
            Children: {
              BinderItem: [
                {
                  _attributes: { ID: '7', Type: 'Text' },
                  Title: { _text: 'Hamlet learns the truth from the ghost of his father' },
                },
                {
                  _attributes: { ID: '8', Type: 'Text' },
                  Title: { _text: 'The guards see a ghost' },
                },
                {
                  _attributes: { ID: '9', Type: 'Text' },
                  Title: { _text: 'Claudius makes an announcement & Hamlet laments' },
                },
                {
                  _attributes: { ID: '10', Type: 'Text' },
                  Title: { _text: 'Laertes leaves for France' },
                },
                {
                  _attributes: { ID: '11', Type: 'Text' },
                  Title: { _text: 'Hamlet goes after the ghost of his father' },
                },
                {
                  _attributes: { ID: '12', Type: 'Text' },
                  Title: { _text: "Hamlet speaks with his father's ghost" },
                },
              ],
            },
          },
          {
            _attributes: { ID: '13', Type: 'Folder' },
            Title: { _text: 'Act 2' },
            Children: {
              BinderItem: [
                {
                  _attributes: { ID: '14', Type: 'Text' },
                  Title: { _text: 'Members of court meet & conspire' },
                },
                {
                  _attributes: { ID: '15', Type: 'Text' },
                  Title: { _text: 'Polonius speaks with Ophelia' },
                },
                {
                  _attributes: { ID: '16', Type: 'Text' },
                  Title: { _text: 'A busy day at court' },
                },
              ],
            },
          },
          {
            _attributes: { ID: '17', Type: 'Folder' },
            Title: { _text: 'Act 3' },
            Children: {
              BinderItem: [
                {
                  _attributes: { ID: '18', Type: 'Text' },
                  Title: { _text: 'Hamlet carries out his plan to prove Claudius guilty' },
                },
                {
                  _attributes: { ID: '19', Type: 'Text' },
                  Title: { _text: 'Hamlet denounces Ophelia' },
                },
                {
                  _attributes: { ID: '20', Type: 'Text' },
                  Title: { _text: 'Court watches The Murder of Gonzago' },
                },
                {
                  _attributes: { ID: '21', Type: 'Text' },
                  Title: { _text: 'Claudius prays for forgiveness' },
                },
                {
                  _attributes: { ID: '22', Type: 'Text' },
                  Title: { _text: 'Hamlet confronts his mother & kills Polonius' },
                },
              ],
            },
          },
          {
            _attributes: { ID: '23', Type: 'Folder' },
            Title: { _text: 'Act 4' },
            Children: {
              BinderItem: [
                {
                  _attributes: { ID: '24', Type: 'Text' },
                  Title: { _text: 'Hamlet is sent away, but Laertes returns' },
                },
                {
                  _attributes: { ID: '25', Type: 'Text' },
                  Title: { _text: "Gertrude tells Claudius of Hamlet's actions" },
                },
                {
                  _attributes: { ID: '26', Type: 'Text' },
                  Title: { _text: 'Rosencrantz and Guildenstern confront Hamlet' },
                },
                {
                  _attributes: { ID: '27', Type: 'Text' },
                  Title: { _text: "Claudius demands to know where Polonius's body is" },
                },
                {
                  _attributes: { ID: '28', Type: 'Text' },
                  Title: { _text: 'Hamlet encounters Fortinbras on the way to England' },
                },
                {
                  _attributes: { ID: '29', Type: 'Text' },
                  Title: { _text: 'Laertes returns from France in a rage' },
                },
                {
                  _attributes: { ID: '30', Type: 'Text' },
                  Title: { _text: 'Horatio receives word from Hamlet' },
                },
                {
                  _attributes: { ID: '31', Type: 'Text' },
                  Title: { _text: 'Claudius and Laertes plan to kill Hamlet' },
                },
              ],
            },
          },
          {
            _attributes: { ID: '32', Type: 'Folder' },
            Title: { _text: 'Act 5' },
            Children: {
              BinderItem: [
                {
                  _attributes: { ID: '33', Type: 'Text' },
                  Title: { _text: 'Hamlet meets an untimely end' },
                },
                {
                  _attributes: { ID: '34', Type: 'Text' },
                  Title: { _text: "Hamlet and Horatio witness Ophelia's funeral" },
                },
                {
                  _attributes: { ID: '35', Type: 'Text' },
                  Title: { _text: 'The duel between Laertes and Hamlet' },
                },
              ],
            },
          },
        ],
      },
    }
    it('should process the hierarchy into an act structure in Plottr', () => {
      const result = processManuscript(manuscript, {}, EMPTY_SCRIVENER_STRUCTURE)
      expect(result).toEqual({
        cards: [
          {
            children: [
              { data: undefined, id: '4', kind: 'Text', title: 'container card' },
              { data: undefined, id: '5', kind: 'Text', title: 'container card for scenes' },
              {
                children: [
                  {
                    data: undefined,
                    id: '7',
                    kind: 'Text',
                    title: 'Hamlet learns the truth from the ghost of his father',
                  },
                  { data: undefined, id: '8', kind: 'Text', title: 'The guards see a ghost' },
                  {
                    data: undefined,
                    id: '9',
                    kind: 'Text',
                    title: 'Claudius makes an announcement & Hamlet laments',
                  },
                  { data: undefined, id: '10', kind: 'Text', title: 'Laertes leaves for France' },
                  {
                    data: undefined,
                    id: '11',
                    kind: 'Text',
                    title: 'Hamlet goes after the ghost of his father',
                  },
                  {
                    data: undefined,
                    id: '12',
                    kind: 'Text',
                    title: "Hamlet speaks with his father's ghost",
                  },
                ],
                data: undefined,
                id: '6',
                kind: 'Folder',
                title: 'Act 1',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '14',
                    kind: 'Text',
                    title: 'Members of court meet & conspire',
                  },
                  {
                    data: undefined,
                    id: '15',
                    kind: 'Text',
                    title: 'Polonius speaks with Ophelia',
                  },
                  { data: undefined, id: '16', kind: 'Text', title: 'A busy day at court' },
                ],
                data: undefined,
                id: '13',
                kind: 'Folder',
                title: 'Act 2',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '18',
                    kind: 'Text',
                    title: 'Hamlet carries out his plan to prove Claudius guilty',
                  },
                  { data: undefined, id: '19', kind: 'Text', title: 'Hamlet denounces Ophelia' },
                  {
                    data: undefined,
                    id: '20',
                    kind: 'Text',
                    title: 'Court watches The Murder of Gonzago',
                  },
                  {
                    data: undefined,
                    id: '21',
                    kind: 'Text',
                    title: 'Claudius prays for forgiveness',
                  },
                  {
                    data: undefined,
                    id: '22',
                    kind: 'Text',
                    title: 'Hamlet confronts his mother & kills Polonius',
                  },
                ],
                data: undefined,
                id: '17',
                kind: 'Folder',
                title: 'Act 3',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '24',
                    kind: 'Text',
                    title: 'Hamlet is sent away, but Laertes returns',
                  },
                  {
                    data: undefined,
                    id: '25',
                    kind: 'Text',
                    title: "Gertrude tells Claudius of Hamlet's actions",
                  },
                  {
                    data: undefined,
                    id: '26',
                    kind: 'Text',
                    title: 'Rosencrantz and Guildenstern confront Hamlet',
                  },
                  {
                    data: undefined,
                    id: '27',
                    kind: 'Text',
                    title: "Claudius demands to know where Polonius's body is",
                  },
                  {
                    data: undefined,
                    id: '28',
                    kind: 'Text',
                    title: 'Hamlet encounters Fortinbras on the way to England',
                  },
                  {
                    data: undefined,
                    id: '29',
                    kind: 'Text',
                    title: 'Laertes returns from France in a rage',
                  },
                  {
                    data: undefined,
                    id: '30',
                    kind: 'Text',
                    title: 'Horatio receives word from Hamlet',
                  },
                  {
                    data: undefined,
                    id: '31',
                    kind: 'Text',
                    title: 'Claudius and Laertes plan to kill Hamlet',
                  },
                ],
                data: undefined,
                id: '23',
                kind: 'Folder',
                title: 'Act 4',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '33',
                    kind: 'Text',
                    title: 'Hamlet meets an untimely end',
                  },
                  {
                    data: undefined,
                    id: '34',
                    kind: 'Text',
                    title: "Hamlet and Horatio witness Ophelia's funeral",
                  },
                  {
                    data: undefined,
                    id: '35',
                    kind: 'Text',
                    title: 'The duel between Laertes and Hamlet',
                  },
                ],
                data: undefined,
                id: '32',
                kind: 'Folder',
                title: 'Act 5',
              },
            ],
            data: undefined,
            id: '3',
            kind: 'Folder',
            title: 'Container',
          },
        ],
        characters: [],
        notes: [],
        places: [],
      })
    })
  })
})

describe('processNotesFolder', () => {
  describe('given an empty array of note nodes', () => {
    describe('and an empty accumulator', () => {
      it('should produce the empty scrivener structure', () => {
        expect(processNotesFolder([], {}, EMPTY_SCRIVENER_STRUCTURE)).toEqual(
          EMPTY_SCRIVENER_STRUCTURE
        )
      })
    })
    describe('and an accumulator with dummy data for cards', () => {
      it('should produce that accumulator', () => {
        expect(
          processNotesFolder(
            [],
            {},
            {
              cards: ['data'],
              characters: [],
              notes: [],
              places: [],
            }
          )
        ).toEqual({
          cards: ['data'],
          characters: [],
          notes: [],
          places: [],
        })
      })
    })
  })
  describe('given an array of scrivener note nodes', () => {
    const notesNodes = [
      {
        _attributes: {
          ID: '36',
          Type: 'Folder',
        },
        Title: {
          _text: 'Characters',
        },
        Children: {
          BinderItem: [
            {
              _attributes: {
                ID: '37',
                Type: 'Text',
              },
              Title: {
                _text: 'Hamlet',
              },
            },
            {
              _attributes: {
                ID: '38',
                Type: 'Text',
              },
              Title: {
                _text: 'Claudius',
              },
            },
            {
              _attributes: {
                ID: '39',
                Type: 'Text',
              },
              Title: {
                _text: 'Gertrude',
              },
            },
            {
              _attributes: {
                ID: '40',
                Type: 'Text',
              },
              Title: {
                _text: 'Polonius',
              },
            },
            {
              _attributes: {
                ID: '41',
                Type: 'Text',
              },
              Title: {
                _text: 'Horatio',
              },
            },
            {
              _attributes: {
                ID: '42',
                Type: 'Text',
              },
              Title: {
                _text: 'Ophelia',
              },
            },
            {
              _attributes: {
                ID: '43',
                Type: 'Text',
              },
              Title: {
                _text: 'Laertes',
              },
            },
            {
              _attributes: {
                ID: '44',
                Type: 'Text',
              },
              Title: {
                _text: 'Fortinbras',
              },
            },
            {
              _attributes: {
                ID: '45',
                Type: 'Text',
              },
              Title: {
                _text: 'The Ghost',
              },
            },
            {
              _attributes: {
                ID: '46',
                Type: 'Text',
              },
              Title: {
                _text: 'Rosencrantz and Guildenstern',
              },
            },
            {
              _attributes: {
                ID: '47',
                Type: 'Text',
              },
              Title: {
                _text: 'Osric',
              },
            },
            {
              _attributes: {
                ID: '48',
                Type: 'Text',
              },
              Title: {
                _text: 'Voltimand and Cornelius',
              },
            },
            {
              _attributes: {
                ID: '49',
                Type: 'Text',
              },
              Title: {
                _text: 'Marcellus',
              },
            },
            {
              _attributes: {
                ID: '50',
                Type: 'Text',
              },
              Title: {
                _text: 'Francisco',
              },
            },
            {
              _attributes: {
                ID: '51',
                Type: 'Text',
              },
              Title: {
                _text: 'Reynaldo',
              },
            },
            {
              _attributes: {
                ID: '52',
                Type: 'Text',
              },
              Title: {
                _text: 'Bernardo',
              },
            },
            {
              _attributes: {
                ID: '53',
                Type: 'Text',
              },
              Title: {
                _text: 'The Players',
              },
            },
            {
              _attributes: {
                ID: '54',
                Type: 'Text',
              },
              Title: {
                _text: 'Sailors',
              },
            },
            {
              _attributes: {
                ID: '55',
                Type: 'Text',
              },
              Title: {
                _text: 'Gravediggers',
              },
            },
          ],
        },
      },
      {
        _attributes: {
          ID: '56',
          Type: 'Folder',
        },
        Title: {
          _text: 'Places',
        },
        Children: {
          BinderItem: [
            {
              _attributes: {
                ID: '57',
                Type: 'Text',
              },
              Title: {
                _text: 'Elsinore Castle',
              },
            },
            {
              _attributes: {
                ID: '58',
                Type: 'Text',
              },
              Title: {
                _text: 'Field in Denmark',
              },
            },
            {
              _attributes: {
                ID: '59',
                Type: 'Text',
              },
              Title: {
                _text: 'France',
              },
            },
            {
              _attributes: {
                ID: '60',
                Type: 'Text',
              },
              Title: {
                _text: 'Graveyard',
              },
            },
            {
              _attributes: {
                ID: '61',
                Type: 'Text',
              },
              Title: {
                _text: 'Univerisity of Wittenberg',
              },
            },
          ],
        },
      },
      {
        _attributes: {
          ID: '62',
          Type: 'Folder',
        },
        Title: {
          _text: 'Notes',
        },
        Children: {
          BinderItem: [
            {
              _attributes: {
                ID: '63',
                Type: 'Text',
              },
              Title: {
                _text: 'Character Chart',
              },
            },
            {
              _attributes: {
                ID: '64',
                Type: 'Text',
              },
              Title: {
                _text: 'Death in Hamlet',
              },
            },
            {
              _attributes: {
                ID: '65',
                Type: 'Text',
              },
              Title: {
                _text: 'Thematic Ideas',
              },
            },
            {
              _attributes: {
                ID: '66',
                Type: 'Text',
              },
              Title: {
                _text: 'Character Sketches',
              },
            },
          ],
        },
      },
    ]
    it('should fill out the notes, places and characters', () => {
      expect(processNotesFolder(notesNodes, {}, EMPTY_SCRIVENER_STRUCTURE)).toEqual({
        cards: [],
        characters: [
          { data: undefined, id: '37', title: 'Hamlet' },
          { data: undefined, id: '38', title: 'Claudius' },
          { data: undefined, id: '39', title: 'Gertrude' },
          { data: undefined, id: '40', title: 'Polonius' },
          { data: undefined, id: '41', title: 'Horatio' },
          { data: undefined, id: '42', title: 'Ophelia' },
          { data: undefined, id: '43', title: 'Laertes' },
          { data: undefined, id: '44', title: 'Fortinbras' },
          { data: undefined, id: '45', title: 'The Ghost' },
          { data: undefined, id: '46', title: 'Rosencrantz and Guildenstern' },
          { data: undefined, id: '47', title: 'Osric' },
          { data: undefined, id: '48', title: 'Voltimand and Cornelius' },
          { data: undefined, id: '49', title: 'Marcellus' },
          { data: undefined, id: '50', title: 'Francisco' },
          { data: undefined, id: '51', title: 'Reynaldo' },
          { data: undefined, id: '52', title: 'Bernardo' },
          { data: undefined, id: '53', title: 'The Players' },
          { data: undefined, id: '54', title: 'Sailors' },
          { data: undefined, id: '55', title: 'Gravediggers' },
        ],
        notes: [
          { data: undefined, id: '63', title: 'Character Chart' },
          { data: undefined, id: '64', title: 'Death in Hamlet' },
          { data: undefined, id: '65', title: 'Thematic Ideas' },
          { data: undefined, id: '66', title: 'Character Sketches' },
        ],
        places: [
          { data: undefined, id: '57', title: 'Elsinore Castle' },
          { data: undefined, id: '58', title: 'Field in Denmark' },
          { data: undefined, id: '59', title: 'France' },
          { data: undefined, id: '60', title: 'Graveyard' },
          { data: undefined, id: '61', title: 'Univerisity of Wittenberg' },
        ],
      })
    })
  })
})

describe('interpretScrivenerStructure', () => {
  describe('given an example scrivener structure', () => {
    const exampleStructure = {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'UTF-8',
        },
      },
      ScrivenerProject: {
        _attributes: {
          Version: '1.5',
        },
        Binder: {
          BinderItem: [
            {
              _attributes: {
                ID: '0',
                Type: 'DraftFolder',
              },
              Title: {
                _text: 'Manuscript',
              },
              Children: {
                BinderItem: {
                  _attributes: {
                    ID: '3',
                    Type: 'Folder',
                  },
                  Title: {
                    _text: 'Container',
                  },
                  Children: {
                    BinderItem: [
                      {
                        _attributes: {
                          ID: '4',
                          Type: 'Text',
                        },
                        Title: {
                          _text: 'container card',
                        },
                      },
                      {
                        _attributes: {
                          ID: '5',
                          Type: 'Text',
                        },
                        Title: {
                          _text: 'container card for scenes',
                        },
                      },
                      {
                        _attributes: {
                          ID: '6',
                          Type: 'Folder',
                        },
                        Title: {
                          _text: 'Act 1',
                        },
                        Children: {
                          BinderItem: [
                            {
                              _attributes: {
                                ID: '7',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet learns the truth from the ghost of his father',
                              },
                            },
                            {
                              _attributes: {
                                ID: '8',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'The guards see a ghost',
                              },
                            },
                            {
                              _attributes: {
                                ID: '9',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Claudius makes an announcement & Hamlet laments',
                              },
                            },
                            {
                              _attributes: {
                                ID: '10',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Laertes leaves for France',
                              },
                            },
                            {
                              _attributes: {
                                ID: '11',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet goes after the ghost of his father',
                              },
                            },
                            {
                              _attributes: {
                                ID: '12',
                                Type: 'Text',
                              },
                              Title: {
                                _text: "Hamlet speaks with his father's ghost",
                              },
                            },
                          ],
                        },
                      },
                      {
                        _attributes: {
                          ID: '13',
                          Type: 'Folder',
                        },
                        Title: {
                          _text: 'Act 2',
                        },
                        Children: {
                          BinderItem: [
                            {
                              _attributes: {
                                ID: '14',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Members of court meet & conspire',
                              },
                            },
                            {
                              _attributes: {
                                ID: '15',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Polonius speaks with Ophelia',
                              },
                            },
                            {
                              _attributes: {
                                ID: '16',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'A busy day at court',
                              },
                            },
                          ],
                        },
                      },
                      {
                        _attributes: {
                          ID: '17',
                          Type: 'Folder',
                        },
                        Title: {
                          _text: 'Act 3',
                        },
                        Children: {
                          BinderItem: [
                            {
                              _attributes: {
                                ID: '18',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet carries out his plan to prove Claudius guilty',
                              },
                            },
                            {
                              _attributes: {
                                ID: '19',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet denounces Ophelia',
                              },
                            },
                            {
                              _attributes: {
                                ID: '20',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Court watches The Murder of Gonzago',
                              },
                            },
                            {
                              _attributes: {
                                ID: '21',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Claudius prays for forgiveness',
                              },
                            },
                            {
                              _attributes: {
                                ID: '22',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet confronts his mother & kills Polonius',
                              },
                            },
                          ],
                        },
                      },
                      {
                        _attributes: {
                          ID: '23',
                          Type: 'Folder',
                        },
                        Title: {
                          _text: 'Act 4',
                        },
                        Children: {
                          BinderItem: [
                            {
                              _attributes: {
                                ID: '24',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet is sent away, but Laertes returns',
                              },
                            },
                            {
                              _attributes: {
                                ID: '25',
                                Type: 'Text',
                              },
                              Title: {
                                _text: "Gertrude tells Claudius of Hamlet's actions",
                              },
                            },
                            {
                              _attributes: {
                                ID: '26',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Rosencrantz and Guildenstern confront Hamlet',
                              },
                            },
                            {
                              _attributes: {
                                ID: '27',
                                Type: 'Text',
                              },
                              Title: {
                                _text: "Claudius demands to know where Polonius's body is",
                              },
                            },
                            {
                              _attributes: {
                                ID: '28',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet encounters Fortinbras on the way to England',
                              },
                            },
                            {
                              _attributes: {
                                ID: '29',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Laertes returns from France in a rage',
                              },
                            },
                            {
                              _attributes: {
                                ID: '30',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Horatio receives word from Hamlet',
                              },
                            },
                            {
                              _attributes: {
                                ID: '31',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Claudius and Laertes plan to kill Hamlet',
                              },
                            },
                          ],
                        },
                      },
                      {
                        _attributes: {
                          ID: '32',
                          Type: 'Folder',
                        },
                        Title: {
                          _text: 'Act 5',
                        },
                        Children: {
                          BinderItem: [
                            {
                              _attributes: {
                                ID: '33',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'Hamlet meets an untimely end',
                              },
                            },
                            {
                              _attributes: {
                                ID: '34',
                                Type: 'Text',
                              },
                              Title: {
                                _text: "Hamlet and Horatio witness Ophelia's funeral",
                              },
                            },
                            {
                              _attributes: {
                                ID: '35',
                                Type: 'Text',
                              },
                              Title: {
                                _text: 'The duel between Laertes and Hamlet',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              _attributes: {
                ID: '1',
                Type: 'ResearchFolder',
              },
              Title: {
                _text: 'Notes',
              },
              Children: {
                BinderItem: [
                  {
                    _attributes: {
                      ID: '36',
                      Type: 'Folder',
                    },
                    Title: {
                      _text: 'Characters',
                    },
                    Children: {
                      BinderItem: [
                        {
                          _attributes: {
                            ID: '37',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Hamlet',
                          },
                        },
                        {
                          _attributes: {
                            ID: '38',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Claudius',
                          },
                        },
                        {
                          _attributes: {
                            ID: '39',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Gertrude',
                          },
                        },
                        {
                          _attributes: {
                            ID: '40',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Polonius',
                          },
                        },
                        {
                          _attributes: {
                            ID: '41',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Horatio',
                          },
                        },
                        {
                          _attributes: {
                            ID: '42',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Ophelia',
                          },
                        },
                        {
                          _attributes: {
                            ID: '43',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Laertes',
                          },
                        },
                        {
                          _attributes: {
                            ID: '44',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Fortinbras',
                          },
                        },
                        {
                          _attributes: {
                            ID: '45',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'The Ghost',
                          },
                        },
                        {
                          _attributes: {
                            ID: '46',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Rosencrantz and Guildenstern',
                          },
                        },
                        {
                          _attributes: {
                            ID: '47',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Osric',
                          },
                        },
                        {
                          _attributes: {
                            ID: '48',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Voltimand and Cornelius',
                          },
                        },
                        {
                          _attributes: {
                            ID: '49',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Marcellus',
                          },
                        },
                        {
                          _attributes: {
                            ID: '50',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Francisco',
                          },
                        },
                        {
                          _attributes: {
                            ID: '51',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Reynaldo',
                          },
                        },
                        {
                          _attributes: {
                            ID: '52',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Bernardo',
                          },
                        },
                        {
                          _attributes: {
                            ID: '53',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'The Players',
                          },
                        },
                        {
                          _attributes: {
                            ID: '54',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Sailors',
                          },
                        },
                        {
                          _attributes: {
                            ID: '55',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Gravediggers',
                          },
                        },
                      ],
                    },
                  },
                  {
                    _attributes: {
                      ID: '56',
                      Type: 'Folder',
                    },
                    Title: {
                      _text: 'Places',
                    },
                    Children: {
                      BinderItem: [
                        {
                          _attributes: {
                            ID: '57',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Elsinore Castle',
                          },
                        },
                        {
                          _attributes: {
                            ID: '58',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Field in Denmark',
                          },
                        },
                        {
                          _attributes: {
                            ID: '59',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'France',
                          },
                        },
                        {
                          _attributes: {
                            ID: '60',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Graveyard',
                          },
                        },
                        {
                          _attributes: {
                            ID: '61',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Univerisity of Wittenberg',
                          },
                        },
                      ],
                    },
                  },
                  {
                    _attributes: {
                      ID: '62',
                      Type: 'Folder',
                    },
                    Title: {
                      _text: 'Notes',
                    },
                    Children: {
                      BinderItem: [
                        {
                          _attributes: {
                            ID: '63',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Character Chart',
                          },
                        },
                        {
                          _attributes: {
                            ID: '64',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Death in Hamlet',
                          },
                        },
                        {
                          _attributes: {
                            ID: '65',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Thematic Ideas',
                          },
                        },
                        {
                          _attributes: {
                            ID: '66',
                            Type: 'Text',
                          },
                          Title: {
                            _text: 'Character Sketches',
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              _attributes: {
                ID: '2',
                Type: 'TrashFolder',
              },
              Title: {
                _text: 'Trash',
              },
              Children: {},
            },
          ],
        },
        ProjectProperties: {
          ProjectTitle: {
            _text: 'Title',
          },
        },
      },
    }
    it('should produce the expected result', () => {
      expect(interpretScrivenerStructure(exampleStructure, {})).toEqual({
        cards: [
          {
            children: [
              {
                data: undefined,
                id: '4',
                kind: 'Text',
                title: 'container card',
              },
              {
                data: undefined,
                id: '5',
                kind: 'Text',
                title: 'container card for scenes',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '7',
                    kind: 'Text',
                    title: 'Hamlet learns the truth from the ghost of his father',
                  },
                  {
                    data: undefined,
                    id: '8',
                    kind: 'Text',
                    title: 'The guards see a ghost',
                  },
                  {
                    data: undefined,
                    id: '9',
                    kind: 'Text',
                    title: 'Claudius makes an announcement & Hamlet laments',
                  },
                  {
                    data: undefined,
                    id: '10',
                    kind: 'Text',
                    title: 'Laertes leaves for France',
                  },
                  {
                    data: undefined,
                    id: '11',
                    kind: 'Text',
                    title: 'Hamlet goes after the ghost of his father',
                  },
                  {
                    data: undefined,
                    id: '12',
                    kind: 'Text',
                    title: "Hamlet speaks with his father's ghost",
                  },
                ],
                data: undefined,
                id: '6',
                kind: 'Folder',
                title: 'Act 1',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '14',
                    kind: 'Text',
                    title: 'Members of court meet & conspire',
                  },
                  {
                    data: undefined,
                    id: '15',
                    kind: 'Text',
                    title: 'Polonius speaks with Ophelia',
                  },
                  {
                    data: undefined,
                    id: '16',
                    kind: 'Text',
                    title: 'A busy day at court',
                  },
                ],
                data: undefined,
                id: '13',
                kind: 'Folder',
                title: 'Act 2',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '18',
                    kind: 'Text',
                    title: 'Hamlet carries out his plan to prove Claudius guilty',
                  },
                  {
                    data: undefined,
                    id: '19',
                    kind: 'Text',
                    title: 'Hamlet denounces Ophelia',
                  },
                  {
                    data: undefined,
                    id: '20',
                    kind: 'Text',
                    title: 'Court watches The Murder of Gonzago',
                  },
                  {
                    data: undefined,
                    id: '21',
                    kind: 'Text',
                    title: 'Claudius prays for forgiveness',
                  },
                  {
                    data: undefined,
                    id: '22',
                    kind: 'Text',
                    title: 'Hamlet confronts his mother & kills Polonius',
                  },
                ],
                data: undefined,
                id: '17',
                kind: 'Folder',
                title: 'Act 3',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '24',
                    kind: 'Text',
                    title: 'Hamlet is sent away, but Laertes returns',
                  },
                  {
                    data: undefined,
                    id: '25',
                    kind: 'Text',
                    title: "Gertrude tells Claudius of Hamlet's actions",
                  },
                  {
                    data: undefined,
                    id: '26',
                    kind: 'Text',
                    title: 'Rosencrantz and Guildenstern confront Hamlet',
                  },
                  {
                    data: undefined,
                    id: '27',
                    kind: 'Text',
                    title: "Claudius demands to know where Polonius's body is",
                  },
                  {
                    data: undefined,
                    id: '28',
                    kind: 'Text',
                    title: 'Hamlet encounters Fortinbras on the way to England',
                  },
                  {
                    data: undefined,
                    id: '29',
                    kind: 'Text',
                    title: 'Laertes returns from France in a rage',
                  },
                  {
                    data: undefined,
                    id: '30',
                    kind: 'Text',
                    title: 'Horatio receives word from Hamlet',
                  },
                  {
                    data: undefined,
                    id: '31',
                    kind: 'Text',
                    title: 'Claudius and Laertes plan to kill Hamlet',
                  },
                ],
                data: undefined,
                id: '23',
                kind: 'Folder',
                title: 'Act 4',
              },
              {
                children: [
                  {
                    data: undefined,
                    id: '33',
                    kind: 'Text',
                    title: 'Hamlet meets an untimely end',
                  },
                  {
                    data: undefined,
                    id: '34',
                    kind: 'Text',
                    title: "Hamlet and Horatio witness Ophelia's funeral",
                  },
                  {
                    data: undefined,
                    id: '35',
                    kind: 'Text',
                    title: 'The duel between Laertes and Hamlet',
                  },
                ],
                data: undefined,
                id: '32',
                kind: 'Folder',
                title: 'Act 5',
              },
            ],
            data: undefined,
            id: '3',
            kind: 'Folder',
            title: 'Container',
          },
        ],
        characters: [
          {
            data: undefined,
            id: '37',
            title: 'Hamlet',
          },
          {
            data: undefined,
            id: '38',
            title: 'Claudius',
          },
          {
            data: undefined,
            id: '39',
            title: 'Gertrude',
          },
          {
            data: undefined,
            id: '40',
            title: 'Polonius',
          },
          {
            data: undefined,
            id: '41',
            title: 'Horatio',
          },
          {
            data: undefined,
            id: '42',
            title: 'Ophelia',
          },
          {
            data: undefined,
            id: '43',
            title: 'Laertes',
          },
          {
            data: undefined,
            id: '44',
            title: 'Fortinbras',
          },
          {
            data: undefined,
            id: '45',
            title: 'The Ghost',
          },
          {
            data: undefined,
            id: '46',
            title: 'Rosencrantz and Guildenstern',
          },
          {
            data: undefined,
            id: '47',
            title: 'Osric',
          },
          {
            data: undefined,
            id: '48',
            title: 'Voltimand and Cornelius',
          },
          {
            data: undefined,
            id: '49',
            title: 'Marcellus',
          },
          {
            data: undefined,
            id: '50',
            title: 'Francisco',
          },
          {
            data: undefined,
            id: '51',
            title: 'Reynaldo',
          },
          {
            data: undefined,
            id: '52',
            title: 'Bernardo',
          },
          {
            data: undefined,
            id: '53',
            title: 'The Players',
          },
          {
            data: undefined,
            id: '54',
            title: 'Sailors',
          },
          {
            data: undefined,
            id: '55',
            title: 'Gravediggers',
          },
        ],
        notes: [
          {
            data: undefined,
            id: '63',
            title: 'Character Chart',
          },
          {
            data: undefined,
            id: '64',
            title: 'Death in Hamlet',
          },
          {
            data: undefined,
            id: '65',
            title: 'Thematic Ideas',
          },
          {
            data: undefined,
            id: '66',
            title: 'Character Sketches',
          },
        ],
        places: [
          {
            data: undefined,
            id: '57',
            title: 'Elsinore Castle',
          },
          {
            data: undefined,
            id: '58',
            title: 'Field in Denmark',
          },
          {
            data: undefined,
            id: '59',
            title: 'France',
          },
          {
            data: undefined,
            id: '60',
            title: 'Graveyard',
          },
          {
            data: undefined,
            id: '61',
            title: 'Univerisity of Wittenberg',
          },
        ],
      })
    })
  })
})
