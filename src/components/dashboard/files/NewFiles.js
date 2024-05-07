import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { IoIosBrowsers } from '@react-icons/all-files/io/IoIosBrowsers'
import { IoIosDocument } from '@react-icons/all-files/io/IoIosDocument'
import { BiImport } from '@react-icons/all-files/bi/BiImport'
import { VscCloudUpload } from '@react-icons/all-files/vsc/VscCloudUpload'
import cx from 'classnames'

import { t } from 'plottr_locales'

import MenuItem from '../../MenuItem'
import Dropdown from '../../Dropdown'
import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import { checkDependencies } from '../../checkDependencies'

const NewFilesConnector = (connector) => {
  const {
    platform: {
      file: { openExistingFile },
      showErrorBox,
      log,
      mpq,
      os,
      errorReporter: { getInstance },
    },
  } = connector
  checkDependencies({ openExistingFile, showErrorBox, log, mpq, os, getInstance })

  const NewFiles = ({
    activeView,
    toggleView,
    doSnowflakeImport,
    doScrivenerImport,
    doWordImport,
    isOnWeb,
    isInOfflineMode,
    doCreateNewProject,
  }) => {
    const wrapFunc = (type, func) => {
      return () => {
        mpq.push(`btn_${type}`)
        try {
          func()
        } catch (error) {
          getInstance().then((errorReporter) => {
            errorReporter.error(type, error)
          })
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    const fromExisting = () => {
      if (isInOfflineMode) return

      wrapFunc('open_existing', openExistingFile)()
    }

    useEffect(() => {
      const fromTempl = document.addEventListener('from-template', () => toggleView('templates'))
      const openEx = document.addEventListener('open-existing', fromExisting)
      return () => {
        document.removeEventListener('from-template', fromTempl)
        document.removeEventListener('open-existing', openEx)
      }
    }, [])

    return (
      <>
        <Grid fluid className="dashboard__new-files">
          <Row>
            <Col xs={isOnWeb ? 4 : 3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  disabled: isInOfflineMode,
                })}
                onClick={() => doCreateNewProject()}
              >
                <IoIosDocument />
                <div>{t('Create Blank Project')}</div>
              </div>
            </Col>
            <Col xs={isOnWeb ? 4 : 3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  active: activeView == 'templates',
                  disabled: isInOfflineMode,
                })}
                onClick={() => toggleView('templates')}
              >
                <IoIosBrowsers />
                <div>{t('Create From Template')}</div>
              </div>
            </Col>
            <Col xs={isOnWeb ? 4 : 3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  disabled: isInOfflineMode,
                })}
                onClick={fromExisting}
              >
                <VscCloudUpload />
                <div>
                  {os() == 'unknown' ? t('Upload Existing Project') : t('Open Existing File')}
                </div>
              </div>
            </Col>
            {isOnWeb ? null : (
              <Col xs={3}>
                <Dropdown
                  id="new-files-dropdown"
                  className={cx('dashboard__new-files__item icon import-file', {
                    active: activeView == 'import',
                    disabled: isInOfflineMode,
                  })}
                  disabled={isInOfflineMode}
                >
                  <Dropdown.Toggle noCaret>
                    <BiImport />
                    <div>{t('Import File')}</div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <MenuItem onSelect={doScrivenerImport}>{t('Scrivener')}</MenuItem>
                    <MenuItem onSelect={doWordImport}>{t('Word (docx)')}</MenuItem>
                    <MenuItem onSelect={doSnowflakeImport}>{t('Snowflake Pro')}</MenuItem>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
          </Row>
        </Grid>
      </>
    )
  }

  NewFiles.propTypes = {
    activeView: PropTypes.string,
    toggleView: PropTypes.func,
    doSnowflakeImport: PropTypes.func.isRequired,
    doScrivenerImport: PropTypes.func.isRequired,
    doCreateNewProject: PropTypes.func.isRequired,
    doWordImport: PropTypes.func.isRequired,
    isOnWeb: PropTypes.bool,
    isInOfflineMode: PropTypes.bool,
  }

  return NewFiles
}

export default NewFilesConnector
