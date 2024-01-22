import { moveToAbove, positionResetByGroup } from '../lists'

const goldilocksNotes = [
  {
    id: 1,
    title: 'Rule of Threes',
    content: [
      {
        type: 'bulleted-list',
        children: [
          {
            children: [
              {
                text: 'Three bears',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Three bowls of porridge',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Three chairs',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Three beds ',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Three indiscretions ',
              },
            ],
            type: 'list-item',
          },
        ],
      },
    ],
    tags: [4],
    characters: [],
    places: [],
    lastEdited: 1597213167350,
    templates: [],
    imageId: null,
    bookIds: [],
  },
  {
    id: 2,
    title: 'Theme: Trust',
    content: [
      {
        type: 'bulleted-list',
        children: [
          {
            children: [
              {
                text: 'The bears leave their door unlocked, trusting no one will enter. ',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Goldilocks breaks their trust and runs away before she has to suffer repercussions. ',
              },
            ],
            type: 'list-item',
          },
        ],
      },
    ],
    tags: [2],
    characters: [],
    places: [],
    lastEdited: 1597183091866,
    templates: [],
    imageId: null,
    bookIds: [],
  },
  {
    id: 3,
    title: 'Theme: Stranger Danger',
    content: [
      {
        children: [
          {
            text: 'Strangers can be dangerous: ',
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            children: [
              {
                text: "Goldilocks (a stranger) entered and caused damaged to the bears' home.",
              },
            ],
            type: 'list-item',
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'Goldilocks could be seriously harmed if the bears (strangers to her) find her.',
              },
            ],
          },
        ],
      },
    ],
    tags: [1],
    characters: [],
    places: [],
    lastEdited: 1597186957639,
    templates: [],
    imageId: null,
    bookIds: [],
  },
  {
    id: 4,
    title: 'Theme: Greed',
    content: [
      {
        type: 'bulleted-list',
        children: [
          {
            children: [
              {
                text: "Goldilocks invites herself into their house, disrespecting the bears' space. ",
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Furthermore, she invites herself to their food and furniture. ',
              },
            ],
            type: 'list-item',
          },
        ],
      },
    ],
    tags: [3],
    characters: [],
    places: [],
    lastEdited: 1597186607532,
    templates: [],
    imageId: null,
    bookIds: [],
  },
  {
    id: 5,
    title: 'Brainstorm: Animals?',
    content: [
      {
        type: 'bulleted-list',
        children: [
          {
            children: [
              {
                text: 'Goldilocks & The Three Pigs',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Goldilocks & The Three Wolves',
              },
            ],
            type: 'list-item',
          },
          {
            children: [
              {
                text: 'Goldilocks & The Three Bears',
              },
            ],
            type: 'list-item',
          },
        ],
      },
    ],
    tags: [5],
    characters: [],
    places: [],
    lastEdited: 1597183102925,
    templates: [],
    imageId: null,
    bookIds: [],
  },
]

describe('moveToAbove', () => {
  describe('given a sample list of notes', () => {
    describe('and user move first item to above the last item', () => {
      const firstPosition = 0
      const thirdPosition = 2
      const lastPosition = goldilocksNotes.length - 1
      const firstReorder = moveToAbove(firstPosition, lastPosition, goldilocksNotes, true)

      it('should move the first item above the last item', () => {
        expect(goldilocksNotes[firstPosition]).toEqual(firstReorder[lastPosition - 1])
      })

      it('should have the same last item', () => {
        expect(goldilocksNotes[lastPosition]).toEqual(firstReorder[lastPosition])
      })

      describe('given the user move the last item below the new first indexed item', () => {
        const secondReorder = moveToAbove(lastPosition, firstPosition, firstReorder, false)

        it('should move the last item below the first item', () => {
          expect(firstReorder[lastPosition]).toEqual(secondReorder[firstPosition + 1])
        })

        it('should still have the same first item', () => {
          expect(firstReorder[firstPosition]).toEqual(secondReorder[firstPosition])
        })

        describe('and user move third item to above the first item', () => {
          const thirdReorder = moveToAbove(thirdPosition, firstPosition, secondReorder, true)

          it('should move the third item above the first item', () => {
            expect(secondReorder[thirdPosition]).toEqual(thirdReorder[firstPosition])
          })

          it('should have not the same first item now', () => {
            expect(secondReorder[firstPosition]).not.toEqual(thirdReorder[firstPosition])
          })
        })
      })
    })
  })
})

