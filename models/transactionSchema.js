var mongoose = require("mongoose");

var transactionSchema = mongoose.Schema({
  userid: String,
  customerid: String,
  date: String,
  type: {
    type: Number,
    required: true,
    default: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
  mode: {
    type: String,
    default: "cash",
  },
  bill: {
    hasbill: Boolean,
    default: 0,
    billdetails: [
      {
        billdate: String,
        billnumber: Number,
      },
    ],
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

module.exports = mongoose.model("Transaction", transactionSchema);
