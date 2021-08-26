import dynamic from 'next/dynamic'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Characters = (props) => <Root {...props} />

export default Characters

