import dynamic from 'next/dynamic'

import { serverOnlySessionCookie } from '../lib/session'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Characters = (props) => <Root {...props} />

export default Characters

export async function getServerSideProps({ req }) {
  const sessionCookie = serverOnlySessionCookie(req)
  if (sessionCookie) {
    return {
      props: {
        email: sessionCookie.email,
      },
    }
  }
  return { props: {} }
}
