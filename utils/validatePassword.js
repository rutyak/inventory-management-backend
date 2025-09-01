const validator = require("validator");

function validatePassword(req) {
  const { password } = req.body;

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be strong and at least 8 char long");
  }
}

module.exports = validatePassword;
