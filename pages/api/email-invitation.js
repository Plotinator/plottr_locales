export default (req, res) => {
  console.log("I totally just sent an email.  Don't worry about it!")
  res.status(200).json({ result: 'sent' })
}
