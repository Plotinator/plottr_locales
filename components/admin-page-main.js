import { PropTypes } from 'prop-types'

const AdminPageMain = ({ section }) => {
  const sectionBody = (() => {
    switch (section) {
      case 'fixes': {
        return (
          <>
            <h1>Fixes</h1>
            <p>Some fixes... TBD.</p>
          </>
        )
      }
      case 'list-files': {
        return (
          <>
            <h1>List Files</h1>
            <p>Search for a user&apos;s files</p>
          </>
        )
      }
      default: {
        return <h1>Unknown section</h1>
      }
    }
  })()

  return (
    <div className="admin-page-main">
      {sectionBody}
      <style jsx>{`
        .admin-page-main {
          grid-area: main;
          display: flex;
          padding-left: 3em;
          flex-direction: column;
          align-items: start;
          justify-content: start;
        }
      `}</style>
    </div>
  )
}

AdminPageMain.propTypes = {
  section: PropTypes.string.isRequired,
}

export default AdminPageMain
