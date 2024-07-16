import animateScrollTo from 'animated-scroll-to'

const mathematicallySensibleOr = (x, y) => {
  if (x || x === 0) return x
  return y
}

class Scrollable {
  getElementRef = () => document.body
  currentAnimation = Promise.resolve()
  completedCallbacks = []
  _scrollTo = (_y, _options) => Promise.resolve(false)

  // @type {number | null}
  targetLeft
  // @type {number | null}
  targetTop

  constructor(getElementRef, scrollTo = animateScrollTo) {
    this.getElementRef = getElementRef
    this._scrollTo = scrollTo
    this.targetLeft = null
    this.targetTop = null
  }

  go(instant = false) {
    return this.currentAnimation.then(() => {
      return this._scrollTo([this.targetLeft, this.targetTop], {
        elementToScroll: this.getElementRef(),
        ...(instant ? { maxDuration: 0 } : {}),
      })
    })
  }

  scrollTo(leftScroll, topScroll, instant = false) {
    const ref = this.getElementRef()
    if (typeof ref?.scrollLeft === 'number' && typeof ref?.scrollTop === 'number') {
      this.targetLeft = mathematicallySensibleOr(leftScroll, ref.scrollLeft)
      this.targetTop = mathematicallySensibleOr(topScroll, ref.scrollTop)

      return this.go(instant)
    } else {
      return Promise.resolve()
    }
  }

  scrollBy(leftDelta, topDelta, instant = false) {
    const ref = this.getElementRef()
    if (typeof ref?.scrollLeft === 'number' && typeof ref?.scrollTop === 'number') {
      this.targetLeft = Math.max(
        0,
        mathematicallySensibleOr(this.targetLeft, ref.scrollLeft) +
          mathematicallySensibleOr(leftDelta, 0)
      )
      this.targetTop = Math.max(
        0,
        mathematicallySensibleOr(this.targetTop, ref.scrollTop) +
          mathematicallySensibleOr(topDelta, 0)
      )

      return this.go(instant)
    } else {
      return Promise.resolve()
    }
  }
}

export default Scrollable
