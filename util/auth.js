const jwt = require("jsonwebtoken")

const createJwtToken = (userID) => {
  return jwt.sign({ userID },"kiendao2001", {
    expiresIn: '10h' 
  })
}

module.exports = { createJwtToken }