import React, { useState, useCallback, useContext } from 'react'
import PropTypes from 'prop-types'
import { FaImage } from '@react-icons/all-files/fa/FaImage'
import { Editor, Transforms } from 'slate'

import Button from '../Button'
import ImagePicker from '../images/ImagePicker'
import { readImage, isImageUrl, readImageFromURL } from '../images'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const ImagesButton = ({ editor }) => {
  const {
    platform: {
      log,
      storage: { isStorageURL },
    },
  } = useContext(PlottrComponentsContext)

  const [dialogOpen, setOpen] = useState(false)
  const [selection, setSelection] = useState()
  const getData = useCallback(
    (id, data) => {
      if (selection) {
        editor.apply({
          type: 'set_selection',
          // @ts-ignore
          properties: { anchor: selection.anchor, focus: selection.focus },
          // @ts-ignore
          newProperties: { anchor: selection.anchor, focus: selection.focus },
        })
      }
      isStorageURL(data).then((storageURL) => {
        if (storageURL) insertImageLink(editor, data)
        else if (data) insertImageData(editor, data)
        setOpen(false)
      })
    },
    [selection, editor, setOpen]
  )
  const close = useCallback(() => setOpen(false), [setOpen])

  // TODO: send ImagePicker the selectedId
  return (
    <Button
      bsStyle={isImageActive(editor, log) ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        setSelection(editor.selection)
        setOpen(true)
      }}
    >
      <FaImage />
      {dialogOpen ? <ImagePicker modalOnly chooseImage={getData} close={close} /> : null}
    </Button>
  )
}

ImagesButton.propTypes = {
  editor: PropTypes.object.isRequired,
}

export default ImagesButton

export const withImages = (editor, addImage) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'image-link' || element.type === 'image-data' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          readImage(file, (data) => {
            addImage({ data, name: file.name, path: file.path })
            insertImageData(editor, data)
          })
        }
      }
    } else if (isImageUrl(text)) {
      readImageFromURL(text, (strData) => {
        addImage({ data: strData, name: text, path: text })
        insertImageData(editor, strData)
      })
    } else {
      insertData(data)
    }
  }

  return editor
}

const isImageActive = (editor, log) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    try {
      // @ts-ignore
      const [link] = Editor.nodes(editor, {
        // @ts-ignore
        match: (n) => n.type === 'image-link' || n.type === 'image-data',
      })
      return !!link
    } catch (error) {
      log.error('Error finding whether image is active', error)
      return false
    }
  } else {
    return false
  }
}

const insertImageData = (editor, data) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    const text = { text: '' }
    const image = { type: 'image-data', data, children: [text] }
    Transforms.insertNodes(editor, image)
  }
}

const insertImageLink = (editor, storageUrl) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    const text = { text: '' }
    const image = { type: 'image-link', storageUrl, children: [text] }
    Transforms.insertNodes(editor, image)
  }
}
