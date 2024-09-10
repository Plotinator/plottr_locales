import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t as i18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import Glyphicon from '../Glyphicon'
import RichText from '../rce/RichText'
import Image from '../images/Image'

class NoteDetails extends Component {
  render() {
    const { note, customAttributes, categories } = this.props
    const customAttrNotes = customAttributes.map((attr, idx) => {
      const { name, type } = attr
      let desc
      if (type == 'paragraph') {
        desc = (
          <dd>
            <RichText id={`note-${note.id}-custom-attribute-${name}`} description={note[name]} />
          </dd>
        )
      } else {
        desc = <dd>{note[name]}</dd>
      }
      return (
        <dl key={idx} className="dl-horizontal">
          <dt>{name}</dt>
          {desc}
        </dl>
      )
    })
    const templateNotes = note.templates.flatMap((t) => {
      return t.attributes.map((attr) => {
        let val
        if (attr.type == 'paragraph') {
          val = (
            <dd>
              <RichText
                id={`note-${note.id}-template-${t.id}-attribute-${attr.name}`}
                description={attr.value}
              />
            </dd>
          )
        } else {
          val = <dd>{attr.value}</dd>
        }
        return (
          <dl key={attr.name} className="dl-horizontal">
            <dt>{attr.name}</dt>
            {val}
          </dl>
        )
      })
    })

    const category = categories.find((cat) => cat.id == note.categoryId)

    return (
      <div className="note-list__note-wrapper">
        <div className="note-list__note" onClick={this.props.startEditing}>
          <h4 className="secondary-text">{note.title || i18n('New Note')}</h4>
          <div className="note-list__note-notes">
            <div>
              <dl className="dl-horizontal">
                <dt>{i18n('Category')}</dt>
                <dd>{(category && category.name) || i18n('Uncategorized')}</dd>
              </dl>
              {customAttrNotes}
              <dl className="dl-horizontal">
                <Image responsive imageId={note.imageId} />
                <dt>{i18n('Notes')}</dt>
                <dd>
                  <RichText id={`note-${note.id}-content`} description={note.content} />
                </dd>
              </dl>
              {templateNotes}
            </div>
            <div className="note-list__right-side">
              <Glyphicon glyph="pencil" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  static propTypes = {
    noteId: PropTypes.number.isRequired,
    note: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    customAttributes: PropTypes.array.isRequired,
    startEditing: PropTypes.func.isRequired,
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    note: selectors.singleNoteSelector(
      state,
      // @ts-ignore
      ownProps.noteId
    ),
    categories: selectors.noteCategoriesSelector(state),
    customAttributes: selectors.noteCustomAttributesSelector(state),
  }
}

export default connect(mapStateToProps)(NoteDetails)
