import React, { useState, useRef, useEffect } from 'react'
import { difference } from 'lodash'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'

import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import Image from '../images/Image'
import Floater from '../PlottrFloater'
import { helpers } from 'pltr'
import { contains } from '../domHelpers'

const {
  books: { isSeries },
} = helpers

const BookSelectList = ({ selectedBooks, books, parentId, add, remove, click }) => {
  const [open, setOpen] = useState(false)

  const buttonRef = useRef()
  const selectListRef = useRef()
  const previousClick = useRef(click)

  useEffect(() => {
    if (!selectListRef.current || !buttonRef.current) return
    if (contains(buttonRef.current, click)) return

    // @ts-ignore
    if (click.counter !== previousClick.counter && !contains(selectListRef.current, click)) {
      setOpen(false)
    }

    previousClick.current = click
  }, [click])

  const close = () => {
    setOpen(false)
  }

  const toggleOpen = () => {
    setOpen(!open)
  }

  const renderUnSelected = () => {
    const idsToList = difference(books.allIds, selectedBooks)
    let listItems = [
      <small key="no-more">
        <i>{i18n('no more to add')}</i>
      </small>,
    ]
    if (idsToList.length) {
      listItems = idsToList.map((id) => {
        return (
          <li key={`book-${id}`} onClick={() => add(parentId, id)}>
            {books[id].title || i18n('Untitled')}
          </li>
        )
      })
    }
    const showSeries = !selectedBooks.some(isSeries)
    return (
      <Popover id="list-popover" title="" noMaxWidth>
        <ul
          // @ts-ignore
          ref={selectListRef}
          className={cx('select-list__item-select-list', { 'series-select': showSeries })}
        >
          {showSeries ? (
            <li key="book-series" className="series" onClick={() => add(parentId, 'series')}>
              {i18n('Series')}
            </li>
          ) : null}
          {listItems}
        </ul>
      </Popover>
    )
  }

  const renderSelected = () => {
    return selectedBooks.map((id) => {
      if (isSeries(id)) {
        return (
          <div key={id} className="chip">
            <span>{i18n('Series')}</span>
            <Glyphicon glyph="remove" onClick={() => remove(parentId, id)} />
          </div>
        )
      } else {
        let book = books[id]
        if (!book) return null
        return (
          <div key={id} className="chip">
            <Image size="xs" shape="circle" imageId={book.imageId} />
            <span>{book.title || i18n('Untitled')}</span>
            <Glyphicon glyph="remove" onClick={() => remove(parentId, id)} />
          </div>
        )
      }
    })
  }

  const handleMouseLeave = () => {
    if (open) close()
  }

  return (
    <div className="select-list__wrapper" onMouseLeave={handleMouseLeave}>
      <label
        // @ts-ignore
        ref={buttonRef}
        className="select-list__details-label"
      >
        {i18n('Books')}:
        <Floater open={open} onClose={close} placement="right" component={renderUnSelected}>
          <Button bsSize="xsmall" onClick={toggleOpen}>
            <Glyphicon glyph="plus" />
          </Button>
        </Floater>
      </label>
      {renderSelected()}
    </div>
  )
}

BookSelectList.propTypes = {
  parentId: PropTypes.number.isRequired,
  add: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  selectedBooks: PropTypes.array.isRequired,
  books: PropTypes.object.isRequired,
  click: PropTypes.object,
}

const mapStateToProps = (state) => {
  return {
    books: selectors.allBooksSelector(state),
    series: selectors.seriesSelector(state),
    click: selectors.lastClickSelector(state),
  }
}

export default connect(mapStateToProps)(BookSelectList)
