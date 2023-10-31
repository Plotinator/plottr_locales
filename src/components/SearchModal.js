import React, { useCallback, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { FaSearch, FaExchangeAlt } from 'react-icons/fa'
import { VscReplaceAll } from 'react-icons/vsc'

import { t } from 'plottr_locales'
import { slate } from 'pltr/v2'

import Button from './Button'
import UnconnectedPlottrModal from './PlottrModal'
import { checkDependencies } from './checkDependencies'
import { withEventTargetValue } from './withEventTargetValue'

const modalStyles = {
  content: {
    borderRadius: 0,
    padding: 0,
    minHeight: 'min-content',
    maxHeight: '80vh',
    overflow: 'hidden',
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

const PRE_AND_POST_CONTEXT_LENGTH = 50
const fontifyHits = (search, source, position) => {
  if (position) {
    const upTo = source.slice(0, position).slice(-PRE_AND_POST_CONTEXT_LENGTH)
    const after = source.slice(position + search.length).slice(0, PRE_AND_POST_CONTEXT_LENGTH)
    return (
      <React.Fragment>
        <span>...{upTo}</span>
        <b>{search}</b>
        <span>{after}...</span>
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

const SearchHit = ({ title, hitPathText, hitText, onClick, hitKey, toggleHit, checked }) => {
  return (
    <div
      className="search-modal--interactable"
      onClick={toggleHit ? toggleHit : onClick}
      key={hitKey}
    >
      {toggleHit ? (
        <div className="search-modal__hit-with-checkbox">
          <div className="search-modal__hit-wrapper">
            <div className="search-modal__hit-type-title">
              <h3>{title}</h3>
            </div>
            <div className="search-modal__hit-details">
              <div className="search-modal__hit-path">{hitPathText}</div>
              <div className="search-modal__hit-text">{hitText}</div>
            </div>
          </div>
          {toggleHit ? <ReplaceHit checked={checked} /> : null}
        </div>
      ) : (
        <div className="search-modal__hit-wrapper">
          <div className="search-modal__hit-type-title">
            <h3>{title}</h3>
          </div>
          <div className="search-modal__hit-details">
            <div className="search-modal__hit-path">{hitPathText}</div>
            <div className="search-modal__hit-text">{hitText}</div>
          </div>
        </div>
      )}
      <hr />
    </div>
  )
}

SearchHit.propTypes = {
  hitKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
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
    nextSearchHit,
    previousSearchHit,
    jumpToHit,
    toggleReplaceSearch,
    setReplacementText,
    toggleHitMarkedForReplacement,
    replaceMarkedHits,
  }) => {
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

    const toggleHit = (replace, hit) => {
      return replace
        ? () => {
            toggleHitMarkedForReplacement(hit)
          }
        : null
    }

    const isChecked = (hit) => {
      return hitsMarkedForReplacement.some((checkedHit) => {
        return checkedHit.path === hit.path
      })
    }

    const interpretProjectHit = (replace) => {
      const projectHitComponent = (projectHit) => {
        const { path, hit } = projectHit
        const [_, _project, type, ...rest] = path.split('/')
        if (type === 'series') {
          const [kind] = rest
          const [title, contextValue] = seriesAttributeToTitle(kind, series)
          const renderedContext = fontifyHits(hit, contextValue)
          return (
            <SearchHit
              hitKey={path}
              title={t('Project Tab')}
              hitPathText={title}
              hitText={renderedContext}
              onClick={() => {
                jumpToHit(cards, 'project', projectHit)
                closeSearch()
              }}
              toggleHit={toggleHit(replace, projectHit)}
              checked={isChecked(projectHit)}
            />
          )
        } else {
          const [id, kind] = rest
          const [bookHitTitle, contextValue] = computeBookHitTitle(kind, id, books)
          const renderedContext = fontifyHits(hit, contextValue)
          return (
            <SearchHit
              hitKey={path}
              title={t('Book')}
              hitPathText={bookHitTitle}
              hitText={renderedContext}
              onClick={() => {
                jumpToHit(cards, 'project', projectHit)
                closeSearch()
              }}
              toggleHit={toggleHit(replace, projectHit)}
              checked={isChecked(projectHit)}
            />
          )
        }
      }
      return projectHitComponent
    }

    const interpretProjectHits = (projectHits, replace) => {
      return projectHits.map(interpretProjectHit(replace))
    }

    const interpretTimelineHit = (replace) => {
      const timelineHitComponent = (timelineHit) => {
        const { path, hit } = timelineHit
        const [_, _timeline, _bookId, _card, cardId, ...rest] = path.split('/')
        const [cardHitTitle, contextValue] = computeCardHitTitle(cardId, cards, rest)
        const renderedContext = fontifyHits(hit, contextValue, safeParseInt(rest[rest.length - 1]))
        return (
          <SearchHit
            hitKey={path}
            title={t('Timeline Card')}
            hitPathText={cardHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'timeline', timelineHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, timelineHit)}
            checked={isChecked(timelineHit)}
          />
        )
      }
      return timelineHitComponent
    }

    const interpretTimelineHits = (timelineHits, replace) => {
      return timelineHits.map(interpretTimelineHit(replace))
    }

    const interpretOutlineHit = (replace) => {
      const outlineHitComponent = (outlineHit) => {
        const { path, hit } = outlineHit
        const [_, _outline, _bookId, _card, cardId, ...rest] = path.split('/')
        const [cardHitTitle, contextValue] = computeCardHitTitle(cardId, cards, rest)
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Outline Card')}
            hitPathText={cardHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'outline', outlineHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, outlineHit)}
            checked={isChecked(outlineHit)}
          />
        )
      }
      return outlineHitComponent
    }

    const interpretOutlineHits = (outlineHits, replace) => {
      return outlineHits.map(interpretOutlineHit(replace))
    }

    const interpretNoteHit = (replace) => {
      const noteHitComponent = (noteHit) => {
        const { path, hit } = noteHit
        const [_, _notes, noteId, ...rest] = path.split('/')
        const [noteHitTitle, contextValue] = computeNoteHitTitle(noteId, notes, rest)
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Note')}
            hitPathText={noteHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'notes', noteHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, noteHit)}
            checked={isChecked(noteHit)}
          />
        )
      }
      return noteHitComponent
    }

    const interpretNotesHits = (notesHits, replace) => {
      return notesHits.map(interpretNoteHit(replace))
    }

    const interpretCharacterHit = (replace) => {
      const characterHitComponent = (characterHit) => {
        const { path, hit } = characterHit
        const [_, _characters, characterId, ...rest] = path.split('/')
        const [characterHitTitle, contextValue] = computeCharacterHitTitle(
          characterId,
          characters,
          rest,
          characterAttributes,
          books
        )
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Character')}
            hitPathText={characterHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'characters', characterHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, characterHit)}
            checked={isChecked(characterHit)}
          />
        )
      }
      return characterHitComponent
    }

    const interpretCharactersHits = (charactersHits, replace) => {
      return charactersHits.map(interpretCharacterHit(replace))
    }

    const interpretPlaceHit = (replace) => {
      const placeHitComponent = (placeHit) => {
        const { path, hit } = placeHit
        const [_, _places, placeId, ...rest] = path.split('/')
        const [placeHitTitle, contextValue] = computePlaceHitTitle(placeId, places, rest)
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Place')}
            hitPathText={placeHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'places', placeHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, placeHit)}
            checked={isChecked(placeHit)}
          />
        )
      }
      return placeHitComponent
    }

    const interpretPlacesHits = (placesHits, replace) => {
      return placesHits.map(interpretPlaceHit(replace))
    }

    const interpretTagHit = (replace) => {
      const tagHitComponent = (tagHit) => {
        const { path, hit } = tagHit
        const [_, _places, tagId, ...rest] = path.split('/')
        const [tagHitTitle, contextValue] = computeTagHitTitle(tagId, tags, rest)
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Tag')}
            hitPathText={tagHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'tags', tagHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, tagHit)}
            checked={isChecked(tagHit)}
          />
        )
      }
      return tagHitComponent
    }

    const interpretTagsHits = (tagsHits, replace) => {
      return tagsHits.map(interpretTagHit(replace))
    }

    const interpretLineHit = (replace) => {
      const lineHitComponent = (lineHit) => {
        const { path, hit } = lineHit
        const [_, _lines, lineId, ...rest] = path.split('/')
        const [lineHitTitle, contextValue] = computeLineHitTitle(lineId, lines, rest)
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Line')}
            hitPathText={lineHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'lines', lineHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, lineHit)}
            checked={isChecked(lineHit)}
          />
        )
      }
      return lineHitComponent
    }

    const interpretLinesHits = (lineHits, replace) => {
      return lineHits.map(interpretLineHit(replace))
    }

    const interpretBeatHit = (replace) => {
      const beatHitComponent = (beatHit) => {
        const { path, hit } = beatHit
        const [_, _beats, bookId, beatId, ...rest] = path.split('/')
        const [beatHitTitle, contextValue] = computeBeatHitTitle(
          beatId,
          bookId,
          books,
          beats,
          series,
          rest
        )
        const renderedContext = fontifyHits(hit, contextValue)
        return (
          <SearchHit
            hitKey={path}
            title={t('Beat')}
            hitPathText={beatHitTitle}
            hitText={renderedContext}
            onClick={() => {
              jumpToHit(cards, 'beats', beatHit)
              closeSearch()
            }}
            toggleHit={toggleHit(replace, beatHit)}
            checked={isChecked(beatHit)}
          />
        )
      }
      return beatHitComponent
    }

    const interpretBeatsHits = (beatHits, replace) => {
      return beatHits.map(interpretBeatHit(replace))
    }

    if (replacing) {
      return (
        <PlottrModal isOpen={true} onRequestClose={closeSearch} style={modalStyles}>
          <div className="search-modal__wrapper">
            <div className="search-modal__header replace">
              <div className="search-modal__search-bar">
                <input
                  className="search-modal__replace-term"
                  placeholder={t('search')}
                  type="text"
                  value={searchTerm}
                  onChange={search}
                  ref={searchInputRef}
                />
                <FaExchangeAlt className="search-modal__replace-icon" />
                <input
                  className="search-modal__replace-term"
                  placeholder={t('replace')}
                  type="text"
                  value={replacementText}
                  onChange={withEventTargetValue(setReplacementText)}
                  ref={replaceInputRef}
                />
                <Button className="search-modal__replace-button" onClick={replaceMarkedHits}>
                  <VscReplaceAll />
                </Button>
              </div>
            </div>
            <div className="search-modal__body">
              {hits.project.length ? interpretProjectHits(hits.project, true) : null}
              {hits.timeline.length ? interpretTimelineHits(hits.timeline, true) : null}
              {hits.outline.length ? interpretOutlineHits(hits.outline, true) : null}
              {hits.notes.length ? interpretNotesHits(hits.notes, true) : null}
              {hits.characters.length ? interpretCharactersHits(hits.characters, true) : null}
              {hits.places.length ? interpretPlacesHits(hits.places, true) : null}
              {hits.tags.length ? interpretTagsHits(hits.tags, true) : null}
              {hits.lines.length ? interpretLinesHits(hits.lines, true) : null}
              {hits.beats.length ? interpretBeatsHits(hits.beats, true) : null}
            </div>
          </div>
        </PlottrModal>
      )
    } else {
      return (
        <PlottrModal isOpen={true} onRequestClose={closeSearch} style={modalStyles}>
          <div className="search-modal__wrapper">
            <div className="search-modal__header">
              <div className="search-modal__search-bar">
                <FaSearch className="search-modal__search-icon" />
                <input
                  className="search-modal__term"
                  placeholder={t('search')}
                  type="text"
                  value={searchTerm}
                  onChange={search}
                  ref={searchInputRef}
                />
              </div>
            </div>
            <div className="search-modal__body">
              {hits.project.length ? interpretProjectHits(hits.project) : null}
              {hits.timeline.length ? interpretTimelineHits(hits.timeline) : null}
              {hits.outline.length ? interpretOutlineHits(hits.outline) : null}
              {hits.notes.length ? interpretNotesHits(hits.notes) : null}
              {hits.characters.length ? interpretCharactersHits(hits.characters) : null}
              {hits.places.length ? interpretPlacesHits(hits.places) : null}
              {hits.tags.length ? interpretTagsHits(hits.tags) : null}
              {hits.lines.length ? interpretLinesHits(hits.lines) : null}
              {hits.beats.length ? interpretBeatsHits(hits.beats) : null}
            </div>
          </div>
        </PlottrModal>
      )
    }
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
    nextSearchHit: PropTypes.func.isRequired,
    previousSearchHit: PropTypes.func.isRequired,
    jumpToHit: PropTypes.func.isRequired,
    toggleReplaceSearch: PropTypes.func.isRequired,
    setReplacementText: PropTypes.func.isRequired,
    toggleHitMarkedForReplacement: PropTypes.func.isRequired,
    replaceMarkedHits: PropTypes.func.isRequired,
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
        }
      },
      {
        closeSearch: actions.ui.closeSearch,
        setSearchTerm: actions.ui.setSearchTerm,
        nextSearchHit: actions.ui.nextSearchHit,
        previousSearchHit: actions.ui.previousSearchHit,
        jumpToHit: actions.ui.jumpToHit,
        toggleReplaceSearch: actions.ui.toggleReplaceSearch,
        setReplacementText: actions.ui.setReplacementText,
        toggleHitMarkedForReplacement: actions.ui.toggleHitMarkedForReplacement,
        replaceMarkedHits: actions.ui.replaceMarkedHits,
      }
    )(SearchModal)
  }

  throw new Error('Could not connect SearchModal')
}

export default SearchModalConnector
