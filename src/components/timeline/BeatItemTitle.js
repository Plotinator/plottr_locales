import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { helpers } from 'pltr'

const {
  card: { truncateTitle },
  beats: { beatTitle },
} = helpers

const BeatItemTitle = ({ beatIndex, beatTree, beat, hierarchyLevels, positionOffset }) =>
  truncateTitle(beatTitle(beatIndex, beatTree, beat, hierarchyLevels, positionOffset), 40)

BeatItemTitle.propTypes = {
  positionOffset: PropTypes.number.isRequired,
  beatIndex: PropTypes.number.isRequired,
  beatTree: PropTypes.object.isRequired,
  beat: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  positionOffset: selectors.positionOffsetSelector(state),
  beatIndex: selectors.beatIndexSelector(
    state,
    // @ts-ignore
    ownProps.beat.id
  ),
  beatTree: selectors.beatsByBookSelector(state),
  hierarchyLevels: selectors.sortedHierarchyLevels(state),
})

export default connect(mapStateToProps)(BeatItemTitle)
