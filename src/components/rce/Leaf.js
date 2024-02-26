import React from 'react'
import PropTypes from 'react-proptypes'

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.strike) {
    children = <del>{children}</del>
  }

  if (leaf.color) {
    const colorStyle = {
      color: leaf.color,
    }
    attributes.style = attributes.style ? { ...attributes.style, ...colorStyle } : colorStyle
  }

  if (leaf.font) {
    const fontStyle = { fontFamily: leaf.font }
    attributes.style = attributes.style ? { ...attributes.style, ...fontStyle } : fontStyle
  }

  if (leaf.fontSize) {
    const size = { fontSize: leaf.fontSize }
    attributes.style = attributes.style ? { ...attributes.style, ...size } : size
  }

  if (leaf.fontWeight) {
    const weight = { fontSize: leaf.fontWeight }
    attributes.style = attributes.style ? { ...attributes.style, ...weight } : weight
  }

  if (leaf.placeholder) {
    attributes.style = attributes.style
      ? { ...attributes.style, display: 'block' }
      : attributes.style
  }

  return <span {...attributes}>{children}</span>
}

Leaf.propTypes = {
  attributes: PropTypes.shape({
    style: PropTypes.object,
    className: PropTypes.string,
  }),
  children: PropTypes.node,
  leaf: PropTypes.shape({
    placeholder: PropTypes.string,
    bold: PropTypes.bool,
    italic: PropTypes.bool,
    underline: PropTypes.bool,
    strike: PropTypes.bool,
    color: PropTypes.string,
    font: PropTypes.string,
    fontSize: PropTypes.number,
    fontWeight: PropTypes.number,
    darkMode: PropTypes.bool,
  }),
}

export default React.memo(Leaf)
