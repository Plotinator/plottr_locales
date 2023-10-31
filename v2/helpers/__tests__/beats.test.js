import { children, findNode, newTree, nodeParent } from '../../reducers/tree'
import { beat } from '../../store/initialState'
import {
  addLevelToHierarchy,
  removeLevelFromHierarchy,
  adjustHierarchyLevels,
  maxDepth,
  numberOfPriorChildrenAtSameDepth,
  allBeatsAsArray,
  beatFocusPath,
} from '../beats'

describe('addLevelToHierarchy', () => {
  describe('given the empty tree', () => {
    const emptyTree = newTree('id')
    it('should produce a new tree with one root level node', () => {
      const newTree = addLevelToHierarchy(emptyTree, 1, 1)
      expect(children(newTree, null)).toHaveLength(1)
      expect(nodeParent(newTree, 1)).toBeNull()
    })
  })
  describe('given a singleton tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const singletonTree = {
      children: {
        1: [],
        null: [1],
      },
      heap: {
        1: null,
      },
      index: {
        1: beatOne,
      },
    }
    it('should add a new node at level zero and make the one node its child', () => {
      const newTree = addLevelToHierarchy(singletonTree, 2, 1)
      const beatTwo = { ...beat, id: 2, bookId: 1 }
      expect(children(newTree, null)).toHaveLength(1)
      expect(children(newTree, null)).toEqual(expect.arrayContaining([beatTwo]))
      expect(children(newTree, 1)).toEqual([])
      expect(children(newTree, 2)).toEqual(expect.arrayContaining([beatOne]))
      expect(nodeParent(newTree, 1)).toEqual(2)
      expect(nodeParent(newTree, 2)).toEqual(null)
    })
  })
  describe('given a more complicated tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const beatTwo = { ...beat, id: 2, bookId: 1 }
    const beatThree = { ...beat, id: 3, bookId: 1 }
    const beatFour = { ...beat, id: 4, bookId: 1 }
    const beatFive = { ...beat, id: 5, bookId: 1 }
    const beatSix = { ...beat, id: 6, bookId: 1 }
    const complicatedTree = {
      children: {
        1: [2],
        2: [3],
        3: [],
        4: [5],
        5: [],
        null: [1, 4],
      },
      heap: {
        1: null,
        2: 1,
        3: 2,
        4: null,
        5: 4,
      },
      index: {
        1: beatOne,
        2: beatTwo,
        3: beatThree,
        4: beatFour,
        5: beatFive,
      },
    }
    it('should make all root nodes parents of the new node', () => {
      const newTree = addLevelToHierarchy(complicatedTree, 6, 1)
      expect(children(newTree, null)).toHaveLength(1)
      expect(children(newTree, null)).toEqual(expect.arrayContaining([beatSix]))
      expect(children(newTree, 6)).toEqual(expect.arrayContaining([beatOne, beatFour]))
      expect(nodeParent(newTree, 1)).toEqual(6)
      expect(nodeParent(newTree, 4)).toEqual(6)
      expect(nodeParent(newTree, 6)).toEqual(null)
    })
  })
})

