import dynamic from 'next/dynamic'

const Root = dynamic(() => import('../components/root'), {
  ssr: false,
})

const Notes = (props) => <Root {...props} />

export default Notes

