import semverGt from 'semver/functions/gt'

import { toSemver } from './toSemver'

export const greaterBySemver = (thisVersion, thatVersion) =>
  // @ts-ignore
  semverGt(toSemver(thisVersion), toSemver(thatVersion))
