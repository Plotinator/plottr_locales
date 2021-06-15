import dynamic from 'next/dynamic'

import { serverOnlySessionCookie } from '../lib/session'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Timeline = (props) => <Root {...props} />

export default Timeline

export async function getServerSideProps({ req }) {
  const sessionCookie = serverOnlySessionCookie(req)
  if (sessionCookie && sessionCookie.email) {
    return {
      props: {
        email: sessionCookie.email,
      },
    }
  }
  return { props: {} }
}
