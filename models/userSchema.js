const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  firmname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  sub: {
    type: Boolean,
    required: true,
    default: false,
  },
  sub2: {
    type: String,
    required: false,
  },
  sub3: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("User", userSchema);