describe('removeLevelFromHierarchy', () => {
  describe('given the empty tree', () => {
    const emptyTree = newTree('id')
    it('should produce the empty tree', () => {
      const newTree = removeLevelFromHierarchy(emptyTree)
      expect(newTree).toEqual(emptyTree)
    })
  })
  describe('given a singleton tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const singletonTree = {
      children: {
        1: [],
        null: [1],
      },
      heap: {
        1: null,
      },
      index: {
        1: beatOne,
      },
    }
    const emptyTree = newTree('id')
    it('should produce the empty tree', () => {
      const newTree = removeLevelFromHierarchy(singletonTree)

      expect(newTree).toEqual(emptyTree)
    })
  })
  describe('given a more complicated tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const beatTwo = { ...beat, id: 2, bookId: 1 }
    const beatThree = { ...beat, id: 3, bookId: 1 }
    const beatFour = { ...beat, id: 4, bookId: 1 }
    const beatFive = { ...beat, id: 5, bookId: 1 }
    const complicatedTree = {
      children: {
        1: [2],
        2: [3],
        3: [],
        4: [5],
        5: [],
        null: [1, 4],
      },
      heap: {
        1: null,
        2: 1,
        3: 2,
        4: null,
        5: 4,
      },
      index: {
        1: beatOne,
        2: beatTwo,
        3: beatThree,
        4: beatFour,
        5: beatFive,
      },
    }
    it('should remove all top level nodes and shift their children to the top', () => {
      const newTree = removeLevelFromHierarchy(complicatedTree)
      expect(children(newTree, null)).toHaveLength(2)
      expect(children(newTree, null)).toEqual(expect.arrayContaining([beatTwo, beatFive]))
      expect(nodeParent(newTree, 2)).toEqual(null)
      expect(nodeParent(newTree, 5)).toEqual(null)
      expect(findNode(newTree, 1)).toBeUndefined()
      expect(findNode(newTree, 4)).toBeUndefined()
    })
  })
})

describe('adjustHierarchyLevels', () => {
  describe('given an empty tree', () => {
    const emptyTree = newTree('id')
    describe('and a target depth of negative infinity', () => {
      it('should produce the empty tree', () => {
        const newTree = adjustHierarchyLevels(0)(emptyTree, 1, 1)

        expect(newTree).toEqual(emptyTree)
      })
    })
    describe('and a target depth of 0', () => {
      it('should produce a new tree with a depth of 0', () => {
        const newTree = adjustHierarchyLevels(0)(emptyTree, 1, 1)

        expect(maxDepth(newTree)).toEqual(0)
      })
    })
  })
  describe('given the singleton tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const singletonTree = {
      children: {
        1: [],
        null: [1],
      },
      heap: {
        1: null,
      },
      index: {
        1: beatOne,
      },
    }
    describe('and a target depth of 0', () => {
      it('should produce the singleton tree', () => {
        const newTree = adjustHierarchyLevels(0)(singletonTree, 1, 1)

        expect(newTree).toEqual(singletonTree)
      })
    })
    describe('and a target depth of 1', () => {
      it('should produce a tree with a maximum depth of 1', () => {
        const newTree = adjustHierarchyLevels(1)(singletonTree, 2, 1)

        expect(maxDepth(newTree)).toEqual(1)
      })
    })
    describe('and a target depth of 0', () => {
      it('should produce a tree with a maximum depth of 0', () => {
        const newTree = adjustHierarchyLevels(0)(singletonTree, 2, 1)

        expect(maxDepth(newTree)).toEqual(0)
      })
    })
  })
  describe('given a more complicated tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const beatTwo = { ...beat, id: 2, bookId: 1 }
    const beatThree = { ...beat, id: 3, bookId: 1 }
    const beatFour = { ...beat, id: 4, bookId: 1 }
    const beatFive = { ...beat, id: 5, bookId: 1 }
    const complicatedTree = {
      children: {
        1: [2],
        2: [3],
        3: [],
        4: [5],
        5: [],
        null: [1, 4],
      },
      heap: {
        1: null,
        2: 1,
        3: 2,
        4: null,
        5: 4,
      },
      index: {
        1: beatOne,
        2: beatTwo,
        3: beatThree,
        4: beatFour,
        5: beatFive,
      },
    }
    it('should have a max depth of 2', () => {
      expect(maxDepth(complicatedTree)).toEqual(2)
    })
    describe('and a target depth of 0', () => {
      it('should have a max depth of 0', () => {
        const newTree = adjustHierarchyLevels(0)(complicatedTree, 6, 1)

        expect(maxDepth(newTree)).toEqual(0)
      })
    })
    // We are not allowed to go deeper than 3
    describe('and a target depth of 3', () => {
      it('should have a max depth of 2', () => {
        const newTree = adjustHierarchyLevels(3)(complicatedTree, 6, 1)

        expect(maxDepth(newTree)).toEqual(2)
      })
    })
  })
})

