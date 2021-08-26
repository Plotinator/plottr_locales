import dynamic from 'next/dynamic'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Timeline = (props) => <Root {...props} />

export default Timeline

