import {
  noPlotlinesRemoved,
  noDanglingCards,
  noCardsRemoved,
  noDanglingPlotlines,
  noBeatsRemoved,
  noNotesRemoved,
  noPlacesRemoved,
  noCharactersRemoved,
  noTagsRemoved,
  hierarchyConfigMatchesBeatDepthForEachBook,
  noDanglingBeats,
  allTextCustomAttributeTypesHaveValidValues,
  allEntityToEntityAssociationsAreValid,
} from '../changeAssertions'
import { emptyFile } from '../../store/newFileState'

import { zelda_no_dangling_cards, zelda_with_dangling_cards } from './fixtures'

describe('noDanglingCards', () => {
  describe('given the empty file', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noDanglingCards(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda test file', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noDanglingCards(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda test file with dangling cards', () => {
    it('should produce false', () => {
      // This file has cards with:
      //  - non-existent beats,
      //  - non-existent lines, and
      //  - lines that don't match the books of their beats.
      const file = {
        user: zelda_with_dangling_cards,
      }
      expect(noDanglingCards(file, file)).toBeFalsy()
    })
  })
})

describe('noCardsRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noCardsRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noCardsRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with dangling cards and the zelda file without (cards are removed in the version without danglers)', () => {
    it('should produce false', () => {
      const file_more_cards = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_cards = {
        user: zelda_no_dangling_cards,
      }
      expect(noCardsRemoved(file_more_cards, file_fewer_cards)).toBeFalsy()
    })
  })
})

describe('noDanglingPlotlines', () => {
  describe('given the empty file', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noDanglingPlotlines(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with no cards', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noDanglingPlotlines(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with dangling cards (it also has dangling lines)', () => {
    it('should produce false', () => {
      const file = {
        user: zelda_with_dangling_cards,
      }
      expect(noDanglingPlotlines(file, file)).toBeFalsy()
    })
  })
})

describe('noPlotlinesRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noPlotlinesRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noPlotlinesRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with dangling lines and the zelda file without (lines are removed in the version without danglers)', () => {
    it('should produce false', () => {
      const file_more_lines = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_lines = {
        user: zelda_no_dangling_cards,
      }
      expect(noPlotlinesRemoved(file_more_lines, file_fewer_lines)).toBeFalsy()
    })
  })
})

describe('noBeatsRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noBeatsRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noBeatsRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with fewer beats', () => {
    it('should produce false', () => {
      const file_more_beats = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_beats = {
        user: {
          ...zelda_no_dangling_cards,
          beats: {
            ...zelda_no_dangling_cards.beats,
            1: {
              children: {},
              heap: {},
              index: {},
            },
          },
        },
      }
      expect(noBeatsRemoved(file_more_beats, file_fewer_beats)).toBeFalsy()
    })
  })
})

describe('noNotesRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noNotesRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noNotesRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with fewer notes', () => {
    it('should produce false', () => {
      const file_more_notes = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_notes = {
        user: {
          ...zelda_no_dangling_cards,
          notes: zelda_no_dangling_cards.notes.filter(({ id }) => {
            return id !== 2
          }),
        },
      }
      expect(noNotesRemoved(file_more_notes, file_fewer_notes)).toBeFalsy()
    })
  })
})

describe('noPlacesRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noPlacesRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noPlacesRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with fewer places', () => {
    it('should produce false', () => {
      const file_more_places = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_places = {
        user: {
          ...zelda_no_dangling_cards,
          places: zelda_no_dangling_cards.places.filter(({ id }) => {
            return id !== 2
          }),
        },
      }
      expect(noPlacesRemoved(file_more_places, file_fewer_places)).toBeFalsy()
    })
  })
})

describe('noCharactersRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noCharactersRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noCharactersRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with characters', () => {
    it('should produce false', () => {
      const file_more_characters = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_characters = {
        user: {
          ...zelda_no_dangling_cards,
          characters: zelda_no_dangling_cards.characters.filter(({ id }) => {
            return id !== 2
          }),
        },
      }
      expect(noCharactersRemoved(file_more_characters, file_fewer_characters)).toBeFalsy()
    })
  })
})

describe('noTagsRemoved', () => {
  describe('given the empty file twice', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noTagsRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file twice', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noTagsRemoved(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file with fewer tags', () => {
    it('should produce false', () => {
      const file_more_lines = {
        user: zelda_with_dangling_cards,
      }
      const file_fewer_lines = {
        user: {
          ...zelda_no_dangling_cards,
          tags: zelda_no_dangling_cards.tags.filter(({ id }) => {
            return id !== 1
          }),
        },
      }
      expect(noTagsRemoved(file_more_lines, file_fewer_lines)).toBeFalsy()
    })
  })
})

