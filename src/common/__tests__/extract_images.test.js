import { extractImages, imageIndex, patchImages } from '../extract_images'

describe('extractImages', () => {
  describe('given an empty file', () => {
    it('should produce an empty list', () => {
      expect(extractImages({})).toEqual([])
    })
  })
  describe('given a synthetic file', () => {
    describe('with no object that has an attribute of name "type" and a value "image-data"', () => {
      it('should produce an empty list', () => {
        expect(extractImages({ a: 'b', c: { d: 1, e: { f: 3 } } })).toEqual([])
      })
    })
    describe('that has a root level attribute name "type" and a value "image-data"', () => {
      it('should produce a singleton list with an empty path', () => {
        expect(extractImages({ type: 'image-data', data: 'data:image/jpeg;base64,x' })).toEqual([
          { path: [], data: 'data:image/jpeg;base64,x' },
        ])
      })
    })
    describe('that has an object on the root level', () => {
      describe('that has a root level attribute name "type" and a value "image-data"', () => {
        it('should produce a singleton list with a path to the sub-object', () => {
          expect(
            extractImages({ a: { type: 'image-data', data: 'data:image/jpeg;base64,y' } })
          ).toEqual([{ path: ['a'], data: 'data:image/jpeg;base64,y' }])
        })
      })
    })
    describe('that has an array on the root level', () => {
      describe('that has an object in it', () => {
        describe('that has a root level attribute name "type" and a value "image-data"', () => {
          it('should produce a singleton list with a path to the object in the array', () => {
            expect(
              extractImages({
                a: [2, { type: 'image-data', data: 'data:image/jpeg;base64,z' }],
                b: { c: 4 },
              })
            ).toEqual([{ path: ['a', 1], data: 'data:image/jpeg;base64,z' }])
          })
        })
      })
    })
    describe('that has an array on the root level', () => {
      describe('that has an object in it', () => {
        describe('that has a root level attribute name "type" and a value "image-data"', () => {
          describe('and an object on the root level', () => {
            describe('that has a root level attribute name "type" and a value "image-data"', () => {
              it('should produce a singleton list with a path to the object in the array', () => {
                expect(
                  extractImages({
                    a: [2, { type: 'image-data', data: 'data:image/jpeg;base64,aa' }],
                    b: { c: 4 },
                    c: { type: 'image-data', data: 'data:image/jpeg;base64,bb' },
                  })
                ).toEqual([
                  { path: ['a', 1], data: 'data:image/jpeg;base64,aa' },
                  { path: ['c'], data: 'data:image/jpeg;base64,bb' },
                ])
              })
            })
          })
        })
      })
    })
  })
})

describe('imageIndex', () => {
  describe('given an empty file', () => {
    it('should produce an empty object', () => {
      expect(imageIndex([], {})).toEqual({})
    })
  })
  describe('given a file with two images in the images key', () => {
    it('should produce an index of those images data to their ids', () => {
      const file = {
        images: {
          1: {
            id: 1,
            data: 'data:image/jpeg;base64,blah',
            path: 'some/image.jpg',
          },
          7: {
            id: 7,
            data: 'data:image/jpeg;base64,haha',
            path: 'some/image.jpg',
          },
        },
      }
      expect(imageIndex(extractImages(file), file)).toEqual({
        'data:image/jpeg;base64,blah': 1,
        'data:image/jpeg;base64,haha': 7,
      })
    })
  })
  describe('given a file with images in the image key', () => {
    describe('but those images are invalid (lacking "data")', () => {
      const file = {
        images: {
          1: {
            id: 1,
            path: 'some/image.jpg',
          },
          7: {
            id: 7,
            path: 'some/image.jpg',
          },
        },
      }
      it('should not add those images to the index', () => {
        expect(imageIndex([], file)).toEqual({})
      })
    })
  })
  describe('given a file with images in RCE content for a character', () => {
    describe('and no images in the index', () => {
      it('should produce a single image index with neg inf + 1 as the id', () => {
        const file = {
          characters: [
            {
              id: 1,
              name: 'Link',
              description: 'Protagnist',
              notes: [
                {
                  type: 'image-data',
                  data: 'data:image/jpeg;base64,This is some data.',
                },
              ],
            },
          ],
        }
        expect(imageIndex(extractImages(file), file)).toEqual({
          'data:image/jpeg;base64,This is some data.': 1,
        })
      })
    })
    describe('and images in the image index', () => {
      it('should produce an index with both the images from the content and the images in the index', () => {
        const file = {
          characters: [
            {
              id: 1,
              name: 'Link',
              description: 'Protagnist',
              notes: [
                {
                  type: 'image-data',
                  data: 'data:image/jpeg;base64,This is some data.',
                },
              ],
            },
          ],
          images: {
            1: {
              id: 1,
              data: 'data:image/jpeg;base64,blah',
              path: 'some/image.jpg',
            },
            7: {
              id: 7,
              data: 'data:image/jpeg;base64,haha',
              path: 'some/image.jpg',
            },
          },
        }
        expect(imageIndex(extractImages(file), file)).toEqual({
          'data:image/jpeg;base64,blah': 1,
          'data:image/jpeg;base64,haha': 7,
          'data:image/jpeg;base64,This is some data.': 8,
        })
      })
      describe('when there are duplicate images by their content', () => {
        it('not produce duplicate images', () => {
          const file = {
            characters: [
              {
                id: 1,
                name: 'Link',
                description: 'Protagnist',
                notes: [
                  {
                    type: 'image-data',
                    data: 'data:image/jpeg;base64,This is some data.',
                  },
                ],
              },
            ],
            images: {
              1: {
                id: 1,
                data: 'data:image/jpeg;base64,blah',
                path: 'some/image.jpg',
              },
              7: {
                id: 7,
                data: 'data:image/jpeg;base64,haha',
                path: 'some/image.jpg',
              },
              9: {
                id: 9,
                data: 'data:image/jpeg;base64,This is some data.',
                path: 'some/image.jpg',
              },
            },
          }
          expect(imageIndex(extractImages(file), file)).toEqual({
            'data:image/jpeg;base64,blah': 1,
            'data:image/jpeg;base64,haha': 7,
            'data:image/jpeg;base64,This is some data.': 9,
          })
        })
      })
    })
  })
})

