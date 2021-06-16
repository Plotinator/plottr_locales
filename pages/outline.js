import dynamic from 'next/dynamic'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Outline = (props) => <Root {...props} />

export default Outline

