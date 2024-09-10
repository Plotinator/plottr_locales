import React, { useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import FormGroup from '../../FormGroup'
import FormControl from '../../FormControl'
import Button from '../../Button'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const HelpHome = () => {
  const {
    platform: { os, mpq, openExternal, createFullErrorReport, handleCustomerServiceCode },
  } = useContext(PlottrComponentsContext)

  const serviceCodeRef = useRef(null)

  const submitCode = () => {
    // @ts-ignore
    const val = serviceCodeRef.current.value
    if (val) {
      handleCustomerServiceCode(val)
      // @ts-ignore
      serviceCodeRef.current.value = ''
    }
  }

  const l = (url) => {
    return () => {
      mpq.push('btn_help_link', { url: url })
      openExternal(`https://${url}`)
    }
  }

  const RenderWebView = () => {
    if (os() === 'unknown') {
      return <iframe src="https://docs.plottr.com" sandbox="allow-forms allow-scripts" />
    }

    return React.createElement('webview', {
      src: 'https://docs.plottr.com',
      allowpopups: 'true',
    })
  }

  const handleCreateErrorReport = () => {
    createFullErrorReport()
  }

  return (
    <div className="dashboard__help">
      <div style={{ flex: 0.16 }}>
        <h1>{t('Help')}</h1>
        <div className="dashboard__help__item links">
          <Button bsSize="large" bsStyle="link" onClick={l('youtube.com/c/Plottr')}>
            {t('Tutorials')}
          </Button>
          <Button
            bsSize="large"
            bsStyle="link"
            onClick={l('docs.plottr.com/frequently-asked-questions/')}
          >
            {t('FAQ')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('plottr.com/demos/')}>
            {t('Demos')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('docs.plottr.com')}>
            {t('Documentation')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('facebook.com/groups/367650870614184')}>
            {t('Facebook Group')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('plottr.com/roadmap')}>
            {t('Request a Feature')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('plottr.com/roadmap/')}>
            {t('Roadmap')}
          </Button>
        </div>
        <hr />
      </div>
      <div style={{ flex: 0.16 }}>
        <h1>{t('Actions')}</h1>
        <div className="dashboard__help__item actions">
          <Button onClick={l('plottr.com/support')}>{t('Contact Support')}</Button>
          <Button onClick={handleCreateErrorReport}>{t('Create an Error Report')}</Button>
          <Button onClick={l('feedback.getplottr.com')}>{t('Give Feedback')}</Button>
          <div>
            <FormGroup controlId="customerServiceCode">
              <FormControl
                type="text"
                placeholder={t('Enter a Customer Service Code')}
                inputRef={(ref) => (serviceCodeRef.current = ref)}
              />
            </FormGroup>
            <Button onClick={submitCode}>{t('Submit')}</Button>
          </div>
        </div>
        <hr />
      </div>
      <div style={{ flex: 0.67 }}>
        <h1>{t('Search Documentation')}</h1>
        {RenderWebView()}
      </div>
    </div>
  )
}

HelpHome.propTypes = {
  isOnWeb: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  isOnWeb: selectors.isOnWebSelector(state),
})

export default connect(mapStateToProps)(HelpHome)
