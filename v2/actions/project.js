export const withFullFileState = (cb) => (dispatch, getState) => {
  cb(getState())
}
