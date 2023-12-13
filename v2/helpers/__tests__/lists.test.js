import { moveToAbove } from '../lists'

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
