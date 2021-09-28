import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Timeline = (props) => {
  const router = useRouter()
  const { projectId } = router.query

  return <Root {...props} projectId={projectId} />
}

export default Timeline
