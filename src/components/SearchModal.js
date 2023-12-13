import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { last } from 'lodash'
import { FaExchangeAlt, FaPlus, FaMinus } from 'react-icons/fa'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { slate } from 'pltr/v2'

import Collapse from './Collapse'
import Button from './Button'
import Tabs from './Tabs'
import Tab from './Tab'
import UnconnectedPlottrModal from './PlottrModal'
import { checkDependencies } from './checkDependencies'
import { withEventTargetValue } from './withEventTargetValue'

const modalStyles = {
  overlay: {
    paddingTop: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    borderRadius: 4,
    padding: 0,
    minHeight: 'min-content',
    maxHeight: 'calc(80vh - 200px)',
    overflow: 'hidden',
    width: '700px',
  },
}

const serializePlain = slate.plain.serialize

const attributeToText = (x) => {
  if (Array.isArray(x)) {
    return serializePlain(x)
  }
  return x
}

const seriesAttributeToTitle = (seriesAttribute, series) => {
  switch (seriesAttribute) {
    case 'name': {
      return [t('Series name'), series.name]
    }
    case 'genre': {
      return [t('Series genre'), series.genre]
    }
    case 'premise': {
      return [t('Series premise'), series.premise]
    }
    case 'theme': {
      return [t('Series theme'), series.theme]
    }
    default: {
      return [t(seriesAttribute), '']
    }
  }
}

const computeBookHitTitle = (where, bookId, books) => {
  const book = books.find(({ id }) => {
    return id == bookId
  })
  if (!book) {
    return ['Unknown book', '']
  }
  switch (where) {
    case 'title': {
      return [`${book.title} > ${t('Title')}`, book.title]
    }
    case 'premise': {
      return [`${book.title} > ${t('Premise')}`, book.premise]
    }
    case 'genre': {
      return [`${book.title} > ${t('Genre')}`, book.genre]
    }
    case 'theme': {
      return [`${book.title} > ${t('Theme')}`, book.theme]
    }
    default: {
      return [book.title, '']
    }
  }
}

const computeCardHitTitle = (cardId, cards, restOfPathElements) => {
  const card = cards.find(({ id }) => {
    return id == cardId
  })
  const restOfPath = restOfPathElements.join(' > ')
  if (!card) {
    return [`Unknown card > ${restOfPath}`, '']
  }
  const type = restOfPathElements[0]
  switch (type) {
    case 'title': {
      return [`${card.title} > Title`, card.title]
    }
    case 'description': {
      return [`${card.title} > Description`, serializePlain(card.description)]
    }
    case 'customAttribute': {
      const attributeName = restOfPathElements[1] || ''
      return [`${card.title} > ${restOfPath}`, attributeToText(card[attributeName])]
    }
    case 'templateAttribute': {
      const templateId = restOfPathElements[1] || ''
      const attributeName = restOfPathElements[2] || ''
      const templateValue = card.templates
        .find(({ id }) => {
          return id == templateId
        })
        ?.attributes.find(({ name }) => {
          return name === attributeName
        })?.value
      return [
        `${card.title} > ${restOfPath}`,
        Array.isArray(templateValue) ? serializePlain(templateValue) : templateValue,
      ]
    }
    default: {
      return [`${card.title} > ${restOfPath}`, '']
    }
  }
}

const computeNoteHitTitle = (noteId, notes, restOfPathElements) => {
  const note = notes.find(({ id }) => {
    return id == noteId
  })
  const restOfPath = restOfPathElements.join(' > ')
  if (!note) {
    return [`Unknown note > ${restOfPath}`, '']
  }
  const type = restOfPathElements[0] || ''
  switch (type) {
    case 'title': {
      return [`${note.title} > Title`, note.title]
    }
    case 'content': {
      return [`${note.title} > Content`, serializePlain(note.content)]
    }
    case 'customAttribute': {
      const attributeName = restOfPathElements[1] || ''
      return [`${note.title} > ${restOfPath}`, attributeToText(note[attributeName])]
    }
    default: {
      return [`${note.title} > ${restOfPath}`, '']
    }
  }
}

