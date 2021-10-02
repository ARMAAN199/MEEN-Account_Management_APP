var mongoose = require("mongoose");

var customerschema = mongoose.Schema({
  userid: String,
  mastername: String,
  name: {
    type: String,
    required: true,
  },
  firmname: {
    type: String,
    required: true,
  },
  pagenumber: {
    type: Number,
    required: true,
    default: 0,
  },
  initialBal: {
    type: Number,
    required: true,
    default: 0,
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

module.exports = mongoose.model("Customer", customerschema);
