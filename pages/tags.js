import dynamic from 'next/dynamic'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Tags = (props) => <Root {...props} />

export default Tags

