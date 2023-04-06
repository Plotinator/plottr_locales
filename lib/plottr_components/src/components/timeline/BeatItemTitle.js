import PropTypes from 'prop-types'

import { helpers } from 'pltr/v2'

import { checkDependencies } from '../checkDependencies'

const {
  card: { truncateTitle },
  beats: { beatTitle },
} = helpers

const BeatItemTitleConnector = (connector) => {
  const BeatItemTitle = ({
    beatIndex,
    beatTree,
    beat,
    hierarchyLevels,
    positionOffset,
    isSeries,
  }) => truncateTitle(beatTitle(beatIndex, beatTree, beat, hierarchyLevels, positionOffset), 40)

  BeatItemTitle.propTypes = {
    isSeries: PropTypes.bool.isRequired,
    positionOffset: PropTypes.number.isRequired,
    beatIndex: PropTypes.number.isRequired,
    beatTree: PropTypes.object.isRequired,
    beat: PropTypes.object.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect((state, ownProps) => ({
      isSeries: selectors.isSeriesSelector(state),
      positionOffset: selectors.positionOffsetSelector(state),
      beatIndex: selectors.beatIndexSelector(state, ownProps.beat.id),
      beatTree: selectors.beatsByBookSelector(state),
      hierarchyLevels: selectors.sortedHierarchyLevels(state),
    }))(BeatItemTitle)
  }

  throw new Error('Could not connect BeatItemTitle')
}

export default BeatItemTitleConnector
