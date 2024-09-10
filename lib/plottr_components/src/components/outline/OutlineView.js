import React, { useState, useEffect, useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { useReactToPrint } from 'react-to-print'

import { t as i18n } from 'plottr_locales'
import { helpers } from 'pltr'
import { selectors, actions } from 'wired-up-pltr'

import Grid from '../Grid'
import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import BeatView from './BeatView'
import MiniMap from './MiniMap'
import ErrorBoundary from '../containers/ErrorBoundary'
import ExportNavItem from '../export/ExportNavItem'
import SubNav from '../containers/SubNav'
import Floater from '../PlottrFloater'
import { withEventTargetValue } from '../withEventTargetValue'
import Scrollable from '../../utils/scrollable'
import { delay } from '../../utils/delay'
import { PlottrComponentsContext } from '../../connections/pltrContext'
import OutlinePageLayoutConfig from './OutlinePageLayoutConfig'
import CardDialog from '../timeline/CardDialog'
import ViewSwitcher from './ViewSwitcher'
import CardHoverDetails from './card/CardHoverDetails'
import FulltextZoom from './FulltextZoom'

const pageStyle = `
  @media print {
    .outline__grid__beats {
      width: 100% !important;
      padding: 0px;
      border: none;
      margin: 1rem;
    }

    .outline__fulltext__title-container,
    .outline__fulltext__config-container {
      display: none !important;
    }

    .outline-list__card-view {
      padding: 0px !important;
      border: none !important;
      width: 100% !important;

      &.isFirstCard {
        margin: 16px;
        &.showFulltextBeatTitle,
        &.inFirstBeat {
          padding: 0px !important;
          border: none !important;
        }
      }

      &.isLastCard {
        &.showFulltextBeatTitle,
        &.inLastBeat {
          padding: 0px !important;
          border: none !important;
        }
      }
    }

    .showBeatGaps {
      &.previousBeatHasCard {
        margin-top: 30px;
      }
  
      .outline__card-wrapper {
        .outline-list__card-view {
          padding: 0px 100px;
          &.isFirstCard {
            padding: 0px !important;
            border: none !important;
          }
    
          &.isLastCard {
            padding: 0px;
            border-top: none;
          }
        }
      }
    }
  }
`

const {
  card: { cardMapping },
} = helpers

const targetPosition = 115

const OutlineView = ({
  outlineFilter,
  actions,
  lines,
  beats,
  allCards,
  selectedCardId,
  card2Dmap,
  outlineSearchTerm,
  outlineScrollPosition,
  recentlyUndidOrRedid,
  outlineView,
  showPageLayoutConfig,
  isCardDialogVisible,
  cardDialog,
  isFulltextHoverDetailsVisible,
  fulltextZoom,
  scaledHeight,
}) => {
  const {
    platform: { exportDisabled },
  } = useContext(PlottrComponentsContext)

  const [active, setActive] = useState(0)
  const [beatsToRender, setBeatsToRender] = useState(beats.length)
  const [filterVisible, setFilterVisible] = useState(false)

  const beatsRef = useRef(null)
  const scrollableRef = useRef(new Scrollable(() => beatsRef.current))
  const scrollTimeoutRef = useRef(null)

  const recentlyUndidOrRedidRef = useRef(false)

  const handlePrint = useReactToPrint({
    content: () => beatsRef.current,
    pageStyle,
  })

  useEffect(() => {
    recentlyUndidOrRedidRef.current = !!recentlyUndidOrRedid
  }, [recentlyUndidOrRedid])

  useEffect(() => {
    if (beatsToRender >= beats.length) return
    delay(() => {
      setBeatsToRender(beatsToRender + 1)
    })
  }, [beats, beatsToRender, setBeatsToRender])

  useEffect(() => {
    if (selectedCardId) {
      setTimeout(() => {
        const elem = document.querySelector(`#card-${selectedCardId}`)
        if (elem) {
          elem.scrollIntoView()
          const container = document.querySelector('.outline__container')
          const yPosition = elem.getBoundingClientRect().y
          if (container) {
            const finalDestination = yPosition - targetPosition
            container.scrollBy(0, finalDestination)
          }
        }
      }, 100)
    }
  }, [selectedCardId])

  useEffect(() => {
    if (!selectedCardId && outlineScrollPosition && scrollableRef.current) {
      setTimeout(() => {
        scrollableRef.current.scrollTo(0, outlineScrollPosition, true)
      }, 100)
    }
  }, [])

  const handleScroll = (_e) => {
    // @ts-ignore
    if (typeof beatsRef?.current?.scrollTop === 'number' && !recentlyUndidOrRedidRef.current) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      // @ts-ignore
      scrollTimeoutRef.current = setTimeout(() => {
        // @ts-ignore
        if (typeof beatsRef?.current?.scrollTop === 'number' && !recentlyUndidOrRedidRef.current) {
          // @ts-ignore
          actions.recordOutlineScrollPosition(beatsRef.current.scrollTop)
        }
      }, 500)
    }
  }

  const filterItem = (id) => {
    actions.setOutlineFilter(id)
  }

  const removeFilter = () => {
    actions.setOutlineFilter(null)
  }

  // ///////////////
  //  rendering   //
  // //////////////

  const renderFilterItem = (item) => {
    let placeholder = <span className="filter-list__placeholder"></span>
    if (
      (Array.isArray(outlineFilter) && outlineFilter.includes(item.id)) ||
      (!Array.isArray(outlineFilter) && outlineFilter === item.id)
    ) {
      placeholder = <Glyphicon glyph="eye-open" />
    }
    return (
      <li key={item.id} onMouseDown={() => filterItem(item.id)}>
        {placeholder} {item.title}
      </li>
    )
  }

  const renderFilterList = () => {
    const items = lines.map((i) => {
      return renderFilterItem(i)
    })
    return <ul className="filter-list__list">{items}</ul>
  }

  const insertSpace = (event) => {
    const currentValue = event.target.value
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    if (event.key === ' ') {
      actions.setOutlineSearchTerm(currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1))
    }
    event.preventDefault()
    event.stopPropagation()
  }

  const handleShowPageLayoutConfig = (evt) => {
    evt.preventDefault()
    if (!showPageLayoutConfig) {
      actions.showFulltextLayoutConfig()
    }
  }

  const renderSubNav = () => {
    const popover = () => (
      <Popover id="filter" noMaxWidth>
        {/* @ts-ignore */}
        <div className="filter-list">{renderFilterList()}</div>
      </Popover>
    )
    let filterDeclaration = (
      <Alert onClick={removeFilter} bsStyle="warning">
        <Glyphicon glyph="remove-sign" />
        {'  '}
        {i18n('Outline is filtered')}
      </Alert>
    )
    if (!outlineFilter) {
      filterDeclaration = <span></span>
    }
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <NavItem>
            <Floater
              rootClose
              onClose={() => {
                setFilterVisible(false)
              }}
              open={filterVisible}
              placement="bottom"
              component={popover}
            >
              <Button
                bsSize="small"
                onClick={() => {
                  setFilterVisible(!filterVisible)
                }}
              >
                <Glyphicon glyph="filter" />
                {i18n('Filter by Plotline')}
              </Button>
            </Floater>
            {filterDeclaration}
          </NavItem>
          <NavItem draggable="false">
            <FormControl
              onChange={withEventTargetValue(actions.setOutlineSearchTerm)}
              onKeyUp={insertSpace}
              value={outlineSearchTerm || ''}
              type="text"
              placeholder="Search"
              className="toolbar__search"
            />
          </NavItem>
        </Nav>
        <Nav>
          <NavItem>
            <button
              style={{ border: 'none' }}
              className="btn btn-sm"
              onClick={() => actions.setOutlineView('legacy')}
            >
              {i18n('Legacy')}
            </button>
          </NavItem>
        </Nav>
        <Nav className="view-switcher__nav">
          <NavItem className="view-switcher__nav-item">
            <ViewSwitcher />
          </NavItem>
        </Nav>
        {!exportDisabled && (
          <Nav pullRight>
            <NavItem
              draggable="false"
              style={{
                visibility:
                  showPageLayoutConfig || outlineView !== 'fulltext' ? 'hidden' : 'visible',
              }}
            >
              <Button
                title={i18n('Show page layout configuration')}
                onClick={handleShowPageLayoutConfig}
                bsSize="small"
              >
                {i18n('Page Layout')}
              </Button>
            </NavItem>
            <NavItem
              draggable="false"
              style={{
                visibility: outlineView !== 'fulltext' ? 'hidden' : 'visible',
              }}
            >
              <Button bsSize="small" title={i18n('Print')} onClick={handlePrint}>
                <Glyphicon glyph="print" />
              </Button>
            </NavItem>
            <ExportNavItem />
          </Nav>
        )}
      </SubNav>
    )
  }

  const renderBeats = (cardMapping) => {
    const beatsWithCards = allCards.map((card) => card.beatId)
    const beatsToMap = beats.length ? beats.slice(0, beatsToRender) : []
    const firstBeatWithCard = beatsToMap.findIndex((b) => beatsWithCards.includes(b.id))
    const lastBeatWithCard = beatsToMap.findLastIndex((b) => beatsWithCards.includes(b.id))

    return beatsToMap.map((beat, idx) => {
      let hasCards = beatsWithCards.includes(beat.id)
      let previousBeatHasCard = beatsWithCards.includes(beatsToMap[idx - 1]?.id)
      const beatCards = hasCards ? cardMapping[beat.id] : []

      return (
        <ErrorBoundary key={beat.id}>
          <BeatView
            isLastBeat={lastBeatWithCard === idx}
            isFirstBeat={firstBeatWithCard === idx}
            beat={beat}
            cards={beatCards}
            previousBeatHasCard={previousBeatHasCard}
            activeFilter={!!outlineFilter}
          />
        </ErrorBoundary>
      )
    })
  }

  const closeDialog = () => {
    actions.setCardDialogClose()
  }

  const renderCardDialog = () => {
    const { cardId, beatId, lineId } = cardDialog
    if (isCardDialogVisible) {
      return (
        <CardDialog cardId={cardId} beatId={beatId} lineId={lineId} closeDialog={closeDialog} />
      )
    }
    return null
  }

  const renderBody = () => {
    const hideMinimap = outlineView === 'plan' || outlineView === 'fulltext'
    const cardMap = cardMapping(beats, lines, card2Dmap, outlineFilter)
    return (
      <div
        className={cx('outline__container tab-body', {
          plan: outlineView === 'plan',
          fulltext: outlineView === 'fulltext',
        })}
      >
        <Grid fluid className="outline__grid">
          <Row
            className={cx('', {
              plan: outlineView === 'plan',
              fulltext: outlineView === 'fulltext',
            })}
          >
            {!hideMinimap ? (
              <div className="outline__grid__minimap col-md-3 col-sm-4 hidden-xs">
                <ErrorBoundary>
                  {!!lines.length && (
                    <MiniMap
                      active={active}
                      handleActive={setActive}
                      cardMapping={cardMap}
                      activeFilter={!!outlineFilter}
                    />
                  )}
                </ErrorBoundary>
              </div>
            ) : (
              <div></div>
            )}
            <div
              className={cx('outline__grid__beats', 'col-xs-12', 'col-sm-8', 'col-md-9', {
                plan: outlineView === 'plan',
                fulltext: outlineView === 'fulltext',
              })}
              ref={beatsRef}
              onScroll={handleScroll}
              style={
                outlineView === 'fulltext'
                  ? {
                      transform: `scale(${fulltextZoom})`,
                      height: scaledHeight,
                    }
                  : {}
              }
            >
              {!!beats.length && renderBeats(cardMap)}
            </div>
            {outlineView === 'fulltext' ? (
              <>
                {showPageLayoutConfig ? <OutlinePageLayoutConfig /> : null}
                {isFulltextHoverDetailsVisible ? <CardHoverDetails /> : null}
                <FulltextZoom />
              </>
            ) : null}
          </Row>
        </Grid>
      </div>
    )
  }

  return (
    <div className="container-with-sub-nav">
      {renderSubNav()}
      {renderBody()}
      {renderCardDialog()}
    </div>
  )
}