describe('numberOfPriorChildrenAtSameDepth', () => {
  describe('given no beats', () => {
    const emptyTree = { children: { null: [] }, heap: {}, index: {} }
    const emptySortedBeats = []
    describe('and the beat id 0', () => {
      it('should produce null', () => {
        expect(numberOfPriorChildrenAtSameDepth(emptyTree, emptySortedBeats, 0)).toEqual(null)
      })
    })
  })
  describe('given one beat', () => {
    const beat = { id: 1 }
    const singletonTree = { children: { null: [1], 1: [] }, heap: { 1: null }, index: { 1: beat } }
    const singletonSortedBeats = [beat]
    describe('and a beat id which is not it', () => {
      it('should produce null', () => {
        expect(numberOfPriorChildrenAtSameDepth(singletonTree, singletonSortedBeats, 0)).toEqual(
          null
        )
      })
    })
    describe('and a beat id which is it', () => {
      it('should produce 1', () => {
        expect(numberOfPriorChildrenAtSameDepth(singletonTree, singletonSortedBeats, 1)).toEqual(1)
      })
    })
  })
  describe('given two beats', () => {
    describe('at the same level', () => {
      const beatOne = { id: 1 }
      const beatTwo = { id: 2 }
      const twoBeatTree = {
        children: { null: [1, 2], 1: [], 2: [] },
        heap: { 1: null, 2: null },
        index: { 1: beatOne, 2: beatTwo },
      }
      const twoSortedBeats = [beatOne, beatTwo]
      describe('and the id of the first', () => {
        it('should produce 1', () => {
          expect(numberOfPriorChildrenAtSameDepth(twoBeatTree, twoSortedBeats, 1)).toEqual(1)
        })
      })
      describe('and the id of the second', () => {
        it('should produce 2', () => {
          expect(numberOfPriorChildrenAtSameDepth(twoBeatTree, twoSortedBeats, 2)).toEqual(2)
        })
      })
    })
    describe('where the second is a child of the first', () => {
      const beatOne = { id: 1 }
      const beatTwo = { id: 2 }
      const twoBeatTree = {
        children: { null: [1], 1: [2], 2: [] },
        heap: { 1: null, 2: 1 },
        index: { 1: beatOne, 2: beatTwo },
      }
      const twoSortedBeats = [beatOne, beatTwo]
      describe('and the id of the first', () => {
        it('should produce 1', () => {
          expect(numberOfPriorChildrenAtSameDepth(twoBeatTree, twoSortedBeats, 1)).toEqual(1)
        })
      })
      describe('and the id of the second', () => {
        it('should produce 1', () => {
          expect(numberOfPriorChildrenAtSameDepth(twoBeatTree, twoSortedBeats, 2)).toEqual(1)
        })
      })
    })
  })
  describe('given a tree with many branches', () => {
    describe('and ids at positions in those branches', () => {
      const tree = {
        children: {
          null: [0, 1, 7, 8],
          0: [],
          1: [2],
          2: [3, 5],
          3: [4],
          4: [],
          5: [6],
          6: [],
          7: [],
          8: [9],
          9: [10, 11],
          10: [],
          11: [12],
          12: [],
        },
        heap: {
          0: null,
          1: null,
          2: 1,
          3: 2,
          4: 3,
          5: 2,
          6: 5,
          7: null,
          8: null,
          9: 8,
          10: 9,
          11: 9,
          12: 11,
        },
        index: {
          0: { id: 0 },
          1: { id: 1 },
          2: { id: 2 },
          3: { id: 3 },
          4: { id: 4 },
          5: { id: 5 },
          6: { id: 6 },
          7: { id: 7 },
          8: { id: 8 },
          9: { id: 9 },
          10: { id: 10 },
          11: { id: 11 },
          12: { id: 12 },
        },
      }
      const sortedBeats = [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 },
        { id: 11 },
        { id: 12 },
      ]
      it('correctly computes the index based on prior children at the same depth', () => {
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 1)).toEqual(2)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 2)).toEqual(1)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 3)).toEqual(1)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 4)).toEqual(1)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 5)).toEqual(2)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 6)).toEqual(2)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 7)).toEqual(3)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 8)).toEqual(4)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 9)).toEqual(2)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 10)).toEqual(3)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 11)).toEqual(4)
        expect(numberOfPriorChildrenAtSameDepth(tree, sortedBeats, 12)).toEqual(3)
      })
    })
  })
})

