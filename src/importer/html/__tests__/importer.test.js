import HTMLParser from 'node-html-parser'
import { omit } from 'lodash'

import { emptyFile, initialState } from 'pltr'

import {
  withNoLines,
  findAndExtractAttributes,
  inferSections,
  categoriseSections,
  EMPTY_CATEGORISED_SECTIONS,
  withEmptyBeatsForBookOne,
  accumulateBeats,
  removeBeatFromKeys,
  accumulateCards,
  accumulateCharacters,
  accumulatePlaces,
  accumulateNotes,
  addHierarchyConfig,
  fixTagsPlacesAndCharacters,
} from '../importer'

describe('findAndExtractAttributes', () => {
  describe('given empty slate content', () => {
    it('should produce an empty object', () => {
      expect(findAndExtractAttributes([])).toEqual([{}, []])
    })
  })
  describe('given a paragraph', () => {
    describe('containing a single line', () => {
      describe('then a semi colon', () => {
        describe('then some other text', () => {
          it('should produce an object with the pre-colon text as a key and the rest of the line as the value', () => {
            expect(
              findAndExtractAttributes([
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'test:',
                    },
                    {
                      text: ' a value',
                    },
                  ],
                },
              ])
            ).toEqual([
              {
                test: 'a value',
              },
              [],
            ])
          })
        })
        describe('then no text', () => {
          it('should produce an object with the pre-colon text as the key and an empty string as the value', () => {
            expect(
              findAndExtractAttributes([
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'test:',
                    },
                  ],
                },
              ])
            ).toEqual([
              {
                test: '',
              },
              [],
            ])
          })
        })
      })
      describe('and then other text without a semi colon', () => {
        it('should produce the empty object', () => {
          expect(
            findAndExtractAttributes([
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'test',
                  },
                  {
                    text: ' a value',
                  },
                ],
              },
            ])
          ).toEqual([
            {},
            [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'test',
                  },
                  {
                    text: ' a value',
                  },
                ],
              },
            ],
          ])
        })
      })
      describe('that does not have any text', () => {
        it('should produce the empty object', () => {
          expect(
            findAndExtractAttributes([
              {
                type: 'paragraph',
                children: [],
              },
            ])
          ).toEqual([
            {},
            [
              {
                type: 'paragraph',
                children: [],
              },
            ],
          ])
        })
      })
    })
    describe('with content from a file with tags', () => {
      it('should produce those tags in an object without processing the tags', () => {
        expect(
          findAndExtractAttributes([
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Tags: white, scandal, silliness, marriage',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: '"A single man in possession of good fortune must be in want of a wife."',
                },
              ],
            },
          ])
        ).toEqual([
          {
            Tags: 'white, scandal, silliness, marriage',
          },
          [
            {
              type: 'paragraph',
              children: [
                {
                  text: '"A single man in possession of good fortune must be in want of a wife."',
                },
              ],
            },
          ],
        ])
      })
    })
  })
  describe('given a heading', () => {
    describe('that has a paragraph after it', () => {
      it('should use the heading as the key and the paragraph as plain text with line breaks as the value', () => {
        expect(
          findAndExtractAttributes([
            {
              type: 'heading-one',
              children: [
                {
                  text: 'testing',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'the first line of the value',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'the second line of the value',
                },
              ],
            },
          ])
        ).toEqual([
          {
            testing: `the first line of the value
the second line of the value`,
          },
          [],
        ])
      })
    })
    describe('that is the end of the slate content', () => {
      it('should produce an object with the heading as the sole key and an empty string as the value', () => {
        expect(
          findAndExtractAttributes([
            {
              type: 'heading-one',
              children: [
                {
                  text: 'testing',
                },
              ],
            },
          ])
        ).toEqual([
          {
            testing: '',
          },
          [],
        ])
      })
    })
    describe('that has no text content', () => {
      it('should produce the empty object', () => {
        expect(
          findAndExtractAttributes([
            {
              type: 'heading-one',
              children: [
                {
                  text: '',
                },
              ],
            },
          ])
        ).toEqual([
          {},
          [
            {
              type: 'heading-one',
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
        ])
        expect(
          findAndExtractAttributes([
            {
              type: 'heading-one',
              children: [],
            },
          ])
        ).toEqual([
          {},
          [
            {
              type: 'heading-one',
              children: [],
            },
          ],
        ])
      })
    })
  })
})

const parseHTML = (htmlString) => {
  // @ts-ignore
  return HTMLParser.parse(htmlString)
}

