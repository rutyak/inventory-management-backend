const validator = require("validator");

function validateSignup(req) {
  const { name, password, email } = req.body;

  if (!name) {
    throw new Error("Name required");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be strong and at least 8 char long");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  }
}

module.exports = validateSignup;
