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
});

module.exports = mongoose.model("Customer", customerschema);