OutlineView.propTypes = {
  recentlyUndidOrRedid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  beats: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  card2Dmap: PropTypes.object.isRequired,
  allCards: PropTypes.array,
  outlineFilter: PropTypes.array,
  isSeries: PropTypes.bool,
  selectedCardId: PropTypes.number,
  actions: PropTypes.object.isRequired,
  outlineSearchTerm: PropTypes.string,
  outlineScrollPosition: PropTypes.number,
  outlineView: PropTypes.string,
  showFulltextCardTitle: PropTypes.bool,
  showPageLayoutConfig: PropTypes.bool,
  isCardDialogVisible: PropTypes.bool,
  cardDialog: PropTypes.object,
  fulltextZoom: PropTypes.number,
  isFulltextHoverDetailsVisible: PropTypes.bool,
  scaledHeight: PropTypes.string,
}

const mapStateToProps = (state) => {
  return {
    recentlyUndidOrRedid: selectors.recentlyUndidOrRedidSelector(state),
    beats: selectors.visibleSortedBeatsByBookIgnoringCollapsedSelector(state),
    lines: selectors.sortedLinesByBookSelector(state),
    beatMapping: selectors.sparceBeatMap(state),
    card2Dmap: selectors.outlineSearchedCardMapSelector(state),
    outlineFilter: selectors.outlineFilterSelector(state),
    allCards: selectors.allCardsSelector(state),
    isSeries: selectors.isSeriesSelector(state),
    outlineSearchTerm: selectors.outlineSearchTermSelector(state),
    outlineScrollPosition: selectors.outlineScrollPositionSelector(state),
    selectedCardId: selectors.selectedOutlineCardSelector(state),
    showFulltextCardTitle: selectors.showOutlineFulltextCardTitleSelector(state),
    showPageLayoutConfig: selectors.showFulltextPageLayoutConfigSelector(state),
    isCardDialogVisible: selectors.isCardDialogVisibleSelector(state),
    outlineView: selectors.outlineViewSelector(state),
    cardDialog: selectors.cardDialogSelector(state),
    isFulltextHoverDetailsVisible: selectors.isFulltextHoverDetailsVisibleSelector(state),
    fulltextZoom: selectors.outlineFulltextZoomSelector(state),
    scaledHeight: selectors.outlineFulltextScaledHeightSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.ui, dispatch),
  }
})(OutlineView)