describe('patchImages', () => {
  describe('given the empty file', () => {
    it('should produce the empty file with an empty image index', () => {
      expect(patchImages([], {}, {}, {})).toEqual({ images: {} })
    })
  })
  describe('given a file with images only present in the image index', () => {
    describe('and a urlIndex that does not cover those images', () => {
      it('should throw an exception', () => {
        const file = {
          images: {
            1: {
              id: 1,
              data: 'data:image/jpeg;base64,blah',
              path: 'test',
              name: 'blah',
            },
            7: {
              id: 7,
              data: 'data:image/jpeg;base64,haha',
              path: 'test2',
              name: 'haha',
            },
            9: {
              id: 9,
              data: 'data:image/jpeg;base64,This is some data.',
              path: 'test3',
              name: 'This is some data.',
            },
          },
        }
        const extractedImages = extractImages(file)
        expect(() =>
          patchImages(
            imageIndex(extractedImages, file),
            extractedImages,
            {
              2: 'storage://images/tetttot/blah.jpg',
              4: 'storage://images/tetttot/hehe.jpg',
            },
            file
          )
        ).toThrow()
      })
    })
    describe('and a urlIndex that covers those images', () => {
      it('should produce a new file with updated images', () => {
        const file = {
          images: {
            1: {
              id: 1,
              data: 'data:image/jpeg;base64,blah',
              path: 'test',
              name: 'blah',
            },
            7: {
              id: 7,
              data: 'data:image/jpeg;base64,haha',
              path: 'test2',
              name: 'haha',
            },
            9: {
              id: 9,
              data: 'data:image/jpeg;base64,This is some data.',
              path: 'test3',
              name: 'This is some data.',
            },
          },
        }
        const extractedImages = extractImages(file)
        expect(
          patchImages(
            extractedImages,
            imageIndex(extractedImages, file),
            {
              1: 'storage://images/tetttot/blah.jpg',
              7: 'storage://images/tetttot/hehe.jpg',
              9: 'storage://images/tetttot/erm.jpg',
            },
            file
          )
        ).toEqual({
          images: {
            1: {
              id: 1,
              data: '',
              path: 'storage://images/tetttot/blah.jpg',
              name: 'blah',
            },
            7: {
              id: 7,
              data: '',
              path: 'storage://images/tetttot/hehe.jpg',
              name: 'haha',
            },
            9: {
              id: 9,
              data: '',
              path: 'storage://images/tetttot/erm.jpg',
              name: 'This is some data.',
            },
          },
        })
      })
    })
  })
  describe('given a file with only images present in RCE content', () => {
    it('should replace content in those images', () => {
      const file = {
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagnist',
            notes: [
              {
                type: 'image-data',
                data: 'data:image/jpeg;base64,This is some data.',
              },
            ],
          },
        ],
      }
      const extractedImages = extractImages(file)
      expect(
        patchImages(
          extractedImages,
          imageIndex(extractedImages, file),
          {
            [1]: 'storage://images/tetttot/blah.jpg',
          },
          file
        )
      ).toEqual({
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagnist',
            notes: [
              {
                type: 'image-link',
                storageUrl: 'storage://images/tetttot/blah.jpg',
              },
            ],
          },
        ],
        images: {
          [1]: {
            id: 1,
            name: '',
            data: '',
            path: 'storage://images/tetttot/blah.jpg',
          },
        },
      })
    })
  })
})
