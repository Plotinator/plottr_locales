import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { flatten } from 'lodash'

import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr'

import Grid from '../Grid'
import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Col from '../Col'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedPlaceCategoriesModal from './PlaceCategoriesModal'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedSortList from '../SortList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedPlaceView from './PlaceView'
import UnconnectedPlaceItem from './PlaceItem'
import UnconnectedFloater from '../PlottrFloater'
import UnconnectedExportNavItem from '../export/ExportNavItem'

import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const { nextId } = newIds

const detailID = (placeCategories, placeDetailId) => {
  const places = flatten(Object.values(placeCategories))
  if (places.length == 0) return null

  let id = places[0].id

  // check for the currently active one
  if (placeDetailId != null) {
    let activePlace = places.find((pl) => pl.id === placeDetailId)
    if (activePlace) id = activePlace.id
  }

  return id
}

const PlaceListViewConnector = (connector) => {
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const PlaceCategoriesModal = UnconnectedPlaceCategoriesModal(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const SortList = UnconnectedSortList(connector)
  const SubNav = UnconnectedSubNav(connector)
  const PlaceView = UnconnectedPlaceView(connector)
  const PlaceItem = UnconnectedPlaceItem(connector)
  const Floater = UnconnectedFloater(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)

  const {
    platform: { exportDisabled },
  } = connector

  checkDependencies({ exportDisabled })

  const PlaceListView = ({
    visiblePlacesByCategory,
    categories,
    filterIsEmpty,
    customAttributes,
    customAttributesThatCanChange,
    restrictedValues,
    darkMode,
    actions,
    placeSearchTerm,
    selectedPlaceId,
    customAttributeActions,
    uiActions,
    undo,
    places,
    placeSort,
    filterVisible,
    sortVisible,
    editingSelected,
    categoriesOpen,
    attributeDialogOpen,
    isJumping,
    recentlyUndidOrRedid,
  }) => {
    const [isMovingToNewCategory, setMovingToNewCategory] = useState(false)
    const [draggedPlace, setDraggedPlace] = useState()

    const recentlyUndidOrRedidRef = useRef(false)
    useEffect(() => {
      recentlyUndidOrRedidRef.current = !!recentlyUndidOrRedid
    }, [recentlyUndidOrRedid])

    useEffect(() => {
      const placeToSelect = detailID(visiblePlacesByCategory, selectedPlaceId)
      if (!recentlyUndidOrRedid.current && !isJumping && placeToSelect !== selectedPlaceId) {
        uiActions.selectPlace(placeToSelect)
      }
    }, [visiblePlacesByCategory])

    const editSelected = () => {
      uiActions.startEditingSelectedPlace()
    }

    const stopEditing = () => {
      uiActions.finishEditingSelectedPlace()
    }

    const closeDialog = () => {
      undo.batch('Close Place Attributes', () => {
        uiActions.hidePlaceAttributeDialog()
        uiActions.hidePlaceCategoryModal()
      })
    }

    const handleCreateNewPlace = () => {
      const id = nextId(places)
      undo.batch('Create New Place', () => {
        actions.addPlace()
        uiActions.selectPlace(id)
        uiActions.startEditingSelectedPlace()
      })
    }

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        uiActions.setPlacesSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const handleDragStart = (e, place) => {
      setDraggedPlace(place)
    }

    const handleDragOver = (e, placeCategory) => {
      e.preventDefault()
      if (placeCategory != draggedPlace.categoryId) {
        setMovingToNewCategory(true)
      } else {
        setMovingToNewCategory(false)
      }
    }

    const handleDrop = () => {
      setDraggedPlace()
    }

    const renderSubNav = () => {
      const filterPopover = () => (
        <Popover id="filter" noMaxWidth>
          <CustomAttrFilterList type="places" />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={() => uiActions.setPlaceFilter(null)} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Place list is filtered')}
        </Alert>
      )
      if (filterIsEmpty) {
        filterDeclaration = <span></span>
      }
      const sortPopover = () => (
        <Popover id="sort">
          <SortList type={'places'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (placeSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <Button bsSize="small" onClick={handleCreateNewPlace}>
                <Glyphicon glyph="plus" /> {i18n('New')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={uiActions.showPlaceAttributeDialog}>
                <Glyphicon glyph="list" /> {i18n('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={uiActions.showPlaceCategoryModal}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
              </Button>
            </NavItem>
            <NavItem>
              <Floater
                trigger="click"
                rootClose
                open={filterVisible}
                onClose={uiActions.hidePlaceFilterList}
                placement="bottom"
                component={filterPopover}
              >
                <Button
                  bsSize="small"
                  onClick={() => {
                    if (!filterVisible) {
                      uiActions.showPlaceFilterList()
                    } else {
                      uiActions.hidePlaceFilterList()
                    }
                  }}
                >
                  <Glyphicon glyph="filter" /> {i18n('Filter')}
                </Button>
              </Floater>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <Floater
                trigger="click"
                rootClose
                open={sortVisible}
                onClose={uiActions.hidePlaceSort}
                placement="bottom"
                component={sortPopover}
              >
                <Button
                  bsSize="small"
                  onClick={() => {
                    if (!sortVisible) {
                      uiActions.showPlaceSort()
                    } else {
                      uiActions.hidePlaceSort()
                    }
                  }}
                >
                  <Glyphicon glyph={sortGlyph} /> {i18n('Sort')}
                </Button>
              </Floater>
            </NavItem>
            <NavItem draggable="false">
              <FormControl
                onChange={withEventTargetValue(uiActions.setPlacesSearchTerm)}
                onKeyUp={insertSpace}
                value={placeSearchTerm || ''}
                type="text"
                placeholder="Search"
                className="toolbar__search"
              />
            </NavItem>
          </Nav>
          {!exportDisabled && (
            <Nav pullRight>
              <ExportNavItem />
            </Nav>
          )}
        </SubNav>
      )
    }

    const renderVisiblePlacesByCategory = (categoryId, startingIndex) => {
      const places =
        categoryId === null
          ? [
              ...(visiblePlacesByCategory[null] || []),
              ...(visiblePlacesByCategory[undefined] || []),
            ]
          : visiblePlacesByCategory[categoryId]

      if (!places) return []

      return places.map((pl, idx) => {
        return (
          <div
            key={pl.id}
            onDragStart={(e) => handleDragStart(e, { ...pl, position: startingIndex + idx })}
            onDragOver={(e) => handleDragOver(e, pl.categoryId)}
            onDrop={handleDrop}
          >
            <PlaceItem
              key={pl.id}
              place={pl}
              selected={pl.id == selectedPlaceId}
              startEdit={editSelected}
              stopEdit={stopEditing}
              select={() => uiActions.selectPlace(pl.id)}
              editing={editingSelected}
              isMovingToNewCategory={isMovingToNewCategory}
              draggedPosition={
                Number.isInteger(draggedPlace?.position) ? Number(draggedPlace.position) : null
              }
              absolutePosition={startingIndex + idx}
            />
          </div>
        )
      })
    }

    const renderCategory = (category, startingIndex) => {
      const placesInCategory = renderVisiblePlacesByCategory(category.id, startingIndex)
      if (!placesInCategory.length) return null
      return (
        <div key={`category-${category.id}`}>
          <h2 className="place-list__category-title">{category.name}</h2>
          <div className={cx('place-list__list', 'list-group', { darkmode: darkMode })}>
            {placesInCategory}
          </div>
        </div>
      )
    }

    const renderPlaces = () => {
      let startingIndex = 0
      return [...categories, { id: null, name: i18n('Uncategorized') }].map((cat) => {
        const result = renderCategory(cat, startingIndex)
        startingIndex += (visiblePlacesByCategory[cat.id] || []).length
        return result
      })
    }

    const renderPlaceDetails = () => {
      let place = places.find((pl) => pl.id === selectedPlaceId)
      if (place) {
        return (
          <ErrorBoundary>
            <PlaceView
              key={`place-${place.id}`}
              place={place}
              editing={editingSelected}
              stopEditing={stopEditing}
              startEditing={editSelected}
            />
          </ErrorBoundary>
        )
      } else {
        return null
      }
    }

    const renderCustomAttributes = () => {
      if (!attributeDialogOpen) {
        return null
      }
      return <CustomAttributeModal hideSaveAsTemplate type="places" closeDialog={closeDialog} />
    }

    const renderCategoriesModal = () => {
      if (!categoriesOpen) return null

      return <PlaceCategoriesModal closeDialog={closeDialog} />
    }

    let klasses = 'secondary-text'
    if (darkMode) klasses += ' darkmode'
    return (
      <div className="place-list container-with-sub-nav">
        {renderSubNav()}
        {renderCustomAttributes()}
        {renderCategoriesModal()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3} onDoubleClick={stopEditing}>
              <h1 className={klasses}>
                {i18n('Places')}{' '}
                <Button onClick={handleCreateNewPlace}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              <div className="place-list__category-list">{renderPlaces()}</div>
            </Col>
            <Col sm={9}>{renderPlaceDetails()}</Col>
          </Row>
        </Grid>
      </div>
    )
  }

  PlaceListView.propTypes = {
    visiblePlacesByCategory: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array,
    restrictedValues: PropTypes.array,
    darkMode: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributeActions: PropTypes.object.isRequired,
    placeSearchTerm: PropTypes.string,
    selectedPlaceId: PropTypes.number,
    uiActions: PropTypes.object.isRequired,
    undo: PropTypes.object.isRequired,
    places: PropTypes.array,
    placeSort: PropTypes.string.isRequired,
    filterVisible: PropTypes.bool,
    sortVisible: PropTypes.bool,
    editingSelected: PropTypes.bool,
    categoriesOpen: PropTypes.bool,
    attributeDialogOpen: PropTypes.bool,
    isJumping: PropTypes.bool,
    recentlyUndidOrRedid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  const CustomAttributeActions = actions.customAttribute
  const PlaceActions = actions.place
  const UIActions = actions.ui
  const UndoActions = actions.undo

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          places: selectors.allPlacesSelector(state),
          visiblePlacesByCategory: selectors.visibleSortedSearchedPlacesByCategorySelector(state),
          categories: selectors.sortedPlaceCategoriesSelector(state),
          filterIsEmpty: selectors.placeFilterIsEmptySelector(state),
          customAttributes: selectors.placeCustomAttributesSelector(state),
          customAttributesThatCanChange:
            selectors.placeCustomAttributesThatCanChangeSelector(state),
          restrictedValues: selectors.placeCustomAttributesRestrictedValues(state),
          darkMode: selectors.isDarkModeSelector(state),
          placeSort: selectors.placeSortSelector(state),
          placeSearchTerm: selectors.placesSearchTermSelector(state),
          selectedPlaceId: selectors.selectedPlaceSelector(state),
          filterVisible: selectors.placesFilterIsVisibleSelector(state),
          sortVisible: selectors.placesSortIsVisibleSelector(state),
          editingSelected: selectors.editingSelectedPlaceSelector(state),
          categoriesOpen: selectors.placesCategoriesOpenSelector(state),
          attributeDialogOpen: selectors.placeAttributeDialogIsOpenSelector(state),
          isPlacesManuallySorted: selectors.isPlacesManuallySortedSelector(state),
          isJumping: selectors.isJumpingSelector(state),
          recentlyUndidOrRedid: selectors.recentlyUndidOrRedidSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(PlaceActions, dispatch),
          customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch),
          uiActions: bindActionCreators(UIActions, dispatch),
          undo: bindActionCreators(UndoActions, dispatch),
        }
      }
    )(PlaceListView)
  }

  throw new Error('Could not connect PlaceListView')
}

export default PlaceListViewConnector
