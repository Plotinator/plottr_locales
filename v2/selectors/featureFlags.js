import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

// WARNING: THIS SHOULD NOT BE MERGED INTO PLTR!!
// IT IS HERE FOR NOW TO MAKE THE MOBILE APP NOT USE STRUCTURE.
export const beatHierarchyIsOn = (state) => false

// WARNING: THIS SHOULD NOT BE MERGED INTO PLTR!!
// IT IS HERE FOR NOW TO MAKE THE MOBILE APP NOT USE STRUCTURE.
export const featureFlags = (state) => {
  BEAT_HIERARCHY: false
}
