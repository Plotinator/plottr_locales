import { createBrowserHistory } from 'history'

export const history = process.browser
  ? createBrowserHistory()
  : { listen: () => {}, location: { pathname: '' }, createHref: () => {} }
