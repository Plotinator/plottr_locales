import React from 'react'
import t from 'format-message'
import { Button, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap'
import { shell } from 'electron'
import { createErrorReport } from '../../../common/utils/full_error_report'

export default function HelpHome (props) {
  const l = (url) => {
    return () => shell.openExternal(`https://${url}`)
  }
  return <div className='dashboard__help'>
    <div style={{flex: 0.16}}>
      <h1>{t('Links')}</h1>
      <div className='dashboard__help__item links'>
        <Button bsSize='large' bsStyle='link' onClick={l('learn.getplottr.com/')}>{t('Tutorials')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('getplottr.com/docs/frequently-asked-questions/')}>{t('FAQ')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('getplottr.com/demos/')}>{t('Demos')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('getplottr.com/docs')}>{t('Documentation')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('feedback.getplottr.com')}>{t('Give Feedback')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('www.facebook.com/groups/367650870614184')}>{t('Facebook Group')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('getplottr.com/support/?help=Feature%20Request')}>{t('Request a Feature')}</Button>
        <Button bsSize='large' bsStyle='link' onClick={l('roadmap.getplottr.com')}>{t('Roadmap')}</Button>
      </div>
      <hr/>
    </div>
    <div style={{flex: 0.16}}>
      <h1>{t('Actions')}</h1>
      <div className='dashboard__help__item actions'>
        <Button onClick={l('getplottr.com/support/?help=Technical%20Support')}>{t('Report a Problem')}</Button>
        <Button onClick={createErrorReport}>{t('Create an Error Report')}</Button>
        <div>
          <FormGroup controlId='customerServiceCode'>
            <FormControl
              type='text'
              placeholder={t('Enter a Customer Service Code')}
              onChange={(event) => {}}
            />
          </FormGroup>
          <Button>{t('Submit')}</Button>
        </div>
      </div>
      <hr/>
    </div>
    <div style={{flex: 0.67}}>
      <h1>{t('Documentation')}</h1>
      <webview src='https://getplottr.com/docs#bsf-live-search'></webview>
    </div>
  </div>
}