const computeCharacterHitTitle = (
  characterId,
  characters,
  restOfPathElements,
  characterAttributes,
  books
) => {
  const character = characters.find(({ id }) => {
    return id == characterId
  })
  const restOfPath = restOfPathElements.join(' > ')
  if (!character) {
    return [`Unknown character > ${restOfPath}`, '']
  }
  const type = restOfPathElements[0] || ''
  switch (type) {
    case 'name': {
      return [`${character.name} > Name`, character.name]
    }
    case 'customAttribute': {
      const [_customAttribute, attributeId, attributeBookId] = restOfPathElements
      const attributeName =
        characterAttributes.find(({ id }) => {
          return id == attributeId
        })?.name || attributeId
      const bookName =
        books.find(({ id }) => {
          return id == attributeBookId
        })?.title || attributeBookId
      return [
        `${character.name} > ${attributeName} > ${bookName}`,
        attributeToText(
          character.attributes.find(({ id, bookId }) => {
            return id == attributeId && bookId == attributeBookId
          })?.value
        ),
      ]
    }
    case 'templateAttribute': {
      const [_templateAttribute, templateId, attributeName, attributeBookId] = restOfPathElements
      const template = character.templates.find(({ id }) => {
        return id == templateId
      })
      const templateName = template?.name || templateId
      const bookName =
        books.find(({ id }) => {
          return id == attributeBookId
        })?.title || attributeBookId
      return [
        `${character.name} > Template > ${templateName} > ${attributeName} > ${bookName}`,
        attributeToText(
          template.values?.find(({ name, bookId }) => {
            return name == attributeName && bookId == attributeBookId
          })?.value || ''
        ),
      ]
    }
    default: {
      return [`${character.name} > ${restOfPath}`, '']
    }
  }
}

const computePlaceHitTitle = (placeId, places, restOfPathElements) => {
  const place = places.find(({ id }) => {
    return id == placeId
  })
  const restOfPath = restOfPathElements.join(' > ')
  if (!place) {
    return [`Unknown place > ${restOfPath}`, '']
  }
  const type = restOfPathElements[0] || ''
  switch (type) {
    case 'name': {
      return [`${place.name} > Name`, place.name]
    }
    case 'description': {
      return [`${place.name} > Description`, place.description]
    }
    case 'notes': {
      return [`${place.name} > Content`, serializePlain(place.notes)]
    }
    case 'customAttribute': {
      const attributeName = restOfPathElements[1] || ''
      return [`${place.name} > ${restOfPath}`, attributeToText(place[attributeName])]
    }
    default: {
      return [`${place.name} > ${restOfPath}`, '']
    }
  }
}

const computeTagHitTitle = (tagId, tags, restOfPathElements) => {
  const tag = tags.find(({ id }) => {
    return id == tagId
  })
  const restOfPath = restOfPathElements.join(' > ')
  if (!tag) {
    return [`Unknown tag > ${restOfPath}`, '']
  }
  const type = restOfPathElements[0] || ''
  switch (type) {
    case 'title': {
      return [`${tag.title} > Title`, tag.title]
    }
    default: {
      return [`${tag.title} > ${restOfPath}`, '']
    }
  }
}

const computeLineHitTitle = (lineId, lines, restOfPathElements) => {
  const line = lines.find(({ id }) => {
    return id == lineId
  })
  const restOfPath = restOfPathElements.join(' > ')
  if (!line) {
    return [`Unknown line > ${restOfPath}`, '']
  } else {
    const type = restOfPathElements[0] || ''
    switch (type) {
      case 'title': {
        return [`${line.title} > Title`, line.title]
      }
      default: {
        return [`${line.title} > ${restOfPath}`, '']
      }
    }
  }
}

const computeBeatHitTitle = (beatId, bookId, books, beats, series, restOfPathElements) => {
  const beat = beats.find(({ id }) => {
    return id == beatId
  })
  const book =
    bookId === 'series'
      ? series
      : books.find(({ id }) => {
          return id == bookId
        })
  const restOfPath = restOfPathElements.join(' > ')
  if (!beat) {
    return [`Unknown beat > ${restOfPath}`, '']
  } else {
    const type = restOfPathElements[0] || ''
    switch (type) {
      case 'title': {
        return [`${book.title} > ${beat.title} > Title`, beat.title]
      }
      default: {
        return [`${book.title} > ${beat.title} > ${restOfPath}`, '']
      }
    }
  }
}

