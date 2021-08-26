import dynamic from 'next/dynamic'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Project = (props) => <Root {...props} />

export default Project

