import React, { useState, useEffect, useCallback, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FaBold } from '@react-icons/all-files/fa/FaBold'
import { FaItalic } from '@react-icons/all-files/fa/FaItalic'
import { FaUnderline } from '@react-icons/all-files/fa/FaUnderline'
import { FaQuoteLeft } from '@react-icons/all-files/fa/FaQuoteLeft'
import { FaListOl } from '@react-icons/all-files/fa/FaListOl'
import { FaListUl } from '@react-icons/all-files/fa/FaListUl'
import { FaStrikethrough } from '@react-icons/all-files/fa/FaStrikethrough'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import ButtonGroup from '../ButtonGroup'
import ButtonToolbar from '../ButtonToolbar'
import Floater from '../PlottrFloater'
import IndentParagraphButton from './IndentParagraphButton'
import DedentParagraphButton from './DedentParagraphButton'
import { addColorMark } from './ColorButton'
import ImagesButton from './ImagesButton'
import { MarkButton } from './MarkButton'
import BlockButton from './BlockButton'
import { LinkButton } from './LinkButton'
import { ColorButton } from './ColorButton'
import { FontsButton } from './FontsButton'
import MiniColorPicker from '../MiniColorPicker'
import { FontSizeChooser } from './FontSizeChooser'
import { addRecent, getFonts, getRecent } from './fonts'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const boldIcon = <FaBold />
const italicIcon = <FaItalic />
const underlineIcon = <FaUnderline />
const strikeThroughIcon = <FaStrikethrough />

const ToolBar = ({ editor, darkMode, settings, focusEditor }) => {
  const {
    platform: {
      os,
      log,
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const errorReportingLogger = {
    info: log.info,
    warn: log.warn,
    error: (message, error) => {
      getInstance().then((errorReporter) => {
        errorReporter.error(message, error)
      })
    },
  }

  const currentFont = settings.user.fonts?.rce?.defaultFont
  const [showColorPicker, toggleColorPicker] = useState(false)
  const [fonts, setFonts] = useState(null)
  const [recentFonts, setRecentFonts] = useState(currentFont ? [currentFont] : null)
  const defaultFontSize = settings.user.fontSize

  const changeColor = useCallback(
    (color) => {
      addColorMark(editor, color)
      focusEditor(editor.selection)
      toggleColorPicker(false)
    },
    [toggleColorPicker]
  )

  useEffect(() => {
    // @ts-ignore
    if (!fonts) setFonts(getFonts(os()))
    setRecentFonts(getRecent())
  }, [currentFont])

  const closeColorPicker = useCallback(() => {
    toggleColorPicker(false)
  }, [toggleColorPicker])

  const miniColorPickerOverlay = () => {
    return <MiniColorPicker chooseColor={changeColor} close={closeColorPicker} />
  }

  return (
    <div className={cx('slate-editor__toolbar-wrapper', { darkmode: darkMode })}>
      <ButtonToolbar>
        <ButtonGroup>
          <FontsButton
            currentSetting={currentFont}
            fonts={fonts || []}
            recentFonts={recentFonts || []}
            addRecent={addRecent}
            editor={editor}
            logger={errorReportingLogger}
          />
          <FontSizeChooser
            editor={editor}
            defaultFontSize={defaultFontSize}
            logger={errorReportingLogger}
          />
          <MarkButton mark="bold" icon={boldIcon} editor={editor} logger={errorReportingLogger} />
          <MarkButton
            mark="italic"
            icon={italicIcon}
            editor={editor}
            logger={errorReportingLogger}
          />
          <MarkButton
            mark="underline"
            icon={underlineIcon}
            editor={editor}
            logger={errorReportingLogger}
          />
          <MarkButton
            mark="strike"
            icon={strikeThroughIcon}
            editor={editor}
            logger={errorReportingLogger}
          />
          <Floater
            component={miniColorPickerOverlay}
            open={showColorPicker}
            placement="bottom"
            hideArrow
            rootClose
            onClose={closeColorPicker}
          >
            <ColorButton
              toggle={() => toggleColorPicker(!showColorPicker)}
              editor={editor}
              logger={errorReportingLogger}
            />
          </Floater>
          <BlockButton
            format="heading-one"
            icon={t('Title')}
            editor={editor}
            logger={errorReportingLogger}
          />
          <BlockButton
            format="heading-two"
            icon={t('Subtitle')}
            editor={editor}
            logger={errorReportingLogger}
          />
          <BlockButton
            format="block-quote"
            icon={<FaQuoteLeft />}
            editor={editor}
            logger={errorReportingLogger}
          />
          <BlockButton
            format="numbered-list"
            icon={<FaListOl />}
            editor={editor}
            logger={errorReportingLogger}
          />
          <BlockButton
            format="bulleted-list"
            icon={<FaListUl />}
            editor={editor}
            logger={errorReportingLogger}
          />
          <IndentParagraphButton editor={editor} logger={errorReportingLogger} />
          <DedentParagraphButton editor={editor} logger={errorReportingLogger} />
          <LinkButton editor={editor} logger={errorReportingLogger} />
          <ImagesButton editor={editor} />
        </ButtonGroup>
      </ButtonToolbar>
    </div>
  )
}

ToolBar.propTypes = {
  focusEditor: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  settings: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  darkMode: selectors.isDarkModeSelector(state),
  settings: selectors.appSettingsSelector(state),
})

export default React.memo(connect(mapStateToProps)(ToolBar))
