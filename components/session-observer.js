import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions } from 'pltr/v2'
import { listenToFiles, onSessionChange } from 'plottr_firebase'
import { useRouter } from 'next/router'

const SessionObserver = ({ setUserId, setFileList, setEmailAddress }) => {
  const router = useRouter()
  const { pid } = router.query

  useEffect(() => {
    let fileListener = null
    const sessionListener = onSessionChange((user) => {
      if (!user) {
        const url = `/login${pid ? '?pid=' + pid : ''}`
        window.location.href = url
      } else {
        setUserId(user.uid)
        setEmailAddress(user.email)
        fileListener = listenToFiles(user.uid, (files) => {
          const activeFiles = files.filter(({ deleted }) => !deleted)
          setFileList(activeFiles)
        })
      }
    })
    return () => {
      if (fileListener) fileListener()
      sessionListener()
    }
  }, [])

  return null
}

SessionObserver.propTypes = {
  setUserId: PropTypes.func.isRequired,
}

export default connect(null, {
  setFileList: actions.project.setFileList,
  setUserId: actions.client.setUserId,
  setEmailAddress: actions.client.setEmailAddress,
})(SessionObserver)
