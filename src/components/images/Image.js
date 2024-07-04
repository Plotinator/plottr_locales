import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'

import { actions, selectors } from 'wired-up-pltr'

import { Spinner } from '../Spinner'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const Image = ({ size, shape, image, responsive, className, imageCache, cacheImage }) => {
  const {
    platform: {
      storage: { resolveToPublicUrl },
    },
  } = useContext(PlottrComponentsContext)

  const [imageSrc, setImageSrc] = useState(null)

  const publicImageUrl = imageCache[image?.path]?.publicUrl

  const isOnStorage = () => {
    return image?.path?.startsWith('storage://')
  }

  useEffect(() => {
    if (!publicImageUrl && image?.path && isOnStorage()) {
      resolveToPublicUrl(image?.path).then((imageUrl) => {
        cacheImage(image?.path, imageUrl)
        // @ts-ignore
        setImageSrc(imageUrl)
      })
    }
  }, [cacheImage, imageCache, resolveToPublicUrl, publicImageUrl, image?.path])

  useEffect(() => {
    setImageSrc(null)
  }, [setImageSrc, image])

  useEffect(() => {
    if (!image || imageSrc) return

    if (isOnStorage()) {
      setImageSrc(publicImageUrl)
    } else {
      setImageSrc(image.data)
    }
  }, [image, setImageSrc, imageSrc])

  useEffect(() => {
    if (!image && imageSrc) {
      setImageSrc(null)
    }
  }, [image, imageSrc])

  if (!image && !imageSrc) return null
  else if (!image || !imageSrc) return <Spinner />

  if (responsive) {
    return <img className={cx('img-responsive', className)} src={imageSrc} />
  } else {
    let klasses = cx(`image-${shape}-${size}`, className)
    return <div className={klasses} style={{ backgroundImage: `url(${imageSrc})` }} />
  }
}

Image.propTypes = {
  imageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(['xl', 'large', 'small', 'xs']),
  shape: PropTypes.oneOf(['circle', 'rounded', 'square']),
  responsive: PropTypes.bool,
  className: PropTypes.string,
  image: PropTypes.object,
  imageCache: PropTypes.object.isRequired,
  cacheImage: PropTypes.func.isRequired,
}

const mapStateToProps = (state, ownProps) => {
  return {
    image: selectors.imageByIdSelector(
      state,
      // @ts-ignore
      ownProps.imageId
    ),
    imageCache: selectors.imageCacheSelector(state),
  }
}

export default connect(mapStateToProps, {
  cacheImage: actions.imageCache.cacheImage,
})(Image)
