import { file_with_character_attributes, file_with_dud_images } from './fixtures'
import { removeDudImages } from '../handleSpecialCases'

describe('removeDudImages', () => {
  describe('given a file with no dud images', () => {
    it('should leave the file as-is', () => {
      expect(removeDudImages(file_with_character_attributes)).toBe(file_with_character_attributes)
    })
  })
  describe('given a file with images that have no path and lack data', () => {
    it("should set those images' data to a missinge image symbol", () => {
      const result = removeDudImages(file_with_dud_images)
      expect(result).not.toBe(file_with_dud_images)
      expect(result.images).toEqual({
        1: {
          data: 'data:image/jpeg;base64,dummy-data',
          id: 1,
          name: 'Legend_of_zelda_cover_(with_cartridge)_gold.png',
          path: '/Users/colinfarris/Downloads/Legend_of_zelda_cover_(with_cartridge)_gold.png',
        },
        3: {
          data: 'data:image/jpeg;base64,dummy-data',
          id: 3,
          name: '2831954-legend_of_zelda_3_-_snes_-_album_art.jpg',
          path: '/Users/colinfarris/Downloads/2831954-legend_of_zelda_3_-_snes_-_album_art.jpg',
        },
        4: {
          data: 'data:image/jpeg;base64,dummy-data',
          id: 4,
          name: 'The Legend of Zelda Ocarina of Time.jpg',
          path: '/Users/colinfarris/Downloads/The Legend of Zelda Ocarina of Time.jpg',
        },
        5: {
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpX5UHawg4pChOlkQFXHUKhShQqgVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6uKk6CIl/i8ptIj14Lgf7+497t4BQrXINKttHNB020zEomIqvSoGXtGNXnRiAJCZZcxJUhwtx9c9fHy9i/Cs1uf+HD1qxmKATySeZYZpE28QT2/aBud94hDLyyrxOfGYSRckfuS64vEb55zLAs8MmcnEPHGIWMw1sdLELG9qxFPEYVXTKV9Ieaxy3uKsFcusfk/+wmBGX1nmOs1hxLCIJUgQoaCMAoqwEaFVJ8VCgvajLfxDrl8il0KuAhg5FlCCBtn1g//B726t7OSElxSMAu0vjvMxAgR2gVrFcb6PHad2AvifgSu94S9VgZlP0isNLXwE9G0DF9cNTdkDLneAwSdDNmVX8tMUslng/Yy+KQ303wJda15v9X2cPgBJ6ip+AxwcAqM5yl5v8e6O5t7+PVPv7wf7enJ3iw8StgAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cLDgkYCNOL7FwAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAARklEQVRYw+3YIQ4AIAwEwSvh/18GiwZTkllVOTnZSrLSuJHmzeOuZrb1xYKAgICAgICAgICAgICAgICAgICAgIC3VXz539rLOwNPnv65RAAAAABJRU5ErkJggg==',
          id: 5,
          name: ' ',
          path: '/Users/colinfarris/Downloads/images.jpg',
        },
        7: {
          data: 'data:image/jpeg;base64,dummy-data',
          id: 7,
          name: ' ',
          path: '/Users/colinfarris/Downloads/images.jpg',
        },
        8: {
          data: 'data:image/jpeg;base64,dummy-data',
          id: 8,
          name: ' ',
          path: '/Users/colinfarris/Downloads/images.jpg',
        },
      })
    })
  })
})
