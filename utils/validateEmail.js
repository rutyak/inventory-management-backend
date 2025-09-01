const validator = require("validator");

function validateEmail(req) {
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  }
}

module.exports = validateEmail;