describe('inferSections', () => {
  describe('given empty html', () => {
    const emptyHtml = parseHTML('')
    it('should produce empty sections', () => {
      expect(inferSections(emptyHtml)).toEqual({
        flatHierarchy: {},
        uncategorised: [],
      })
    })
  })
  describe('given html with a lone heading', () => {
    const loneHeadingHtml = parseHTML('<h1>Test</h1>')
    it('should categorise that heading into section 1', () => {
      expect(inferSections(loneHeadingHtml)).toEqual({
        flatHierarchy: {
          1: [
            {
              text: 'Test',
              type: 'heading-one',
            },
          ],
        },
        uncategorised: [],
      })
    })
  })
  describe('given html with a lone heading followed by text', () => {
    it('should categorise that heading into section 1 along with the text', () => {
      const headingWithTextHtml = parseHTML(`<h1>Test</h1>Here is some text after the heading`)
      expect(inferSections(headingWithTextHtml)).toEqual({
        flatHierarchy: {
          1: [
            {
              text: 'Test',
              type: 'heading-one',
            },
            {
              text: 'Here is some text after the heading',
              type: 'paragraph',
            },
          ],
        },
        uncategorised: [],
      })
    })
  })
  describe('given html with a heading followed by text, and then a sub heading with some text', () => {
    const headingWithTextHtml = parseHTML(`<h1>Test</h1>
<p>Here is some text after the heading</p>
<h2>Test Sub</h2>
<p>Sub text</p>
<p>More sub text</p>`)
    it('should create two tiers in the hierarchy of inferred sections', () => {
      expect(inferSections(headingWithTextHtml)).toEqual({
        flatHierarchy: {
          1: [
            {
              text: 'Test',
              type: 'heading-one',
            },
            {
              text: 'Here is some text after the heading',
              type: 'paragraph',
            },
          ],
          1.1: [
            {
              text: 'Test Sub',
              type: 'heading-two',
            },
            {
              text: 'Sub text',
              type: 'paragraph',
            },
            {
              text: 'More sub text',
              type: 'paragraph',
            },
          ],
        },
        uncategorised: [],
      })
    })
  })
  describe('given two top level headings', () => {
    const twoHeadingHTML = parseHTML(`<h1>First</h1><h1>Second</h1>`)
    it('should categorise them into successive sections', () => {
      expect(inferSections(twoHeadingHTML)).toEqual({
        flatHierarchy: {
          1: [
            {
              text: 'First',
              type: 'heading-one',
            },
          ],
          2: [
            {
              text: 'Second',
              type: 'heading-one',
            },
          ],
        },
        uncategorised: [],
      })
    })
  })
  describe('given deeply-nested content with many headings and sub-headings', () => {
    const complexHTML = parseHTML(`<h1>Act 1</h1>
Wherein the hero is called upon to do great things.
<h2>Chapter 1</h2>
<p>Here, the hero's home is raised in a raid.  He escapes and dedicates his life to determining the cause</p>
<h3>Scene 1</h3>
<p>The hero plays with the family cat in the barn.  The two of them chase each other to dangerous heights, and it looks like the hero might be in danger.  Just as he might fall, a scream rings out in the town.</p>
<h3>Scene 2</h3>
<p>The hero and his cat snap out of their revilry, deflty drop to the floor from the rafters of the barn by swinging from perlands and beams and rush out to see what happened; they see smoke and farm hands running.</p>
<h2>Chapter 2</h2>
<p>We return to the current day.  The hero is an orphan in a town near his parent's old farm, and witnesses something familiar.</p>
<h3>Scene 1</h3>
<p>The hero is a member of a crew of orphans who distract and then pick pocket nobles.  The guards turn a blind eye because the nobles can both whether their thefts and aren't nice people.</p>
<h3>Scene 2</h3>
<p>The crew picks a mark in a carraige, and the carraige takes a strange turn down an alleyway.  In the alley, the carraige is intercepted by thugs.  The boy recognises a man who killed the stablemaster at his farm and follows the crew to their lair.</p>
<h3>Scene 3</h3>
<p>In the crew's lair, the hero get's a better look at the man.  The man's crew talk about their leader -- a member of the King's court.  He retreats to the orphanage where he describes his adventure to his friends.</p>
<h2>Chapter 3</h2>
<p>In this chapter, the boy starts a quest to become a servant of the king so that he can track down the crew.  He's not sure what he'll do when he finds out more, but he feels compelled to.</p>
<h1>Act 2</h1>
<p>The hero makes it into the King's court as a cook's servant.</p>
<h2>Chapter 4</h2>
<p>etc.</p>`)
    it('should create a mirrored hierarchy of sections', () => {
      expect(inferSections(complexHTML)).toEqual({
        flatHierarchy: {
          1: [
            {
              text: 'Act 1',
              type: 'heading-one',
            },
            {
              text: 'Wherein the hero is called upon to do great things.',
              type: 'paragraph',
            },
          ],
          1.1: [
            {
              text: 'Chapter 1',
              type: 'heading-two',
            },
            {
              text: "Here, the hero's home is raised in a raid.  He escapes and dedicates his life to determining the cause",
              type: 'paragraph',
            },
          ],
          '1.1.1': [
            {
              text: 'Scene 1',
              type: 'heading-three',
            },
            {
              text: 'The hero plays with the family cat in the barn.  The two of them chase each other to dangerous heights, and it looks like the hero might be in danger.  Just as he might fall, a scream rings out in the town.',
              type: 'paragraph',
            },
          ],
          '1.1.2': [
            {
              text: 'Scene 2',
              type: 'heading-three',
            },
            {
              text: 'The hero and his cat snap out of their revilry, deflty drop to the floor from the rafters of the barn by swinging from perlands and beams and rush out to see what happened; they see smoke and farm hands running.',
              type: 'paragraph',
            },
          ],
          1.2: [
            {
              text: 'Chapter 2',
              type: 'heading-two',
            },
            {
              text: "We return to the current day.  The hero is an orphan in a town near his parent's old farm, and witnesses something familiar.",
              type: 'paragraph',
            },
          ],
          '1.2.1': [
            {
              text: 'Scene 1',
              type: 'heading-three',
            },
            {
              text: "The hero is a member of a crew of orphans who distract and then pick pocket nobles.  The guards turn a blind eye because the nobles can both whether their thefts and aren't nice people.",
              type: 'paragraph',
            },
          ],
          '1.2.2': [
            {
              text: 'Scene 2',
              type: 'heading-three',
            },
            {
              text: 'The crew picks a mark in a carraige, and the carraige takes a strange turn down an alleyway.  In the alley, the carraige is intercepted by thugs.  The boy recognises a man who killed the stablemaster at his farm and follows the crew to their lair.',
              type: 'paragraph',
            },
          ],
          '1.2.3': [
            {
              text: 'Scene 3',
              type: 'heading-three',
            },
            {
              text: "In the crew's lair, the hero get's a better look at the man.  The man's crew talk about their leader -- a member of the King's court.  He retreats to the orphanage where he describes his adventure to his friends.",
              type: 'paragraph',
            },
          ],
          1.3: [
            {
              text: 'Chapter 3',
              type: 'heading-two',
            },
            {
              text: "In this chapter, the boy starts a quest to become a servant of the king so that he can track down the crew.  He's not sure what he'll do when he finds out more, but he feels compelled to.",
              type: 'paragraph',
            },
          ],
          2: [
            {
              text: 'Act 2',
              type: 'heading-one',
            },
            {
              text: "The hero makes it into the King's court as a cook's servant.",
              type: 'paragraph',
            },
          ],
          2.1: [
            {
              text: 'Chapter 4',
              type: 'heading-two',
            },
            {
              text: 'etc.',
              type: 'paragraph',
            },
          ],
        },
        uncategorised: [],
      })
    })
  })
  describe('given text that goes to heading depth 6', () => {
    const deepHtml = parseHTML(
      `<h1>One</h1>
<h2>Two</h2>
<h3>Three</h3>
<h4>Four</h4>
<h5>Five</h5>
<h6>Six</h6>`
    )
    it('should correctly interpret all levels', () => {
      expect(inferSections(deepHtml)).toEqual({
        flatHierarchy: {
          1: [
            {
              text: 'One',
              type: 'heading-one',
            },
          ],
          1.1: [
            {
              text: 'Two',
              type: 'heading-two',
            },
          ],
          '1.1.1': [
            {
              text: 'Three',
              type: 'heading-three',
            },
          ],
          '1.1.1.1': [
            {
              text: 'Four',
              type: 'heading-four',
            },
          ],
          '1.1.1.1.1': [
            {
              text: 'Five',
              type: 'heading-five',
            },
          ],
          '1.1.1.1.1.1': [
            {
              text: 'Six',
              type: 'heading-six',
            },
          ],
        },
        uncategorised: [],
      })
    })
  })
})

describe('categoriseSections', () => {
  describe('given empty sections', () => {
    it('should produce empty categories', () => {
      expect(
        categoriseSections({
          flatHierarchy: {},
          uncategorised: [],
        })
      ).toEqual(EMPTY_CATEGORISED_SECTIONS)
    })
  })
  describe('given a deeply nested hierarchy', () => {
    const deeplyNestedHierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
        ],
        1.1: [
          {
            text: 'Two',
            type: 'heading-two',
          },
        ],
        '1.1.1': [
          {
            text: 'Three',
            type: 'heading-three',
          },
        ],
        '1.1.1.1': [
          {
            text: 'Four',
            type: 'heading-four',
          },
        ],
        '1.1.1.1.1': [
          {
            text: 'Five',
            type: 'heading-five',
          },
        ],
        '1.1.1.1.1.1': [
          {
            text: 'Six',
            type: 'heading-six',
          },
        ],
      },
      uncategorised: [],
    }
    it('should produce an appropriate outline of cards', () => {
      expect(categoriseSections(deeplyNestedHierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Two',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Three',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1',
            value: [
              {
                text: 'Four',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1.1',
            value: [
              {
                text: 'Five',
                type: 'heading-five',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1.1.1',
            value: [
              {
                text: 'Six',
                type: 'heading-six',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      })
    })
  })
  describe('given a hierarchy where a second level heading is "notes"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'Notes',
            type: 'heading-two',
          },
        ],
      },
    }
    it('should still categorise everything as a card', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Notes',
                type: 'heading-two',
              },
            ],
          },
        ],
        characters: [],
        notes: [],
        places: [],
      })
    })
  })
  describe('given a hierarchy where a top-level heading is "Notes"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'Notes',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'Notes',
            type: 'heading-one',
          },
          {
            text: 'A note description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as notes', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Notes',
                type: 'heading-two',
              },
            ],
          },
        ],
        notes: [
          {
            type: 'NOTE',
            key: '2',
            value: [
              {
                text: 'Notes',
                type: 'heading-one',
              },
              {
                text: 'A note description',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
      })
    })
  })
  describe('given a hierarchy where a top-level heading is "Notez (note the typo)"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'Notes',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'Notez',
            type: 'heading-one',
          },
          {
            text: 'A note description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as notes', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Notes',
                type: 'heading-two',
              },
            ],
          },
        ],
        notes: [
          {
            type: 'NOTE',
            key: '2',
            value: [
              {
                text: 'Notez',
                type: 'heading-one',
              },
              {
                text: 'A note description',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
      })
    })
  })
  describe('given a hierarchy where a top-level heading is "places"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'places',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'places',
            type: 'heading-one',
          },
          {
            text: 'A place description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as places', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'places',
                type: 'heading-two',
              },
            ],
          },
        ],
        places: [
          {
            type: 'PLACE',
            key: '2',
            value: [
              {
                text: 'places',
                type: 'heading-one',
              },
              {
                text: 'A place description',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        notes: [],
      })
    })
  })
  describe('given a hierarchy where a top-level heading is "placez (note the typo)"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'places',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'placez',
            type: 'heading-one',
          },
          {
            text: 'A place description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as places', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'places',
                type: 'heading-two',
              },
            ],
          },
        ],
        places: [
          {
            type: 'PLACE',
            key: '2',
            value: [
              {
                text: 'placez',
                type: 'heading-one',
              },
              {
                text: 'A place description',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        notes: [],
      })
    })
  })
  describe('given a hierarchy where a top-level heading is "characters"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'characters',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'characters',
            type: 'heading-one',
          },
          {
            text: 'A character description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as characters', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'characters',
                type: 'heading-two',
              },
            ],
          },
        ],
        characters: [
          {
            type: 'CHARACTER',
            key: '2',
            value: [
              {
                text: 'characters',
                type: 'heading-one',
              },
              {
                text: 'A character description',
                type: 'paragraph',
              },
            ],
          },
        ],
        places: [],
        notes: [],
      })
    })
  })
  describe('given a hierarchy where a top-level heading is "characterz (note the typo)"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'characters',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'characterz',
            type: 'heading-one',
          },
          {
            text: 'A character description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as characters', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'characters',
                type: 'heading-two',
              },
            ],
          },
        ],
        characters: [
          {
            type: 'CHARACTER',
            key: '2',
            value: [
              {
                text: 'characterz',
                type: 'heading-one',
              },
              {
                text: 'A character description',
                type: 'paragraph',
              },
            ],
          },
        ],
        places: [],
        notes: [],
      })
    })
  })
  describe('given a hierarchy with multiple top level headings named "characters"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'characters',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'characters',
            type: 'heading-one',
          },
          {
            text: 'A character description',
            type: 'paragraph',
          },
        ],
        3: [
          {
            text: 'Characters',
            type: 'heading-one',
          },
          {
            text: 'Another character description',
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as characters', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'characters',
                type: 'heading-two',
              },
            ],
          },
        ],
        characters: [
          {
            type: 'CHARACTER',
            key: '2',
            value: [
              {
                text: 'characters',
                type: 'heading-one',
              },
              {
                text: 'A character description',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CHARACTER',
            key: '3',
            value: [
              {
                text: 'Characters',
                type: 'heading-one',
              },
              {
                text: 'Another character description',
                type: 'paragraph',
              },
            ],
          },
        ],
        places: [],
        notes: [],
      })
    })
  })
  describe('given a hierarchy with multiple characters beneath the heading "characters"', () => {
    const hierarchy = {
      flatHierarchy: {
        1: [
          {
            text: 'One',
            type: 'heading-one',
          },
          {
            text: 'some paragraph text',
            type: 'paragraph',
          },
        ],
        1.1: [
          {
            text: 'characters',
            type: 'heading-two',
          },
        ],
        2: [
          {
            text: 'characters',
            type: 'heading-one',
          },
          {
            text: 'A character description',
            type: 'paragraph',
          },
          {
            text: 'Bob',
            type: 'heading-two',
          },
          {
            text: "Bob's description",
            type: 'paragraph',
          },
          {
            text: 'Alice',
            type: 'heading-two',
          },
          {
            text: "Alice's description",
            type: 'paragraph',
          },
        ],
      },
    }
    it('should categorise it and its children as characters', () => {
      expect(categoriseSections(hierarchy)).toEqual({
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'One',
                type: 'heading-one',
              },
              {
                text: 'some paragraph text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'characters',
                type: 'heading-two',
              },
            ],
          },
        ],
        characters: [
          {
            type: 'CHARACTER',
            key: '2',
            value: [
              {
                text: 'characters',
                type: 'heading-one',
              },
              {
                text: 'A character description',
                type: 'paragraph',
              },
              {
                text: 'Bob',
                type: 'heading-two',
              },
              {
                text: "Bob's description",
                type: 'paragraph',
              },
              {
                text: 'Alice',
                type: 'heading-two',
              },
              {
                text: "Alice's description",
                type: 'paragraph',
              },
            ],
          },
        ],
        places: [],
        notes: [],
      })
    })
  })
})

