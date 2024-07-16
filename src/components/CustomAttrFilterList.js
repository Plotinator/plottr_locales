import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { identity, orderBy, isEqual, uniq } from 'lodash'

import { t as i18n } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import Glyphicon from './Glyphicon'
import TagFilterList from './filterLists/TagFilterList'
import BookFilterList from './filterLists/BookFilterList'
import CharacterCategoryFilterList from './filterLists/CharacterCategoryFilterList'
import PlacesFilterList from './filterLists/PlacesFilterList'
import CharactersFilterList from './filterLists/CharactersFilterList'
import NoteCategoryFilterList from './filterLists/NoteCategoryFilterList'
import CardColorFilterList from './filterLists/CardColorFilterList'

const CustomAttrFilterList = ({
  customAttributes,
  customAttributeValues,
  items,
  filteredItems,
  update,
  showCategory,
  showNoteCategory,
  showCharacters,
  showPlaces,
  showBook,
  showColor,
}) => {
  useEffect(() => {
    const withCAs = customAttributes.reduce((result, attr) => {
      if (attr.type == 'text') {
        return {
          ...result,
          [attr.id || attr.name]: filteredItems?.[attr.id || attr.name] || [],
        }
      } else {
        return result
      }
    }, filteredItems)
    if (!isEqual(withCAs, filteredItems)) {
      update(withCAs)
    }
  }, [customAttributes, filteredItems])

  const updateFilter = (type, ids) => {
    const newFilteredItems = { ...filteredItems, [type]: ids }

    update(newFilteredItems)
  }

  const filterItem = (value, attr, id) => {
    const key = id || attr
    if (!filteredItems?.[key]) {
      return
    } else if (!filteredItems?.[key].includes(value)) {
      const newFilteredItems = {
        ...filteredItems,
        [key]: [...(filteredItems?.[key] ?? []), value],
      }
      update(newFilteredItems)
    } else {
      const index = filteredItems?.[key].indexOf(value)
      if (index !== -1) {
        update({
          ...filteredItems,
          [key]: filteredItems?.[key].filter((existingValue) => {
            return existingValue !== value
          }),
        })
      }
    }
  }

  const filterList = (attr, id) => {
    const key = id || attr
    if (!filteredItems?.[key]) {
      return
    } else if (filteredItems?.[key].length > 0) {
      update({ ...filteredItems, [key]: [] })
    } else {
      update({ ...filteredItems, [key]: values(key, id) })
    }
  }

  const isChecked = (value, attrKey) => {
    if (!filteredItems?.[attrKey]) return false
    if (!filteredItems?.[attrKey].length) return false
    return filteredItems?.[attrKey].indexOf(value) !== -1
  }

  const values = (attrName, id) => {
    if (id) {
      return customAttributeValues[id] || []
    }
    // TODO: this should be a selector
    let values = items.map((item) => item[attrName])
    return uniq(values.filter((v) => v && v != ''))
  }

  const renderFilterList = (array, attr) => {
    const items = orderBy(array, ['name', 'title', identity])
      .filter((i) => {
        return !Array.isArray(i)
      })
      .map((i) => renderFilterItem(i, attr))
    return (
      <ul key={`${attr.name}-${items}`} className="filter-list__list">
        {items}
        {renderBlank(attr)}
      </ul>
    )
  }

  const renderFilterItem = (value, attr) => {
    const checked = isChecked(value, attr.id || attr.name) ? 'eye-open' : 'unchecked'
    return (
      <li key={`${value}-${attr.name}`} onMouseDown={() => filterItem(value, attr.name, attr.id)}>
        <Glyphicon glyph={checked} /> {value.substr(0, 18)}
      </li>
    )
  }

  const renderBlank = (attr) => {
    const checked = isChecked('', attr.id || attr.name) ? 'eye-open' : 'unchecked'
    return (
      <li onMouseDown={() => filterItem('', attr.name, attr.id)}>
        <Glyphicon glyph={checked} /> <em className="secondary-text">[{i18n('blank')}]</em>
      </li>
    )
  }

  const renderList = (attr) => {
    const { name, type } = attr
    if (type != 'text') return null

    return (
      <div key={name}>
        <p onClick={() => filterList(attr.name, attr.id)}>
          <em>{name}</em>
        </p>
        {renderFilterList(values(attr.name, attr.id), attr)}
      </div>
    )
  }

  const CAlists = (customAttributes || []).map(renderList)
  const orEmpty = (value) => (value ? value : [])

  const cardColors = items.map((item) => (!item.color ? null : item.color))
  const cardColorsSet = new Set(cardColors)
  const cardColorsToFilterBy = Array.from(cardColorsSet.keys())

  return (
    <div className="filter-list flex">
      {showBook && (
        <BookFilterList
          updateItems={updateFilter}
          filteredItems={[...orEmpty(filteredItems?.book)]}
        />
      )}
      {showCharacters ? (
        <CharactersFilterList
          updateItems={updateFilter}
          filteredItems={[...orEmpty(filteredItems?.character)]}
        />
      ) : null}
      {showPlaces ? (
        <PlacesFilterList
          updateItems={updateFilter}
          filteredItems={[...orEmpty(filteredItems?.place)]}
        />
      ) : null}
      {showCategory ? (
        <CharacterCategoryFilterList
          updateItems={updateFilter}
          filteredItems={[...orEmpty(filteredItems?.category)]}
        />
      ) : null}
      {showNoteCategory ? (
        <NoteCategoryFilterList
          updateItems={updateFilter}
          filteredItems={[...orEmpty(filteredItems?.noteCategory)]}
        />
      ) : null}
      <TagFilterList updateItems={updateFilter} filteredItems={[...orEmpty(filteredItems?.tag)]} />
      {showColor && (
        <CardColorFilterList
          updateItems={updateFilter}
          colors={cardColorsToFilterBy}
          filteredItems={[...orEmpty(filteredItems?.color)]}
        />
      )}
      {CAlists}
    </div>
  )
}

