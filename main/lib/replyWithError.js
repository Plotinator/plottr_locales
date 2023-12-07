const replyWithError = (replyChannel, error) => {
  if (error.message !== 'Object has been destroyed') {
    try {
      error.sender.send(replyChannel, { error: error.message })
    } catch (_error) {
      // Assume: the error was logged before trying to let the sending
      // window know that there was an error.
    }
  }
}

export default replyWithError
