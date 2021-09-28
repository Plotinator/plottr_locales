import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Timeline = (props) => {
  const router = useRouter()
  const { pid } = router.query

  return <Root {...props} projectId={pid} />
}

export default Timeline