describe('accumulateBeats', () => {
  const initialFile = withEmptyBeatsForBookOne(emptyFile())
  describe('given empty categories', () => {
    describe('and the empty new file', () => {
      it('should produce the empty new file', () => {
        expect(accumulateBeats(EMPTY_CATEGORISED_SECTIONS, initialFile)).toEqual(initialFile)
      })
    })
  })
  describe('given a categories object with 1 level of hierarchy in cards', () => {
    const categories = {
      cards: [
        {
          type: 'CARD',
          key: '1',
          value: [
            {
              text: 'Chapter 1',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '2',
          value: [
            {
              text: 'Chapter 2',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '3',
          value: [
            {
              text: 'Chapter 3',
              type: 'heading-one',
            },
          ],
        },
      ],
      characters: [],
      places: [],
      notes: [],
    }
    it('should produce a file with beats for the top level of cards', () => {
      const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
      expect(resultFile.beats).toEqual({
        1: {
          children: {
            3: [],
            4: [],
            5: [],
            null: [3, 4, 5],
          },
          heap: {
            3: null,
            4: null,
            5: null,
          },
          index: {
            3: {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: 3,
              position: 0,
              templates: [],
              time: 0,
              title: 'Chapter 1',
            },
            4: {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: 4,
              position: 0,
              templates: [],
              time: 0,
              title: 'Chapter 2',
            },
            5: {
              autoOutlineSort: true,
              bookId: 1,
              expanded: true,
              fromTemplateId: null,
              id: 5,
              position: 0,
              templates: [],
              time: 0,
              title: 'Chapter 3',
            },
          },
        },
        series: {
          children: {
            1: [],
            null: [1],
          },
          heap: {
            1: null,
          },
          index: {
            1: {
              autoOutlineSort: true,
              bookId: 'series',
              expanded: true,
              fromTemplateId: null,
              id: 1,
              position: 0,
              templates: [],
              time: 0,
              title: 'auto',
            },
          },
        },
      })
    })
  })
  describe('given a categories object with 2 levels of hierarchy in cards', () => {
    describe('and only one top-level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'My book',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.2',
            value: [
              {
                text: 'Chapter 2',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.3',
            value: [
              {
                text: 'Chapter 3',
                type: 'heading-two',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with a two level structure', () => {
        const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
        expect(resultFile.beats).toEqual({
          1: {
            children: {
              3: [],
              4: [],
              5: [],
              null: [3, 4, 5],
            },
            heap: {
              3: null,
              4: null,
              5: null,
            },
            index: {
              3: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 3,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 1',
              },
              4: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 4,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 2',
              },
              5: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 5,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 3',
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            heap: {
              1: null,
            },
            index: {
              1: {
                autoOutlineSort: true,
                bookId: 'series',
                expanded: true,
                fromTemplateId: null,
                id: 1,
                position: 0,
                templates: [],
                time: 0,
                title: 'auto',
              },
            },
          },
        })
      })
    })
    describe('and more than one top-level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Act 2',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Act 1',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.2',
            value: [
              {
                text: 'Chapter 2',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.3',
            value: [
              {
                text: 'Chapter 3',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.3.1',
            value: [
              {
                text: 'Scene Card 1',
                type: 'heading-three',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with a two level structure', () => {
        const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
        expect(resultFile.beats).toEqual({
          1: {
            children: {
              3: [],
              4: [5, 6, 7],
              5: [],
              6: [],
              7: [],
              null: [3, 4],
            },
            heap: {
              3: null,
              4: null,
              5: 4,
              6: 4,
              7: 4,
            },
            index: {
              3: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 3,
                position: 0,
                templates: [],
                time: 0,
                title: 'Act 2',
              },
              4: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 4,
                position: 0,
                templates: [],
                time: 0,
                title: 'Act 1',
              },
              5: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 5,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 1',
              },
              6: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 6,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 2',
              },
              7: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 7,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 3',
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            heap: {
              1: null,
            },
            index: {
              1: {
                autoOutlineSort: true,
                bookId: 'series',
                expanded: true,
                fromTemplateId: null,
                id: 1,
                position: 0,
                templates: [],
                time: 0,
                title: 'auto',
              },
            },
          },
        })
      })
    })
  })
  describe('given a categories object with 3 levels of hierarchy in cards', () => {
    describe('and only one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'My book',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.2',
            value: [
              {
                text: 'Scene 2',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.3',
            value: [
              {
                text: 'Scene 3',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.3.1',
            value: [
              {
                text: 'Scene card 1',
                type: 'heading-four',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with a three level structure', () => {
        const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
        expect(resultFile.beats).toEqual({
          1: {
            children: {
              3: [4, 5, 6],
              4: [],
              5: [],
              6: [],
              null: [3],
            },
            heap: {
              3: null,
              4: 3,
              5: 3,
              6: 3,
            },
            index: {
              3: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 3,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 1',
              },
              4: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 4,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 1',
              },
              5: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 5,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 2',
              },
              6: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 6,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 3',
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            heap: {
              1: null,
            },
            index: {
              1: {
                autoOutlineSort: true,
                bookId: 'series',
                expanded: true,
                fromTemplateId: null,
                id: 1,
                position: 0,
                templates: [],
                time: 0,
                title: 'auto',
              },
            },
          },
        })
      })
    })
    describe('and more than one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Act 2',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Act 1',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.2',
            value: [
              {
                text: 'Scene 2',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.3',
            value: [
              {
                text: 'Scene 3',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.3.1',
            value: [
              {
                text: 'Scene Card 1',
                type: 'heading-three',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with a three level structure', () => {
        const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
        expect(resultFile.beats).toEqual({
          1: {
            children: {
              3: [],
              4: [5],
              5: [6, 7, 8],
              6: [],
              7: [],
              8: [],
              null: [3, 4],
            },
            heap: {
              3: null,
              4: null,
              5: 4,
              6: 5,
              7: 5,
              8: 5,
            },
            index: {
              3: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 3,
                position: 0,
                templates: [],
                time: 0,
                title: 'Act 2',
              },
              4: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 4,
                position: 0,
                templates: [],
                time: 0,
                title: 'Act 1',
              },
              5: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 5,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 1',
              },
              6: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 6,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 1',
              },
              7: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 7,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 2',
              },
              8: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 8,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 3',
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            heap: {
              1: null,
            },
            index: {
              1: {
                autoOutlineSort: true,
                bookId: 'series',
                expanded: true,
                fromTemplateId: null,
                id: 1,
                position: 0,
                templates: [],
                time: 0,
                title: 'auto',
              },
            },
          },
        })
      })
    })
  })
  describe('given a categories object with 4 levels of hierarchy in cards', () => {
    describe('and only one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'My book',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1',
            value: [
              {
                text: 'Sub-Scene 1',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.2',
            value: [
              {
                text: 'Sub-Scene 2',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.3',
            value: [
              {
                text: 'Sub-Scene 3',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.3.2',
            value: [
              {
                text: 'Scene Card 1',
                type: 'heading-five',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with a three level structure', () => {
        const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
        expect(resultFile.beats).toEqual({
          1: {
            children: {
              3: [4],
              4: [5, 6, 7],
              5: [],
              6: [],
              7: [],
              null: [3],
            },
            heap: {
              3: null,
              4: 3,
              5: 4,
              6: 4,
              7: 4,
            },
            index: {
              3: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 3,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 1',
              },
              4: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 4,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 1',
              },
              5: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 5,
                position: 0,
                templates: [],
                time: 0,
                title: 'Sub-Scene 1',
              },
              6: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 6,
                position: 0,
                templates: [],
                time: 0,
                title: 'Sub-Scene 2',
              },
              7: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 7,
                position: 0,
                templates: [],
                time: 0,
                title: 'Sub-Scene 3',
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            heap: {
              1: null,
            },
            index: {
              1: {
                autoOutlineSort: true,
                bookId: 'series',
                expanded: true,
                fromTemplateId: null,
                id: 1,
                position: 0,
                templates: [],
                time: 0,
                title: 'auto',
              },
            },
          },
        })
      })
    })
    describe('and more than one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Act 2',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Act 1',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1',
            value: [
              {
                text: 'Sub-Scene 1',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.2',
            value: [
              {
                text: 'Sub-Scene 2',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.3',
            value: [
              {
                text: 'Sub-Scene 3',
                type: 'heading-four',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with a three level structure', () => {
        const resultFile = removeBeatFromKeys(accumulateBeats(categories, initialFile))
        expect(resultFile.beats).toEqual({
          1: {
            children: {
              3: [],
              4: [5],
              5: [6],
              6: [],
              null: [3, 4],
            },
            heap: {
              3: null,
              4: null,
              5: 4,
              6: 5,
            },
            index: {
              3: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 3,
                position: 0,
                templates: [],
                time: 0,
                title: 'Act 2',
              },
              4: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 4,
                position: 0,
                templates: [],
                time: 0,
                title: 'Act 1',
              },
              5: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 5,
                position: 0,
                templates: [],
                time: 0,
                title: 'Chapter 1',
              },
              6: {
                autoOutlineSort: true,
                bookId: 1,
                expanded: true,
                fromTemplateId: null,
                id: 6,
                position: 0,
                templates: [],
                time: 0,
                title: 'Scene 1',
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            heap: {
              1: null,
            },
            index: {
              1: {
                autoOutlineSort: true,
                bookId: 'series',
                expanded: true,
                fromTemplateId: null,
                id: 1,
                position: 0,
                templates: [],
                time: 0,
                title: 'auto',
              },
            },
          },
        })
      })
    })
  })
})

describe('accumulateCards', () => {
  const initialFile = withNoLines(withEmptyBeatsForBookOne(emptyFile()))
  describe('given empty categories', () => {
    describe('and the empty new file', () => {
      it('should produce the empty new file', () => {
        expect(
          accumulateCards(
            EMPTY_CATEGORISED_SECTIONS,
            accumulateBeats(EMPTY_CATEGORISED_SECTIONS, initialFile)
          )
        ).toEqual(initialFile)
      })
    })
  })
  describe('given a categories object with 1 level of hierarchy in cards', () => {
    const categories = {
      cards: [
        {
          type: 'CARD',
          key: '1',
          value: [
            {
              text: 'Chapter 1',
              type: 'heading-one',
            },
            {
              text: 'Begin Summary',
              type: 'paragraph',
            },
            {
              text: 'Blah-1',
              type: 'paragraph',
            },
            {
              type: 'paragraph',
              text: 'Attribute One',
              italic: true,
              bold: true,
            },
            {
              type: 'paragraph',
              text: 'line 1',
            },
            {
              type: 'paragraph',
              text: 'second line',
            },
            {
              text: 'End Summary',
              type: 'paragraph',
            },
            {
              text: 'Extra text',
              type: 'paragraph',
            },
          ],
        },
        {
          type: 'CARD',
          key: '2',
          value: [
            {
              text: 'Chapter 2',
              type: 'heading-one',
            },
            {
              text: 'Begin Summary',
              type: 'paragraph',
            },
            {
              text: 'Blah-2',
              type: 'paragraph',
            },
            {
              type: 'paragraph',
              text: 'Not Attribute',
              italic: true,
            },
            {
              type: 'paragraph',
              text: 'line 1',
            },
            {
              type: 'paragraph',
              text: 'second line',
            },
            {
              text: 'End Summary',
              type: 'paragraph',
            },
          ],
        },
        {
          type: 'CARD',
          key: '3',
          value: [
            {
              text: 'Chapter 3',
              type: 'heading-one',
            },
            {
              text: 'Begin Summary',
              type: 'paragraph',
            },
            {
              text: 'Blah-3',
              type: 'paragraph',
            },
            {
              text: 'End Summary',
              type: 'paragraph',
            },
          ],
        },
      ],
      characters: [],
      places: [],
      notes: [],
    }
    it('should produce a file with only the bottom level cards', () => {
      const resultFile = removeBeatFromKeys(
        accumulateCards(categories, accumulateBeats(categories, initialFile))
      )
      expect(resultFile.cards).toEqual([
        {
          beatId: 3,
          bookId: null,
          characters: [],
          color: null,
          description: [{ children: [{ text: 'Blah-1' }], type: 'paragraph' }],
          'Attribute One': 'line 1\nsecond line',
          fromTemplateId: null,
          id: 2,
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          tags: [],
          templates: [],
          title: 'Chapter 1',
        },
        {
          beatId: 4,
          bookId: null,
          characters: [],
          color: null,
          description: [
            { children: [{ text: 'Blah-2' }], type: 'paragraph' },
            {
              children: [
                {
                  italic: true,
                  text: 'Not Attribute',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  text: 'line 1',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  text: 'second line',
                },
              ],
              type: 'paragraph',
            },
          ],
          fromTemplateId: null,
          id: 3,
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          tags: [],
          templates: [],
          title: 'Chapter 2',
        },
        {
          beatId: 5,
          bookId: null,
          characters: [],
          color: null,
          description: [{ children: [{ text: 'Blah-3' }], type: 'paragraph' }],
          fromTemplateId: null,
          id: 4,
          imageId: null,
          lineId: 1,
          places: [],
          positionInBeat: 0,
          positionWithinLine: 0,
          tags: [],
          templates: [],
          title: 'Chapter 3',
        },
      ])
      expect(resultFile.lines).toEqual([
        {
          bookId: 1,
          characterId: null,
          color: '#6cace4',
          expanded: null,
          fromTemplateId: null,
          id: 1,
          isPinned: false,
          position: 0,
          title: 'Main Plot',
        },
      ])
    })
    describe('when all the cards have line titles', () => {
      const categoriesWithLineTitles = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Chapter 1 (Mega Plotline)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-1',
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                text: 'Attribute One',
                italic: true,
                bold: true,
              },
              {
                type: 'paragraph',
                text: 'line 1',
              },
              {
                type: 'paragraph',
                text: 'second line',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Chapter 2 (2)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-2',
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                text: 'Not Attribute',
                italic: true,
              },
              {
                type: 'paragraph',
                text: 'line 1',
              },
              {
                type: 'paragraph',
                text: 'second line',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '3',
            value: [
              {
                text: 'Chapter 3 (Whoa!)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-3',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with no default line', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(
            categoriesWithLineTitles,
            accumulateBeats(categoriesWithLineTitles, initialFile)
          )
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'Blah-1' }], type: 'paragraph' }],
            'Attribute One': 'line 1\nsecond line',
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 1',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [
              { children: [{ text: 'Blah-2' }], type: 'paragraph' },
              {
                children: [
                  {
                    italic: true,
                    text: 'Not Attribute',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'line 1',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'second line',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 2,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 2',
          },
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'Blah-3' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 3,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 3',
          },
        ])
        expect(resultFile.lines).toEqual([
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            isPinned: false,
            position: 0,
            title: 'Mega Plotline',
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
            title: '2',
          },
          {
            bookId: 1,
            characterId: null,
            color: '#e5554f',
            expanded: null,
            fromTemplateId: null,
            id: 3,
            isPinned: false,
            position: 2,
            title: 'Whoa!',
          },
        ])
      })
    })
    describe('when all the cards have one-character line titles', () => {
      const categoriesWithLineTitles = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Chapter 1 (1)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-1',
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                text: 'Attribute One',
                italic: true,
                bold: true,
              },
              {
                type: 'paragraph',
                text: 'line 1',
              },
              {
                type: 'paragraph',
                text: 'second line',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Chapter 2 (2)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-2',
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                text: 'Not Attribute',
                italic: true,
              },
              {
                type: 'paragraph',
                text: 'line 1',
              },
              {
                type: 'paragraph',
                text: 'second line',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '3',
            value: [
              {
                text: 'Chapter 3 (3)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-3',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce each of those line titles without matching them to each other', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(
            categoriesWithLineTitles,
            accumulateBeats(categoriesWithLineTitles, initialFile)
          )
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'Blah-1' }], type: 'paragraph' }],
            'Attribute One': 'line 1\nsecond line',
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 1',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [
              { children: [{ text: 'Blah-2' }], type: 'paragraph' },
              {
                children: [
                  {
                    italic: true,
                    text: 'Not Attribute',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'line 1',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'second line',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 2,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 2',
          },
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'Blah-3' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 3,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 3',
          },
        ])
        expect(resultFile.lines).toEqual([
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            isPinned: false,
            position: 0,
            title: '1',
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
            title: '2',
          },
          {
            bookId: 1,
            characterId: null,
            color: '#e5554f',
            expanded: null,
            fromTemplateId: null,
            id: 3,
            isPinned: false,
            position: 2,
            title: '3',
          },
        ])
      })
    })
    describe('when all the cards have similar titles of at least three character length', () => {
      const categoriesWithLineTitles = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Chapter 1 (two)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-1',
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                text: 'Attribute One',
                italic: true,
                bold: true,
              },
              {
                type: 'paragraph',
                text: 'line 1',
              },
              {
                type: 'paragraph',
                text: 'second line',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Chapter 2 (one)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-2',
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                text: 'Not Attribute',
                italic: true,
              },
              {
                type: 'paragraph',
                text: 'line 1',
              },
              {
                type: 'paragraph',
                text: 'second line',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '3',
            value: [
              {
                text: 'Chapter 3 (on3)',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Blah-3',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should match the titles that are close enough to each other in content', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(
            categoriesWithLineTitles,
            accumulateBeats(categoriesWithLineTitles, initialFile)
          )
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'Blah-1' }], type: 'paragraph' }],
            'Attribute One': 'line 1\nsecond line',
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 1',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [
              { children: [{ text: 'Blah-2' }], type: 'paragraph' },
              {
                children: [
                  {
                    italic: true,
                    text: 'Not Attribute',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'line 1',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'second line',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 2,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 2',
          },
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'Blah-3' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 2,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 3',
          },
        ])
        expect(resultFile.lines).toEqual([
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            isPinned: false,
            position: 0,
            title: 'two',
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
            title: 'one',
          },
        ])
      })
    })
    describe('and some of the cards have attributes', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Favourite_Colour: Blue',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Chapter 2',
                type: 'heading-one',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Favourite_Colour: Turquoise',
                type: 'paragraph',
              },
              {
                text: 'Height: 6 ft',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '3',
            value: [
              {
                text: 'Chapter 3',
                type: 'heading-one',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should add the attributes as custom attributes and place values on the cards', () => {
        const result = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(result.cards).toEqual([
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 1',
            Favourite_Colour: 'Blue',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 2',
            Height: '6 ft',
            Favourite_Colour: 'Turquoise',
          },
        ])
        expect(result.customAttributes).toEqual({
          cards: [],
          scenes: [
            {
              type: 'text',
              name: 'Favourite_Colour',
            },
            {
              type: 'text',
              name: 'Height',
            },
          ],
          notes: [],
          places: [],
          characters: [],
          lines: [],
        })
      })
      describe('when the attribute name overlaps a built-in attribute', () => {
        const categories = {
          cards: [
            {
              type: 'CARD',
              key: '1',
              value: [
                {
                  text: 'Chapter 1',
                  type: 'heading-one',
                },
                {
                  text: 'Begin Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Favourite_Colour: Blue',
                  type: 'paragraph',
                },
                {
                  text: 'Description',
                  type: 'heading-two',
                },
                {
                  text: 'First paragraph of text',
                  type: 'paragraph',
                },
                {
                  text: 'Second paragraph of text',
                  type: 'paragraph',
                },
                {
                  text: 'End Summary',
                  type: 'paragraph',
                },
              ],
            },
            {
              type: 'CARD',
              key: '2',
              value: [
                {
                  text: 'Chapter 2',
                  type: 'heading-one',
                },
                {
                  text: 'Begin Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Favourite_Colour: Turquoise',
                  type: 'paragraph',
                },
                {
                  text: 'Height: 6 ft',
                  type: 'paragraph',
                },
                {
                  text: 'id: 5',
                  type: 'paragraph',
                },
                {
                  text: 'color: green',
                  type: 'paragraph',
                },
                {
                  text: 'characters: hey!',
                  type: 'paragraph',
                },
                {
                  text: 'End Summary',
                  type: 'paragraph',
                },
              ],
            },
            {
              type: 'CARD',
              key: '3',
              value: [
                {
                  text: 'Chapter 3',
                  type: 'heading-one',
                },
              ],
            },
          ],
          characters: [],
          places: [],
          notes: [],
        }
        it('should not create a custom attribute and only accept the value if valid', () => {
          const result = removeBeatFromKeys(
            accumulateCards(categories, accumulateBeats(categories, initialFile))
          )
          expect(result.cards).toEqual([
            {
              beatId: 3,
              bookId: null,
              characters: [],
              color: null,
              description: 'First paragraph of text\nSecond paragraph of text',
              fromTemplateId: null,
              id: 2,
              imageId: null,
              lineId: 1,
              places: [],
              positionInBeat: 0,
              positionWithinLine: 0,
              tags: [],
              templates: [],
              title: 'Chapter 1',
              Favourite_Colour: 'Blue',
            },
            {
              beatId: 4,
              bookId: null,
              color: null,
              description: [],
              fromTemplateId: null,
              id: 3,
              imageId: null,
              lineId: 1,
              places: [],
              positionInBeat: 0,
              positionWithinLine: 0,
              tags: [],
              templates: [],
              title: 'Chapter 2',
              Height: '6 ft',
              Favourite_Colour: 'Turquoise',
              characters: ['hey!'],
            },
          ])
          expect(result.customAttributes).toEqual({
            cards: [],
            scenes: [
              {
                type: 'text',
                name: 'Favourite_Colour',
              },
              {
                type: 'text',
                name: 'Height',
              },
            ],
            notes: [],
            places: [],
            characters: [],
            lines: [],
          })
        })
      })
    })
  })
  describe('given a categories object with 2 levels of hierarchy in cards', () => {
    describe('and only one top-level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'My book',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'blah 1',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.2',
            value: [
              {
                text: 'Chapter 2',
                type: 'heading-two',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'blah 2',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.3',
            value: [
              {
                text: 'Chapter 3',
                type: 'heading-two',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'blah 3',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with cards for the bottom tier', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'blah 1' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 1',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'blah 2' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 2',
          },
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'blah 3' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 3',
          },
        ])
        expect(resultFile.lines).toEqual([
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            isPinned: false,
            position: 0,
            title: 'Main Plot',
          },
        ])
      })
    })
    describe('and more than one top-level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Act 2',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Act 1',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'blah 1',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.2',
            value: [
              {
                text: 'Chapter 2',
                type: 'heading-two',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'blah 2',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.3',
            value: [
              {
                text: 'Chapter 3',
                type: 'heading-two',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'blah 3',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with cards for the bottom tier', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'blah 1' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 1',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'blah 2' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 2',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [{ children: [{ text: 'blah 3' }], type: 'paragraph' }],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Chapter 3',
          },
        ])
      })
    })
  })
  describe('given a categories object with 3 levels of hierarchy in cards', () => {
    describe('and only one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'My book',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.2',
            value: [
              {
                text: 'Scene 2',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.3',
            value: [
              {
                text: 'Scene 3',
                type: 'heading-three',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with cards for the bottom tier', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Scene 1',
          },
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Scene 2',
          },
          {
            beatId: 3,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Scene 3',
          },
        ])
      })
    })
    describe('and more than one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Act 2',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Act 1',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.2',
            value: [
              {
                text: 'Scene 2',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.3',
            value: [
              {
                text: 'Scene 3',
                type: 'heading-three',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with cards for the bottom tier', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Scene 1',
          },
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Scene 2',
          },
          {
            beatId: 5,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Scene 3',
          },
        ])
      })
    })
  })
  describe('given a categories object with 4 levels of hierarchy in cards', () => {
    describe('and only one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'My book',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1',
            value: [
              {
                text: 'Sub-Scene 1',
                type: 'heading-four',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'The first paragraph text',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.2',
            value: [
              {
                text: 'Sub-Scene 2',
                type: 'heading-four',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Some paragraph text',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.3',
            value: [
              {
                text: 'Sub-Scene 3',
                type: 'heading-four',
              },
              {
                text: 'Begin Summary',
                type: 'paragraph',
              },
              {
                text: 'Some other paragraph text',
                type: 'paragraph',
              },
              {
                text: 'End Summary',
                type: 'paragraph',
              },
              {
                text: 'Extra text',
                type: 'paragraph',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with cards for the bottom tier', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The first paragraph text',
                  },
                ],
              },
            ],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Sub-Scene 1',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Some paragraph text',
                  },
                ],
              },
            ],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Sub-Scene 2',
          },
          {
            beatId: 4,
            bookId: null,
            characters: [],
            color: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Some other paragraph text',
                  },
                ],
              },
            ],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Sub-Scene 3',
          },
        ])
      })
      describe('and a paragraph on a second level heading', () => {
        const categories = {
          cards: [
            {
              type: 'CARD',
              key: '1',
              value: [
                {
                  text: 'My book',
                  type: 'heading-one',
                },
              ],
            },
            {
              type: 'CARD',
              key: '1.1',
              value: [
                {
                  text: 'Chapter 1',
                  type: 'heading-two',
                },
                {
                  text: 'Begin Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Some paragraph text for Chapter 1',
                  type: 'paragraph',
                },
                {
                  text: 'End Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Extra text',
                  type: 'paragraph',
                },
              ],
            },
            {
              type: 'CARD',
              key: '1.1.1',
              value: [
                {
                  text: 'Scene 1',
                  type: 'heading-three',
                },
              ],
            },
            {
              type: 'CARD',
              key: '1.1.1.1',
              value: [
                {
                  text: 'Sub-Scene 1',
                  type: 'heading-four',
                },
                {
                  text: 'Begin Summary',
                  type: 'paragraph',
                },
                {
                  text: 'The first paragraph text',
                  type: 'paragraph',
                },
                {
                  text: 'End Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Extra text',
                  type: 'paragraph',
                },
              ],
            },
            {
              type: 'CARD',
              key: '1.1.1.2',
              value: [
                {
                  text: 'Sub-Scene 2',
                  type: 'heading-four',
                },
                {
                  text: 'Begin Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Some paragraph text',
                  type: 'paragraph',
                },
                {
                  text: 'End Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Extra text',
                  type: 'paragraph',
                },
              ],
            },
            {
              type: 'CARD',
              key: '1.1.1.3',
              value: [
                {
                  text: 'Sub-Scene 3',
                  type: 'heading-four',
                },
                {
                  text: 'Begin Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Some other paragraph text',
                  type: 'paragraph',
                },
                {
                  text: 'End Summary',
                  type: 'paragraph',
                },
                {
                  text: 'Extra text',
                  type: 'paragraph',
                },
              ],
            },
          ],
          characters: [],
          places: [],
          notes: [],
        }
        it('should produce a file with cards for Chapter 1 & the bottom tier', () => {
          const resultFile = removeBeatFromKeys(
            accumulateCards(categories, accumulateBeats(categories, initialFile))
          )
          expect(resultFile.cards).toEqual([
            {
              beatId: 3,
              bookId: null,
              characters: [],
              color: null,
              description: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Some paragraph text for Chapter 1',
                    },
                  ],
                },
              ],
              fromTemplateId: null,
              id: 2,
              imageId: null,
              lineId: 1,
              places: [],
              positionInBeat: 0,
              positionWithinLine: 0,
              tags: [],
              templates: [],
              title: 'Chapter 1',
            },
            {
              beatId: 4,
              bookId: null,
              characters: [],
              color: null,
              description: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The first paragraph text',
                    },
                  ],
                },
              ],
              fromTemplateId: null,
              id: 3,
              imageId: null,
              lineId: 1,
              places: [],
              positionInBeat: 0,
              positionWithinLine: 0,
              tags: [],
              templates: [],
              title: 'Sub-Scene 1',
            },
            {
              beatId: 4,
              bookId: null,
              characters: [],
              color: null,
              description: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Some paragraph text',
                    },
                  ],
                },
              ],
              fromTemplateId: null,
              id: 4,
              imageId: null,
              lineId: 1,
              places: [],
              positionInBeat: 0,
              positionWithinLine: 0,
              tags: [],
              templates: [],
              title: 'Sub-Scene 2',
            },
            {
              beatId: 4,
              bookId: null,
              characters: [],
              color: null,
              description: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Some other paragraph text',
                    },
                  ],
                },
              ],
              fromTemplateId: null,
              id: 5,
              imageId: null,
              lineId: 1,
              places: [],
              positionInBeat: 0,
              positionWithinLine: 0,
              tags: [],
              templates: [],
              title: 'Sub-Scene 3',
            },
          ])
        })
      })
    })
    describe('and more than one top level heading', () => {
      const categories = {
        cards: [
          {
            type: 'CARD',
            key: '2',
            value: [
              {
                text: 'Act 2',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1',
            value: [
              {
                text: 'Act 1',
                type: 'heading-one',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1',
            value: [
              {
                text: 'Chapter 1',
                type: 'heading-two',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1',
            value: [
              {
                text: 'Scene 1',
                type: 'heading-three',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.1',
            value: [
              {
                text: 'Sub-Scene 1',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.2',
            value: [
              {
                text: 'Sub-Scene 2',
                type: 'heading-four',
              },
            ],
          },
          {
            type: 'CARD',
            key: '1.1.1.3',
            value: [
              {
                text: 'Sub-Scene 3',
                type: 'heading-four',
              },
            ],
          },
        ],
        characters: [],
        places: [],
        notes: [],
      }
      it('should produce a file with cards for the bottom tier', () => {
        const resultFile = removeBeatFromKeys(
          accumulateCards(categories, accumulateBeats(categories, initialFile))
        )
        expect(resultFile.cards).toEqual([
          {
            beatId: 6,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 2,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Sub-Scene 1',
          },
          {
            beatId: 6,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 3,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Sub-Scene 2',
          },
          {
            beatId: 6,
            bookId: null,
            characters: [],
            color: null,
            description: [],
            fromTemplateId: null,
            id: 4,
            imageId: null,
            lineId: 1,
            places: [],
            positionInBeat: 0,
            positionWithinLine: 0,
            tags: [],
            templates: [],
            title: 'Sub-Scene 3',
          },
        ])
        expect(resultFile.lines).toEqual([
          {
            bookId: 1,
            characterId: null,
            color: '#6cace4',
            expanded: null,
            fromTemplateId: null,
            id: 1,
            isPinned: false,
            position: 0,
            title: 'Main Plot',
          },
        ])
      })
    })
  })
})

describe('accumulateCharacters', () => {
  const initialFile = withEmptyBeatsForBookOne(emptyFile())
  describe('given no characters in the categorised content', () => {
    it('should not create any characters', () => {
      const result = accumulateCharacters(EMPTY_CATEGORISED_SECTIONS, initialFile)
      expect(result.characters).toEqual([])
    })
  })
  describe('given a character in the categorised content with only a heading', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      characters: [
        {
          type: 'CHARACTER',
          key: '2',
          value: [
            {
              text: 'characters',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CHARACTER',
          key: '2.1',
          value: [
            {
              text: 'Bill',
              type: 'heading-two',
            },
          ],
        },
      ],
    }
    it('should add the character to the file with the heading as the name', () => {
      const result = accumulateCharacters(categories, initialFile)
      expect(result.characters).toEqual([
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: '',
          id: 2,
          imageId: null,
          name: 'Bill',
          noteIds: [],
          notes: [],
          position: 0,
          tags: [],
          templates: [],
        },
      ])
    })
  })
  describe('given a character in the categorised content with a heading and paragraph', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      characters: [
        {
          type: 'CHARACTER',
          key: '2',
          value: [
            {
              text: 'characters',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CHARACTER',
          key: '2.1',
          value: [
            {
              text: 'Bill',
              type: 'heading-two',
            },
            {
              text: "Bill's description",
              type: 'paragraph',
            },
          ],
        },
      ],
    }
    it('should add the character to the file with the heading as the name and the paragraph as the description', () => {
      const result = accumulateCharacters(categories, initialFile)
      expect(result.characters).toEqual([
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: '',
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: "Bill's description",
                },
              ],
            },
          ],
          id: 2,
          imageId: null,
          name: 'Bill',
          noteIds: [],
          position: 0,
          tags: [],
          templates: [],
        },
      ])
    })
  })
  describe('given two characters in the content', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      characters: [
        {
          type: 'CHARACTER',
          key: '2',
          value: [
            {
              text: 'characters',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CHARACTER',
          key: '2.1',
          value: [
            {
              text: 'Bill',
              type: 'heading-two',
            },
            {
              text: "Bill's description",
              type: 'paragraph',
            },
          ],
        },
        {
          type: 'CHARACTER',
          key: '2.2',
          value: [
            {
              text: 'Sarah',
              type: 'heading-two',
            },
            {
              text: "Description: She's the best!",
              type: 'paragraph',
            },
            {
              text: "Sarah's description",
              type: 'paragraph',
            },
            {
              text: 'Second line of her description',
              type: 'paragraph',
            },
          ],
        },
      ],
    }
    it('should produce a file with two characters', () => {
      const result = accumulateCharacters(categories, initialFile)
      expect(result.characters).toEqual([
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: '',
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: "Bill's description",
                },
              ],
            },
          ],
          id: 2,
          imageId: null,
          name: 'Bill',
          noteIds: [],
          position: 0,
          tags: [],
          templates: [],
        },
        {
          bookIds: [],
          cards: [],
          categoryId: null,
          color: null,
          description: "She's the best!",
          notes: [
            {
              type: 'paragraph',
              children: [
                {
                  text: "Sarah's description",
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Second line of her description',
                },
              ],
            },
          ],
          id: 3,
          imageId: null,
          name: 'Sarah',
          noteIds: [],
          position: 0,
          tags: [],
          templates: [],
        },
      ])
    })
  })
})