CustomAttrFilterList.propTypes = {
  customAttributes: PropTypes.array.isRequired,
  customAttributeValues: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  filteredItems: PropTypes.object,
  type: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  showCategory: PropTypes.bool.isRequired,
  showNoteCategory: PropTypes.bool.isRequired,
  showCharacters: PropTypes.bool.isRequired,
  showPlaces: PropTypes.bool.isRequired,
  showBook: PropTypes.bool.isRequired,
  showColor: PropTypes.bool,
}

const chooseAttributeValuesPerType = (state, type) => {
  switch (type) {
    case 'characters': {
      return selectors.characterAttributeValuesForCurrentBookSelector(state)
    }
    default: {
      return {}
    }
  }
}

const mapStateToProps = (state, { type }) => {
  return {
    customAttributes: selectors.customAttributesFilter(state),
    customAttributeValues: chooseAttributeValuesPerType(state, type),
    // @ts-ignore
    items: selectors.filterItemsSelector(state, type),
    filteredItems: selectors.filteredItemsSelector(state),
    showCharacters: type === 'cards' || type === 'notes',
    showPlaces: type === 'cards' || type === 'notes',
    showCategory: type === 'characters',
    showNoteCategory: type === 'notes',
    showBook: type === 'notes' || type === 'characters' || type === 'places',
  }
}

const chooseUpdateFilter = (dispatch, type) => {
  const uiActions = bindActionCreators(actions.ui, dispatch)
  switch (type) {
    case 'characters':
      return uiActions.setCharacterFilter
    case 'places':
      return uiActions.setPlaceFilter
    case 'cards':
      return uiActions.setTimelineFilter
    case 'outline':
      return uiActions.setOutlineFilter
    case 'notes':
      return uiActions.setNoteFilter
    default:
      return (newFilter) => {
        console.error(
          `Trying to update filter to ${newFilter} for unsuported type: ${type}`,
          new Error('Unsupported filter type')
        )
      }
  }
}

const mapDispatchToProps = (dispatch, { type }) => {
  return {
    update: chooseUpdateFilter(dispatch, type),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomAttrFilterList)