const EXAMPLE_BEAT_TREE = {
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
  5: {
    children: {
      18: [],
      null: [18],
    },
    heap: {
      18: null,
    },
    index: {
      18: {
        autoOutlineSort: true,
        bookId: 5,
        fromTemplateId: null,
        id: 18,
        position: 0,
        time: 0,
        title: 'auto',
        expanded: true,
      },
    },
  },
  6: {
    children: {
      19: [],
      null: [19],
    },
    heap: {
      19: null,
    },
    index: {
      19: {
        autoOutlineSort: true,
        bookId: 6,
        fromTemplateId: null,
        id: 19,
        position: 0,
        time: 0,
        title: 'auto',
        expanded: true,
      },
    },
  },
  7: {
    children: {
      20: [],
      26: [],
      27: [],
      28: [],
      29: [],
      30: [],
      31: [],
      32: [],
      33: [],
      null: [33, 32, 31, 30, 29, 28, 27, 26, 20],
    },
    heap: {
      20: null,
      26: null,
      27: null,
      28: null,
      29: null,
      30: null,
      31: null,
      32: null,
      33: null,
    },
    index: {
      20: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 20,
        position: 0,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      26: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 26,
        position: 1,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      27: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 27,
        position: 2,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      28: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 28,
        position: 3,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      29: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 29,
        position: 4,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      30: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 30,
        position: 5,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      31: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 31,
        position: 6,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      32: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 32,
        position: 7,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      33: {
        autoOutlineSort: true,
        bookId: 7,
        fromTemplateId: null,
        id: 33,
        position: 8,
        time: 0,
        title: 'auto',
        expanded: true,
      },
    },
  },
  8: {
    children: {
      21: [],
      22: [],
      23: [],
      24: [],
      null: [24, 23, 22, 21],
    },
    heap: {
      21: null,
      22: null,
      23: null,
      24: null,
    },
    index: {
      21: {
        autoOutlineSort: true,
        bookId: 8,
        fromTemplateId: null,
        id: 21,
        position: 0,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      22: {
        autoOutlineSort: true,
        bookId: 8,
        fromTemplateId: null,
        id: 22,
        position: 1,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      23: {
        autoOutlineSort: true,
        bookId: 8,
        fromTemplateId: null,
        id: 23,
        position: 2,
        time: 0,
        title: 'auto',
        expanded: true,
      },
      24: {
        autoOutlineSort: true,
        bookId: 8,
        fromTemplateId: null,
        id: 24,
        position: 3,
        time: 0,
        title: 'auto',
        expanded: true,
      },
    },
  },
  9: {
    children: {
      25: [],
      null: [25],
    },
    heap: {
      25: null,
    },
    index: {
      25: {
        autoOutlineSort: true,
        bookId: 9,
        fromTemplateId: null,
        id: 25,
        position: 0,
        time: 0,
        title: 'auto',
        expanded: true,
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
        id: 1,
        bookId: 'series',
        position: 0,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
        expanded: true,
      },
    },
  },
}

describe('allBeatsAsArray', () => {
  describe('given an empty beat tree', () => {
    const result = allBeatsAsArray({ series: newTree('id'), 1: newTree('id') })
    it('should produce the empty array', () => {
      expect(result).toEqual([])
    })
  })
  describe('given the example beat tree', () => {
    const result = allBeatsAsArray(EXAMPLE_BEAT_TREE)
    it('should produce its beats without caring about the order', () => {
      expect(result).toEqual(
        expect.arrayContaining([
          {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0,
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 9,
            fromTemplateId: null,
            id: 25,
            position: 0,
            time: 0,
            title: 'auto',
            expanded: true,
          },

          {
            autoOutlineSort: true,
            bookId: 8,
            fromTemplateId: null,
            id: 21,
            position: 0,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 8,
            fromTemplateId: null,
            id: 22,
            position: 1,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 8,
            fromTemplateId: null,
            id: 23,
            position: 2,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 8,
            fromTemplateId: null,
            id: 24,
            position: 3,
            time: 0,
            title: 'auto',
            expanded: true,
          },

          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 20,
            position: 0,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 26,
            position: 1,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 27,
            position: 2,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 28,
            position: 3,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 29,
            position: 4,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 30,
            position: 5,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 31,
            position: 6,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 32,
            position: 7,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 7,
            fromTemplateId: null,
            id: 33,
            position: 8,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 6,
            fromTemplateId: null,
            id: 19,
            position: 0,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 5,
            fromTemplateId: null,
            id: 18,
            position: 0,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
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
          {
            autoOutlineSort: true,
            bookId: 1,
            fromTemplateId: null,
            id: 16,
            position: 1,
            time: 0,
            title: 'auto',
            expanded: true,
          },
          {
            autoOutlineSort: true,
            bookId: 1,
            fromTemplateId: null,
            id: 17,
            position: 2,
            time: 0,
            title: 'auto',
            expanded: true,
          },
        ])
      )
    })
  })
})

describe('beatFocusPath', () => {
  describe('given a book id', () => {
    describe('when the book id is not valid', () => {
      it('should produce the known path', () => {
        expect(beatFocusPath('21z')).toEqual(['unknown'])
        expect(beatFocusPath(undefined)).toEqual(['unknown'])
        expect(beatFocusPath(null)).toEqual(['unknown'])
      })
    })
    describe('and a beat id', () => {
      describe('when the beat id is not valid', () => {
        it('should produce the unknown path', () => {
          expect(beatFocusPath('2', 3)).toEqual(['unknown'])
          expect(beatFocusPath('2', 'test')).toEqual(['unknown'])
          expect(beatFocusPath('2', null)).toEqual(['unknown'])
          expect(beatFocusPath('2', undefined)).toEqual(['unknown'])

          expect(beatFocusPath(2, 3)).toEqual(['unknown'])
          expect(beatFocusPath(2, 'test')).toEqual(['unknown'])
          expect(beatFocusPath(2, null)).toEqual(['unknown'])
          expect(beatFocusPath(2, undefined)).toEqual(['unknown'])
        })
      })
      describe('and the beat id is valid', () => {
        describe('and an invalid attribute type', () => {
          it('should produce a beat focus path', () => {
            expect(beatFocusPath(2, 1, null)).toEqual(['unknown'])
            expect(beatFocusPath(2, 1, undefined)).toEqual(['unknown'])
            expect(beatFocusPath(2, 1, 'blarg')).toEqual(['unknown'])

            expect(beatFocusPath(2, '1', null)).toEqual(['unknown'])
            expect(beatFocusPath(2, '1', undefined)).toEqual(['unknown'])
            expect(beatFocusPath(2, '1', 'blarg')).toEqual(['unknown'])
          })
        })
        describe('and a valid attribute type', () => {
          it('should produce a beat focus path', () => {
            expect(beatFocusPath(2, 1, 'title')).toEqual(['beat', 1, 2, 'title'])
            expect(beatFocusPath('2', 1, 'title')).toEqual(['beat', 1, 2, 'title'])

            expect(beatFocusPath(2, '1', 'title')).toEqual(['beat', 1, 2, 'title'])
            expect(beatFocusPath('2', '1', 'title')).toEqual(['beat', 1, 2, 'title'])
          })
        })
      })
    })
  })
})