const PRE_AND_POST_CONTEXT_LENGTH = 20
const fontifyHits = (search, source, position) => {
  if (typeof position === 'number') {
    const upTo = source.slice(0, position).slice(-PRE_AND_POST_CONTEXT_LENGTH)
    const after = source.slice(position + search.length).slice(0, PRE_AND_POST_CONTEXT_LENGTH)
    const preElipses = position > PRE_AND_POST_CONTEXT_LENGTH ? '...' : ''
    const postElipses =
      position + search.length + PRE_AND_POST_CONTEXT_LENGTH < source.length ? '...' : ''
    return (
      <React.Fragment>
        <span>
          {preElipses}
          {upTo}
        </span>
        <b>{search}</b>
        <span>
          {after}
          {postElipses}
        </span>
      </React.Fragment>
    )
  } else {
    const contextRegex = new RegExp(search, 'gi')
    const sections = source.split(contextRegex)
    return sections.map((nonHit, index) => {
      return index < sections.length - 1 ? (
        <React.Fragment key={`search-${index}`}>
          <span>{nonHit}</span>
          <b>{search}</b>
        </React.Fragment>
      ) : (
        <React.Fragment key={`search-${index}`}>
          <span>{nonHit}</span>
        </React.Fragment>
      )
    })
  }
}

const SearchHit = ({ index, hitPathText, hitText, onClick, hitKey, toggleHit, checked }) => {
  return (
    <div
      className="search-modal--interactable"
      onClick={toggleHit ? toggleHit : onClick}
      key={hitKey}
    >
      {toggleHit ? (
        <div className="search-modal__hit-wrapper">
          <div className={cx({ highlighted: index % 2 === 1 }, 'search-modal__hit-details')}>
            <div className="search-modal__replace-wrapper">
              <div className="search-modal__hit-details-left">
                <span className="search-modal__hit-number">{index}.&nbsp;</span>
                <div className="search-modal__hit-text">{hitText}</div>
                <div className="search-modal__hit-path">{hitPathText}</div>
              </div>
              <ReplaceHit checked={checked} />
            </div>
          </div>
        </div>
      ) : (
        <div className="search-modal__hit-wrapper">
          <div className={cx({ highlighted: index % 2 === 1 }, 'search-modal__hit-details')}>
            <span className="search-modal__hit-number">{index}.&nbsp;</span>
            <div className="search-modal__hit-text">{hitText}</div>
            <div className="search-modal__hit-path">{hitPathText}</div>
          </div>
        </div>
      )}
    </div>
  )
}

SearchHit.propTypes = {
  index: PropTypes.number.isRequired,
  hitKey: PropTypes.string.isRequired,
  hitPathText: PropTypes.string.isRequired,
  hitText: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  toggleHit: PropTypes.func,
  checked: PropTypes.bool,
}

const ReplaceHit = ({ checked }) => {
  return (
    <input
      type="checkbox"
      className="search-modal__replace-checkbox"
      checked={checked}
      onChange={() => {
        // To Silence the React warning
      }}
    />
  )
}

ReplaceHit.propTypes = {
  checked: PropTypes.bool,
}

const safeParseInt = (x) => {
  try {
    return parseInt(x)
  } catch (error) {
    return null
  }
}

const SearchModalConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  const {
    platform: { log },
  } = connector
  checkDependencies({ log })

  const SearchModal = ({
    searchTerm,
    books,
    hits,
    series,
    cards,
    notes,
    characters,
    places,
    tags,
    lines,
    beats,
    replacing,
    replacementText,
    hitsMarkedForReplacement,
    closeSearch,
    currentHitIndex,
    scanning,
    characterAttributes,
    setSearchTerm,
    jumpToHit,
    setReplacementText,
    toggleHitMarkedForReplacement,
    replaceMarkedHits,
    openSearch,
    openReplace,
    hasNoResults,
  }) => {
    const activeTab = useMemo(() => {
      if (replacing) {
        return 'replace'
      } else {
        return 'search'
      }
    }, [replacing])
    const [projectHitsOpen, setProjectHitsOpen] = useState(true)
    const [timelineHitsOpen, setTimelineHitsOpen] = useState(true)
    const [outlineHitsOpen, setOutlineHitsOpen] = useState(true)
    const [noteHitsOpen, setNoteHitsOpen] = useState(true)
    const [characterHitsOpen, setCharacterHitsOpen] = useState(true)
    const [placeHitsOpen, setPlaceHitsOpen] = useState(true)
    const [tagHitsOpen, setTagHitsOpen] = useState(true)
    const [lineHitsOpen, setLineHitsOpen] = useState(true)
    const [beatHitsOpen, setBeatHitsOpen] = useState(true)

    const handleSetActiveTab = useCallback(
      (newTab) => {
        if (typeof newTab === 'string') {
          if (activeTab !== newTab) {
            if (newTab === 'search') {
              openSearch()
            } else if (newTab === 'replace') {
              openReplace()
            }
          }
        }
      },
      [openReplace, openSearch, activeTab]
    )

    const search = useCallback(
      (event) => {
        setSearchTerm(event.target.value)
      },
      [setSearchTerm]
    )

    useEffect(() => {
      if (!scanning || (!currentHitIndex && currentHitIndex !== 0)) {
        return
      }
    }, [currentHitIndex, scanning, hits])

    const searchInputRef = useRef()

    useEffect(() => {
      setTimeout(() => {
        if (searchInputRef.current && typeof searchInputRef.current.focus === 'function') {
          searchInputRef.current.focus()
        }
      }, 100)
    }, [])

    const replaceInputRef = useRef()

    const toggleHit = useCallback(
      (hit) => {
        return replacing
          ? () => {
              toggleHitMarkedForReplacement(hit)
            }
          : null
      },
      [toggleHitMarkedForReplacement, replacing]
    )

    const isChecked = (hit) => {
      return hitsMarkedForReplacement.some((checkedHit) => {
        return checkedHit.path === hit.path
      })
    }

    /**
     * computeTitle = (path: [String]) => String,
     */
    const interpretHit = (idx, type, inputHit, computeTitle) => {
      const { path, hit } = inputHit
      const pathSegments = path.split('/')
      const [hitTitle, contextValue] = computeTitle(pathSegments)
      const renderedContext = fontifyHits(hit, contextValue, safeParseInt(last(pathSegments)))
      return (
        <SearchHit
          index={1 + idx}
          hitKey={path}
          hitPathText={hitTitle}
          hitText={renderedContext}
          onClick={() => {
            jumpToHit(cards, type, inputHit)
            closeSearch()
          }}
          toggleHit={toggleHit(inputHit)}
          checked={isChecked(inputHit)}
        />
      )
    }

    const interpretHits = (type, title, hits, open, setOpen, computeTitle) => {
      const checkedCount = hits.reduce((acc, hit) => {
        if (isChecked(hit)) {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const atLeastOneChecked = checkedCount > 0
      const allChecked = checkedCount === hits.length
      const partiallyChecked = atLeastOneChecked && checkedCount !== hits.length
      const preTotalCount = replacing ? `${checkedCount} of ` : ''
      const checkUncheckAll = replacing ? (
        <input
          type="checkbox"
          className={cx({ partial: partiallyChecked }, 'search-modal__replace-all-checkbox')}
          checked={!partiallyChecked ? allChecked : undefined}
          ref={(ref) => {
            if (ref) {
              if (partiallyChecked) {
                ref.indeterminate = true
              } else {
                ref.indeterminate = false
              }
            }
          }}
          onClick={(event) => {
            event.stopPropagation()
            if (!atLeastOneChecked) {
              hits.forEach((hit) => {
                toggleHitMarkedForReplacement(hit)
              })
            } else {
              hits.forEach((hit) => {
                if (isChecked(hit)) {
                  toggleHitMarkedForReplacement(hit)
                }
              })
            }
          }}
          onChange={(event) => {
            // To Silence the React warning
          }}
        />
      ) : null

      return (
        <div>
          <div
            className={cx('search-modal__hit-category-section-heading', { active: open })}
            onClick={() => setOpen(!open)}
          >
            <div>
              <div>{open ? <FaMinus /> : <FaPlus />}</div>
              <div>{title}</div>
            </div>
            <div className="search-modal__hit-category-section-heading__hit-count">
              {preTotalCount}
              {hits.length}
              {checkUncheckAll}
            </div>
          </div>
          <Collapse in={open}>
            <div>{hits.map((hit, index) => interpretHit(index, type, hit, computeTitle))}</div>
          </Collapse>
        </div>
      )
    }

    const tabBody = () => {
      return (
        <div className="search-modal__wrapper">
          <div className="search-modal__header">
            <div className="search-modal__search-bar">
              <input
                className="search-modal__term"
                placeholder={t('search')}
                type="text"
                value={searchTerm}
                onChange={search}
                ref={searchInputRef}
              />
              {replacing ? (
                <>
                  <FaExchangeAlt className="search-modal__replace-icon" />
                  <input
                    className="search-modal__replace-term"
                    placeholder={t('replace')}
                    type="text"
                    value={replacementText}
                    onChange={withEventTargetValue(setReplacementText)}
                    ref={replaceInputRef}
                  />
                </>
              ) : null}
            </div>
          </div>
          <div className="search-modal__body">
            {searchTerm?.length < 3 ? (
              <div>
                <div className="search-modal__hit-category-section-heading no-results">
                  {t('Enter at least 3 letters to search...')}
                </div>
              </div>
            ) : hasNoResults ? (
              <div>
                <div className="search-modal__hit-category-section-heading no-results">
                  {t('No Results')}
                </div>
              </div>
            ) : null}
            {hits.project.length
              ? interpretHits(
                  'project',
                  t('Project'),
                  hits.project,
                  projectHitsOpen,
                  setProjectHitsOpen,
                  (segments) => {
                    const [_, _project, type, ...rest] = segments
                    if (type === 'series') {
                      const [kind] = rest
                      return seriesAttributeToTitle(kind, series)
                    } else {
                      const [id, kind] = rest
                      return computeBookHitTitle(kind, id, books)
                    }
                  }
                )
              : null}
            {hits.timeline.length
              ? interpretHits(
                  'timeline',
                  t('Timeline Card'),
                  hits.timeline,
                  timelineHitsOpen,
                  setTimelineHitsOpen,
                  (segments) => {
                    const [_, _timeline, _bookId, _card, cardId, ...rest] = segments
                    return computeCardHitTitle(cardId, cards, rest)
                  }
                )
              : null}
            {!replacing
              ? hits.outline.length
                ? interpretHits(
                    'outline',
                    t('Outline Card'),
                    hits.outline,
                    outlineHitsOpen,
                    setOutlineHitsOpen,
                    (segments) => {
                      const [_, _timeline, _bookId, _card, cardId, ...rest] = segments
                      return computeCardHitTitle(cardId, cards, rest)
                    }
                  )
                : null
              : null}
            {hits.notes.length
              ? interpretHits(
                  'notes',
                  t('Note'),
                  hits.notes,
                  noteHitsOpen,
                  setNoteHitsOpen,
                  (segments) => {
                    const [_, _notes, noteId, ...rest] = segments
                    return computeNoteHitTitle(noteId, notes, rest)
                  }
                )
              : null}
            {hits.characters.length
              ? interpretHits(
                  'characters',
                  t('Character'),
                  hits.characters,
                  characterHitsOpen,
                  setCharacterHitsOpen,
                  (segments) => {
                    const [_, _characters, characterId, ...rest] = segments
                    return computeCharacterHitTitle(
                      characterId,
                      characters,
                      rest,
                      characterAttributes,
                      books
                    )
                  }
                )
              : null}
            {hits.places.length
              ? interpretHits(
                  'places',
                  t('Place'),
                  hits.places,
                  placeHitsOpen,
                  setPlaceHitsOpen,
                  (segments) => {
                    const [_, _places, placeId, ...rest] = segments
                    return computePlaceHitTitle(placeId, places, rest)
                  }
                )
              : null}
            {hits.tags.length
              ? interpretHits(
                  'tags',
                  t('Tag'),
                  hits.tags,
                  tagHitsOpen,
                  setTagHitsOpen,
                  (segments) => {
                    const [_, _tags, tagId, ...rest] = segments
                    return computeTagHitTitle(tagId, tags, rest)
                  }
                )
              : null}
            {hits.lines.length
              ? interpretHits(
                  'lines',
                  t('Line'),
                  hits.lines,
                  lineHitsOpen,
                  setLineHitsOpen,
                  (segments) => {
                    const [_, _lines, lineId, ...rest] = segments
                    return computeLineHitTitle(lineId, lines, rest)
                  }
                )
              : null}
            {hits.beats.length
              ? interpretHits(
                  'beats',
                  t('Beat'),
                  hits.beats,
                  beatHitsOpen,
                  setBeatHitsOpen,
                  (segments) => {
                    const [_, _beats, bookId, beatId, ...rest] = segments
                    return computeBeatHitTitle(beatId, bookId, books, beats, series, rest)
                  }
                )
              : null}
          </div>
          {replacing ? (
            <div className="search-modal__footer">
              <hr />
              <div>
                <Button
                  bsStyle="success"
                  onClick={replaceMarkedHits}
                  disabled={!hitsMarkedForReplacement.length}
                >
                  {t('Replace Selected')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <PlottrModal isOpen={true} onRequestClose={closeSearch} style={modalStyles}>
        <Tabs
          activeKey={activeTab}
          onSelect={handleSetActiveTab}
          className="search_modal__tab-line"
        >
          <Tab key={'search'} eventKey={'search'} title={'Search'} tabClassName="search_modal__tab">
            {tabBody()}
          </Tab>
          <Tab
            key={'replace'}
            eventKey={'replace'}
            title={'Replace'}
            tabClassName="search_modal__tab"
          >
            {tabBody()}
          </Tab>
        </Tabs>
      </PlottrModal>
    )
  }

  SearchModal.propTypes = {
    searchTerm: PropTypes.string,
    books: PropTypes.array.isRequired,
    hits: PropTypes.object,
    series: PropTypes.object.isRequired,
    cards: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    lines: PropTypes.array.isRequired,
    beats: PropTypes.array.isRequired,
    replacing: PropTypes.bool,
    currentHitIndex: PropTypes.number,
    scanning: PropTypes.bool,
    characterAttributes: PropTypes.array,
    replacementText: PropTypes.string,
    hitsMarkedForReplacement: PropTypes.array.isRequired,
    closeSearch: PropTypes.func.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    jumpToHit: PropTypes.func.isRequired,
    setReplacementText: PropTypes.func.isRequired,
    toggleHitMarkedForReplacement: PropTypes.func.isRequired,
    replaceMarkedHits: PropTypes.func.isRequired,
    openSearch: PropTypes.func.isRequired,
    openReplace: PropTypes.func.isRequired,
    hasNoResults: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          searchTerm: selectors.searchDialogSearchTermSelector(state),
          hits: selectors.searchHitsSelector(state),
          books: selectors.allBooksAsArraySelector(state),
          series: selectors.seriesSelector(state),
          cards: selectors.allCardsSelector(state),
          notes: selectors.allNotesSelector(state),
          characters: selectors.allCharactersSelector(state),
          places: selectors.allPlacesSelector(state),
          tags: selectors.allTagsSelector(state),
          beats: selectors.allBeatsAsArraySelector(state),
          lines: selectors.allLinesSelector(state),
          currentHitIndex: selectors.searchDialogCurrentHitIndexSelector(state),
          scanning: selectors.searchDialogIsScanningSelector(state),
          characterAttributes: selectors.allCharacterAttributesSelector(state),
          replacing: selectors.searchDialogIsReplacingSelector(state),
          replacementText: selectors.searchReplacementTextSelector(state),
          hitsMarkedForReplacement: selectors.hitsMarkedForReplacementSelector(state),
          hasNoResults: selectors.hasNoResultsSelector(state),
        }
      },
      {
        closeSearch: actions.ui.closeSearch,
        setSearchTerm: actions.ui.setSearchTerm,
        jumpToHit: actions.ui.jumpToHit,
        setReplacementText: actions.ui.setReplacementText,
        toggleHitMarkedForReplacement: actions.ui.toggleHitMarkedForReplacement,
        replaceMarkedHits: actions.ui.replaceMarkedHits,
        openSearch: actions.ui.openSearch,
        openReplace: actions.ui.openReplace,
      }
    )(SearchModal)
  }

  throw new Error('Could not connect SearchModal')
}

export default SearchModalConnector
