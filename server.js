if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const Transaction = require("./models/transactionSchema");
const objparser = require("bson-objectid");
const Customer = require("./models/customerSchema");
const url =
  "mongodb+srv://armaan199:abcd@cluster0.0gdku.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var config = require("./passport-config")(passport, bcrypt); // pass passport for configuration

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

app.use(express.static(__dirname + "/public"));
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: "process.env.SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { user: req.user });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local-login", {
    successRedirect: "/", // redirect to the secure profile section
    failureRedirect: "/login", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }),
  function (req, res) {
    //if(req.user.local.isprofile=='no')
    //    res.redirect('/profile')
    //else {
    res.render("profile_book.ejs", {
      user: req.user, // get the user out of session and pass to template
    });
  }
  //}
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post(
  "/register",
  passport.authenticate("local-signup", {
    successRedirect: "/", // redirect to the secure profile section
    failureRedirect: "/register", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }),
  function (req, res) {
    res.render("/login", {
      user: req.user, // get the user out of session and pass to template
    });
  }
);

app.get("/registercust", checkAuthenticated, (req, res) => {
  res.render("customer_register.ejs");
});

app.delete("/registercust/:custid", checkAuthenticated, function (req, res) {
  Customer.deleteOne({ _id: req.params.custid }, function (err) {
    if (err) return err;
    console.log("Successful deletion of customer id" + req.params.custid);
    Transaction.deleteMany({ customerid: req.params.custid })
      .then(function () {
        console.log("Transactions also deleted"); // Success
        res.send("Customer And Transactions Deleted");
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
  });
});

app.post(
  "/registercust",
  checkAuthenticated,
  passport.authenticate("local-custsignup", {
    successRedirect: "/", // redirect to the secure profile section
    failureRedirect: "/registercust", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }),
  function (req, res) {
    res.render("/login", {
      user: req.user, // get the user out of session and pass to template
    });
  }
);

app.put('/registercust/:custid/:chgcode', checkAuthenticated, function (req,res) { 
  if(req.params.chgcode == 0){
      custedit()
  }
  if (req.params.chgcode == 1){
    Customer.findOne( {$and: [ { 'name' :  req.body.name } , {'userid' : req.user._id} ]} , function(err, customer){
      if (err) return err;
      if (customer) res.send("Customer With Entered Name Exists");
      else custedit()
    })
  }
  if (req.params.chgcode == 2){
    Customer.findOne( {$and: [ { 'pagenumber' :  req.body.pagenumber } , {'userid' : req.user._id} ]} , function(err, customer){
      if (err) return err;
      if (customer) res.send("Customer With Entered PageNumber Exists");
      else custedit()
    })
  }
  if (req.params.chgcode == 3){
    Customer.findOne( {$and: [ { 'name' :  req.body.name } , {'userid' : req.user._id} ]} , function(err, customer){
      if (err) return err;
      if (customer) res.send("Customer With Entered Name Exists");
      else {
        Customer.findOne( {$and: [ { 'pagenumber' :  req.body.pagenumber } , {'userid' : req.user._id} ]} , function(err, customer){
          if (err) return err;
          if (customer) res.send("Customer With Entered PageNumber Exists");
          else custedit()
        })
      }
    })
  }