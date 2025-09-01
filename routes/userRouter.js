const express = require("express");
const bcrypt = require("bcryptjs");
const userRouter = express.Router();
const User = require("../models/User.js");
const validatePassword = require("../utils/validatePassword.js");

userRouter.patch("/update/:id", async (req, res) => {
  try {
    validatePassword(req);

    const { id } = req.params;
    const { firstname, lastname, email, password } = req.body;

    const name = [firstname, lastname].filter(Boolean).join(" ");

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
});

module.exports = userRouter;
