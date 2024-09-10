import React, { useState, useEffect, useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { v4 as uuidv4 } from 'uuid'

import { selectors, actions } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'

import Grid from '../Grid'
import NavItem from '../NavItem'
import Nav from '../Nav'
import ButtonGroup from '../ButtonGroup'
import ButtonToolbar from '../ButtonToolbar'
import Glyphicon from '../Glyphicon'
import Col from '../Col'
import Row from '../Row'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import Image from './Image'
import { Spinner } from '../Spinner'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import PlottrModal from '../PlottrModal'
import Alert from '../Alert'
import { readImage, isImageUrl, readImageFromURL } from '../images'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const ImagePicker = ({
  chooseImage,
  selectedId,
  darkMode,
  iconOnly,
  modalOnly,
  deleteButton,
  close,
  onClose,
  images,
  actions,
  isCloudFile,
  fromMenu,
}) => {
  const {
    platform: {
      storage: { saveImageToStorageFromURL, resizeImage },
    },
  } = useContext(PlottrComponentsContext)

  const [tabId, setTabId] = useState('1')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [justAddedImage, setJustAddedImage] = useState(false)
  const [inDropZone, setInDropZone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stateSelectedId, setStateSelectedId] = useState(null)
  const [sortedIds, setSortedIds] = useState([])
  const [error, setError] = useState('')

  /**
   * @type {InputRef}
   * @typedef InputRef
   * @property { HTMLInputElement | null} current
   */
  const fileNameRef = useRef(null)

  useEffect(() => {
    const ids = Object.keys(images)
      .map(Number)
      .sort((a, b) => a - b)
      .reverse()
    let selected = null
    if (justAddedImage) selected = ids[0]
    if (!tabId) setTabId(tabId ?? '1')
    setStateSelectedId(selected || stateSelectedId || selectedId)
    setOpen(fromMenu || modalOnly || open || false)
    setEditing(editing || false)
    setInDropZone(inDropZone || false)
    // @ts-ignore
    setSortedIds(ids)
    setJustAddedImage(false)
    setLoading(loading || false)
    // @ts-ignore
    setDeleting(deleting || null)
  }, [images, selectedId, fromMenu, modalOnly])

  // @ts-ignore
  const handleDragOver = (e) => {
    e.preventDefault()
    setInDropZone(true)
  }

  const handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setInDropZone(false)

    const { files } = e.dataTransfer

    if (files && files.length > 0) {
      for (const file of files) {
        if (saveImageToStorageFromURL && isCloudFile) {
          resizeImage(file, (imageData) => {
            saveImageToStorageFromURL(imageData, file.name).then((internalUrl) => {
              actions.addImage({ name: file.name, path: internalUrl })
              setTabId('1')
              setJustAddedImage(true)
            })
          })
        } else {
          readImage(file, (data) => {
            actions.addImage({ data, name: file.name, path: file.path })
            setTabId('1')
            setJustAddedImage(true)
          })
        }
      }
    }
  }

  const getFromURL = (e) => {
    const url = e.target.value
    setError('')
    if (isImageUrl(url)) {
      setLoading(true)
      if (saveImageToStorageFromURL && isCloudFile) {
        fetch(url)
          .then((response) => {
            response.blob().then((image) => {
              const tempName = uuidv4()
              resizeImage(image, (imageData) => {
                saveImageToStorageFromURL(imageData, tempName).then((internalUrl) => {
                  actions.addImage({ name: tempName, path: internalUrl })
                  setTimeout(() => {
                    setTabId('1')
                    setJustAddedImage(true)
                    setLoading(false)
                  }, 500)
                })
              })
            })
          })
          .catch((_error) => {
            setError(i18n("Sorry, we couldn't read that image."))
            setLoading(false)
          })
      } else {
        readImageFromURL(url, (strData) => {
          actions.addImage({ data: strData, name: url, path: url })
          setTimeout(() => {
            setTabId('1')
            setJustAddedImage(true)
            setLoading(false)
          }, 500)
        }).catch((_error) => {
          setError(i18n("Sorry, we couldn't read that image."))
          setLoading(false)
        })
      }
    } else {
      setError(
        i18n(
          "We can't read an image from that URL.  Please provide a direct link to the image and ensure the server allows it to be read."
        )
      )
    }
  }

  const renameFile = () => {
    if (typeof fileNameRef.current?.value === 'string') {
      let newName = fileNameRef.current.value
      actions.renameImage(stateSelectedId, newName)
      setEditing(false)
    }
  }

  const deleteImage = () => {
    if (deleting) {
      actions.deleteImage(stateSelectedId)
      setDeleting(false)
      setStateSelectedId(null)
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (onClose) onClose()
    if (modalOnly || fromMenu) close()
  }

  const handleChooseImage = () => {
    const idString = `${stateSelectedId}`
    chooseImage(idString, images[idString].data || images[idString].path)
    handleClose()
  }

  const chooseNoImage = () => {
    chooseImage(null)
    if (open) handleClose()
    setStateSelectedId(null)
  }

  const uploadNewFile = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (saveImageToStorageFromURL && isCloudFile) {
        resizeImage(file, (imageData) => {
          saveImageToStorageFromURL(imageData, file.name).then((internalUrl) => {
            actions.addImage({ name: file.name, path: internalUrl })
            setTabId('1')
            setJustAddedImage(true)
          })
        })
      } else {
        readImage(file, (data) => {
          actions.addImage({ data, name: file.name, path: file.path })
          setTabId('1')
          setJustAddedImage(true)
        })
      }
    }
  }

  const renderDelete = () => {
    if (!deleting) return null

    const text = i18n('Do you want to remove this image? It will NOT be deleted from your computer')
    return (
      <DeleteConfirmModal
        customText={text}
        onDelete={deleteImage}
        onCancel={() => setDeleting(false)}
      />
    )
  }

  const renderUpload = () => {
    return (
      <Row>
        <Col xs={12}>
          <div
            className={cx('image-picker__dropzone', { dropping: inDropZone })}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <h2>{i18n('Drop a File Here')}</h2>
            <p>{i18n('or')}</p>
            <ControlLabel htmlFor="fileUpload">
              <div className="btn image-picker__upload-button">
                <Glyphicon glyph="upload" /> {i18n('Select a File')}
              </div>
            </ControlLabel>
            <FormControl
              id="fileUpload"
              type="file"
              onChange={uploadNewFile}
              accept="image/png, image/jpeg, image/webp"
            />
          </div>
        </Col>
      </Row>
    )
  }

  const renderURL = () => {
    return (
      <Row>
        <Col xs={12}>
          <div className="image-picker__url-wrapper">
            <FormGroup bsSize="large">
              <ControlLabel>
                <h6>{i18n('Enter the URL of the link:')}</h6>
              </ControlLabel>
              <FormControl
                onClick={(event) => {
                  if (typeof event?.target?.focus === 'function') {
                    event.target.focus()
                  }
                }}
                placeholder={i18n('URL')}
                type="text"
                onChange={getFromURL}
              />
            </FormGroup>
            {loading ? <Spinner /> : null}
            {error ? (
              <Alert bsStyle="danger">
                <h4>{error}</h4>
              </Alert>
            ) : null}
          </div>
        </Col>
      </Row>
    )
  }

  const renderGallery = () => {
    return (
      <Row>
        <Col xs={9}>
          <div className="image-picker__images-container">{renderImages()}</div>
        </Col>
        <Col xs={3}>{renderSidebar()}</Col>
      </Row>
    )
  }

  const renderTab = () => {
    switch (tabId) {
      case '1':
        return renderGallery()
      case '2':
        return renderUpload()
      case '3':
        return renderURL()
    }
  }

  const handleKeyPress = (evt) => {
    evt.preventDefault()
    if (evt.key === 'Enter' && !fromMenu && stateSelectedId) {
      handleChooseImage()
    }
  }

  const renderName = (value) => {
    if (editing) {
      return (
        <FormGroup>
          <FormControl
            type="text"
            defaultValue={value}
            inputRef={(ref) => {
              fileNameRef.current = ref
            }}
          />
          <Button onClick={renameFile}>{i18n('Rename')}</Button>
        </FormGroup>
      )
    } else {
      return <p>{value}</p>
    }
  }

  const renderToolbar = () => {
    if (editing) return null

    return (
      <ButtonToolbar className="card-dialog__button-bar">
        <Button onClick={() => setEditing(true)}>{i18n('Rename')}</Button>
        <Button bsStyle="danger" onClick={() => setDeleting(true)}>
          {i18n('Delete')}
        </Button>
      </ButtonToolbar>
    )
  }

  const renderImages = () => {
    return sortedIds.map((id) => {
      const isSelected = stateSelectedId == id
      const klasses = cx('image-picker__image-wrapper', { selected: isSelected })
      return (
        <div
          key={id}
          className={klasses}
          onClick={() => setStateSelectedId(isSelected ? null : id)}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <Image imageId={id} shape="square" size="large" />
        </div>
      )
    })
  }

  const renderSidebar = () => {
    const image = images[`${stateSelectedId}`]
    let body = null
    if (image) {
      body = (
        <div>
          <h6>{i18n('Image Details')}</h6>
          <Image imageId={stateSelectedId} responsive />
          <div className="image-picker__sidebar-tools">
            {renderDelete()}
            {renderName(image.name)}
            {renderToolbar()}
          </div>
        </div>
      )
    }

    return <div className="image-picker__sidebar">{body}</div>
  }

  if (open) {
    return (
      <PlottrModal isOpen={true} onRequestClose={handleClose}>
        <div className={cx('image-picker__wrapper', { darkmode: darkMode })}>
          <div className="image-picker__header">
            <div className="pull-right">
              {fromMenu ? null : (
                <Button bsStyle="success" onClick={handleChooseImage} disabled={!stateSelectedId}>
                  {i18n('Choose')}
                </Button>
              )}
              <Button onClick={handleClose} style={{ marginLeft: '12px' }}>
                {fromMenu ? i18n('Close') : i18n('Cancel')}
              </Button>
            </div>
            <Nav bsStyle="tabs" activeKey={tabId} onSelect={(k) => setTabId(k)}>
              <NavItem eventKey="1">
                <span className="image-picker__title">{i18n('Image Gallery')}</span>
              </NavItem>
              <NavItem eventKey="2">
                <span className="image-picker__title">{i18n('Upload Files')}</span>
              </NavItem>
              <NavItem eventKey="3">
                <span className="image-picker__title">{i18n('Insert from URL')}</span>
              </NavItem>
            </Nav>
          </div>
          <div className="image-picker__body">
            <Grid fluid>{renderTab()}</Grid>
          </div>
        </div>
      </PlottrModal>
    )
  } else {
    let text = !fromMenu && iconOnly ? null : ` ${i18n('Choose an image')}`
    let button = (
      <Button title={i18n('Choose an image')} onClick={() => setOpen(true)}>
        <Glyphicon glyph="picture" />
        {text}
      </Button>
    )
    if (stateSelectedId && stateSelectedId > 0 && deleteButton) {
      let deleteText = iconOnly ? null : ` ${i18n('Remove')}`
      return (
        <ButtonGroup>
          {button}
          <Button bsStyle="warning" title={i18n('Remove image')} onClick={chooseNoImage}>
            <Glyphicon glyph="ban-circle" />
            {deleteText}
          </Button>
        </ButtonGroup>
      )
    } else {
      return button
    }
  }
}

ImagePicker.propTypes = {
  chooseImage: PropTypes.func,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  darkMode: PropTypes.bool,
  iconOnly: PropTypes.bool,
  modalOnly: PropTypes.bool,
  deleteButton: PropTypes.bool,
  close: PropTypes.func,
  onClose: PropTypes.func,
  images: PropTypes.object,
  actions: PropTypes.object,
  isCloudFile: PropTypes.bool,
  fromMenu: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    images: selectors.imagesSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    isCloudFile: selectors.isCloudFileSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.image, dispatch),
  }
})(ImagePicker)
