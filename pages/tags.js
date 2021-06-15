import dynamic from 'next/dynamic'

import { serverOnlySessionCookie } from '../lib/session'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Tags = (props) => <Root {...props} />

export default Tags

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
