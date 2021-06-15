import dynamic from 'next/dynamic'

import { serverOnlySessionCookie } from '../lib/session'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Project = (props) => <Root {...props} />

export default Project

export async function getServerSideProps({ req }) {
  const sessionCookie = serverOnlySessionCookie(req)
  console.log('session', sessionCookie)
  if (sessionCookie) {
    return {
      props: {
        email: sessionCookie.email,
      },
    }
  }
  return { props: {} }
}