describe('hierarchyConfigMatchesBeatDepthForEachBook', () => {
  describe('given the empty book', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(hierarchyConfigMatchesBeatDepthForEachBook(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda book', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(hierarchyConfigMatchesBeatDepthForEachBook(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda book with deeper hierarchy configs', () => {
    it('should produce true', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          hierarchyLevels: {
            ...zelda_no_dangling_cards.hierarchyLevels,
            1: {
              0: {
                name: 'Chapter',
                level: 0,
                autoNumber: true,
                textSize: 24,
                borderStyle: 'NONE',
                backgroundColor: 'none',
                textColor: '#0b1117',
                borderColor: '#6cace4',
                dark: {
                  borderColor: '#c9e6ff',
                  textColor: '#c9e6ff',
                },
                light: {
                  borderColor: '#6cace4',
                  textColor: '#0b1117',
                },
              },
              1: {
                name: 'Act',
                level: 0,
                autoNumber: true,
                textSize: 24,
                borderStyle: 'NONE',
                backgroundColor: 'none',
                textColor: '#0b1117',
                borderColor: '#6cace4',
                dark: {
                  borderColor: '#c9e6ff',
                  textColor: '#c9e6ff',
                },
                light: {
                  borderColor: '#6cace4',
                  textColor: '#0b1117',
                },
              },
            },
          },
        },
      }
      expect(hierarchyConfigMatchesBeatDepthForEachBook(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda book with beats that are too deep', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          beats: {
            ...zelda_no_dangling_cards,
            1: {
              children: {
                2: [16, 17],
                16: [],
                17: [],
                null: [2],
              },
              heap: {
                2: null,
                16: 2,
                17: 2,
              },
              index: {
                2: {
                  id: 2,
                  bookId: 1,
                  position: 0,
                  title: 'auto',
                  time: 0,
                  templates: [],
                  autoOutlineSort: true,
                  fromTemplateId: null,
                  expanded: true,
                },
                16: {
                  autoOutlineSort: true,
                  bookId: 1,
                  fromTemplateId: null,
                  id: 16,
                  position: 1,
                  time: 0,
                  title: 'auto',
                  expanded: true,
                },
                17: {
                  autoOutlineSort: true,
                  bookId: 1,
                  fromTemplateId: null,
                  id: 17,
                  position: 2,
                  time: 0,
                  title: 'auto',
                  expanded: true,
                },
              },
            },
          },
        },
      }
      expect(hierarchyConfigMatchesBeatDepthForEachBook(file, file)).toBeFalsy()
    })
  })
})

describe('noDanglingBeats', () => {
  describe('given the empty file', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(noDanglingBeats(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(noDanglingBeats(file, file)).toBeTruthy()
    })
  })
  describe('given a file with beats that refer to non-existent books', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          beats: {
            ...zelda_no_dangling_cards.beats,
            1: {
              children: {
                2: [],
                16: [],
                17: [],
                null: [17, 16, 2],
              },
              heap: {
                2: null,
                16: null,
                17: null,
              },
              index: {
                2: {
                  id: 2,
                  bookId: 12,
                  position: 0,
                  title: 'auto',
                  time: 0,
                  templates: [],
                  autoOutlineSort: true,
                  fromTemplateId: null,
                  expanded: true,
                },
                16: {
                  autoOutlineSort: true,
                  bookId: 1,
                  fromTemplateId: null,
                  id: 16,
                  position: 1,
                  time: 0,
                  title: 'auto',
                  expanded: true,
                },
                17: {
                  autoOutlineSort: true,
                  bookId: 1,
                  fromTemplateId: null,
                  id: 17,
                  position: 2,
                  time: 0,
                  title: 'auto',
                  expanded: true,
                },
              },
            },
          },
        },
      }
      expect(noDanglingBeats(file, file)).toBeFalsy()
    })
  })
})

