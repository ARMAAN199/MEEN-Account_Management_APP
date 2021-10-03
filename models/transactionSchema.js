var mongoose = require('mongoose');

var transactionSchema = mongoose.Schema({
    userid: String,
    customerid: String,
    date:String,
    type: {
        type: Number,
        required: true,
        default: 0    
    },
    amount: {
        type: Number,
        required: true        
    }, 