import dynamic from 'next/dynamic'

const AdminPage = dynamic(() => import('../../components/admin/admin-page'), {
  ssr: false,
})

const Admin = (props) => {
  return <AdminPage />
}

export default Admin