describe('allTextCustomAttributeTypesHaveValidValues', () => {
  describe('given the empty file', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(allTextCustomAttributeTypesHaveValidValues(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(allTextCustomAttributeTypesHaveValidValues(file, file)).toBeTruthy()
    })
  })
  describe('given a file with an invalid place attribute value', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          places: [
            {
              ...zelda_no_dangling_cards.places[0],
              one: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The castle',
                    },
                  ],
                },
              ],
            },
            ...zelda_no_dangling_cards.places.slice(1),
          ],
        },
      }
      expect(allTextCustomAttributeTypesHaveValidValues(file, file)).toBeFalsy()
    })
  })
  describe('given a file with an invalid card attribute value', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          cards: [
            {
              ...zelda_no_dangling_cards.cards[0],
              'attr 1': [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The castle',
                    },
                  ],
                },
              ],
            },
            ...zelda_no_dangling_cards.cards.slice(1),
          ],
        },
      }
      expect(allTextCustomAttributeTypesHaveValidValues(file, file)).toBeFalsy()
    })
  })
  describe('given a file with an invalid note attribute value', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          notes: [
            {
              ...zelda_no_dangling_cards.notes[0],
              first: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'The castle',
                    },
                  ],
                },
              ],
            },
            ...zelda_no_dangling_cards.notes.slice(1),
          ],
        },
      }
      expect(allTextCustomAttributeTypesHaveValidValues(file, file)).toBeFalsy()
    })
  })
})

describe('allEntityToEntityAssociationsAreValid', () => {
  describe('given the empty file', () => {
    it('should produce true', () => {
      const file = {
        user: emptyFile(),
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeTruthy()
    })
  })
  describe('given the zelda file', () => {
    it('should produce true', () => {
      const file = {
        user: zelda_no_dangling_cards,
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeTruthy()
    })
  })
  // Cards
  describe('given the zelda file where a card has an association to a non-existent tag', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          cards: [
            {
              ...zelda_no_dangling_cards.cards[0],
              tags: [...zelda_no_dangling_cards.cards[0].tags, 30],
            },
            ...zelda_no_dangling_cards.cards.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a card has an association to a non-existent character', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          cards: [
            {
              ...zelda_no_dangling_cards.cards[0],
              characters: [...zelda_no_dangling_cards.cards[0].characters, 30],
            },
            ...zelda_no_dangling_cards.cards.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a card has an association to a non-existent place', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          cards: [
            {
              ...zelda_no_dangling_cards.cards[0],
              places: [...zelda_no_dangling_cards.cards[0].places, 30],
            },
            ...zelda_no_dangling_cards.cards.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  // Places
  describe('given the zelda file where a place has an association to a non-existent tag', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          places: [
            {
              ...zelda_no_dangling_cards.places[0],
              tags: [...zelda_no_dangling_cards.places[0].tags, 30],
            },
            ...zelda_no_dangling_cards.places.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a place has an association to a non-existent note', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          places: [
            {
              ...zelda_no_dangling_cards.places[0],
              noteIds: [...zelda_no_dangling_cards.places[0].noteIds, 30],
            },
            ...zelda_no_dangling_cards.places.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a place has an association to a non-existent book', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          places: [
            {
              ...zelda_no_dangling_cards.places[0],
              bookIds: [...zelda_no_dangling_cards.places[0].bookIds, 30],
            },
            ...zelda_no_dangling_cards.places.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  // Notes
  describe('given the zelda file where a note has an association to a non-existent tag', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          notes: [
            {
              ...zelda_no_dangling_cards.notes[0],
              tags: [...zelda_no_dangling_cards.notes[0].tags, 30],
            },
            ...zelda_no_dangling_cards.notes.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a note has an association to a non-existent character', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          notes: [
            {
              ...zelda_no_dangling_cards.notes[0],
              characters: [...zelda_no_dangling_cards.notes[0].characters, 30],
            },
            ...zelda_no_dangling_cards.notes.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a note has an association to a non-existent book', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          notes: [
            {
              ...zelda_no_dangling_cards.notes[0],
              bookIds: [...zelda_no_dangling_cards.notes[0].bookIds, 30],
            },
            ...zelda_no_dangling_cards.notes.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  describe('given the zelda file where a note has an association to a non-existent place', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          notes: [
            {
              ...zelda_no_dangling_cards.notes[0],
              places: [...zelda_no_dangling_cards.notes[0].places, 30],
            },
            ...zelda_no_dangling_cards.notes.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
  // Characters
  describe('given the zelda file where a character has an association to a non-existent tag', () => {
    it('should produce false', () => {
      const file = {
        user: {
          ...zelda_no_dangling_cards,
          characters: [
            {
              ...zelda_no_dangling_cards.characters[0],
              attributes: [
                {
                  id: 6,
                  bookId: 1,
                  value: [50],
                },
              ],
            },
            ...zelda_no_dangling_cards.characters.slice(1),
          ],
        },
      }
      expect(allEntityToEntityAssociationsAreValid(file, file)).toBeFalsy()
    })
  })
})
