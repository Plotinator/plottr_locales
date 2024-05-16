import { configureStore, pltrAdaptor } from './fixtures/testStore'
import selectors from '../index'
import actions from '../../actions'

const wiredUpActions = actions(pltrAdaptor)
const { groupedSortedBackupFoldersSelector } = selectors(pltrAdaptor)

const initialStore = () => {
  const store = configureStore()
  return store
}

describe('groupedSortedBackupFoldersSelector', () => {
  describe('given an empty initial initial', () => {
    const emptyStore = initialStore()
    it('should produce an empty array', () => {
      expect(groupedSortedBackupFoldersSelector(emptyStore.getState())).toEqual([])
    })
  })
  describe('given a collection of local backup folders', () => {
    const localBackupFolders = [
      {
        path: '/home/edward/.config/plottr/backups/5_7_2024',
        date: '2024_5_7',
        backups: [],
      },
      {
        path: '/home/edward/.config/plottr/backups/5_6_2024',
        date: '2024_5_6',
        backups: [
          {
            name: '(start-session)-Tarumba-test.pltr',
            size: 407635,
            lastEdited: 1714978059924.1614,
          },
          {
            name: '(start-session)-Tarumba.pltr',
            size: 407637,
            lastEdited: 1714977130753.1055,
          },
          {
            name: '(start-session)-[template] Kishoutenketsu Blank.pltr',
            size: 9425,
            lastEdited: 1714983696970.5012,
          },
          {
            name: '(start-session)-blargy blarg.pltr',
            size: 5346,
            lastEdited: 1714990525799.9128,
          },
          {
            name: '(start-session)-example3.pltr',
            size: 1063454,
            lastEdited: 1714994349471.0164,
          },
          {
            name: 'Tarumba.pltr',
            size: 407637,
            lastEdited: 1714977780406.1445,
          },
          {
            name: 'blargy blarg.pltr',
            size: 5462,
            lastEdited: 1714995619375.0928,
          },
          {
            name: 'example3.pltr',
            size: 1071504,
            lastEdited: 1714994714767.0383,
          },
        ],
      },
      {
        path: '/home/edward/.config/plottr/backups/5_2_2024',
        date: '2024_5_2',
        backups: [
          {
            name: '(start-session)-40 Sentence Template by Zara Altair.pltr',
            size: 1409588,
            lastEdited: 1714631502356.2793,
          },
          {
            name: '(start-session)-blargy blarg.pltr',
            size: 5341,
            lastEdited: 1714635684221.5312,
          },
          {
            name: '40 Sentence Template by Zara Altair.pltr',
            size: 1409508,
            lastEdited: 1714631778498.296,
          },
          {
            name: 'blargy blarg.pltr',
            size: 5346,
            lastEdited: 1714639301681.0747,
          },
        ],
      },
      {
        path: '/home/edward/.config/plottr/backups/5_1_2024',
        date: '2024_5_1',
        backups: [
          {
            name: '(start-session)-blargy blarg.pltr',
            size: 5075,
            lastEdited: 1714546185400.2012,
          },
          {
            name: '(start-session)-example3.pltr',
            size: 1063454,
            lastEdited: 1714564366910.7466,
          },
          {
            name: 'example3.pltr',
            size: 3886907,
            lastEdited: 1714565869766.8716,
          },
        ],
      },
    ]
    const store = initialStore()
    store.dispatch(wiredUpActions.backups.setBackupFolders(localBackupFolders))
    it('should produce those folders', () => {
      expect(groupedSortedBackupFoldersSelector(store.getState())).toEqual([
        {
          backups: [
            {
              lastEdited: 1714978059924.1614,
              name: '(start-session)-Tarumba-test.pltr',
              size: 407635,
            },
            {
              lastEdited: 1714977130753.1055,
              name: '(start-session)-Tarumba.pltr',
              size: 407637,
            },
            {
              lastEdited: 1714983696970.5012,
              name: '(start-session)-[template] Kishoutenketsu Blank.pltr',
              size: 9425,
            },
            {
              lastEdited: 1714990525799.9128,
              name: '(start-session)-blargy blarg.pltr',
              size: 5346,
            },
            {
              lastEdited: 1714994349471.0164,
              name: '(start-session)-example3.pltr',
              size: 1063454,
            },
            {
              lastEdited: 1714977780406.1445,
              name: 'Tarumba.pltr',
              size: 407637,
            },
            {
              lastEdited: 1714995619375.0928,
              name: 'blargy blarg.pltr',
              size: 5462,
            },
            {
              lastEdited: 1714994714767.0383,
              name: 'example3.pltr',
              size: 1071504,
            },
          ],
          date: '2024_5_6',
          groups: {
            Tarumba: [
              {
                lastEdited: 1714977130753.1055,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  '(start-session)-Tarumba.pltr',
                ],
                name: 'Tarumba',
                size: 407637,
              },
              {
                lastEdited: 1714977780406.1445,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  'Tarumba.pltr',
                ],
                name: 'Tarumba',
                size: 407637,
              },
            ],
            'Tarumba-test': [
              {
                lastEdited: 1714978059924.1614,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  '(start-session)-Tarumba-test.pltr',
                ],
                name: 'Tarumba-test',
                size: 407635,
              },
            ],
            '[template] Kishoutenketsu Blank': [
              {
                lastEdited: 1714983696970.5012,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  '(start-session)-[template] Kishoutenketsu Blank.pltr',
                ],
                name: '[template] Kishoutenketsu Blank',
                size: 9425,
              },
            ],
            'blargy blarg': [
              {
                lastEdited: 1714990525799.9128,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  '(start-session)-blargy blarg.pltr',
                ],
                name: 'blargy blarg',
                size: 5346,
              },
              {
                lastEdited: 1714995619375.0928,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  'blargy blarg.pltr',
                ],
                name: 'blargy blarg',
                size: 5462,
              },
            ],
            example3: [
              {
                lastEdited: 1714994349471.0164,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  '(start-session)-example3.pltr',
                ],
                name: 'example3',
                size: 1063454,
              },
              {
                lastEdited: 1714994714767.0383,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_6_2024',
                  'example3.pltr',
                ],
                name: 'example3',
                size: 1071504,
              },
            ],
          },
          longDateStr: 'May 6, 2024',
          path: '/home/edward/.config/plottr/backups/5_6_2024',
          shortDateStr: '2024 (day: 6), 12:00 AM',
        },
        {
          backups: [
            {
              lastEdited: 1714631502356.2793,
              name: '(start-session)-40 Sentence Template by Zara Altair.pltr',
              size: 1409588,
            },
            {
              lastEdited: 1714635684221.5312,
              name: '(start-session)-blargy blarg.pltr',
              size: 5341,
            },
            {
              lastEdited: 1714631778498.296,
              name: '40 Sentence Template by Zara Altair.pltr',
              size: 1409508,
            },
            {
              lastEdited: 1714639301681.0747,
              name: 'blargy blarg.pltr',
              size: 5346,
            },
          ],
          date: '2024_5_2',
          groups: {
            '40 Sentence Template by Zara Altair': [
              {
                lastEdited: 1714631502356.2793,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_2_2024',
                  '(start-session)-40 Sentence Template by Zara Altair.pltr',
                ],
                name: '40 Sentence Template by Zara Altair',
                size: 1409588,
              },
              {
                lastEdited: 1714631778498.296,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_2_2024',
                  '40 Sentence Template by Zara Altair.pltr',
                ],
                name: '40 Sentence Template by Zara Altair',
                size: 1409508,
              },
            ],
            'blargy blarg': [
              {
                lastEdited: 1714635684221.5312,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_2_2024',
                  '(start-session)-blargy blarg.pltr',
                ],
                name: 'blargy blarg',
                size: 5341,
              },
              {
                lastEdited: 1714639301681.0747,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_2_2024',
                  'blargy blarg.pltr',
                ],
                name: 'blargy blarg',
                size: 5346,
              },
            ],
          },
          longDateStr: 'May 2, 2024',
          path: '/home/edward/.config/plottr/backups/5_2_2024',
          shortDateStr: '2024 (day: 2), 12:00 AM',
        },
        {
          backups: [
            {
              lastEdited: 1714546185400.2012,
              name: '(start-session)-blargy blarg.pltr',
              size: 5075,
            },
            {
              lastEdited: 1714564366910.7466,
              name: '(start-session)-example3.pltr',
              size: 1063454,
            },
            {
              lastEdited: 1714565869766.8716,
              name: 'example3.pltr',
              size: 3886907,
            },
          ],
          date: '2024_5_1',
          groups: {
            'blargy blarg': [
              {
                lastEdited: 1714546185400.2012,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_1_2024',
                  '(start-session)-blargy blarg.pltr',
                ],
                name: 'blargy blarg',
                size: 5075,
              },
            ],
            example3: [
              {
                lastEdited: 1714564366910.7466,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_1_2024',
                  '(start-session)-example3.pltr',
                ],
                name: 'example3',
                size: 1063454,
              },
              {
                lastEdited: 1714565869766.8716,
                localFilePathSegments: [
                  '/home/edward/.config/plottr/backups/5_1_2024',
                  'example3.pltr',
                ],
                name: 'example3',
                size: 3886907,
              },
            ],
          },
          longDateStr: 'May 1, 2024',
          path: '/home/edward/.config/plottr/backups/5_1_2024',
          shortDateStr: '2024 (day: 1), 12:00 AM',
        },
      ])
    })
  })
  describe('given a collection of local and cloudstorage backups', () => {
    const mixedBackups = [
      {
        date: '2024_5_7',
        path: '/home/edward/.config/plottr/backups/5_7_2024',
        backups: [
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/7IkFZliLc5OrTcnmRgN3/1-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1633039200,
              nanoseconds: 0,
            },
            fileId: '7IkFZliLc5OrTcnmRgN3',
            startOfSession: true,
            proRecordId: '0ogNnIASVBZql5dgMSGk',
          },
          {
            fileId: 'N3NiRBRlRDHf1vqM1Jtn',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/N3NiRBRlRDHf1vqM1Jtn/4-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1633298400,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: 'T5C55i5y05s1NZjITwfN',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rYof3MF6j1MGMvoEUEql/4-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1633298400,
              nanoseconds: 0,
            },
            fileId: 'rYof3MF6j1MGMvoEUEql',
            startOfSession: true,
            proRecordId: 'X3Zf050WATY47XkifokE',
          },
          {
            startOfSession: true,
            fileId: 'SmtpHyM4PqoFDJilzHrA',
            backupTime: {
              seconds: 1633298400,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SmtpHyM4PqoFDJilzHrA/4-10-2021-(start-of-session)',
            proRecordId: 'd27F4ftgugLkNV8a90JY',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/bSVCr22cxm9CvPljjOrq/4-10-2021-(start-of-session)',
            startOfSession: true,
            backupTime: {
              seconds: 1633298400,
              nanoseconds: 0,
            },
            fileId: 'bSVCr22cxm9CvPljjOrq',
            proRecordId: 'e3nmtXUwcCLLM1DD1mzP',
          },
          {
            backupTime: {
              seconds: 1633298400,
              nanoseconds: 0,
            },
            fileId: 'ZY2xo0cionSvemAyCkoy',
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/ZY2xo0cionSvemAyCkoy/4-10-2021-(start-of-session)',
            proRecordId: 'gs923QZBsd0iZRdaqjNh',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/sOzNa5Hq0U6y1Z7apbGp/4-10-2021-(start-of-session)',
            fileId: 'sOzNa5Hq0U6y1Z7apbGp',
            startOfSession: true,
            backupTime: {
              seconds: 1633298400,
              nanoseconds: 0,
            },
            proRecordId: 'o5OmrsnUqXcFV2cyjEvV',
          },
          {
            startOfSession: true,
            backupTime: {
              seconds: 1633384800,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/fVYoE8szsiDvIG190Z0G/5-10-2021-(start-of-session)',
            fileId: 'fVYoE8szsiDvIG190Z0G',
            proRecordId: 'FuaWcwMtzjBVBXVkiuMu',
          },
          {
            backupTime: {
              seconds: 1633384800,
              nanoseconds: 0,
            },
            fileId: '5fa6rAkLra3M5dtpCGYl',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/5fa6rAkLra3M5dtpCGYl/5-10-2021-(start-of-session)',
            startOfSession: true,
            proRecordId: 'ZXfWydgxs83H2sqIVJ1h',
          },
          {
            startOfSession: true,
            fileId: 'wGCW9tOdK4S2wcmDxTHv',
            backupTime: {
              seconds: 1633384800,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/wGCW9tOdK4S2wcmDxTHv/5-10-2021-(start-of-session)',
            proRecordId: 'kXHeuAnUlNIjBrHhdOqs',
          },
          {
            backupTime: {
              seconds: 1633384800,
              nanoseconds: 0,
            },
            fileId: '007U42lVjKuG2TMHiu2j',
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/007U42lVjKuG2TMHiu2j/5-10-2021-(start-of-session)',
            proRecordId: 'uzi3PoVMfMDwSm5Rppl9',
          },
          {
            startOfSession: true,
            backupTime: {
              seconds: 1633384800,
              nanoseconds: 0,
            },
            fileId: 'FgUwKjjRh2ZYkCJ3oTnv',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/FgUwKjjRh2ZYkCJ3oTnv/5-10-2021-(start-of-session)',
            proRecordId: 'zVmzZtbmR8GCKP9n4zXW',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/AX7HDALdfRetihLkg0GG/6-10-2021-(start-of-session)',
            fileId: 'AX7HDALdfRetihLkg0GG',
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: '1ZpszAoZwIK9exjtTC34',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/n7nD3N2AL78W1KlmDDrG/6-10-2021-(start-of-session)',
            fileId: 'n7nD3N2AL78W1KlmDDrG',
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: '26yWA4Um7JYLHgeJ2pQ0',
          },
          {
            fileId: 'jLEp9ZkLhu8sulhMV7Bd',
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/jLEp9ZkLhu8sulhMV7Bd/6-10-2021-(start-of-session)',
            proRecordId: '6pWFzBIqnZf6S4AbFhES',
          },
          {
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/HgsHEAUxgeyNRt3pozal/6-10-2021-(start-of-session)',
            fileId: 'HgsHEAUxgeyNRt3pozal',
            startOfSession: true,
            proRecordId: 'DnY9UvbYSULZJtRUXyrY',
          },
          {
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/C7HwKigacbX1ssMFeFhG/6-10-2021-(start-of-session)',
            fileId: 'C7HwKigacbX1ssMFeFhG',
            proRecordId: 'EXAqD360F9BjUfwsyVCB',
          },
          {
            startOfSession: true,
            fileId: '68b6zynBEr9l68WOfYpk',
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/68b6zynBEr9l68WOfYpk/6-10-2021-(start-of-session)',
            proRecordId: 'ZtUiNrVKUMIWjQePU7vK',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/j8J3aLFfvNwq4Jafs57Z/6-10-2021-(start-of-session)',
            startOfSession: true,
            fileId: 'j8J3aLFfvNwq4Jafs57Z',
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            proRecordId: 'hGHqy72ddsjKqeJC8QEH',
          },
          {
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2BzXzqvwFY3TYKWlEU0l/6-10-2021-(start-of-session)',
            fileId: '2BzXzqvwFY3TYKWlEU0l',
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            proRecordId: 'lokdEwuxwmQbKXFV5hxJ',
          },
          {
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/FDVQW0NUeKENFSkRVGB8/6-10-2021-(start-of-session)',
            fileId: 'FDVQW0NUeKENFSkRVGB8',
            proRecordId: 'syPF2D0XSZriA5CoYkaE',
          },
          {
            fileId: '3VT0Yig3mttLm97ifIgu',
            startOfSession: true,
            backupTime: {
              seconds: 1633471200,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3VT0Yig3mttLm97ifIgu/6-10-2021-(start-of-session)',
            proRecordId: 'w1btHcZqsNH5uZqDEXU1',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pYoNWoFdiFxSXe6chZTB/7-10-2021-(start-of-session)',
            fileId: 'pYoNWoFdiFxSXe6chZTB',
            backupTime: {
              seconds: 1633557600,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: 'MAUxQYeSuRZMpfR1EaeQ',
          },
          {
            backupTime: {
              seconds: 1633557600,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/jsbUZpbW5zBMz4ty8Aen/7-10-2021-(start-of-session)',
            fileId: 'jsbUZpbW5zBMz4ty8Aen',
            startOfSession: true,
            proRecordId: 'ufBiTtwP6pUR1Sjewu8J',
          },
          {
            startOfSession: true,
            fileId: '21WIbRF6UxAKhNEO8x75',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/21WIbRF6UxAKhNEO8x75/8-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1633644000,
              nanoseconds: 0,
            },
            proRecordId: 'Sp0wSFPy2m9FdfAadLZ0',
          },
          {
            fileId: 'bR3jS6eDdFrzhDlqFvVn',
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/bR3jS6eDdFrzhDlqFvVn/11-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1633903200,
              nanoseconds: 0,
            },
            proRecordId: 'DsUC5bUu6KMGXS4eGfr8',
          },
          {
            fileId: 'a8xpIpMIQdaBgmAUMA9u',
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/a8xpIpMIQdaBgmAUMA9u/11-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1633903200,
              nanoseconds: 0,
            },
            proRecordId: 'EbFOBWlC0BIlJtW1Y7NK',
          },
          {
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/fYRIDbaH0cTny7R7Idcu/11-10-2021-(start-of-session)',
            fileId: 'fYRIDbaH0cTny7R7Idcu',
            backupTime: {
              seconds: 1633903200,
              nanoseconds: 0,
            },
            proRecordId: 'T20qdx3uumfYH4AlrrHb',
          },
          {
            backupTime: {
              seconds: 1633903200,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/8Pntl64bWBS4FnXcDB0l/11-10-2021-(start-of-session)',
            startOfSession: true,
            fileId: '8Pntl64bWBS4FnXcDB0l',
            proRecordId: 'alK5r8QHwawqOCmH6p3h',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vRvzbAzhx0dCvQQB9NWa/18-10-2021-(start-of-session)',
            backupTime: {
              seconds: 1634508000,
              nanoseconds: 0,
            },
            startOfSession: true,
            fileId: 'vRvzbAzhx0dCvQQB9NWa',
            proRecordId: 'EFjTePQW1voxJWd2BUBo',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/UUnQGVUKggPlWRbckrrV/18-10-2021-(start-of-session)',
            startOfSession: true,
            backupTime: {
              seconds: 1634508000,
              nanoseconds: 0,
            },
            fileId: 'UUnQGVUKggPlWRbckrrV',
            proRecordId: 'FGFlzaZ0MFW0QOVzkTRK',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/xiMioiGgbUi5ZIex3vR9/18-10-2021-(start-of-session)',
            fileId: 'xiMioiGgbUi5ZIex3vR9',
            backupTime: {
              seconds: 1634508000,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: 'Zh9gKp5sp0xMBVzwpINY',
          },
          {
            fileName: 'blargy blarg.pltr',
            backupTime: {
              seconds: 1715032800,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
            lastModified: {
              seconds: 1715070303,
              nanoseconds: 804000000,
            },
            fileId: 'KTrhLvygi1QEfZSaCbUD',
            startOfSession: true,
            proRecordId: 'CUCyl3HX4jZIhWkqdKsp',
          },
          {
            fileName: 'Hamlet',
            startOfSession: true,
            fileId: 'Mjlm7whoiCiMdLLgyLAQ',
            lastModified: {
              seconds: 1715068570,
              nanoseconds: 441000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
            backupTime: {
              seconds: 1715032800,
              nanoseconds: 0,
            },
            proRecordId: 'M9I5i7gQPtwaQxaRdInR',
          },
          {
            fileId: null,
            fileName: '',
            backupTime: {
              seconds: 1715032800,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
            lastModified: {
              seconds: 1715068509,
              nanoseconds: 306000000,
            },
            startOfSession: true,
            proRecordId: 'WEYgKe5H3orxO8kmZbm0',
          },
          {
            lastModified: {
              seconds: 1715070544,
              nanoseconds: 546000000,
            },
            fileName: 'blargy blarg.pltr',
            backupTime: {
              seconds: 1715032800,
              nanoseconds: 0,
            },
            storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
            fileId: 'KTrhLvygi1QEfZSaCbUD',
            startOfSession: false,
            proRecordId: '1RbK1ws2HyG6taZte50i',
          },
          {
            lastModified: {
              seconds: 1715070550,
              nanoseconds: 861000000,
            },
            startOfSession: false,
            storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
            fileId: 'Mjlm7whoiCiMdLLgyLAQ',
            backupTime: {
              seconds: 1715032800,
              nanoseconds: 0,
            },
            fileName: 'Hamlet',
            proRecordId: '4Ip8kJzidSgVAbOebzpY',
          },
          {
            fileId: null,
            lastModified: {
              seconds: 1715070243,
              nanoseconds: 564000000,
            },
            storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
            backupTime: {
              seconds: 1715032800,
              nanoseconds: 0,
            },
            fileName: '',
            startOfSession: false,
            proRecordId: 'l2DFXeWTHipEzQUA5etm',
          },
        ],
      },
      {
        date: '2024_5_6',
        path: '/home/edward/.config/plottr/backups/5_6_2024',
        backups: [
          {
            name: '(start-session)-Tarumba-test.pltr',
            size: 407635,
            lastEdited: 1714978059924.1614,
          },
          {
            name: '(start-session)-Tarumba.pltr',
            size: 407637,
            lastEdited: 1714977130753.1055,
          },
          {
            name: '(start-session)-[template] Kishoutenketsu Blank.pltr',
            size: 9425,
            lastEdited: 1714983696970.5012,
          },
          {
            name: '(start-session)-blargy blarg.pltr',
            size: 5346,
            lastEdited: 1714990525799.9128,
          },
          {
            name: '(start-session)-example3.pltr',
            size: 1063454,
            lastEdited: 1714994349471.0164,
          },
          {
            name: 'Tarumba.pltr',
            size: 407637,
            lastEdited: 1714977780406.1445,
          },
          {
            name: 'blargy blarg.pltr',
            size: 5462,
            lastEdited: 1714995619375.0928,
          },
          {
            name: 'example3.pltr',
            size: 1071504,
            lastEdited: 1714994714767.0383,
          },
          {
            startOfSession: true,
            fileId: 'pzpxZkL6PZNDV1FmeDhE',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pzpxZkL6PZNDV1FmeDhE/6-5-2024-(start-of-session).pltr',
            fileName: '[template] Kishoutenketsu Blank.pltr',
            lastModified: {
              seconds: 1714983772,
              nanoseconds: 818000000,
            },
            backupTime: {
              seconds: 1714946400,
              nanoseconds: 0,
            },
            proRecordId: 'mL0HcMtnOy3hjvPt1g1p',
          },
          {
            fileId: 'pzpxZkL6PZNDV1FmeDhE',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pzpxZkL6PZNDV1FmeDhE/6-5-2024.pltr',
            backupTime: {
              seconds: 1714946400,
              nanoseconds: 0,
            },
            startOfSession: false,
            lastModified: {
              seconds: 1714983834,
              nanoseconds: 460000000,
            },
            fileName: '[template] Kishoutenketsu Blank.pltr',
            proRecordId: 'ZRPfRTXRN9oB9RbC21lO',
          },
        ],
      },
      {
        date: '2024_5_2',
        path: '/home/edward/.config/plottr/backups/5_2_2024',
        backups: [
          {
            name: '(start-session)-40 Sentence Template by Zara Altair.pltr',
            size: 1409588,
            lastEdited: 1714631502356.2793,
          },
          {
            name: '(start-session)-blargy blarg.pltr',
            size: 5341,
            lastEdited: 1714635684221.5312,
          },
          {
            name: '40 Sentence Template by Zara Altair.pltr',
            size: 1409508,
            lastEdited: 1714631778498.296,
          },
          {
            name: 'blargy blarg.pltr',
            size: 5346,
            lastEdited: 1714639301681.0747,
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/KTrhLvygi1QEfZSaCbUD/2-5-2024-(start-of-session).pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1714639184,
              nanoseconds: 974000000,
            },
            fileName: 'blargy blarg.pltr',
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            fileId: 'KTrhLvygi1QEfZSaCbUD',
            proRecordId: '2p8acF9wcvKFm8U6dewk',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Mw0dwuUrcd8D7NUkkAVt/2-5-2024-(start-of-session).pltr',
            lastModified: {
              seconds: 1714636909,
              nanoseconds: 979000000,
            },
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            fileId: 'Mw0dwuUrcd8D7NUkkAVt',
            startOfSession: true,
            fileName: 'blargy blarg.pltr',
            proRecordId: '7ftasa0BdbZNWucSuQQm',
          },
          {
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024-(start-of-session).pltr',
            fileName: '',
            lastModified: {
              seconds: 1714640619,
              nanoseconds: 710000000,
            },
            fileId: null,
            startOfSession: true,
            proRecordId: '8R7HDhf6Evk5FNl8WK95',
          },
          {
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            fileId: 'Qenyef5kruX3EUfqyYnL',
            fileName: 'blargy blarg.pltr',
            lastModified: {
              seconds: 1714639374,
              nanoseconds: 845000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Qenyef5kruX3EUfqyYnL/2-5-2024-(start-of-session).pltr',
            startOfSession: true,
            proRecordId: 'GOIkA4F1ilk4y86KZjEg',
          },
          {
            lastModified: {
              seconds: 1714638852,
              nanoseconds: 880000000,
            },
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/HI0RY0XD4JMBvfvRkV9A/2-5-2024-(start-of-session).pltr',
            fileName: 'blargy blarg.pltr',
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            fileId: 'HI0RY0XD4JMBvfvRkV9A',
            proRecordId: 'IxAaeq20QrCMCRcsWkzc',
          },
          {
            lastModified: {
              seconds: 1714637497,
              nanoseconds: 561000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vXkRjjQD6enpUwFalmi7/2-5-2024-(start-of-session).pltr',
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            startOfSession: true,
            fileName: 'blargy blarg.pltr',
            fileId: 'vXkRjjQD6enpUwFalmi7',
            proRecordId: 'Lht4iQtVA2TCiWIQTiIf',
          },
          {
            lastModified: {
              seconds: 1714635596,
              nanoseconds: 922000000,
            },
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            startOfSession: true,
            fileName: 'hello',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PdCTepSAqSWwnJpE4o5T/2-5-2024-(start-of-session).pltr',
            fileId: 'PdCTepSAqSWwnJpE4o5T',
            proRecordId: 'XPYKVJTmeBEuPs4xYvO0',
          },
          {
            fileId: '7763363wovA82z0Ep8LC',
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1714637313,
              nanoseconds: 526000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/7763363wovA82z0Ep8LC/2-5-2024-(start-of-session).pltr',
            fileName: 'blargy blarg.pltr',
            startOfSession: true,
            proRecordId: 'dctlL7tUUdGAWlbYptpc',
          },
          {
            fileId: null,
            startOfSession: false,
            storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024.pltr',
            fileName: '',
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1714640647,
              nanoseconds: 825000000,
            },
            proRecordId: '1swuQHtL66VxshBbO6WL',
          },
          {
            startOfSession: false,
            fileName: 'blargy blarg.pltr',
            fileId: 'vXkRjjQD6enpUwFalmi7',
            lastModified: {
              seconds: 1714637558,
              nanoseconds: 481000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vXkRjjQD6enpUwFalmi7/2-5-2024.pltr',
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            proRecordId: '7OKTUIjM2tFt8K3LwR25',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Mw0dwuUrcd8D7NUkkAVt/2-5-2024.pltr',
            fileName: 'blargy blarg.pltr',
            startOfSession: false,
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1714636970,
              nanoseconds: 931000000,
            },
            fileId: 'Mw0dwuUrcd8D7NUkkAVt',
            proRecordId: 'D5YkIoZvI8x7eIuenK4x',
          },
          {
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024.pltr',
            fileName: 'blargy blarg.pltr',
            startOfSession: false,
            lastModified: {
              seconds: 1714641930,
              nanoseconds: 422000000,
            },
            fileId: 'KTrhLvygi1QEfZSaCbUD',
            proRecordId: 'XDMLa0TeBBQwpL4qLh8r',
          },
          {
            startOfSession: false,
            fileName: 'blargy blarg.pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Qenyef5kruX3EUfqyYnL/2-5-2024.pltr',
            fileId: 'Qenyef5kruX3EUfqyYnL',
            lastModified: {
              seconds: 1714639398,
              nanoseconds: 778000000,
            },
            backupTime: {
              seconds: 1714600800,
              nanoseconds: 0,
            },
            proRecordId: 'ogVDtvcC4sWORf3eVIcF',
          },
        ],
      },
      {
        date: '2024_5_1',
        path: '/home/edward/.config/plottr/backups/5_1_2024',
        backups: [
          {
            name: '(start-session)-blargy blarg.pltr',
            size: 5075,
            lastEdited: 1714546185400.2012,
          },
          {
            name: '(start-session)-example3.pltr',
            size: 1063454,
            lastEdited: 1714564366910.7466,
          },
          {
            name: 'example3.pltr',
            size: 3886907,
            lastEdited: 1714565869766.8716,
          },
          {
            backupTime: {
              seconds: 1714514400,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pNTJ1U9UbuZrw9HwaEVq/1-5-2024-(start-of-session).pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1714557267,
              nanoseconds: 824000000,
            },
            fileName: 'Goldilocks and The Three Bears.pltr',
            fileId: 'pNTJ1U9UbuZrw9HwaEVq',
            proRecordId: 'fR3qNjxwDCod6F2hjWYm',
          },
        ],
      },
      {
        date: '2023_10_30',
        path: '2023_10_30',
        backups: [
          {
            fileName: 'The Turn',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Tf2vOREjd8Pmr3ArZdOm/30-10-2023-(start-of-session).pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1698641184,
              nanoseconds: 990000000,
            },
            backupTime: {
              seconds: 1698606000,
              nanoseconds: 0,
            },
            fileId: 'Tf2vOREjd8Pmr3ArZdOm',
            proRecordId: 'Bzf5vS0Rs8DFNft7zJXL',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BhNQW5N4CN3UdVRAEJxl/30-10-2023-(start-of-session).pltr',
            lastModified: {
              seconds: 1698657532,
              nanoseconds: 641000000,
            },
            backupTime: {
              seconds: 1698616800,
              nanoseconds: 0,
            },
            startOfSession: true,
            fileId: 'BhNQW5N4CN3UdVRAEJxl',
            fileName: 'Test Notes',
            proRecordId: '01ZoA3SyCgxUIolZooxR',
          },
          {
            startOfSession: false,
            fileName: 'The Turn',
            backupTime: {
              seconds: 1698606000,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Tf2vOREjd8Pmr3ArZdOm/30-10-2023.pltr',
            lastModified: {
              seconds: 1698659231,
              nanoseconds: 687000000,
            },
            fileId: 'Tf2vOREjd8Pmr3ArZdOm',
            proRecordId: '7NgwYrsFUPdF2xu9TPo1',
          },
        ],
      },
      {
        date: '2023_4_17',
        path: '2023_4_17',
        backups: [
          {
            fileId: 'J7hgHEbfdV7PxpQyGdC5',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/J7hgHEbfdV7PxpQyGdC5/17-4-2023-(start-of-session).pltr',
            startOfSession: true,
            backupTime: {
              seconds: 1681682400,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1681717170,
              nanoseconds: 955000000,
            },
            fileName: 'Snow',
            proRecordId: 'Wmvrr0Zo29uCfLdJ0mYQ',
          },
          {
            fileId: 'iNik0ASY9Zy2TbSZFs3u',
            fileName: 'Testing with adapted pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PmQ7Mrmuyi5JzhXLrUQS/17-4-2023.pltr',
            startOfSession: false,
            lastModified: {
              seconds: 1681708047,
              nanoseconds: 454000000,
            },
            backupTime: {
              seconds: 1658948400,
              nanoseconds: 0,
            },
            proRecordId: '01xjPwl45cOmTcvYsbkP',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/J7hgHEbfdV7PxpQyGdC5/17-4-2023.pltr',
            fileName: 'Snow',
            startOfSession: false,
            backupTime: {
              seconds: 1681682400,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1681718077,
              nanoseconds: 854000000,
            },
            fileId: 'J7hgHEbfdV7PxpQyGdC5',
            proRecordId: 'hjY65NhawRuGzfTjXQ7o',
          },
        ],
      },
      {
        date: '2023_5_22',
        path: '2023_5_22',
        backups: [
          {
            lastModified: {
              seconds: 1684740393,
              nanoseconds: 797000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/OI3xvD4aZyahTLKirFzn/22-5-2023-(start-of-session).pltr',
            fileId: 'OI3xvD4aZyahTLKirFzn',
            startOfSession: true,
            fileName: 'safari',
            backupTime: {
              seconds: 1684695600,
              nanoseconds: 0,
            },
            proRecordId: '0216IvOWo0OSMbjsjJGM',
          },
          {
            fileId: 'PloC8E9okkuYk3K628E5',
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PloC8E9okkuYk3K628E5/22-5-2023-(start-of-session).pltr',
            fileName: '01.14.pltr',
            lastModified: {
              seconds: 1684741740,
              nanoseconds: 411000000,
            },
            backupTime: {
              seconds: 1684695600,
              nanoseconds: 0,
            },
            proRecordId: 'DrqdxOeErXSiXCxPGS1O',
          },
          {
            startOfSession: true,
            backupTime: {
              seconds: 1684695600,
              nanoseconds: 0,
            },
            fileId: 'g6HiqHB5dGytcXo7tmma',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/g6HiqHB5dGytcXo7tmma/22-5-2023-(start-of-session).pltr',
            lastModified: {
              seconds: 1684741776,
              nanoseconds: 541000000,
            },
            fileName: 'blank project on 1403.pltr',
            proRecordId: 'eXDV6RIlMiA1D7ERoFNV',
          },
          {
            backupTime: {
              seconds: 1684695600,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3kot5Qt6Ty9yDUFUapo7/22-5-2023-(start-of-session).pltr',
            fileName: 'The Tortoise And The Hare V3.pltr',
            lastModified: {
              seconds: 1684740424,
              nanoseconds: 413000000,
            },
            fileId: '3kot5Qt6Ty9yDUFUapo7',
            startOfSession: true,
            proRecordId: 'em0OLJSHfRobjvA7GqRk',
          },
          {
            backupTime: {
              seconds: 1684706400,
              nanoseconds: 0,
            },
            fileName: 'SKYRAKERS-BREAKOUT.pltr',
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/mMirUfkwSNyPbJjnWmi2/22-5-2023-(start-of-session).pltr',
            fileId: 'mMirUfkwSNyPbJjnWmi2',
            lastModified: {
              seconds: 1684743054,
              nanoseconds: 771000000,
            },
            proRecordId: 'VXl3h8v87kYrYoy9tYTb',
          },
          {
            fileName: 'The Tortoise And The Hare V3.pltr',
            startOfSession: false,
            fileId: '3kot5Qt6Ty9yDUFUapo7',
            backupTime: {
              seconds: 1684695600,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1684740867,
              nanoseconds: 264000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3kot5Qt6Ty9yDUFUapo7/22-5-2023.pltr',
            proRecordId: 'DT921F2mgtmah22RuD6h',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/OI3xvD4aZyahTLKirFzn/22-5-2023.pltr',
            fileName: 'safari',
            startOfSession: false,
            fileId: 'OI3xvD4aZyahTLKirFzn',
            lastModified: {
              seconds: 1684740503,
              nanoseconds: 890000000,
            },
            backupTime: {
              seconds: 1684695600,
              nanoseconds: 0,
            },
            proRecordId: 'E4ehsaJOQksVXiU1b5l6',
          },
        ],
      },
      {
        date: '2022_7_28',
        path: '2022_7_28',
        backups: [
          {
            fileId: 'w6SjKdoH48YRN1sXYmIG',
            startOfSession: true,
            lastModified: {
              seconds: 1659006715,
              nanoseconds: 264000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/w6SjKdoH48YRN1sXYmIG/28-7-2022-(start-of-session).pltr',
            fileName: 'Pride & Prejudice (1)',
            backupTime: {
              seconds: 1658937600,
              nanoseconds: 0,
            },
            proRecordId: 'oYwzZuIFwxt1TYsCaIG4',
          },
          {
            startOfSession: true,
            fileName: 'hi',
            fileId: 'GMtWezAv2DEyc9jWuZ2A',
            backupTime: {
              seconds: 1658948400,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GMtWezAv2DEyc9jWuZ2A/28-7-2022-(start-of-session).pltr',
            lastModified: {
              seconds: 1659000053,
              nanoseconds: 170000000,
            },
            proRecordId: '80JIzZwyaAOExTrOu63I',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/iNik0ASY9Zy2TbSZFs3u/28-7-2022-(start-of-session).pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1659012041,
              nanoseconds: 591000000,
            },
            fileName: 'comments',
            backupTime: {
              seconds: 1658948400,
              nanoseconds: 0,
            },
            fileId: 'iNik0ASY9Zy2TbSZFs3u',
            proRecordId: 'lX56fkpt3EDUKd5yjnyb',
          },
          {
            backupTime: {
              seconds: 1658937600,
              nanoseconds: 0,
            },
            startOfSession: false,
            fileName: 'Pride & Prejudice (1)',
            fileId: 'w6SjKdoH48YRN1sXYmIG',
            lastModified: {
              seconds: 1659020893,
              nanoseconds: 939000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/w6SjKdoH48YRN1sXYmIG/28-7-2022.pltr',
            proRecordId: 'JQm3homIycge46fTPnwg',
          },
          {
            backupTime: {
              seconds: 1658948400,
              nanoseconds: 0,
            },
            fileId: 'GMtWezAv2DEyc9jWuZ2A',
            lastModified: {
              seconds: 1659023654,
              nanoseconds: 696000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GMtWezAv2DEyc9jWuZ2A/28-7-2022.pltr',
            startOfSession: false,
            fileName: 'hi',
            proRecordId: '02eGIdvBvvC5ptsCHoqs',
          },
        ],
      },
      {
        date: '2021_11_4',
        path: '2021_11_4',
        backups: [
          {
            fileName: 'Zelda',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/kTqfqQEJXUQLkOe6tjsd/4-11-2021-(start-of-session).pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1636027669,
              nanoseconds: 429000000,
            },
            fileId: 'kTqfqQEJXUQLkOe6tjsd',
            backupTime: {
              seconds: 1635976800,
              nanoseconds: 0,
            },
            proRecordId: '0Dp4sl0sDAOR0ON7l0Vr',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/A9ysYrJ2Lx9fOIYv9ryW/4-11-2021-(start-of-session).pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1636038405,
              nanoseconds: 786000000,
            },
            fileName: 'Zelda',
            fileId: 'A9ysYrJ2Lx9fOIYv9ryW',
            backupTime: {
              seconds: 1635976800,
              nanoseconds: 0,
            },
            proRecordId: 'XwnPPcnRky4UgZoROhJZ',
          },
          {
            fileId: 'rfVK2j2KBFUl8JJQ93vt',
            backupTime: {
              seconds: 1635976800,
              nanoseconds: 0,
            },
            startOfSession: true,
            lastModified: {
              seconds: 1636009093,
              nanoseconds: 860000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rfVK2j2KBFUl8JJQ93vt/4-11-2021-(start-of-session).pltr',
            fileName: 'Zelda',
            proRecordId: 'uS2VYX2UrXkLBgdN4ThA',
          },
          {
            fileId: 'rfVK2j2KBFUl8JJQ93vt',
            lastModified: {
              seconds: 1636010363,
              nanoseconds: 545000000,
            },
            fileName: 'Zelda',
            backupTime: {
              seconds: 1635976800,
              nanoseconds: 0,
            },
            startOfSession: false,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rfVK2j2KBFUl8JJQ93vt/4-11-2021.pltr',
            proRecordId: '04FZvaQ5XxJrrSO8r5wS',
          },
          {
            backupTime: {
              seconds: 1635976800,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1636039814,
              nanoseconds: 479000000,
            },
            startOfSession: false,
            fileName: 'Zelda',
            fileId: 'A9ysYrJ2Lx9fOIYv9ryW',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/A9ysYrJ2Lx9fOIYv9ryW/4-11-2021.pltr',
            proRecordId: 'Bvre1qBvWitvo1vNG9pm',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/kTqfqQEJXUQLkOe6tjsd/4-11-2021.pltr',
            startOfSession: false,
            backupTime: {
              seconds: 1635976800,
              nanoseconds: 0,
            },
            fileId: 'kTqfqQEJXUQLkOe6tjsd',
            lastModified: {
              seconds: 1636038163,
              nanoseconds: 87000000,
            },
            fileName: 'Zelda',
            proRecordId: 'N4hk18UdJNfJVxKVW5qj',
          },
        ],
      },
      {
        date: '2023_2_23',
        path: '2023_2_23',
        backups: [
          {
            fileId: 'vy6BN3ISmWHCkC7ebP39',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vy6BN3ISmWHCkC7ebP39/23-2-2023-(start-of-session).pltr',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            startOfSession: true,
            lastModified: {
              seconds: 1677138956,
              nanoseconds: 318000000,
            },
            fileName: 'Goldilocks and The 3 Bears.pltr',
            proRecordId: '06rwQswdZxt2i0ThvqY3',
          },
          {
            fileId: 'juKG4Ev5ZKgkeLAOJiOR',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/juKG4Ev5ZKgkeLAOJiOR/23-2-2023-(start-of-session).pltr',
            fileName: 'Pride & Prejudice.pltr',
            startOfSession: true,
            lastModified: {
              seconds: 1677137990,
              nanoseconds: 274000000,
            },
            proRecordId: '5oUggAloQu5dyKOPmNFg',
          },
          {
            fileId: 'vDIBK2lbZSXsbB09SDRK',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vDIBK2lbZSXsbB09SDRK/23-2-2023-(start-of-session).pltr',
            fileName: 'Pride & Prejudice.pltr',
            lastModified: {
              seconds: 1677138489,
              nanoseconds: 607000000,
            },
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: '7Mf1CTVJlkMWD9b8FYGo',
          },
          {
            lastModified: {
              seconds: 1677136864,
              nanoseconds: 249000000,
            },
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/gkV85Z8BFJcoZmAAhQQB/23-2-2023-(start-of-session).pltr',
            startOfSession: true,
            fileName: 'The Tortoise And The Hare.pltr',
            fileId: 'gkV85Z8BFJcoZmAAhQQB',
            proRecordId: '8DyK8g3TgvXjofJ8hylI',
          },
          {
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileId: 'GVnLnMLSWYBt0qOH4Ruu',
            fileName: 'Hamlet.pltr',
            lastModified: {
              seconds: 1677137062,
              nanoseconds: 190000000,
            },
            startOfSession: true,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GVnLnMLSWYBt0qOH4Ruu/23-2-2023-(start-of-session).pltr',
            proRecordId: 'CfWx8x5L3XqsH6YyH6vd',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BqnU5GVAGniilGNmc9as/23-2-2023-(start-of-session).pltr',
            lastModified: {
              seconds: 1677136524,
              nanoseconds: 108000000,
            },
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileName: 'Goldilocks and The Three Bears',
            fileId: 'BqnU5GVAGniilGNmc9as',
            startOfSession: true,
            proRecordId: 'D6xIcb0SvuDkhlE1rFvU',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2W6b5bwrpDtFUWokgngJ/23-2-2023-(start-of-session).pltr',
            fileId: '2W6b5bwrpDtFUWokgngJ',
            startOfSession: true,
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1677136657,
              nanoseconds: 214000000,
            },
            fileName: 'The Tortoise And The Hare.pltr',
            proRecordId: 'GfDBmShAmP38g7z3MjIm',
          },
          {
            lastModified: {
              seconds: 1677136565,
              nanoseconds: 425000000,
            },
            fileId: 'yR6mlLRDDv6nTRBqOFGH',
            startOfSession: true,
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileName: 'blank',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/yR6mlLRDDv6nTRBqOFGH/23-2-2023-(start-of-session).pltr',
            proRecordId: 'YFQvqj2y4O0s779Vj11t',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/TJyfVF2vmY5apUmah8J9/23-2-2023-(start-of-session).pltr',
            lastModified: {
              seconds: 1677138151,
              nanoseconds: 661000000,
            },
            fileId: 'TJyfVF2vmY5apUmah8J9',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            startOfSession: true,
            fileName: 'Pride & Prejudice.pltr',
            proRecordId: 'ZRSDhvkey8LExspS5jwa',
          },
          {
            lastModified: {
              seconds: 1677136614,
              nanoseconds: 13000000,
            },
            fileName: 'Goldilocks and The Three Bears.pltr',
            fileId: 'Dcn50N2LDQi26g1nTMkC',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Dcn50N2LDQi26g1nTMkC/23-2-2023-(start-of-session).pltr',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            startOfSession: true,
            proRecordId: 'iXypleCeShx4pVcJSZ5d',
          },
          {
            lastModified: {
              seconds: 1677138453,
              nanoseconds: 870000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MjGdIzcoRMVQNhhK45jd/23-2-2023-(start-of-session).pltr',
            fileName: 'The Turn',
            startOfSession: true,
            fileId: 'MjGdIzcoRMVQNhhK45jd',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            proRecordId: 'mfg87xYbpFCeQOYQjJei',
          },
          {
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileId: 'E1TtStA9Y78WPZ3Ojotq',
            lastModified: {
              seconds: 1677136456,
              nanoseconds: 944000000,
            },
            fileName: 'Thief of Adon.pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/E1TtStA9Y78WPZ3Ojotq/23-2-2023-(start-of-session).pltr',
            startOfSession: true,
            proRecordId: 'socDRrGCxFNJByEouImR',
          },
          {
            startOfSession: true,
            backupTime: {
              seconds: 1677103200,
              nanoseconds: 0,
            },
            fileId: 'MIm5d9efLoTIhXGPPJiK',
            fileName: 'Hamlet.pltr',
            lastModified: {
              seconds: 1677140379,
              nanoseconds: 900000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MIm5d9efLoTIhXGPPJiK/23-2-2023-(start-of-session).pltr',
            proRecordId: 'k2Jz4s3Wb0FojZKFEnz1',
          },
          {
            startOfSession: true,
            fileName: 'Hamlet.pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SJkDzETDu67tb1QgzDKN/23-2-2023-(start-of-session).pltr',
            backupTime: {
              seconds: 1677103200,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1677141218,
              nanoseconds: 628000000,
            },
            fileId: 'SJkDzETDu67tb1QgzDKN',
            proRecordId: 'sTL0YQo2RkUCQmJAR9lP',
          },
          {
            lastModified: {
              seconds: 1677136713,
              nanoseconds: 711000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2W6b5bwrpDtFUWokgngJ/23-2-2023.pltr',
            fileName: 'The Tortoise And The Hare.pltr',
            startOfSession: false,
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileId: '2W6b5bwrpDtFUWokgngJ',
            proRecordId: '05GPCgAU6zw5PVy0Rcgp',
          },
          {
            fileName: 'Goldilocks and The 3 Bears.pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vy6BN3ISmWHCkC7ebP39/23-2-2023.pltr',
            lastModified: {
              seconds: 1677145665,
              nanoseconds: 424000000,
            },
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileId: 'vy6BN3ISmWHCkC7ebP39',
            startOfSession: false,
            proRecordId: '14auv92nKb5CbtlI659k',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BqnU5GVAGniilGNmc9as/23-2-2023.pltr',
            startOfSession: false,
            lastModified: {
              seconds: 1677136580,
              nanoseconds: 849000000,
            },
            fileName: 'Goldilocks and The Three Bears',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileId: 'BqnU5GVAGniilGNmc9as',
            proRecordId: '295u7EQqwC0YOLE3dBhM',
          },
          {
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1677138706,
              nanoseconds: 108000000,
            },
            fileId: 'vDIBK2lbZSXsbB09SDRK',
            startOfSession: false,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vDIBK2lbZSXsbB09SDRK/23-2-2023.pltr',
            fileName: 'Pride & Prejudice.pltr',
            proRecordId: 'BRSqjnLaW9S9ec42wSZ7',
          },
          {
            startOfSession: false,
            fileName: 'Thief of Adon.pltr',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/E1TtStA9Y78WPZ3Ojotq/23-2-2023.pltr',
            lastModified: {
              seconds: 1677136554,
              nanoseconds: 878000000,
            },
            fileId: 'E1TtStA9Y78WPZ3Ojotq',
            proRecordId: 'LK71XPmSLumMpygx2ynA',
          },
          {
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/juKG4Ev5ZKgkeLAOJiOR/23-2-2023.pltr',
            fileId: 'juKG4Ev5ZKgkeLAOJiOR',
            lastModified: {
              seconds: 1677138177,
              nanoseconds: 812000000,
            },
            startOfSession: false,
            fileName: 'Pride & Prejudice.pltr',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            proRecordId: 'MvVbMs5VsJp8KwWTTYJg',
          },
          {
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            startOfSession: false,
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Dcn50N2LDQi26g1nTMkC/23-2-2023.pltr',
            fileName: 'Goldilocks and The Three Bears.pltr',
            lastModified: {
              seconds: 1677138215,
              nanoseconds: 695000000,
            },
            fileId: 'Dcn50N2LDQi26g1nTMkC',
            proRecordId: 'N8bAZ6TehdCeZLvYjKze',
          },
          {
            startOfSession: false,
            fileName: 'Pride & Prejudice.pltr',
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            fileId: 'TJyfVF2vmY5apUmah8J9',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/TJyfVF2vmY5apUmah8J9/23-2-2023.pltr',
            lastModified: {
              seconds: 1677138895,
              nanoseconds: 156000000,
            },
            proRecordId: 'U6pKLNQGvfvUjNTNPS8a',
          },
          {
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            lastModified: {
              seconds: 1677136920,
              nanoseconds: 950000000,
            },
            fileId: 'gkV85Z8BFJcoZmAAhQQB',
            startOfSession: false,
            fileName: 'The Tortoise And The Hare.pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/gkV85Z8BFJcoZmAAhQQB/23-2-2023.pltr',
            proRecordId: 'Xk84NKiQBklClMQg6hbQ',
          },
          {
            backupTime: {
              seconds: 1677092400,
              nanoseconds: 0,
            },
            startOfSession: false,
            lastModified: {
              seconds: 1677137119,
              nanoseconds: 123000000,
            },
            fileId: 'GVnLnMLSWYBt0qOH4Ruu',
            fileName: 'Hamlet.pltr',
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GVnLnMLSWYBt0qOH4Ruu/23-2-2023.pltr',
            proRecordId: 'mhdpTTqoMMlCvnnSDP45',
          },
          {
            startOfSession: false,
            fileId: 'MIm5d9efLoTIhXGPPJiK',
            lastModified: {
              seconds: 1677149233,
              nanoseconds: 397000000,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MIm5d9efLoTIhXGPPJiK/23-2-2023.pltr',
            backupTime: {
              seconds: 1677103200,
              nanoseconds: 0,
            },
            fileName: 'Hamlet.pltr',
            proRecordId: '53CYB3U2Zri0WQy2qNgs',
          },
          {
            lastModified: {
              seconds: 1677146194,
              nanoseconds: 689000000,
            },
            backupTime: {
              seconds: 1677103200,
              nanoseconds: 0,
            },
            storagePath:
              'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SJkDzETDu67tb1QgzDKN/23-2-2023.pltr',
            fileId: 'SJkDzETDu67tb1QgzDKN',
            fileName: 'Hamlet.pltr',
            startOfSession: false,
            proRecordId: 'IqJLN2jxhKaiVbHfwY4O',
          },
        ],
      },
    ]
    describe('when we are not logged in to pro', () => {
      const store = initialStore()
      store.dispatch(wiredUpActions.backups.setBackupFolders(mixedBackups))
      it('should only produce the local backups', () => {
        expect(groupedSortedBackupFoldersSelector(store.getState())).toEqual([
          {
            backups: [
              {
                lastEdited: 1714978059924.1614,
                name: '(start-session)-Tarumba-test.pltr',
                size: 407635,
              },
              {
                lastEdited: 1714977130753.1055,
                name: '(start-session)-Tarumba.pltr',
                size: 407637,
              },
              {
                lastEdited: 1714983696970.5012,
                name: '(start-session)-[template] Kishoutenketsu Blank.pltr',
                size: 9425,
              },
              {
                lastEdited: 1714990525799.9128,
                name: '(start-session)-blargy blarg.pltr',
                size: 5346,
              },
              {
                lastEdited: 1714994349471.0164,
                name: '(start-session)-example3.pltr',
                size: 1063454,
              },
              {
                lastEdited: 1714977780406.1445,
                name: 'Tarumba.pltr',
                size: 407637,
              },
              {
                lastEdited: 1714995619375.0928,
                name: 'blargy blarg.pltr',
                size: 5462,
              },
              {
                lastEdited: 1714994714767.0383,
                name: 'example3.pltr',
                size: 1071504,
              },
            ],
            date: '2024_5_6',
            groups: {
              Tarumba: [
                {
                  lastEdited: 1714977130753.1055,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-Tarumba.pltr',
                  ],
                  name: 'Tarumba',
                  size: 407637,
                },
                {
                  lastEdited: 1714977780406.1445,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    'Tarumba.pltr',
                  ],
                  name: 'Tarumba',
                  size: 407637,
                },
              ],
              'Tarumba-test': [
                {
                  lastEdited: 1714978059924.1614,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-Tarumba-test.pltr',
                  ],
                  name: 'Tarumba-test',
                  size: 407635,
                },
              ],
              '[template] Kishoutenketsu Blank': [
                {
                  lastEdited: 1714983696970.5012,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-[template] Kishoutenketsu Blank.pltr',
                  ],
                  name: '[template] Kishoutenketsu Blank',
                  size: 9425,
                },
              ],
              'blargy blarg': [
                {
                  lastEdited: 1714990525799.9128,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5346,
                },
                {
                  lastEdited: 1714995619375.0928,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    'blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5462,
                },
              ],
              example3: [
                {
                  lastEdited: 1714994349471.0164,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-example3.pltr',
                  ],
                  name: 'example3',
                  size: 1063454,
                },
                {
                  lastEdited: 1714994714767.0383,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    'example3.pltr',
                  ],
                  name: 'example3',
                  size: 1071504,
                },
              ],
            },
            longDateStr: 'May 6, 2024',
            path: '/home/edward/.config/plottr/backups/5_6_2024',
            shortDateStr: '2024 (day: 6), 12:00 AM',
          },
          {
            backups: [
              {
                lastEdited: 1714631502356.2793,
                name: '(start-session)-40 Sentence Template by Zara Altair.pltr',
                size: 1409588,
              },
              {
                lastEdited: 1714635684221.5312,
                name: '(start-session)-blargy blarg.pltr',
                size: 5341,
              },
              {
                lastEdited: 1714631778498.296,
                name: '40 Sentence Template by Zara Altair.pltr',
                size: 1409508,
              },
              {
                lastEdited: 1714639301681.0747,
                name: 'blargy blarg.pltr',
                size: 5346,
              },
            ],
            date: '2024_5_2',
            groups: {
              '40 Sentence Template by Zara Altair': [
                {
                  lastEdited: 1714631502356.2793,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    '(start-session)-40 Sentence Template by Zara Altair.pltr',
                  ],
                  name: '40 Sentence Template by Zara Altair',
                  size: 1409588,
                },
                {
                  lastEdited: 1714631778498.296,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    '40 Sentence Template by Zara Altair.pltr',
                  ],
                  name: '40 Sentence Template by Zara Altair',
                  size: 1409508,
                },
              ],
              'blargy blarg': [
                {
                  lastEdited: 1714635684221.5312,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    '(start-session)-blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5341,
                },
                {
                  lastEdited: 1714639301681.0747,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    'blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5346,
                },
              ],
            },
            longDateStr: 'May 2, 2024',
            path: '/home/edward/.config/plottr/backups/5_2_2024',
            shortDateStr: '2024 (day: 2), 12:00 AM',
          },
          {
            backups: [
              {
                lastEdited: 1714546185400.2012,
                name: '(start-session)-blargy blarg.pltr',
                size: 5075,
              },
              {
                lastEdited: 1714564366910.7466,
                name: '(start-session)-example3.pltr',
                size: 1063454,
              },
              {
                lastEdited: 1714565869766.8716,
                name: 'example3.pltr',
                size: 3886907,
              },
            ],
            date: '2024_5_1',
            groups: {
              'blargy blarg': [
                {
                  lastEdited: 1714546185400.2012,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_1_2024',
                    '(start-session)-blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5075,
                },
              ],
              example3: [
                {
                  lastEdited: 1714564366910.7466,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_1_2024',
                    '(start-session)-example3.pltr',
                  ],
                  name: 'example3',
                  size: 1063454,
                },
                {
                  lastEdited: 1714565869766.8716,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_1_2024',
                    'example3.pltr',
                  ],
                  name: 'example3',
                  size: 3886907,
                },
              ],
            },
            longDateStr: 'May 1, 2024',
            path: '/home/edward/.config/plottr/backups/5_1_2024',
            shortDateStr: '2024 (day: 1), 12:00 AM',
          },
        ])
      })
    })
    describe('when we are logged into pro', () => {
      const store = initialStore()
      store.dispatch(wiredUpActions.backups.setBackupFolders(mixedBackups))
      store.dispatch(wiredUpActions.client.setUserId('dummy-user-id'))
      store.dispatch(
        wiredUpActions.settings.setAppSettings({
          user: {
            frbId: 'dummy-id',
            choseProMode: true,
          },
        })
      )
      store.dispatch(
        wiredUpActions.license.setLicenseInfo({
          plottrLicense: {
            secret: '',
            machineInfo: {
              id: 'f3cdecaab7a08a84570a4a354ea85ad4b3a389dbf0e7800aba50f94299b0efb2',
              os: 'linux',
              name: 'quiescent.home',
              localUserName: 'edward',
            },
            dateChecked: '2024-04-22T13:35:48.429Z',
            expiresAt: '2050-04-23T09:44:42.469Z',
          },
          proLicense: {
            secret: '',
            machineInfo: {
              id: 'f3cdecaab7a08a84570a4a354ea85ad4b3a389dbf0e7800aba50f94299b0efb2',
              os: 'linux',
              name: 'quiescent.home',
              localUserName: 'edward',
            },
            expiresAt: '2050-04-22T13:17:16.626Z',
            dateChecked: '2024-04-26T11:12:49.682Z',
          },
        })
      )
      it('should produce both categories of backup', () => {
        expect(groupedSortedBackupFoldersSelector(store.getState())).toEqual([
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633039200,
                },
                fileId: '7IkFZliLc5OrTcnmRgN3',
                proRecordId: '0ogNnIASVBZql5dgMSGk',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/7IkFZliLc5OrTcnmRgN3/1-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633298400,
                },
                fileId: 'N3NiRBRlRDHf1vqM1Jtn',
                proRecordId: 'T5C55i5y05s1NZjITwfN',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/N3NiRBRlRDHf1vqM1Jtn/4-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633298400,
                },
                fileId: 'rYof3MF6j1MGMvoEUEql',
                proRecordId: 'X3Zf050WATY47XkifokE',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rYof3MF6j1MGMvoEUEql/4-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633298400,
                },
                fileId: 'SmtpHyM4PqoFDJilzHrA',
                proRecordId: 'd27F4ftgugLkNV8a90JY',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SmtpHyM4PqoFDJilzHrA/4-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633298400,
                },
                fileId: 'bSVCr22cxm9CvPljjOrq',
                proRecordId: 'e3nmtXUwcCLLM1DD1mzP',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/bSVCr22cxm9CvPljjOrq/4-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633298400,
                },
                fileId: 'ZY2xo0cionSvemAyCkoy',
                proRecordId: 'gs923QZBsd0iZRdaqjNh',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/ZY2xo0cionSvemAyCkoy/4-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633298400,
                },
                fileId: 'sOzNa5Hq0U6y1Z7apbGp',
                proRecordId: 'o5OmrsnUqXcFV2cyjEvV',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/sOzNa5Hq0U6y1Z7apbGp/4-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633384800,
                },
                fileId: 'fVYoE8szsiDvIG190Z0G',
                proRecordId: 'FuaWcwMtzjBVBXVkiuMu',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/fVYoE8szsiDvIG190Z0G/5-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633384800,
                },
                fileId: '5fa6rAkLra3M5dtpCGYl',
                proRecordId: 'ZXfWydgxs83H2sqIVJ1h',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/5fa6rAkLra3M5dtpCGYl/5-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633384800,
                },
                fileId: 'wGCW9tOdK4S2wcmDxTHv',
                proRecordId: 'kXHeuAnUlNIjBrHhdOqs',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/wGCW9tOdK4S2wcmDxTHv/5-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633384800,
                },
                fileId: '007U42lVjKuG2TMHiu2j',
                proRecordId: 'uzi3PoVMfMDwSm5Rppl9',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/007U42lVjKuG2TMHiu2j/5-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633384800,
                },
                fileId: 'FgUwKjjRh2ZYkCJ3oTnv',
                proRecordId: 'zVmzZtbmR8GCKP9n4zXW',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/FgUwKjjRh2ZYkCJ3oTnv/5-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'AX7HDALdfRetihLkg0GG',
                proRecordId: '1ZpszAoZwIK9exjtTC34',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/AX7HDALdfRetihLkg0GG/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'n7nD3N2AL78W1KlmDDrG',
                proRecordId: '26yWA4Um7JYLHgeJ2pQ0',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/n7nD3N2AL78W1KlmDDrG/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'jLEp9ZkLhu8sulhMV7Bd',
                proRecordId: '6pWFzBIqnZf6S4AbFhES',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/jLEp9ZkLhu8sulhMV7Bd/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'HgsHEAUxgeyNRt3pozal',
                proRecordId: 'DnY9UvbYSULZJtRUXyrY',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/HgsHEAUxgeyNRt3pozal/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'C7HwKigacbX1ssMFeFhG',
                proRecordId: 'EXAqD360F9BjUfwsyVCB',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/C7HwKigacbX1ssMFeFhG/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: '68b6zynBEr9l68WOfYpk',
                proRecordId: 'ZtUiNrVKUMIWjQePU7vK',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/68b6zynBEr9l68WOfYpk/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'j8J3aLFfvNwq4Jafs57Z',
                proRecordId: 'hGHqy72ddsjKqeJC8QEH',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/j8J3aLFfvNwq4Jafs57Z/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: '2BzXzqvwFY3TYKWlEU0l',
                proRecordId: 'lokdEwuxwmQbKXFV5hxJ',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2BzXzqvwFY3TYKWlEU0l/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: 'FDVQW0NUeKENFSkRVGB8',
                proRecordId: 'syPF2D0XSZriA5CoYkaE',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/FDVQW0NUeKENFSkRVGB8/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633471200,
                },
                fileId: '3VT0Yig3mttLm97ifIgu',
                proRecordId: 'w1btHcZqsNH5uZqDEXU1',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3VT0Yig3mttLm97ifIgu/6-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633557600,
                },
                fileId: 'pYoNWoFdiFxSXe6chZTB',
                proRecordId: 'MAUxQYeSuRZMpfR1EaeQ',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pYoNWoFdiFxSXe6chZTB/7-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633557600,
                },
                fileId: 'jsbUZpbW5zBMz4ty8Aen',
                proRecordId: 'ufBiTtwP6pUR1Sjewu8J',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/jsbUZpbW5zBMz4ty8Aen/7-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633644000,
                },
                fileId: '21WIbRF6UxAKhNEO8x75',
                proRecordId: 'Sp0wSFPy2m9FdfAadLZ0',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/21WIbRF6UxAKhNEO8x75/8-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633903200,
                },
                fileId: 'bR3jS6eDdFrzhDlqFvVn',
                proRecordId: 'DsUC5bUu6KMGXS4eGfr8',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/bR3jS6eDdFrzhDlqFvVn/11-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633903200,
                },
                fileId: 'a8xpIpMIQdaBgmAUMA9u',
                proRecordId: 'EbFOBWlC0BIlJtW1Y7NK',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/a8xpIpMIQdaBgmAUMA9u/11-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633903200,
                },
                fileId: 'fYRIDbaH0cTny7R7Idcu',
                proRecordId: 'T20qdx3uumfYH4AlrrHb',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/fYRIDbaH0cTny7R7Idcu/11-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1633903200,
                },
                fileId: '8Pntl64bWBS4FnXcDB0l',
                proRecordId: 'alK5r8QHwawqOCmH6p3h',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/8Pntl64bWBS4FnXcDB0l/11-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1634508000,
                },
                fileId: 'vRvzbAzhx0dCvQQB9NWa',
                proRecordId: 'EFjTePQW1voxJWd2BUBo',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vRvzbAzhx0dCvQQB9NWa/18-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1634508000,
                },
                fileId: 'UUnQGVUKggPlWRbckrrV',
                proRecordId: 'FGFlzaZ0MFW0QOVzkTRK',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/UUnQGVUKggPlWRbckrrV/18-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1634508000,
                },
                fileId: 'xiMioiGgbUi5ZIex3vR9',
                proRecordId: 'Zh9gKp5sp0xMBVzwpINY',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/xiMioiGgbUi5ZIex3vR9/18-10-2021-(start-of-session)',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1715032800,
                },
                fileId: 'KTrhLvygi1QEfZSaCbUD',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 804000000,
                  seconds: 1715070303,
                },
                proRecordId: 'CUCyl3HX4jZIhWkqdKsp',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1715032800,
                },
                fileId: 'Mjlm7whoiCiMdLLgyLAQ',
                fileName: 'Hamlet',
                lastModified: {
                  nanoseconds: 441000000,
                  seconds: 1715068570,
                },
                proRecordId: 'M9I5i7gQPtwaQxaRdInR',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1715032800,
                },
                fileId: null,
                fileName: '',
                lastModified: {
                  nanoseconds: 306000000,
                  seconds: 1715068509,
                },
                proRecordId: 'WEYgKe5H3orxO8kmZbm0',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1715032800,
                },
                fileId: 'KTrhLvygi1QEfZSaCbUD',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 546000000,
                  seconds: 1715070544,
                },
                proRecordId: '1RbK1ws2HyG6taZte50i',
                startOfSession: false,
                storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1715032800,
                },
                fileId: 'Mjlm7whoiCiMdLLgyLAQ',
                fileName: 'Hamlet',
                lastModified: {
                  nanoseconds: 861000000,
                  seconds: 1715070550,
                },
                proRecordId: '4Ip8kJzidSgVAbOebzpY',
                startOfSession: false,
                storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1715032800,
                },
                fileId: null,
                fileName: '',
                lastModified: {
                  nanoseconds: 564000000,
                  seconds: 1715070243,
                },
                proRecordId: 'l2DFXeWTHipEzQUA5etm',
                startOfSession: false,
                storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
              },
            ],
            date: '2024_5_7',
            groups: {
              '007U42lVjKuG2TMHiu2j': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633384800,
                  },
                  fileId: '007U42lVjKuG2TMHiu2j',
                  name: undefined,
                  proRecordId: 'uzi3PoVMfMDwSm5Rppl9',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/007U42lVjKuG2TMHiu2j/5-10-2021-(start-of-session)',
                },
              ],
              '21WIbRF6UxAKhNEO8x75': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633644000,
                  },
                  fileId: '21WIbRF6UxAKhNEO8x75',
                  name: undefined,
                  proRecordId: 'Sp0wSFPy2m9FdfAadLZ0',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/21WIbRF6UxAKhNEO8x75/8-10-2021-(start-of-session)',
                },
              ],
              '2BzXzqvwFY3TYKWlEU0l': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: '2BzXzqvwFY3TYKWlEU0l',
                  name: undefined,
                  proRecordId: 'lokdEwuxwmQbKXFV5hxJ',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2BzXzqvwFY3TYKWlEU0l/6-10-2021-(start-of-session)',
                },
              ],
              '3VT0Yig3mttLm97ifIgu': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: '3VT0Yig3mttLm97ifIgu',
                  name: undefined,
                  proRecordId: 'w1btHcZqsNH5uZqDEXU1',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3VT0Yig3mttLm97ifIgu/6-10-2021-(start-of-session)',
                },
              ],
              '5fa6rAkLra3M5dtpCGYl': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633384800,
                  },
                  fileId: '5fa6rAkLra3M5dtpCGYl',
                  name: undefined,
                  proRecordId: 'ZXfWydgxs83H2sqIVJ1h',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/5fa6rAkLra3M5dtpCGYl/5-10-2021-(start-of-session)',
                },
              ],
              '68b6zynBEr9l68WOfYpk': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: '68b6zynBEr9l68WOfYpk',
                  name: undefined,
                  proRecordId: 'ZtUiNrVKUMIWjQePU7vK',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/68b6zynBEr9l68WOfYpk/6-10-2021-(start-of-session)',
                },
              ],
              '7IkFZliLc5OrTcnmRgN3': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633039200,
                  },
                  fileId: '7IkFZliLc5OrTcnmRgN3',
                  name: undefined,
                  proRecordId: '0ogNnIASVBZql5dgMSGk',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/7IkFZliLc5OrTcnmRgN3/1-10-2021-(start-of-session)',
                },
              ],
              '8Pntl64bWBS4FnXcDB0l': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633903200,
                  },
                  fileId: '8Pntl64bWBS4FnXcDB0l',
                  name: undefined,
                  proRecordId: 'alK5r8QHwawqOCmH6p3h',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/8Pntl64bWBS4FnXcDB0l/11-10-2021-(start-of-session)',
                },
              ],
              AX7HDALdfRetihLkg0GG: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'AX7HDALdfRetihLkg0GG',
                  name: undefined,
                  proRecordId: '1ZpszAoZwIK9exjtTC34',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/AX7HDALdfRetihLkg0GG/6-10-2021-(start-of-session)',
                },
              ],
              C7HwKigacbX1ssMFeFhG: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'C7HwKigacbX1ssMFeFhG',
                  name: undefined,
                  proRecordId: 'EXAqD360F9BjUfwsyVCB',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/C7HwKigacbX1ssMFeFhG/6-10-2021-(start-of-session)',
                },
              ],
              FDVQW0NUeKENFSkRVGB8: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'FDVQW0NUeKENFSkRVGB8',
                  name: undefined,
                  proRecordId: 'syPF2D0XSZriA5CoYkaE',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/FDVQW0NUeKENFSkRVGB8/6-10-2021-(start-of-session)',
                },
              ],
              FgUwKjjRh2ZYkCJ3oTnv: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633384800,
                  },
                  fileId: 'FgUwKjjRh2ZYkCJ3oTnv',
                  name: undefined,
                  proRecordId: 'zVmzZtbmR8GCKP9n4zXW',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/FgUwKjjRh2ZYkCJ3oTnv/5-10-2021-(start-of-session)',
                },
              ],
              HgsHEAUxgeyNRt3pozal: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'HgsHEAUxgeyNRt3pozal',
                  name: undefined,
                  proRecordId: 'DnY9UvbYSULZJtRUXyrY',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/HgsHEAUxgeyNRt3pozal/6-10-2021-(start-of-session)',
                },
              ],
              KTrhLvygi1QEfZSaCbUD: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1715032800,
                  },
                  fileId: 'KTrhLvygi1QEfZSaCbUD',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 804000000,
                    seconds: 1715070303,
                  },
                  name: undefined,
                  proRecordId: 'CUCyl3HX4jZIhWkqdKsp',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1715032800,
                  },
                  fileId: 'KTrhLvygi1QEfZSaCbUD',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 546000000,
                    seconds: 1715070544,
                  },
                  name: undefined,
                  proRecordId: '1RbK1ws2HyG6taZte50i',
                  startOfSession: false,
                  storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
                },
              ],
              Mjlm7whoiCiMdLLgyLAQ: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1715032800,
                  },
                  fileId: 'Mjlm7whoiCiMdLLgyLAQ',
                  fileName: 'Hamlet',
                  lastModified: {
                    nanoseconds: 441000000,
                    seconds: 1715068570,
                  },
                  name: undefined,
                  proRecordId: 'M9I5i7gQPtwaQxaRdInR',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1715032800,
                  },
                  fileId: 'Mjlm7whoiCiMdLLgyLAQ',
                  fileName: 'Hamlet',
                  lastModified: {
                    nanoseconds: 861000000,
                    seconds: 1715070550,
                  },
                  name: undefined,
                  proRecordId: '4Ip8kJzidSgVAbOebzpY',
                  startOfSession: false,
                  storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
                },
              ],
              N3NiRBRlRDHf1vqM1Jtn: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633298400,
                  },
                  fileId: 'N3NiRBRlRDHf1vqM1Jtn',
                  name: undefined,
                  proRecordId: 'T5C55i5y05s1NZjITwfN',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/N3NiRBRlRDHf1vqM1Jtn/4-10-2021-(start-of-session)',
                },
              ],
              SmtpHyM4PqoFDJilzHrA: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633298400,
                  },
                  fileId: 'SmtpHyM4PqoFDJilzHrA',
                  name: undefined,
                  proRecordId: 'd27F4ftgugLkNV8a90JY',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SmtpHyM4PqoFDJilzHrA/4-10-2021-(start-of-session)',
                },
              ],
              UUnQGVUKggPlWRbckrrV: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1634508000,
                  },
                  fileId: 'UUnQGVUKggPlWRbckrrV',
                  name: undefined,
                  proRecordId: 'FGFlzaZ0MFW0QOVzkTRK',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/UUnQGVUKggPlWRbckrrV/18-10-2021-(start-of-session)',
                },
              ],
              ZY2xo0cionSvemAyCkoy: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633298400,
                  },
                  fileId: 'ZY2xo0cionSvemAyCkoy',
                  name: undefined,
                  proRecordId: 'gs923QZBsd0iZRdaqjNh',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/ZY2xo0cionSvemAyCkoy/4-10-2021-(start-of-session)',
                },
              ],
              a8xpIpMIQdaBgmAUMA9u: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633903200,
                  },
                  fileId: 'a8xpIpMIQdaBgmAUMA9u',
                  name: undefined,
                  proRecordId: 'EbFOBWlC0BIlJtW1Y7NK',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/a8xpIpMIQdaBgmAUMA9u/11-10-2021-(start-of-session)',
                },
              ],
              bR3jS6eDdFrzhDlqFvVn: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633903200,
                  },
                  fileId: 'bR3jS6eDdFrzhDlqFvVn',
                  name: undefined,
                  proRecordId: 'DsUC5bUu6KMGXS4eGfr8',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/bR3jS6eDdFrzhDlqFvVn/11-10-2021-(start-of-session)',
                },
              ],
              bSVCr22cxm9CvPljjOrq: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633298400,
                  },
                  fileId: 'bSVCr22cxm9CvPljjOrq',
                  name: undefined,
                  proRecordId: 'e3nmtXUwcCLLM1DD1mzP',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/bSVCr22cxm9CvPljjOrq/4-10-2021-(start-of-session)',
                },
              ],
              fVYoE8szsiDvIG190Z0G: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633384800,
                  },
                  fileId: 'fVYoE8szsiDvIG190Z0G',
                  name: undefined,
                  proRecordId: 'FuaWcwMtzjBVBXVkiuMu',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/fVYoE8szsiDvIG190Z0G/5-10-2021-(start-of-session)',
                },
              ],
              fYRIDbaH0cTny7R7Idcu: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633903200,
                  },
                  fileId: 'fYRIDbaH0cTny7R7Idcu',
                  name: undefined,
                  proRecordId: 'T20qdx3uumfYH4AlrrHb',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/fYRIDbaH0cTny7R7Idcu/11-10-2021-(start-of-session)',
                },
              ],
              j8J3aLFfvNwq4Jafs57Z: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'j8J3aLFfvNwq4Jafs57Z',
                  name: undefined,
                  proRecordId: 'hGHqy72ddsjKqeJC8QEH',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/j8J3aLFfvNwq4Jafs57Z/6-10-2021-(start-of-session)',
                },
              ],
              jLEp9ZkLhu8sulhMV7Bd: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'jLEp9ZkLhu8sulhMV7Bd',
                  name: undefined,
                  proRecordId: '6pWFzBIqnZf6S4AbFhES',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/jLEp9ZkLhu8sulhMV7Bd/6-10-2021-(start-of-session)',
                },
              ],
              jsbUZpbW5zBMz4ty8Aen: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633557600,
                  },
                  fileId: 'jsbUZpbW5zBMz4ty8Aen',
                  name: undefined,
                  proRecordId: 'ufBiTtwP6pUR1Sjewu8J',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/jsbUZpbW5zBMz4ty8Aen/7-10-2021-(start-of-session)',
                },
              ],
              n7nD3N2AL78W1KlmDDrG: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633471200,
                  },
                  fileId: 'n7nD3N2AL78W1KlmDDrG',
                  name: undefined,
                  proRecordId: '26yWA4Um7JYLHgeJ2pQ0',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/n7nD3N2AL78W1KlmDDrG/6-10-2021-(start-of-session)',
                },
              ],
              null: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1715032800,
                  },
                  fileId: null,
                  fileName: '',
                  lastModified: {
                    nanoseconds: 306000000,
                    seconds: 1715068509,
                  },
                  name: undefined,
                  proRecordId: 'WEYgKe5H3orxO8kmZbm0',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1715032800,
                  },
                  fileId: null,
                  fileName: '',
                  lastModified: {
                    nanoseconds: 564000000,
                    seconds: 1715070243,
                  },
                  name: undefined,
                  proRecordId: 'l2DFXeWTHipEzQUA5etm',
                  startOfSession: false,
                  storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/7-5-2024.pltr',
                },
              ],
              pYoNWoFdiFxSXe6chZTB: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633557600,
                  },
                  fileId: 'pYoNWoFdiFxSXe6chZTB',
                  name: undefined,
                  proRecordId: 'MAUxQYeSuRZMpfR1EaeQ',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pYoNWoFdiFxSXe6chZTB/7-10-2021-(start-of-session)',
                },
              ],
              rYof3MF6j1MGMvoEUEql: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633298400,
                  },
                  fileId: 'rYof3MF6j1MGMvoEUEql',
                  name: undefined,
                  proRecordId: 'X3Zf050WATY47XkifokE',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rYof3MF6j1MGMvoEUEql/4-10-2021-(start-of-session)',
                },
              ],
              sOzNa5Hq0U6y1Z7apbGp: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633298400,
                  },
                  fileId: 'sOzNa5Hq0U6y1Z7apbGp',
                  name: undefined,
                  proRecordId: 'o5OmrsnUqXcFV2cyjEvV',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/sOzNa5Hq0U6y1Z7apbGp/4-10-2021-(start-of-session)',
                },
              ],
              vRvzbAzhx0dCvQQB9NWa: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1634508000,
                  },
                  fileId: 'vRvzbAzhx0dCvQQB9NWa',
                  name: undefined,
                  proRecordId: 'EFjTePQW1voxJWd2BUBo',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vRvzbAzhx0dCvQQB9NWa/18-10-2021-(start-of-session)',
                },
              ],
              wGCW9tOdK4S2wcmDxTHv: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1633384800,
                  },
                  fileId: 'wGCW9tOdK4S2wcmDxTHv',
                  name: undefined,
                  proRecordId: 'kXHeuAnUlNIjBrHhdOqs',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/wGCW9tOdK4S2wcmDxTHv/5-10-2021-(start-of-session)',
                },
              ],
              xiMioiGgbUi5ZIex3vR9: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1634508000,
                  },
                  fileId: 'xiMioiGgbUi5ZIex3vR9',
                  name: undefined,
                  proRecordId: 'Zh9gKp5sp0xMBVzwpINY',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/xiMioiGgbUi5ZIex3vR9/18-10-2021-(start-of-session)',
                },
              ],
            },
            longDateStr: 'May 7, 2024',
            path: '/home/edward/.config/plottr/backups/5_7_2024',
            shortDateStr: '2024 (day: 7), 12:00 AM',
          },
          {
            backups: [
              {
                lastEdited: 1714978059924.1614,
                name: '(start-session)-Tarumba-test.pltr',
                size: 407635,
              },
              {
                lastEdited: 1714977130753.1055,
                name: '(start-session)-Tarumba.pltr',
                size: 407637,
              },
              {
                lastEdited: 1714983696970.5012,
                name: '(start-session)-[template] Kishoutenketsu Blank.pltr',
                size: 9425,
              },
              {
                lastEdited: 1714990525799.9128,
                name: '(start-session)-blargy blarg.pltr',
                size: 5346,
              },
              {
                lastEdited: 1714994349471.0164,
                name: '(start-session)-example3.pltr',
                size: 1063454,
              },
              {
                lastEdited: 1714977780406.1445,
                name: 'Tarumba.pltr',
                size: 407637,
              },
              {
                lastEdited: 1714995619375.0928,
                name: 'blargy blarg.pltr',
                size: 5462,
              },
              {
                lastEdited: 1714994714767.0383,
                name: 'example3.pltr',
                size: 1071504,
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714946400,
                },
                fileId: 'pzpxZkL6PZNDV1FmeDhE',
                fileName: '[template] Kishoutenketsu Blank.pltr',
                lastModified: {
                  nanoseconds: 818000000,
                  seconds: 1714983772,
                },
                proRecordId: 'mL0HcMtnOy3hjvPt1g1p',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pzpxZkL6PZNDV1FmeDhE/6-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714946400,
                },
                fileId: 'pzpxZkL6PZNDV1FmeDhE',
                fileName: '[template] Kishoutenketsu Blank.pltr',
                lastModified: {
                  nanoseconds: 460000000,
                  seconds: 1714983834,
                },
                proRecordId: 'ZRPfRTXRN9oB9RbC21lO',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pzpxZkL6PZNDV1FmeDhE/6-5-2024.pltr',
              },
            ],
            date: '2024_5_6',
            groups: {
              Tarumba: [
                {
                  lastEdited: 1714977130753.1055,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-Tarumba.pltr',
                  ],
                  name: 'Tarumba',
                  size: 407637,
                },
                {
                  lastEdited: 1714977780406.1445,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    'Tarumba.pltr',
                  ],
                  name: 'Tarumba',
                  size: 407637,
                },
              ],
              'Tarumba-test': [
                {
                  lastEdited: 1714978059924.1614,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-Tarumba-test.pltr',
                  ],
                  name: 'Tarumba-test',
                  size: 407635,
                },
              ],
              '[template] Kishoutenketsu Blank': [
                {
                  lastEdited: 1714983696970.5012,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-[template] Kishoutenketsu Blank.pltr',
                  ],
                  name: '[template] Kishoutenketsu Blank',
                  size: 9425,
                },
              ],
              'blargy blarg': [
                {
                  lastEdited: 1714990525799.9128,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5346,
                },
                {
                  lastEdited: 1714995619375.0928,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    'blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5462,
                },
              ],
              example3: [
                {
                  lastEdited: 1714994349471.0164,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    '(start-session)-example3.pltr',
                  ],
                  name: 'example3',
                  size: 1063454,
                },
                {
                  lastEdited: 1714994714767.0383,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_6_2024',
                    'example3.pltr',
                  ],
                  name: 'example3',
                  size: 1071504,
                },
              ],
              pzpxZkL6PZNDV1FmeDhE: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714946400,
                  },
                  fileId: 'pzpxZkL6PZNDV1FmeDhE',
                  fileName: '[template] Kishoutenketsu Blank.pltr',
                  lastModified: {
                    nanoseconds: 818000000,
                    seconds: 1714983772,
                  },
                  name: undefined,
                  proRecordId: 'mL0HcMtnOy3hjvPt1g1p',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pzpxZkL6PZNDV1FmeDhE/6-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714946400,
                  },
                  fileId: 'pzpxZkL6PZNDV1FmeDhE',
                  fileName: '[template] Kishoutenketsu Blank.pltr',
                  lastModified: {
                    nanoseconds: 460000000,
                    seconds: 1714983834,
                  },
                  name: undefined,
                  proRecordId: 'ZRPfRTXRN9oB9RbC21lO',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pzpxZkL6PZNDV1FmeDhE/6-5-2024.pltr',
                },
              ],
            },
            longDateStr: 'May 6, 2024',
            path: '/home/edward/.config/plottr/backups/5_6_2024',
            shortDateStr: '2024 (day: 6), 12:00 AM',
          },
          {
            backups: [
              {
                lastEdited: 1714631502356.2793,
                name: '(start-session)-40 Sentence Template by Zara Altair.pltr',
                size: 1409588,
              },
              {
                lastEdited: 1714635684221.5312,
                name: '(start-session)-blargy blarg.pltr',
                size: 5341,
              },
              {
                lastEdited: 1714631778498.296,
                name: '40 Sentence Template by Zara Altair.pltr',
                size: 1409508,
              },
              {
                lastEdited: 1714639301681.0747,
                name: 'blargy blarg.pltr',
                size: 5346,
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'KTrhLvygi1QEfZSaCbUD',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 974000000,
                  seconds: 1714639184,
                },
                proRecordId: '2p8acF9wcvKFm8U6dewk',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/KTrhLvygi1QEfZSaCbUD/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'Mw0dwuUrcd8D7NUkkAVt',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 979000000,
                  seconds: 1714636909,
                },
                proRecordId: '7ftasa0BdbZNWucSuQQm',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Mw0dwuUrcd8D7NUkkAVt/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: null,
                fileName: '',
                lastModified: {
                  nanoseconds: 710000000,
                  seconds: 1714640619,
                },
                proRecordId: '8R7HDhf6Evk5FNl8WK95',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'Qenyef5kruX3EUfqyYnL',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 845000000,
                  seconds: 1714639374,
                },
                proRecordId: 'GOIkA4F1ilk4y86KZjEg',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Qenyef5kruX3EUfqyYnL/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'HI0RY0XD4JMBvfvRkV9A',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 880000000,
                  seconds: 1714638852,
                },
                proRecordId: 'IxAaeq20QrCMCRcsWkzc',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/HI0RY0XD4JMBvfvRkV9A/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'vXkRjjQD6enpUwFalmi7',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 561000000,
                  seconds: 1714637497,
                },
                proRecordId: 'Lht4iQtVA2TCiWIQTiIf',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vXkRjjQD6enpUwFalmi7/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'PdCTepSAqSWwnJpE4o5T',
                fileName: 'hello',
                lastModified: {
                  nanoseconds: 922000000,
                  seconds: 1714635596,
                },
                proRecordId: 'XPYKVJTmeBEuPs4xYvO0',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PdCTepSAqSWwnJpE4o5T/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: '7763363wovA82z0Ep8LC',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 526000000,
                  seconds: 1714637313,
                },
                proRecordId: 'dctlL7tUUdGAWlbYptpc',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/7763363wovA82z0Ep8LC/2-5-2024-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: null,
                fileName: '',
                lastModified: {
                  nanoseconds: 825000000,
                  seconds: 1714640647,
                },
                proRecordId: '1swuQHtL66VxshBbO6WL',
                startOfSession: false,
                storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'vXkRjjQD6enpUwFalmi7',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 481000000,
                  seconds: 1714637558,
                },
                proRecordId: '7OKTUIjM2tFt8K3LwR25',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vXkRjjQD6enpUwFalmi7/2-5-2024.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'Mw0dwuUrcd8D7NUkkAVt',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 931000000,
                  seconds: 1714636970,
                },
                proRecordId: 'D5YkIoZvI8x7eIuenK4x',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Mw0dwuUrcd8D7NUkkAVt/2-5-2024.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'KTrhLvygi1QEfZSaCbUD',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 422000000,
                  seconds: 1714641930,
                },
                proRecordId: 'XDMLa0TeBBQwpL4qLh8r',
                startOfSession: false,
                storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714600800,
                },
                fileId: 'Qenyef5kruX3EUfqyYnL',
                fileName: 'blargy blarg.pltr',
                lastModified: {
                  nanoseconds: 778000000,
                  seconds: 1714639398,
                },
                proRecordId: 'ogVDtvcC4sWORf3eVIcF',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Qenyef5kruX3EUfqyYnL/2-5-2024.pltr',
              },
            ],
            date: '2024_5_2',
            groups: {
              '40 Sentence Template by Zara Altair': [
                {
                  lastEdited: 1714631502356.2793,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    '(start-session)-40 Sentence Template by Zara Altair.pltr',
                  ],
                  name: '40 Sentence Template by Zara Altair',
                  size: 1409588,
                },
                {
                  lastEdited: 1714631778498.296,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    '40 Sentence Template by Zara Altair.pltr',
                  ],
                  name: '40 Sentence Template by Zara Altair',
                  size: 1409508,
                },
              ],
              '7763363wovA82z0Ep8LC': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: '7763363wovA82z0Ep8LC',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 526000000,
                    seconds: 1714637313,
                  },
                  name: undefined,
                  proRecordId: 'dctlL7tUUdGAWlbYptpc',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/7763363wovA82z0Ep8LC/2-5-2024-(start-of-session).pltr',
                },
              ],
              HI0RY0XD4JMBvfvRkV9A: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'HI0RY0XD4JMBvfvRkV9A',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 880000000,
                    seconds: 1714638852,
                  },
                  name: undefined,
                  proRecordId: 'IxAaeq20QrCMCRcsWkzc',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/HI0RY0XD4JMBvfvRkV9A/2-5-2024-(start-of-session).pltr',
                },
              ],
              KTrhLvygi1QEfZSaCbUD: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'KTrhLvygi1QEfZSaCbUD',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 974000000,
                    seconds: 1714639184,
                  },
                  name: undefined,
                  proRecordId: '2p8acF9wcvKFm8U6dewk',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/KTrhLvygi1QEfZSaCbUD/2-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'KTrhLvygi1QEfZSaCbUD',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 422000000,
                    seconds: 1714641930,
                  },
                  name: undefined,
                  proRecordId: 'XDMLa0TeBBQwpL4qLh8r',
                  startOfSession: false,
                  storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024.pltr',
                },
              ],
              Mw0dwuUrcd8D7NUkkAVt: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'Mw0dwuUrcd8D7NUkkAVt',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 979000000,
                    seconds: 1714636909,
                  },
                  name: undefined,
                  proRecordId: '7ftasa0BdbZNWucSuQQm',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Mw0dwuUrcd8D7NUkkAVt/2-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'Mw0dwuUrcd8D7NUkkAVt',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 931000000,
                    seconds: 1714636970,
                  },
                  name: undefined,
                  proRecordId: 'D5YkIoZvI8x7eIuenK4x',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Mw0dwuUrcd8D7NUkkAVt/2-5-2024.pltr',
                },
              ],
              PdCTepSAqSWwnJpE4o5T: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'PdCTepSAqSWwnJpE4o5T',
                  fileName: 'hello',
                  lastModified: {
                    nanoseconds: 922000000,
                    seconds: 1714635596,
                  },
                  name: undefined,
                  proRecordId: 'XPYKVJTmeBEuPs4xYvO0',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PdCTepSAqSWwnJpE4o5T/2-5-2024-(start-of-session).pltr',
                },
              ],
              Qenyef5kruX3EUfqyYnL: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'Qenyef5kruX3EUfqyYnL',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 845000000,
                    seconds: 1714639374,
                  },
                  name: undefined,
                  proRecordId: 'GOIkA4F1ilk4y86KZjEg',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Qenyef5kruX3EUfqyYnL/2-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'Qenyef5kruX3EUfqyYnL',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 778000000,
                    seconds: 1714639398,
                  },
                  name: undefined,
                  proRecordId: 'ogVDtvcC4sWORf3eVIcF',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Qenyef5kruX3EUfqyYnL/2-5-2024.pltr',
                },
              ],
              'blargy blarg': [
                {
                  lastEdited: 1714635684221.5312,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    '(start-session)-blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5341,
                },
                {
                  lastEdited: 1714639301681.0747,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_2_2024',
                    'blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5346,
                },
              ],
              null: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: null,
                  fileName: '',
                  lastModified: {
                    nanoseconds: 710000000,
                    seconds: 1714640619,
                  },
                  name: undefined,
                  proRecordId: '8R7HDhf6Evk5FNl8WK95',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: null,
                  fileName: '',
                  lastModified: {
                    nanoseconds: 825000000,
                    seconds: 1714640647,
                  },
                  name: undefined,
                  proRecordId: '1swuQHtL66VxshBbO6WL',
                  startOfSession: false,
                  storagePath: 'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/null/2-5-2024.pltr',
                },
              ],
              vXkRjjQD6enpUwFalmi7: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'vXkRjjQD6enpUwFalmi7',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 561000000,
                    seconds: 1714637497,
                  },
                  name: undefined,
                  proRecordId: 'Lht4iQtVA2TCiWIQTiIf',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vXkRjjQD6enpUwFalmi7/2-5-2024-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714600800,
                  },
                  fileId: 'vXkRjjQD6enpUwFalmi7',
                  fileName: 'blargy blarg.pltr',
                  lastModified: {
                    nanoseconds: 481000000,
                    seconds: 1714637558,
                  },
                  name: undefined,
                  proRecordId: '7OKTUIjM2tFt8K3LwR25',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vXkRjjQD6enpUwFalmi7/2-5-2024.pltr',
                },
              ],
            },
            longDateStr: 'May 2, 2024',
            path: '/home/edward/.config/plottr/backups/5_2_2024',
            shortDateStr: '2024 (day: 2), 12:00 AM',
          },
          {
            backups: [
              {
                lastEdited: 1714546185400.2012,
                name: '(start-session)-blargy blarg.pltr',
                size: 5075,
              },
              {
                lastEdited: 1714564366910.7466,
                name: '(start-session)-example3.pltr',
                size: 1063454,
              },
              {
                lastEdited: 1714565869766.8716,
                name: 'example3.pltr',
                size: 3886907,
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1714514400,
                },
                fileId: 'pNTJ1U9UbuZrw9HwaEVq',
                fileName: 'Goldilocks and The Three Bears.pltr',
                lastModified: {
                  nanoseconds: 824000000,
                  seconds: 1714557267,
                },
                proRecordId: 'fR3qNjxwDCod6F2hjWYm',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pNTJ1U9UbuZrw9HwaEVq/1-5-2024-(start-of-session).pltr',
              },
            ],
            date: '2024_5_1',
            groups: {
              'blargy blarg': [
                {
                  lastEdited: 1714546185400.2012,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_1_2024',
                    '(start-session)-blargy blarg.pltr',
                  ],
                  name: 'blargy blarg',
                  size: 5075,
                },
              ],
              example3: [
                {
                  lastEdited: 1714564366910.7466,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_1_2024',
                    '(start-session)-example3.pltr',
                  ],
                  name: 'example3',
                  size: 1063454,
                },
                {
                  lastEdited: 1714565869766.8716,
                  localFilePathSegments: [
                    '/home/edward/.config/plottr/backups/5_1_2024',
                    'example3.pltr',
                  ],
                  name: 'example3',
                  size: 3886907,
                },
              ],
              pNTJ1U9UbuZrw9HwaEVq: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1714514400,
                  },
                  fileId: 'pNTJ1U9UbuZrw9HwaEVq',
                  fileName: 'Goldilocks and The Three Bears.pltr',
                  lastModified: {
                    nanoseconds: 824000000,
                    seconds: 1714557267,
                  },
                  name: undefined,
                  proRecordId: 'fR3qNjxwDCod6F2hjWYm',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/pNTJ1U9UbuZrw9HwaEVq/1-5-2024-(start-of-session).pltr',
                },
              ],
            },
            longDateStr: 'May 1, 2024',
            path: '/home/edward/.config/plottr/backups/5_1_2024',
            shortDateStr: '2024 (day: 1), 12:00 AM',
          },
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1698606000,
                },
                fileId: 'Tf2vOREjd8Pmr3ArZdOm',
                fileName: 'The Turn',
                lastModified: {
                  nanoseconds: 990000000,
                  seconds: 1698641184,
                },
                proRecordId: 'Bzf5vS0Rs8DFNft7zJXL',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Tf2vOREjd8Pmr3ArZdOm/30-10-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1698616800,
                },
                fileId: 'BhNQW5N4CN3UdVRAEJxl',
                fileName: 'Test Notes',
                lastModified: {
                  nanoseconds: 641000000,
                  seconds: 1698657532,
                },
                proRecordId: '01ZoA3SyCgxUIolZooxR',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BhNQW5N4CN3UdVRAEJxl/30-10-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1698606000,
                },
                fileId: 'Tf2vOREjd8Pmr3ArZdOm',
                fileName: 'The Turn',
                lastModified: {
                  nanoseconds: 687000000,
                  seconds: 1698659231,
                },
                proRecordId: '7NgwYrsFUPdF2xu9TPo1',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Tf2vOREjd8Pmr3ArZdOm/30-10-2023.pltr',
              },
            ],
            date: '2023_10_30',
            groups: {
              BhNQW5N4CN3UdVRAEJxl: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1698616800,
                  },
                  fileId: 'BhNQW5N4CN3UdVRAEJxl',
                  fileName: 'Test Notes',
                  lastModified: {
                    nanoseconds: 641000000,
                    seconds: 1698657532,
                  },
                  name: undefined,
                  proRecordId: '01ZoA3SyCgxUIolZooxR',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BhNQW5N4CN3UdVRAEJxl/30-10-2023-(start-of-session).pltr',
                },
              ],
              Tf2vOREjd8Pmr3ArZdOm: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1698606000,
                  },
                  fileId: 'Tf2vOREjd8Pmr3ArZdOm',
                  fileName: 'The Turn',
                  lastModified: {
                    nanoseconds: 990000000,
                    seconds: 1698641184,
                  },
                  name: undefined,
                  proRecordId: 'Bzf5vS0Rs8DFNft7zJXL',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Tf2vOREjd8Pmr3ArZdOm/30-10-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1698606000,
                  },
                  fileId: 'Tf2vOREjd8Pmr3ArZdOm',
                  fileName: 'The Turn',
                  lastModified: {
                    nanoseconds: 687000000,
                    seconds: 1698659231,
                  },
                  name: undefined,
                  proRecordId: '7NgwYrsFUPdF2xu9TPo1',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Tf2vOREjd8Pmr3ArZdOm/30-10-2023.pltr',
                },
              ],
            },
            longDateStr: 'Oct 30, 2023',
            path: '2023_10_30',
            shortDateStr: '2023 (day: 30), 12:00 AM',
          },
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684695600,
                },
                fileId: 'OI3xvD4aZyahTLKirFzn',
                fileName: 'safari',
                lastModified: {
                  nanoseconds: 797000000,
                  seconds: 1684740393,
                },
                proRecordId: '0216IvOWo0OSMbjsjJGM',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/OI3xvD4aZyahTLKirFzn/22-5-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684695600,
                },
                fileId: 'PloC8E9okkuYk3K628E5',
                fileName: '01.14.pltr',
                lastModified: {
                  nanoseconds: 411000000,
                  seconds: 1684741740,
                },
                proRecordId: 'DrqdxOeErXSiXCxPGS1O',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PloC8E9okkuYk3K628E5/22-5-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684695600,
                },
                fileId: 'g6HiqHB5dGytcXo7tmma',
                fileName: 'blank project on 1403.pltr',
                lastModified: {
                  nanoseconds: 541000000,
                  seconds: 1684741776,
                },
                proRecordId: 'eXDV6RIlMiA1D7ERoFNV',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/g6HiqHB5dGytcXo7tmma/22-5-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684695600,
                },
                fileId: '3kot5Qt6Ty9yDUFUapo7',
                fileName: 'The Tortoise And The Hare V3.pltr',
                lastModified: {
                  nanoseconds: 413000000,
                  seconds: 1684740424,
                },
                proRecordId: 'em0OLJSHfRobjvA7GqRk',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3kot5Qt6Ty9yDUFUapo7/22-5-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684706400,
                },
                fileId: 'mMirUfkwSNyPbJjnWmi2',
                fileName: 'SKYRAKERS-BREAKOUT.pltr',
                lastModified: {
                  nanoseconds: 771000000,
                  seconds: 1684743054,
                },
                proRecordId: 'VXl3h8v87kYrYoy9tYTb',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/mMirUfkwSNyPbJjnWmi2/22-5-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684695600,
                },
                fileId: '3kot5Qt6Ty9yDUFUapo7',
                fileName: 'The Tortoise And The Hare V3.pltr',
                lastModified: {
                  nanoseconds: 264000000,
                  seconds: 1684740867,
                },
                proRecordId: 'DT921F2mgtmah22RuD6h',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3kot5Qt6Ty9yDUFUapo7/22-5-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1684695600,
                },
                fileId: 'OI3xvD4aZyahTLKirFzn',
                fileName: 'safari',
                lastModified: {
                  nanoseconds: 890000000,
                  seconds: 1684740503,
                },
                proRecordId: 'E4ehsaJOQksVXiU1b5l6',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/OI3xvD4aZyahTLKirFzn/22-5-2023.pltr',
              },
            ],
            date: '2023_5_22',
            groups: {
              '3kot5Qt6Ty9yDUFUapo7': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684695600,
                  },
                  fileId: '3kot5Qt6Ty9yDUFUapo7',
                  fileName: 'The Tortoise And The Hare V3.pltr',
                  lastModified: {
                    nanoseconds: 413000000,
                    seconds: 1684740424,
                  },
                  name: undefined,
                  proRecordId: 'em0OLJSHfRobjvA7GqRk',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3kot5Qt6Ty9yDUFUapo7/22-5-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684695600,
                  },
                  fileId: '3kot5Qt6Ty9yDUFUapo7',
                  fileName: 'The Tortoise And The Hare V3.pltr',
                  lastModified: {
                    nanoseconds: 264000000,
                    seconds: 1684740867,
                  },
                  name: undefined,
                  proRecordId: 'DT921F2mgtmah22RuD6h',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/3kot5Qt6Ty9yDUFUapo7/22-5-2023.pltr',
                },
              ],
              OI3xvD4aZyahTLKirFzn: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684695600,
                  },
                  fileId: 'OI3xvD4aZyahTLKirFzn',
                  fileName: 'safari',
                  lastModified: {
                    nanoseconds: 797000000,
                    seconds: 1684740393,
                  },
                  name: undefined,
                  proRecordId: '0216IvOWo0OSMbjsjJGM',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/OI3xvD4aZyahTLKirFzn/22-5-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684695600,
                  },
                  fileId: 'OI3xvD4aZyahTLKirFzn',
                  fileName: 'safari',
                  lastModified: {
                    nanoseconds: 890000000,
                    seconds: 1684740503,
                  },
                  name: undefined,
                  proRecordId: 'E4ehsaJOQksVXiU1b5l6',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/OI3xvD4aZyahTLKirFzn/22-5-2023.pltr',
                },
              ],
              PloC8E9okkuYk3K628E5: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684695600,
                  },
                  fileId: 'PloC8E9okkuYk3K628E5',
                  fileName: '01.14.pltr',
                  lastModified: {
                    nanoseconds: 411000000,
                    seconds: 1684741740,
                  },
                  name: undefined,
                  proRecordId: 'DrqdxOeErXSiXCxPGS1O',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PloC8E9okkuYk3K628E5/22-5-2023-(start-of-session).pltr',
                },
              ],
              g6HiqHB5dGytcXo7tmma: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684695600,
                  },
                  fileId: 'g6HiqHB5dGytcXo7tmma',
                  fileName: 'blank project on 1403.pltr',
                  lastModified: {
                    nanoseconds: 541000000,
                    seconds: 1684741776,
                  },
                  name: undefined,
                  proRecordId: 'eXDV6RIlMiA1D7ERoFNV',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/g6HiqHB5dGytcXo7tmma/22-5-2023-(start-of-session).pltr',
                },
              ],
              mMirUfkwSNyPbJjnWmi2: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1684706400,
                  },
                  fileId: 'mMirUfkwSNyPbJjnWmi2',
                  fileName: 'SKYRAKERS-BREAKOUT.pltr',
                  lastModified: {
                    nanoseconds: 771000000,
                    seconds: 1684743054,
                  },
                  name: undefined,
                  proRecordId: 'VXl3h8v87kYrYoy9tYTb',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/mMirUfkwSNyPbJjnWmi2/22-5-2023-(start-of-session).pltr',
                },
              ],
            },
            longDateStr: 'May 22, 2023',
            path: '2023_5_22',
            shortDateStr: '2023 (day: 22), 12:00 AM',
          },
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1681682400,
                },
                fileId: 'J7hgHEbfdV7PxpQyGdC5',
                fileName: 'Snow',
                lastModified: {
                  nanoseconds: 955000000,
                  seconds: 1681717170,
                },
                proRecordId: 'Wmvrr0Zo29uCfLdJ0mYQ',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/J7hgHEbfdV7PxpQyGdC5/17-4-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1658948400,
                },
                fileId: 'iNik0ASY9Zy2TbSZFs3u',
                fileName: 'Testing with adapted pltr',
                lastModified: {
                  nanoseconds: 454000000,
                  seconds: 1681708047,
                },
                proRecordId: '01xjPwl45cOmTcvYsbkP',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PmQ7Mrmuyi5JzhXLrUQS/17-4-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1681682400,
                },
                fileId: 'J7hgHEbfdV7PxpQyGdC5',
                fileName: 'Snow',
                lastModified: {
                  nanoseconds: 854000000,
                  seconds: 1681718077,
                },
                proRecordId: 'hjY65NhawRuGzfTjXQ7o',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/J7hgHEbfdV7PxpQyGdC5/17-4-2023.pltr',
              },
            ],
            date: '2023_4_17',
            groups: {
              J7hgHEbfdV7PxpQyGdC5: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1681682400,
                  },
                  fileId: 'J7hgHEbfdV7PxpQyGdC5',
                  fileName: 'Snow',
                  lastModified: {
                    nanoseconds: 955000000,
                    seconds: 1681717170,
                  },
                  name: undefined,
                  proRecordId: 'Wmvrr0Zo29uCfLdJ0mYQ',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/J7hgHEbfdV7PxpQyGdC5/17-4-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1681682400,
                  },
                  fileId: 'J7hgHEbfdV7PxpQyGdC5',
                  fileName: 'Snow',
                  lastModified: {
                    nanoseconds: 854000000,
                    seconds: 1681718077,
                  },
                  name: undefined,
                  proRecordId: 'hjY65NhawRuGzfTjXQ7o',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/J7hgHEbfdV7PxpQyGdC5/17-4-2023.pltr',
                },
              ],
              iNik0ASY9Zy2TbSZFs3u: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1658948400,
                  },
                  fileId: 'iNik0ASY9Zy2TbSZFs3u',
                  fileName: 'Testing with adapted pltr',
                  lastModified: {
                    nanoseconds: 454000000,
                    seconds: 1681708047,
                  },
                  name: undefined,
                  proRecordId: '01xjPwl45cOmTcvYsbkP',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/PmQ7Mrmuyi5JzhXLrUQS/17-4-2023.pltr',
                },
              ],
            },
            longDateStr: 'Apr 17, 2023',
            path: '2023_4_17',
            shortDateStr: '2023 (day: 17), 12:00 AM',
          },
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'vy6BN3ISmWHCkC7ebP39',
                fileName: 'Goldilocks and The 3 Bears.pltr',
                lastModified: {
                  nanoseconds: 318000000,
                  seconds: 1677138956,
                },
                proRecordId: '06rwQswdZxt2i0ThvqY3',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vy6BN3ISmWHCkC7ebP39/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'juKG4Ev5ZKgkeLAOJiOR',
                fileName: 'Pride & Prejudice.pltr',
                lastModified: {
                  nanoseconds: 274000000,
                  seconds: 1677137990,
                },
                proRecordId: '5oUggAloQu5dyKOPmNFg',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/juKG4Ev5ZKgkeLAOJiOR/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'vDIBK2lbZSXsbB09SDRK',
                fileName: 'Pride & Prejudice.pltr',
                lastModified: {
                  nanoseconds: 607000000,
                  seconds: 1677138489,
                },
                proRecordId: '7Mf1CTVJlkMWD9b8FYGo',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vDIBK2lbZSXsbB09SDRK/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'gkV85Z8BFJcoZmAAhQQB',
                fileName: 'The Tortoise And The Hare.pltr',
                lastModified: {
                  nanoseconds: 249000000,
                  seconds: 1677136864,
                },
                proRecordId: '8DyK8g3TgvXjofJ8hylI',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/gkV85Z8BFJcoZmAAhQQB/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'GVnLnMLSWYBt0qOH4Ruu',
                fileName: 'Hamlet.pltr',
                lastModified: {
                  nanoseconds: 190000000,
                  seconds: 1677137062,
                },
                proRecordId: 'CfWx8x5L3XqsH6YyH6vd',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GVnLnMLSWYBt0qOH4Ruu/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'BqnU5GVAGniilGNmc9as',
                fileName: 'Goldilocks and The Three Bears',
                lastModified: {
                  nanoseconds: 108000000,
                  seconds: 1677136524,
                },
                proRecordId: 'D6xIcb0SvuDkhlE1rFvU',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BqnU5GVAGniilGNmc9as/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: '2W6b5bwrpDtFUWokgngJ',
                fileName: 'The Tortoise And The Hare.pltr',
                lastModified: {
                  nanoseconds: 214000000,
                  seconds: 1677136657,
                },
                proRecordId: 'GfDBmShAmP38g7z3MjIm',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2W6b5bwrpDtFUWokgngJ/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'yR6mlLRDDv6nTRBqOFGH',
                fileName: 'blank',
                lastModified: {
                  nanoseconds: 425000000,
                  seconds: 1677136565,
                },
                proRecordId: 'YFQvqj2y4O0s779Vj11t',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/yR6mlLRDDv6nTRBqOFGH/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'TJyfVF2vmY5apUmah8J9',
                fileName: 'Pride & Prejudice.pltr',
                lastModified: {
                  nanoseconds: 661000000,
                  seconds: 1677138151,
                },
                proRecordId: 'ZRSDhvkey8LExspS5jwa',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/TJyfVF2vmY5apUmah8J9/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'Dcn50N2LDQi26g1nTMkC',
                fileName: 'Goldilocks and The Three Bears.pltr',
                lastModified: {
                  nanoseconds: 13000000,
                  seconds: 1677136614,
                },
                proRecordId: 'iXypleCeShx4pVcJSZ5d',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Dcn50N2LDQi26g1nTMkC/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'MjGdIzcoRMVQNhhK45jd',
                fileName: 'The Turn',
                lastModified: {
                  nanoseconds: 870000000,
                  seconds: 1677138453,
                },
                proRecordId: 'mfg87xYbpFCeQOYQjJei',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MjGdIzcoRMVQNhhK45jd/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'E1TtStA9Y78WPZ3Ojotq',
                fileName: 'Thief of Adon.pltr',
                lastModified: {
                  nanoseconds: 944000000,
                  seconds: 1677136456,
                },
                proRecordId: 'socDRrGCxFNJByEouImR',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/E1TtStA9Y78WPZ3Ojotq/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677103200,
                },
                fileId: 'MIm5d9efLoTIhXGPPJiK',
                fileName: 'Hamlet.pltr',
                lastModified: {
                  nanoseconds: 900000000,
                  seconds: 1677140379,
                },
                proRecordId: 'k2Jz4s3Wb0FojZKFEnz1',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MIm5d9efLoTIhXGPPJiK/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677103200,
                },
                fileId: 'SJkDzETDu67tb1QgzDKN',
                fileName: 'Hamlet.pltr',
                lastModified: {
                  nanoseconds: 628000000,
                  seconds: 1677141218,
                },
                proRecordId: 'sTL0YQo2RkUCQmJAR9lP',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SJkDzETDu67tb1QgzDKN/23-2-2023-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: '2W6b5bwrpDtFUWokgngJ',
                fileName: 'The Tortoise And The Hare.pltr',
                lastModified: {
                  nanoseconds: 711000000,
                  seconds: 1677136713,
                },
                proRecordId: '05GPCgAU6zw5PVy0Rcgp',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2W6b5bwrpDtFUWokgngJ/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'vy6BN3ISmWHCkC7ebP39',
                fileName: 'Goldilocks and The 3 Bears.pltr',
                lastModified: {
                  nanoseconds: 424000000,
                  seconds: 1677145665,
                },
                proRecordId: '14auv92nKb5CbtlI659k',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vy6BN3ISmWHCkC7ebP39/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'BqnU5GVAGniilGNmc9as',
                fileName: 'Goldilocks and The Three Bears',
                lastModified: {
                  nanoseconds: 849000000,
                  seconds: 1677136580,
                },
                proRecordId: '295u7EQqwC0YOLE3dBhM',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BqnU5GVAGniilGNmc9as/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'vDIBK2lbZSXsbB09SDRK',
                fileName: 'Pride & Prejudice.pltr',
                lastModified: {
                  nanoseconds: 108000000,
                  seconds: 1677138706,
                },
                proRecordId: 'BRSqjnLaW9S9ec42wSZ7',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vDIBK2lbZSXsbB09SDRK/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'E1TtStA9Y78WPZ3Ojotq',
                fileName: 'Thief of Adon.pltr',
                lastModified: {
                  nanoseconds: 878000000,
                  seconds: 1677136554,
                },
                proRecordId: 'LK71XPmSLumMpygx2ynA',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/E1TtStA9Y78WPZ3Ojotq/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'juKG4Ev5ZKgkeLAOJiOR',
                fileName: 'Pride & Prejudice.pltr',
                lastModified: {
                  nanoseconds: 812000000,
                  seconds: 1677138177,
                },
                proRecordId: 'MvVbMs5VsJp8KwWTTYJg',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/juKG4Ev5ZKgkeLAOJiOR/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'Dcn50N2LDQi26g1nTMkC',
                fileName: 'Goldilocks and The Three Bears.pltr',
                lastModified: {
                  nanoseconds: 695000000,
                  seconds: 1677138215,
                },
                proRecordId: 'N8bAZ6TehdCeZLvYjKze',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Dcn50N2LDQi26g1nTMkC/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'TJyfVF2vmY5apUmah8J9',
                fileName: 'Pride & Prejudice.pltr',
                lastModified: {
                  nanoseconds: 156000000,
                  seconds: 1677138895,
                },
                proRecordId: 'U6pKLNQGvfvUjNTNPS8a',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/TJyfVF2vmY5apUmah8J9/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'gkV85Z8BFJcoZmAAhQQB',
                fileName: 'The Tortoise And The Hare.pltr',
                lastModified: {
                  nanoseconds: 950000000,
                  seconds: 1677136920,
                },
                proRecordId: 'Xk84NKiQBklClMQg6hbQ',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/gkV85Z8BFJcoZmAAhQQB/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677092400,
                },
                fileId: 'GVnLnMLSWYBt0qOH4Ruu',
                fileName: 'Hamlet.pltr',
                lastModified: {
                  nanoseconds: 123000000,
                  seconds: 1677137119,
                },
                proRecordId: 'mhdpTTqoMMlCvnnSDP45',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GVnLnMLSWYBt0qOH4Ruu/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677103200,
                },
                fileId: 'MIm5d9efLoTIhXGPPJiK',
                fileName: 'Hamlet.pltr',
                lastModified: {
                  nanoseconds: 397000000,
                  seconds: 1677149233,
                },
                proRecordId: '53CYB3U2Zri0WQy2qNgs',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MIm5d9efLoTIhXGPPJiK/23-2-2023.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1677103200,
                },
                fileId: 'SJkDzETDu67tb1QgzDKN',
                fileName: 'Hamlet.pltr',
                lastModified: {
                  nanoseconds: 689000000,
                  seconds: 1677146194,
                },
                proRecordId: 'IqJLN2jxhKaiVbHfwY4O',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SJkDzETDu67tb1QgzDKN/23-2-2023.pltr',
              },
            ],
            date: '2023_2_23',
            groups: {
              '2W6b5bwrpDtFUWokgngJ': [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: '2W6b5bwrpDtFUWokgngJ',
                  fileName: 'The Tortoise And The Hare.pltr',
                  lastModified: {
                    nanoseconds: 214000000,
                    seconds: 1677136657,
                  },
                  name: undefined,
                  proRecordId: 'GfDBmShAmP38g7z3MjIm',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2W6b5bwrpDtFUWokgngJ/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: '2W6b5bwrpDtFUWokgngJ',
                  fileName: 'The Tortoise And The Hare.pltr',
                  lastModified: {
                    nanoseconds: 711000000,
                    seconds: 1677136713,
                  },
                  name: undefined,
                  proRecordId: '05GPCgAU6zw5PVy0Rcgp',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/2W6b5bwrpDtFUWokgngJ/23-2-2023.pltr',
                },
              ],
              BqnU5GVAGniilGNmc9as: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'BqnU5GVAGniilGNmc9as',
                  fileName: 'Goldilocks and The Three Bears',
                  lastModified: {
                    nanoseconds: 108000000,
                    seconds: 1677136524,
                  },
                  name: undefined,
                  proRecordId: 'D6xIcb0SvuDkhlE1rFvU',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BqnU5GVAGniilGNmc9as/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'BqnU5GVAGniilGNmc9as',
                  fileName: 'Goldilocks and The Three Bears',
                  lastModified: {
                    nanoseconds: 849000000,
                    seconds: 1677136580,
                  },
                  name: undefined,
                  proRecordId: '295u7EQqwC0YOLE3dBhM',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/BqnU5GVAGniilGNmc9as/23-2-2023.pltr',
                },
              ],
              Dcn50N2LDQi26g1nTMkC: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'Dcn50N2LDQi26g1nTMkC',
                  fileName: 'Goldilocks and The Three Bears.pltr',
                  lastModified: {
                    nanoseconds: 13000000,
                    seconds: 1677136614,
                  },
                  name: undefined,
                  proRecordId: 'iXypleCeShx4pVcJSZ5d',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Dcn50N2LDQi26g1nTMkC/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'Dcn50N2LDQi26g1nTMkC',
                  fileName: 'Goldilocks and The Three Bears.pltr',
                  lastModified: {
                    nanoseconds: 695000000,
                    seconds: 1677138215,
                  },
                  name: undefined,
                  proRecordId: 'N8bAZ6TehdCeZLvYjKze',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/Dcn50N2LDQi26g1nTMkC/23-2-2023.pltr',
                },
              ],
              E1TtStA9Y78WPZ3Ojotq: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'E1TtStA9Y78WPZ3Ojotq',
                  fileName: 'Thief of Adon.pltr',
                  lastModified: {
                    nanoseconds: 944000000,
                    seconds: 1677136456,
                  },
                  name: undefined,
                  proRecordId: 'socDRrGCxFNJByEouImR',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/E1TtStA9Y78WPZ3Ojotq/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'E1TtStA9Y78WPZ3Ojotq',
                  fileName: 'Thief of Adon.pltr',
                  lastModified: {
                    nanoseconds: 878000000,
                    seconds: 1677136554,
                  },
                  name: undefined,
                  proRecordId: 'LK71XPmSLumMpygx2ynA',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/E1TtStA9Y78WPZ3Ojotq/23-2-2023.pltr',
                },
              ],
              GVnLnMLSWYBt0qOH4Ruu: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'GVnLnMLSWYBt0qOH4Ruu',
                  fileName: 'Hamlet.pltr',
                  lastModified: {
                    nanoseconds: 190000000,
                    seconds: 1677137062,
                  },
                  name: undefined,
                  proRecordId: 'CfWx8x5L3XqsH6YyH6vd',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GVnLnMLSWYBt0qOH4Ruu/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'GVnLnMLSWYBt0qOH4Ruu',
                  fileName: 'Hamlet.pltr',
                  lastModified: {
                    nanoseconds: 123000000,
                    seconds: 1677137119,
                  },
                  name: undefined,
                  proRecordId: 'mhdpTTqoMMlCvnnSDP45',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GVnLnMLSWYBt0qOH4Ruu/23-2-2023.pltr',
                },
              ],
              MIm5d9efLoTIhXGPPJiK: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677103200,
                  },
                  fileId: 'MIm5d9efLoTIhXGPPJiK',
                  fileName: 'Hamlet.pltr',
                  lastModified: {
                    nanoseconds: 900000000,
                    seconds: 1677140379,
                  },
                  name: undefined,
                  proRecordId: 'k2Jz4s3Wb0FojZKFEnz1',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MIm5d9efLoTIhXGPPJiK/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677103200,
                  },
                  fileId: 'MIm5d9efLoTIhXGPPJiK',
                  fileName: 'Hamlet.pltr',
                  lastModified: {
                    nanoseconds: 397000000,
                    seconds: 1677149233,
                  },
                  name: undefined,
                  proRecordId: '53CYB3U2Zri0WQy2qNgs',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MIm5d9efLoTIhXGPPJiK/23-2-2023.pltr',
                },
              ],
              MjGdIzcoRMVQNhhK45jd: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'MjGdIzcoRMVQNhhK45jd',
                  fileName: 'The Turn',
                  lastModified: {
                    nanoseconds: 870000000,
                    seconds: 1677138453,
                  },
                  name: undefined,
                  proRecordId: 'mfg87xYbpFCeQOYQjJei',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/MjGdIzcoRMVQNhhK45jd/23-2-2023-(start-of-session).pltr',
                },
              ],
              SJkDzETDu67tb1QgzDKN: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677103200,
                  },
                  fileId: 'SJkDzETDu67tb1QgzDKN',
                  fileName: 'Hamlet.pltr',
                  lastModified: {
                    nanoseconds: 628000000,
                    seconds: 1677141218,
                  },
                  name: undefined,
                  proRecordId: 'sTL0YQo2RkUCQmJAR9lP',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SJkDzETDu67tb1QgzDKN/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677103200,
                  },
                  fileId: 'SJkDzETDu67tb1QgzDKN',
                  fileName: 'Hamlet.pltr',
                  lastModified: {
                    nanoseconds: 689000000,
                    seconds: 1677146194,
                  },
                  name: undefined,
                  proRecordId: 'IqJLN2jxhKaiVbHfwY4O',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/SJkDzETDu67tb1QgzDKN/23-2-2023.pltr',
                },
              ],
              TJyfVF2vmY5apUmah8J9: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'TJyfVF2vmY5apUmah8J9',
                  fileName: 'Pride & Prejudice.pltr',
                  lastModified: {
                    nanoseconds: 661000000,
                    seconds: 1677138151,
                  },
                  name: undefined,
                  proRecordId: 'ZRSDhvkey8LExspS5jwa',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/TJyfVF2vmY5apUmah8J9/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'TJyfVF2vmY5apUmah8J9',
                  fileName: 'Pride & Prejudice.pltr',
                  lastModified: {
                    nanoseconds: 156000000,
                    seconds: 1677138895,
                  },
                  name: undefined,
                  proRecordId: 'U6pKLNQGvfvUjNTNPS8a',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/TJyfVF2vmY5apUmah8J9/23-2-2023.pltr',
                },
              ],
              gkV85Z8BFJcoZmAAhQQB: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'gkV85Z8BFJcoZmAAhQQB',
                  fileName: 'The Tortoise And The Hare.pltr',
                  lastModified: {
                    nanoseconds: 249000000,
                    seconds: 1677136864,
                  },
                  name: undefined,
                  proRecordId: '8DyK8g3TgvXjofJ8hylI',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/gkV85Z8BFJcoZmAAhQQB/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'gkV85Z8BFJcoZmAAhQQB',
                  fileName: 'The Tortoise And The Hare.pltr',
                  lastModified: {
                    nanoseconds: 950000000,
                    seconds: 1677136920,
                  },
                  name: undefined,
                  proRecordId: 'Xk84NKiQBklClMQg6hbQ',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/gkV85Z8BFJcoZmAAhQQB/23-2-2023.pltr',
                },
              ],
              juKG4Ev5ZKgkeLAOJiOR: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'juKG4Ev5ZKgkeLAOJiOR',
                  fileName: 'Pride & Prejudice.pltr',
                  lastModified: {
                    nanoseconds: 274000000,
                    seconds: 1677137990,
                  },
                  name: undefined,
                  proRecordId: '5oUggAloQu5dyKOPmNFg',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/juKG4Ev5ZKgkeLAOJiOR/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'juKG4Ev5ZKgkeLAOJiOR',
                  fileName: 'Pride & Prejudice.pltr',
                  lastModified: {
                    nanoseconds: 812000000,
                    seconds: 1677138177,
                  },
                  name: undefined,
                  proRecordId: 'MvVbMs5VsJp8KwWTTYJg',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/juKG4Ev5ZKgkeLAOJiOR/23-2-2023.pltr',
                },
              ],
              vDIBK2lbZSXsbB09SDRK: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'vDIBK2lbZSXsbB09SDRK',
                  fileName: 'Pride & Prejudice.pltr',
                  lastModified: {
                    nanoseconds: 607000000,
                    seconds: 1677138489,
                  },
                  name: undefined,
                  proRecordId: '7Mf1CTVJlkMWD9b8FYGo',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vDIBK2lbZSXsbB09SDRK/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'vDIBK2lbZSXsbB09SDRK',
                  fileName: 'Pride & Prejudice.pltr',
                  lastModified: {
                    nanoseconds: 108000000,
                    seconds: 1677138706,
                  },
                  name: undefined,
                  proRecordId: 'BRSqjnLaW9S9ec42wSZ7',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vDIBK2lbZSXsbB09SDRK/23-2-2023.pltr',
                },
              ],
              vy6BN3ISmWHCkC7ebP39: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'vy6BN3ISmWHCkC7ebP39',
                  fileName: 'Goldilocks and The 3 Bears.pltr',
                  lastModified: {
                    nanoseconds: 318000000,
                    seconds: 1677138956,
                  },
                  name: undefined,
                  proRecordId: '06rwQswdZxt2i0ThvqY3',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vy6BN3ISmWHCkC7ebP39/23-2-2023-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'vy6BN3ISmWHCkC7ebP39',
                  fileName: 'Goldilocks and The 3 Bears.pltr',
                  lastModified: {
                    nanoseconds: 424000000,
                    seconds: 1677145665,
                  },
                  name: undefined,
                  proRecordId: '14auv92nKb5CbtlI659k',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/vy6BN3ISmWHCkC7ebP39/23-2-2023.pltr',
                },
              ],
              yR6mlLRDDv6nTRBqOFGH: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1677092400,
                  },
                  fileId: 'yR6mlLRDDv6nTRBqOFGH',
                  fileName: 'blank',
                  lastModified: {
                    nanoseconds: 425000000,
                    seconds: 1677136565,
                  },
                  name: undefined,
                  proRecordId: 'YFQvqj2y4O0s779Vj11t',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/yR6mlLRDDv6nTRBqOFGH/23-2-2023-(start-of-session).pltr',
                },
              ],
            },
            longDateStr: 'Feb 23, 2023',
            path: '2023_2_23',
            shortDateStr: '2023 (day: 23), 12:00 AM',
          },
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1658937600,
                },
                fileId: 'w6SjKdoH48YRN1sXYmIG',
                fileName: 'Pride & Prejudice (1)',
                lastModified: {
                  nanoseconds: 264000000,
                  seconds: 1659006715,
                },
                proRecordId: 'oYwzZuIFwxt1TYsCaIG4',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/w6SjKdoH48YRN1sXYmIG/28-7-2022-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1658948400,
                },
                fileId: 'GMtWezAv2DEyc9jWuZ2A',
                fileName: 'hi',
                lastModified: {
                  nanoseconds: 170000000,
                  seconds: 1659000053,
                },
                proRecordId: '80JIzZwyaAOExTrOu63I',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GMtWezAv2DEyc9jWuZ2A/28-7-2022-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1658948400,
                },
                fileId: 'iNik0ASY9Zy2TbSZFs3u',
                fileName: 'comments',
                lastModified: {
                  nanoseconds: 591000000,
                  seconds: 1659012041,
                },
                proRecordId: 'lX56fkpt3EDUKd5yjnyb',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/iNik0ASY9Zy2TbSZFs3u/28-7-2022-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1658937600,
                },
                fileId: 'w6SjKdoH48YRN1sXYmIG',
                fileName: 'Pride & Prejudice (1)',
                lastModified: {
                  nanoseconds: 939000000,
                  seconds: 1659020893,
                },
                proRecordId: 'JQm3homIycge46fTPnwg',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/w6SjKdoH48YRN1sXYmIG/28-7-2022.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1658948400,
                },
                fileId: 'GMtWezAv2DEyc9jWuZ2A',
                fileName: 'hi',
                lastModified: {
                  nanoseconds: 696000000,
                  seconds: 1659023654,
                },
                proRecordId: '02eGIdvBvvC5ptsCHoqs',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GMtWezAv2DEyc9jWuZ2A/28-7-2022.pltr',
              },
            ],
            date: '2022_7_28',
            groups: {
              GMtWezAv2DEyc9jWuZ2A: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1658948400,
                  },
                  fileId: 'GMtWezAv2DEyc9jWuZ2A',
                  fileName: 'hi',
                  lastModified: {
                    nanoseconds: 170000000,
                    seconds: 1659000053,
                  },
                  name: undefined,
                  proRecordId: '80JIzZwyaAOExTrOu63I',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GMtWezAv2DEyc9jWuZ2A/28-7-2022-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1658948400,
                  },
                  fileId: 'GMtWezAv2DEyc9jWuZ2A',
                  fileName: 'hi',
                  lastModified: {
                    nanoseconds: 696000000,
                    seconds: 1659023654,
                  },
                  name: undefined,
                  proRecordId: '02eGIdvBvvC5ptsCHoqs',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/GMtWezAv2DEyc9jWuZ2A/28-7-2022.pltr',
                },
              ],
              iNik0ASY9Zy2TbSZFs3u: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1658948400,
                  },
                  fileId: 'iNik0ASY9Zy2TbSZFs3u',
                  fileName: 'comments',
                  lastModified: {
                    nanoseconds: 591000000,
                    seconds: 1659012041,
                  },
                  name: undefined,
                  proRecordId: 'lX56fkpt3EDUKd5yjnyb',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/iNik0ASY9Zy2TbSZFs3u/28-7-2022-(start-of-session).pltr',
                },
              ],
              w6SjKdoH48YRN1sXYmIG: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1658937600,
                  },
                  fileId: 'w6SjKdoH48YRN1sXYmIG',
                  fileName: 'Pride & Prejudice (1)',
                  lastModified: {
                    nanoseconds: 264000000,
                    seconds: 1659006715,
                  },
                  name: undefined,
                  proRecordId: 'oYwzZuIFwxt1TYsCaIG4',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/w6SjKdoH48YRN1sXYmIG/28-7-2022-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1658937600,
                  },
                  fileId: 'w6SjKdoH48YRN1sXYmIG',
                  fileName: 'Pride & Prejudice (1)',
                  lastModified: {
                    nanoseconds: 939000000,
                    seconds: 1659020893,
                  },
                  name: undefined,
                  proRecordId: 'JQm3homIycge46fTPnwg',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/w6SjKdoH48YRN1sXYmIG/28-7-2022.pltr',
                },
              ],
            },
            longDateStr: 'Jul 28, 2022',
            path: '2022_7_28',
            shortDateStr: '2022 (day: 28), 12:00 AM',
          },
          {
            backups: [
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1635976800,
                },
                fileId: 'kTqfqQEJXUQLkOe6tjsd',
                fileName: 'Zelda',
                lastModified: {
                  nanoseconds: 429000000,
                  seconds: 1636027669,
                },
                proRecordId: '0Dp4sl0sDAOR0ON7l0Vr',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/kTqfqQEJXUQLkOe6tjsd/4-11-2021-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1635976800,
                },
                fileId: 'A9ysYrJ2Lx9fOIYv9ryW',
                fileName: 'Zelda',
                lastModified: {
                  nanoseconds: 786000000,
                  seconds: 1636038405,
                },
                proRecordId: 'XwnPPcnRky4UgZoROhJZ',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/A9ysYrJ2Lx9fOIYv9ryW/4-11-2021-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1635976800,
                },
                fileId: 'rfVK2j2KBFUl8JJQ93vt',
                fileName: 'Zelda',
                lastModified: {
                  nanoseconds: 860000000,
                  seconds: 1636009093,
                },
                proRecordId: 'uS2VYX2UrXkLBgdN4ThA',
                startOfSession: true,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rfVK2j2KBFUl8JJQ93vt/4-11-2021-(start-of-session).pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1635976800,
                },
                fileId: 'rfVK2j2KBFUl8JJQ93vt',
                fileName: 'Zelda',
                lastModified: {
                  nanoseconds: 545000000,
                  seconds: 1636010363,
                },
                proRecordId: '04FZvaQ5XxJrrSO8r5wS',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rfVK2j2KBFUl8JJQ93vt/4-11-2021.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1635976800,
                },
                fileId: 'A9ysYrJ2Lx9fOIYv9ryW',
                fileName: 'Zelda',
                lastModified: {
                  nanoseconds: 479000000,
                  seconds: 1636039814,
                },
                proRecordId: 'Bvre1qBvWitvo1vNG9pm',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/A9ysYrJ2Lx9fOIYv9ryW/4-11-2021.pltr',
              },
              {
                backupTime: {
                  nanoseconds: 0,
                  seconds: 1635976800,
                },
                fileId: 'kTqfqQEJXUQLkOe6tjsd',
                fileName: 'Zelda',
                lastModified: {
                  nanoseconds: 87000000,
                  seconds: 1636038163,
                },
                proRecordId: 'N4hk18UdJNfJVxKVW5qj',
                startOfSession: false,
                storagePath:
                  'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/kTqfqQEJXUQLkOe6tjsd/4-11-2021.pltr',
              },
            ],
            date: '2021_11_4',
            groups: {
              A9ysYrJ2Lx9fOIYv9ryW: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1635976800,
                  },
                  fileId: 'A9ysYrJ2Lx9fOIYv9ryW',
                  fileName: 'Zelda',
                  lastModified: {
                    nanoseconds: 786000000,
                    seconds: 1636038405,
                  },
                  name: undefined,
                  proRecordId: 'XwnPPcnRky4UgZoROhJZ',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/A9ysYrJ2Lx9fOIYv9ryW/4-11-2021-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1635976800,
                  },
                  fileId: 'A9ysYrJ2Lx9fOIYv9ryW',
                  fileName: 'Zelda',
                  lastModified: {
                    nanoseconds: 479000000,
                    seconds: 1636039814,
                  },
                  name: undefined,
                  proRecordId: 'Bvre1qBvWitvo1vNG9pm',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/A9ysYrJ2Lx9fOIYv9ryW/4-11-2021.pltr',
                },
              ],
              kTqfqQEJXUQLkOe6tjsd: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1635976800,
                  },
                  fileId: 'kTqfqQEJXUQLkOe6tjsd',
                  fileName: 'Zelda',
                  lastModified: {
                    nanoseconds: 429000000,
                    seconds: 1636027669,
                  },
                  name: undefined,
                  proRecordId: '0Dp4sl0sDAOR0ON7l0Vr',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/kTqfqQEJXUQLkOe6tjsd/4-11-2021-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1635976800,
                  },
                  fileId: 'kTqfqQEJXUQLkOe6tjsd',
                  fileName: 'Zelda',
                  lastModified: {
                    nanoseconds: 87000000,
                    seconds: 1636038163,
                  },
                  name: undefined,
                  proRecordId: 'N4hk18UdJNfJVxKVW5qj',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/kTqfqQEJXUQLkOe6tjsd/4-11-2021.pltr',
                },
              ],
              rfVK2j2KBFUl8JJQ93vt: [
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1635976800,
                  },
                  fileId: 'rfVK2j2KBFUl8JJQ93vt',
                  fileName: 'Zelda',
                  lastModified: {
                    nanoseconds: 860000000,
                    seconds: 1636009093,
                  },
                  name: undefined,
                  proRecordId: 'uS2VYX2UrXkLBgdN4ThA',
                  startOfSession: true,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rfVK2j2KBFUl8JJQ93vt/4-11-2021-(start-of-session).pltr',
                },
                {
                  backupTime: {
                    nanoseconds: 0,
                    seconds: 1635976800,
                  },
                  fileId: 'rfVK2j2KBFUl8JJQ93vt',
                  fileName: 'Zelda',
                  lastModified: {
                    nanoseconds: 545000000,
                    seconds: 1636010363,
                  },
                  name: undefined,
                  proRecordId: '04FZvaQ5XxJrrSO8r5wS',
                  startOfSession: false,
                  storagePath:
                    'storage://backups/ToWgxrNhLif4O89bZD2jhAQQYJ83/rfVK2j2KBFUl8JJQ93vt/4-11-2021.pltr',
                },
              ],
            },
            longDateStr: 'Nov 4, 2021',
            path: '2021_11_4',
            shortDateStr: '2021 (day: 4), 12:00 AM',
          },
        ])
      })
    })
  })
})