describe('positionResetByGroup', () => {
  const areaCode = ({ areaCode }) => {
    return areaCode
  }
  describe('given an empty list', () => {
    it('should produce an empty list', () => {
      expect(positionResetByGroup([], areaCode)).toEqual([])
    })
  })
  describe('given a singleton list', () => {
    const singleton = [{ name: 'bob', areaCode: 10, position: 0 }]
    it('should produce that list unchanged', () => {
      expect(positionResetByGroup(singleton, areaCode)).toEqual(singleton)
    })
  })
  describe('given a two element list', () => {
    describe('where the two elements come from the same area', () => {
      describe('and they are out of order', () => {
        const input = [
          { name: 'bob', areaCode: 10, position: 1 },
          { name: 'sarah', areaCode: 10, position: 0 },
        ]
        it('should put the elements in the correct order', () => {
          expect(positionResetByGroup(input, areaCode)).toEqual([
            { name: 'bob', areaCode: 10, position: 0 },
            { name: 'sarah', areaCode: 10, position: 1 },
          ])
        })
      })
      describe('and they are in the correct order', () => {
        const input = [
          { name: 'sarah', areaCode: 10, position: 0 },
          { name: 'bob', areaCode: 10, position: 1 },
        ]
        it('should produce the lists unchanged', () => {
          expect(positionResetByGroup(input, areaCode)).toEqual(input)
        })
      })
    })
    describe('where the two element come from different areas', () => {
      describe('and their positions are both 0', () => {
        const input = [
          { name: 'sarah', areaCode: 1, position: 0 },
          { name: 'bob', areaCode: 10, position: 0 },
        ]
        it('should produce the lists unchanged', () => {
          expect(positionResetByGroup(input, areaCode)).toEqual(input)
        })
      })
      describe('and their positions are non-zero', () => {
        const input = [
          { name: 'sarah', areaCode: 1, position: 5 },
          { name: 'bob', areaCode: 10, position: 3 },
        ]
        it('should reset their postiions to 0', () => {
          expect(positionResetByGroup(input, areaCode)).toEqual([
            { name: 'sarah', areaCode: 1, position: 0 },
            { name: 'bob', areaCode: 10, position: 0 },
          ])
        })
      })
    })
  })
  describe('given a multi-element list with various area codes', () => {
    const input = [
      { name: 'sarah', areaCode: 1, position: 5 },
      { name: 'bob', areaCode: 10, position: 3 },
      { name: 'jude', areaCode: 10, position: 1 },
      { name: 'jasnah', areaCode: 1, position: 2 },
      { name: 'ralf', areaCode: 10, position: 3 },
      { name: 'gary', areaCode: 11, position: 1 },
      { name: 'mike', areaCode: 11, position: 0 },
      { name: 'mary', areaCode: 14, position: 2 },
    ]
    it('should order each area code distinctly', () => {
      expect(positionResetByGroup(input, areaCode)).toEqual([
        { name: 'sarah', areaCode: 1, position: 0 },
        { name: 'jasnah', areaCode: 1, position: 1 },
        { name: 'bob', areaCode: 10, position: 0 },
        { name: 'jude', areaCode: 10, position: 1 },
        { name: 'ralf', areaCode: 10, position: 2 },
        { name: 'gary', areaCode: 11, position: 0 },
        { name: 'mike', areaCode: 11, position: 1 },
        { name: 'mary', areaCode: 14, position: 0 },
      ])
    })
  })
})
