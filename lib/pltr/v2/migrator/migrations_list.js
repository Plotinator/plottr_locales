import { greaterBySemver } from './greaterBySemver'

// NOTE: to indicate that a migration has breaking changes, use a *
// e.g. '*m2022_9_21'

const list = [
  'm0_6',
  'm0_7',
  'm0_8',
  'm0_9',
  'm1_0',
  'm1_2',
  'm1_3',
  'm2020_3_4',
  'm2020_3_9',
  'm2020_3_16',
  'm2020_3_26',
  'm2020_4_3',
  'm2020_5_5',
  'm2020_6_12',
  'm2020_7_7',
  'm2020_8_28',
  'm2020_11_16',
  'm2021_1_15',
  'm2021_2_4',
  'm2021_2_8',
  'm2021_4_13',
  'm2021_6_9',
  'm2021_8_1',
  'm2022_5_17',
  'm2022_5_17_1',
  '*m2022_1_5',
]

export default list.sort((thisVersion, thatVersion) =>
  greaterBySemver(thisVersion, thatVersion) ? 1 : -1
)
