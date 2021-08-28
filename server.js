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


app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { user: req.user })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})



app.post('/login', checkNotAuthenticated, passport.authenticate('local-login', {
        
      successRedirect : '/', // redirect to the secure profile section