describe('accumulatePlaces', () => {
  const initialFile = withEmptyBeatsForBookOne(emptyFile())
  describe('given empty categories', () => {
    it('should produce no new places', () => {
      const result = accumulatePlaces(EMPTY_CATEGORISED_SECTIONS, initialFile)
      expect(result.places).toEqual([])
    })
  })
  describe('given a place in the categorised content with only a heading', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      places: [
        {
          type: 'PLACE',
          key: '2',
          value: [
            {
              text: 'places',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'PLACE',
          key: '2.1',
          value: [
            {
              text: 'Johannesburg',
              type: 'heading-two',
            },
          ],
        },
      ],
    }
    it('should add the place to the file with the heading as the name', () => {
      const result = accumulatePlaces(categories, initialFile)
      expect(result.places).toEqual([
        {
          bookIds: [],
          cards: [],
          color: null,
          description: '',
          id: 2,
          imageId: null,
          name: 'Johannesburg',
          noteIds: [],
          notes: [],
          position: 0,
          tags: [],
          templates: [],
        },
      ])
    })
  })
  describe('given a place in the categorised content with a heading and a paragraph', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      places: [
        {
          type: 'PLACE',
          key: '2',
          value: [
            {
              text: 'places',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'PLACE',
          key: '2.1',
          value: [
            {
              text: 'Johannesburg',
              type: 'heading-two',
            },
            {
              text: 'AKA Egoli, which means "the city of gold" in Zulu.',
              type: 'paragraph',
            },
          ],
        },
      ],
    }
    it('should add the place to the file with the heading as the name and the paragraph as the description', () => {
      const result = accumulatePlaces(categories, initialFile)
      expect(result.places).toEqual([
        {
          bookIds: [],
          cards: [],
          color: null,
          description: '',
          id: 2,
          imageId: null,
          name: 'Johannesburg',
          noteIds: [],
          notes: [
            {
              children: [
                {
                  text: 'AKA Egoli, which means "the city of gold" in Zulu.',
                },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          tags: [],
          templates: [],
        },
      ])
    })
  })
  describe('given two places in the content', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      places: [
        {
          type: 'PLACE',
          key: '2',
          value: [
            {
              text: 'places',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'PLACE',
          key: '2.1',
          value: [
            {
              text: 'Johannesburg',
              type: 'heading-two',
            },
            {
              text: 'AKA Egoli, which means "the city of gold" in Zulu.',
              type: 'paragraph',
            },
          ],
        },
        {
          type: 'PLACE',
          key: '2.2',
          value: [
            {
              text: 'Cape Town',
              type: 'heading-two',
            },
            {
              text: 'Description: The Mother City',
              type: 'paragraph',
            },
            {
              text: "Cape Town's description",
              type: 'paragraph',
            },
            {
              text: "It's beautiful, is on the coastline, has forests and is walkable!",
              type: 'paragraph',
            },
          ],
        },
      ],
    }
    it('should produce a file with two places', () => {
      const result = accumulatePlaces(categories, initialFile)
      expect(result.places).toEqual([
        {
          bookIds: [],
          cards: [],
          color: null,
          description: '',
          id: 2,
          imageId: null,
          name: 'Johannesburg',
          noteIds: [],
          notes: [
            {
              children: [{ text: 'AKA Egoli, which means "the city of gold" in Zulu.' }],
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
          color: null,
          description: 'The Mother City',
          id: 3,
          imageId: null,
          name: 'Cape Town',
          noteIds: [],
          notes: [
            { children: [{ text: "Cape Town's description" }], type: 'paragraph' },
            {
              children: [
                { text: "It's beautiful, is on the coastline, has forests and is walkable!" },
              ],
              type: 'paragraph',
            },
          ],
          position: 0,
          tags: [],
          templates: [],
        },
      ])
    })
  })
})

describe('accumulateNotes', () => {
  const initialFile = withEmptyBeatsForBookOne(emptyFile())
  describe('given empty categories', () => {
    it('shoudl produce no new places', () => {
      const result = accumulateNotes(EMPTY_CATEGORISED_SECTIONS, initialFile)
      expect(result.notes).toEqual([])
    })
  })
  describe('given a note in the categorised content with only a heading', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      notes: [
        {
          type: 'NOTE',
          key: '2',
          value: [
            {
              text: 'notes',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'NOTE',
          key: '2.1',
          value: [
            {
              text: 'My new idea',
              type: 'heading-two',
            },
          ],
        },
      ],
    }
    it('should add the note to the file with the heading as the name', () => {
      const result = accumulateNotes(categories, initialFile)
      expect(result.notes).toEqual([
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [],
          id: 2,
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          tags: [],
          templates: [],
          title: 'My new idea',
        },
      ])
    })
  })
  describe('given a note in the categorised content with a heading and a paragraph', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      notes: [
        {
          type: 'NOTE',
          key: '2',
          value: [
            {
              text: 'notes',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'NOTE',
          key: '2.1',
          value: [
            {
              text: 'My new idea',
              type: 'heading-two',
            },
            {
              text: 'Dinosaurs are thin on one end, fat in the midddle and then on the other end.',
              type: 'paragraph',
            },
          ],
        },
      ],
    }
    it('should add the note to the file with the heading as the name and the paragraph as the descirption', () => {
      const result = accumulateNotes(categories, initialFile)
      expect(result.notes).toEqual([
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            {
              children: [
                {
                  text: 'Dinosaurs are thin on one end, fat in the midddle and then on the other end.',
                },
              ],
              type: 'paragraph',
            },
          ],
          id: 2,
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          tags: [],
          templates: [],
          title: 'My new idea',
        },
      ])
    })
  })
  describe('given two notes in the content', () => {
    const categories = {
      ...EMPTY_CATEGORISED_SECTIONS,
      notes: [
        {
          type: 'NOTE',
          key: '2',
          value: [
            {
              text: 'notes',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'NOTE',
          key: '2.1',
          value: [
            {
              text: 'My new idea',
              type: 'heading-two',
            },
            {
              text: 'Dinosaurs are thin on one end, fat in the midddle and then on the other end.',
              type: 'paragraph',
            },
          ],
        },
        {
          type: 'NOTE',
          key: '2.2',
          value: [
            {
              text: 'Length',
              type: 'heading-two',
            },
            {
              text: 'I should keep this story short enough.',
              type: 'paragraph',
            },
            {
              text: 'This story is meant to create an impression quickly and leave the reader wanting more.',
              type: 'paragraph',
            },
          ],
        },
      ],
    }
    it('should create a file with both those notes in it', () => {
      const result = accumulateNotes(categories, initialFile)
      expect(result.notes).toEqual([
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            {
              children: [
                {
                  text: 'Dinosaurs are thin on one end, fat in the midddle and then on the other end.',
                },
              ],
              type: 'paragraph',
            },
          ],
          id: 2,
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          tags: [],
          templates: [],
          title: 'My new idea',
        },
        {
          bookIds: [],
          categoryId: null,
          characters: [],
          content: [
            { children: [{ text: 'I should keep this story short enough.' }], type: 'paragraph' },
            {
              children: [
                {
                  text: 'This story is meant to create an impression quickly and leave the reader wanting more.',
                },
              ],
              type: 'paragraph',
            },
          ],
          id: 3,
          imageId: null,
          lastEdited: null,
          places: [],
          position: 0,
          tags: [],
          templates: [],
          title: 'Length',
        },
      ])
    })
  })
})

describe('addHierarchyConfig', () => {
  const initialFile = withEmptyBeatsForBookOne(emptyFile())
  describe('given a file with no cards', () => {
    const categories = EMPTY_CATEGORISED_SECTIONS
    it('should leave the hierarchy config as-is', () => {
      const result = addHierarchyConfig(accumulateBeats(categories, initialFile))
      expect(result.hierarchyLevels).toBe(initialFile.hierarchyLevels)
    })
  })
  describe('given a file with a flat structure of cards', () => {
    const categories = {
      cards: [
        {
          type: 'CARD',
          key: '1',
          value: [
            {
              text: 'Chapter 1',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '2',
          value: [
            {
              text: 'Chapter 2',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '3',
          value: [
            {
              text: 'Chapter 3',
              type: 'heading-one',
            },
          ],
        },
      ],
      characters: [],
      places: [],
      notes: [],
    }
    it('should leave the hierarchy config as-is', () => {
      const result = addHierarchyConfig(accumulateBeats(categories, initialFile))
      expect(result.hierarchyLevels).toBe(initialFile.hierarchyLevels)
    })
  })
  describe('given a file with two tiers of structure', () => {
    const categories = {
      cards: [
        {
          type: 'CARD',
          key: '2',
          value: [
            {
              text: 'Act 2',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1',
          value: [
            {
              text: 'Act 1',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.1',
          value: [
            {
              text: 'Chapter 1',
              type: 'heading-two',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.2',
          value: [
            {
              text: 'Chapter 2',
              type: 'heading-two',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.3',
          value: [
            {
              text: 'Chapter 3',
              type: 'heading-two',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.3.1',
          value: [
            {
              text: 'Scene 1',
              type: 'heading-three',
            },
          ],
        },
      ],
      characters: [],
      places: [],
      notes: [],
    }
    it("should add a level of structure to that book's structure", () => {
      const result = addHierarchyConfig(accumulateBeats(categories, initialFile))
      expect(result.hierarchyLevels).toEqual({
        1: {
          0: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'DASHED',
            dark: { borderColor: '#baed79', textColor: '#baed79' },
            level: 0,
            light: { borderColor: '#78be20', textColor: '#78be20' },
            name: 'Chapter',
            textColor: '#0b1117',
            textSize: 24,
          },
          1: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'NONE',
            dark: { borderColor: '#ccc', textColor: '#ccc' },
            level: 1,
            light: { borderColor: '#6cace4', textColor: '#6cace4' },
            name: 'Scene',
            textColor: '#0b1117',
            textSize: 24,
          },
        },
        series: {
          0: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'NONE',
            dark: { borderColor: '#ccc', textColor: '#ccc' },
            level: 0,
            light: { borderColor: '#6cace4', textColor: '#0b1117' },
            name: 'Chapter',
            textColor: '#0b1117',
            textSize: 24,
          },
        },
      })
    })
  })
  describe('given categories with three levels of structure', () => {
    const categories = {
      cards: [
        {
          type: 'CARD',
          key: '2',
          value: [
            {
              text: 'Act 2',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1',
          value: [
            {
              text: 'Act 1',
              type: 'heading-one',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.1',
          value: [
            {
              text: 'Chapter 1',
              type: 'heading-two',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.1.1',
          value: [
            {
              text: 'Scene 1',
              type: 'heading-three',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.1.2',
          value: [
            {
              text: 'Scene 2',
              type: 'heading-three',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.1.3',
          value: [
            {
              text: 'Scene 3',
              type: 'heading-three',
            },
          ],
        },
        {
          type: 'CARD',
          key: '1.1.3.1',
          value: [
            {
              text: 'Scene Card 1',
              type: 'heading-four',
            },
          ],
        },
      ],
      characters: [],
      places: [],
      notes: [],
    }
    it('should result in a file with levels of hierarchy config', () => {
      const result = addHierarchyConfig(accumulateBeats(categories, initialFile))
      expect(result.hierarchyLevels).toEqual({
        1: {
          0: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'SOLID',
            dark: { borderColor: '#ffb8b5', textColor: '#ffb8b5' },
            level: 0,
            light: { borderColor: '#e5554f', textColor: '#e5554f' },
            name: 'Act',
            textColor: '#0b1117',
            textSize: 24,
          },
          1: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'DASHED',
            dark: { borderColor: '#baed79', textColor: '#baed79' },
            level: 1,
            light: { borderColor: '#78be20', textColor: '#78be20' },
            name: 'Chapter',
            textColor: '#0b1117',
            textSize: 24,
          },
          2: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'NONE',
            dark: { borderColor: '#ccc', textColor: '#ccc' },
            level: 2,
            light: { borderColor: '#6cace4', textColor: '#6cace4' },
            name: 'Scene',
            textColor: '#0b1117',
            textSize: 24,
          },
        },
        series: {
          0: {
            autoNumber: true,
            backgroundColor: 'none',
            borderColor: '#6cace4',
            borderStyle: 'NONE',
            dark: { borderColor: '#ccc', textColor: '#ccc' },
            level: 0,
            light: { borderColor: '#6cace4', textColor: '#0b1117' },
            name: 'Chapter',
            textColor: '#0b1117',
            textSize: 24,
          },
        },
      })
    })
  })
})

describe('fixTagsPlacesAndCharacters', () => {
  const initialFile = withEmptyBeatsForBookOne(emptyFile())
  describe('given the initial file', () => {
    it('should produce that file unchanged except for adding character attribute metadata', () => {
      const result = fixTagsPlacesAndCharacters(initialFile)
      expect(omit(result, 'attributes')).toEqual(omit(initialFile, 'attributes'))
    })
  })
  describe('given a file with characters', () => {
    describe('that have tags by name', () => {
      const fileWithTaggedCharacters = {
        ...initialFile,
        characters: [
          {
            ...initialState.character,
            tags: ['best', 'first'],
          },
        ],
      }
      it('should create tags and associate them with the character', () => {
        const result = fixTagsPlacesAndCharacters(fileWithTaggedCharacters)
        expect(result.characters).toEqual([
          {
            attributes: [{ bookId: 1, id: 2, value: [2, 3] }],
            bookIds: [],
            cards: [],
            categoryId: null,
            color: null,
            description: '',
            id: 1,
            imageId: null,
            name: '',
            noteIds: [],
            notes: [{ children: [{ text: '' }], type: 'paragraph' }],
            position: 0,
            tags: [],
            templates: [],
          },
        ])
        expect(result.attributes).toEqual({
          characters: [{ id: 2, name: 'tags', type: 'base-attribute' }],
        })
        expect(result.tags).toEqual([
          { color: null, id: 2, title: 'best' },
          { color: null, id: 3, title: 'first' },
        ])
      })
    })
  })
  describe('given a file with places', () => {
    describe('that have places by name', () => {
      const fileWithTaggedPlaces = {
        ...initialFile,
        places: [
          {
            ...initialState.place,
            name: 'JHB',
            id: 1,
            tags: ['best', 'first'],
          },
        ],
      }
      it('should associate the places that exist and ignore those that do not', () => {
        const result = fixTagsPlacesAndCharacters(fileWithTaggedPlaces)
        expect(result.places).toEqual([
          {
            bookIds: [],
            cards: [],
            color: null,
            description: '',
            id: 1,
            imageId: null,
            name: 'JHB',
            noteIds: [],
            notes: [{ children: [{ text: '' }], type: 'paragraph' }],
            position: 0,
            tags: [2, 3],
            templates: [],
          },
        ])
        expect(result.tags).toEqual([
          { color: null, id: 2, title: 'best' },
          { color: null, id: 3, title: 'first' },
        ])
      })
    })
  })
  describe('given a file with tagged, notes that have places and characters', () => {
    const fileWithTaggedCharacters = {
      ...initialFile,
      notes: [
        {
          ...initialState.note,
          tags: ['best', 'first'],
          places: ['JHB', 'CPT'],
          characters: ['Sarah', 'Bob'],
        },
      ],
      characters: [
        {
          ...initialState.character,
          name: 'Sarah',
          id: 2,
        },
      ],
      places: [
        {
          ...initialState.place,
          name: 'JHB',
          id: 3,
        },
      ],
    }
    it('should replace those raw attributes with id attributes', () => {
      const result = fixTagsPlacesAndCharacters(fileWithTaggedCharacters)
      expect(result.notes).toEqual([
        {
          bookIds: [],
          categoryId: null,
          characters: [2],
          content: [{ children: [{ text: '' }], type: 'paragraph' }],
          id: 1,
          imageId: null,
          lastEdited: null,
          places: [3],
          position: 0,
          tags: [2, 3],
          templates: [],
          title: '',
        },
      ])
      expect(result.tags).toEqual([
        { color: null, id: 2, title: 'best' },
        { color: null, id: 3, title: 'first' },
      ])
    })
  })
})
