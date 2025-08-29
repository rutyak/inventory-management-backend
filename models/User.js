const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fistname: {
      type: String,
      required: [true, "Please enter your firstname"],
    },
    lastname: {
      type: String,
      required: [true, "Please enter your lastname"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: 6,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
