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

app.put(
  "/registercust/:custid/:chgcode",
  checkAuthenticated,
  function (req, res) {
    if (req.params.chgcode == 0) {
      custedit();
    }
    if (req.params.chgcode == 1) {
      Customer.findOne(
        { $and: [{ name: req.body.name }, { userid: req.user._id }] },
        function (err, customer) {
          if (err) return err;
          if (customer) res.send("Customer With Entered Name Exists");
          else custedit();
        }
      );
    }
    if (req.params.chgcode == 2) {
      Customer.findOne(
        {
          $and: [{ pagenumber: req.body.pagenumber }, { userid: req.user._id }],
        },
        function (err, customer) {
          if (err) return err;
          if (customer) res.send("Customer With Entered PageNumber Exists");
          else custedit();
        }
      );
    }
    if (req.params.chgcode == 3) {
      Customer.findOne(
        { $and: [{ name: req.body.name }, { userid: req.user._id }] },
        function (err, customer) {
          if (err) return err;
          if (customer) res.send("Customer With Entered Name Exists");
          else {
            Customer.findOne(
              {
                $and: [
                  { pagenumber: req.body.pagenumber },
                  { userid: req.user._id },
                ],
              },
              function (err, customer) {
                if (err) return err;
                if (customer)
                  res.send("Customer With Entered PageNumber Exists");
                else custedit();
              }
            );
          }
        }
      );
    }
    function custedit() {
      console.log("in customer edit");
      Customer.updateOne(
        { _id: req.params.custid },
        {
          $set: {
            name: req.body.name,
            firmname: req.body.firmname,
            pagenumber: req.body.pagenumber,
          },
        }
      )
        .then(function () {
          console.log("Customer Updated"); // Success
          res.send("Customer Updated");
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
);

app.post(
  "/get_customer_list/:userid",
  checkAuthenticated,
  function (req, res, done) {
    Customer.find({ userid: req.params.userid })
      .sort({ pagenumber: 1 })
      .exec(function (err, customers) {
        if (err) return err;
        if (customers) {
          res.status(200);
          console.log(customers);
          res.send(customers);
          res.end();
        }
      });
  }
);

app.post(
  "/get_customer_transactions/:customerid",
  checkAuthenticated,
  function (req, res, done) {
    Transaction.find({
      $and: [{ userid: req.user._id }, { customerid: req.params.customerid }],
    }).exec(function (err, transactions) {
      if (err) return err;
      if (transactions) {
        console.log(req.user._id + " " + req.params.customerid);
        res.status(200);
        res.send(transactions);
        res.end();
      }
    });
  }
);
app.post(
  "/addtransaction/:customerid",
  checkAuthenticated,
  function (req, res, done) {
    console.log(req);
    const transaction = new Transaction({
      userid: req.user._id,
      customerid: req.params.customerid,
      date: new Date(req.body.date).toISOString(),
      amount: req.body.amount,
      type: req.body.type,
    });
    try {
      const a1 = transaction.save();
      res.status(200);
      res.send("Your data is safe with you. FU");
      res.end();
    } catch (err) {
      console.log(err);
    }
  }
);
app.put(
  "/addtransaction/:transactionid",
  checkAuthenticated,
  function (req, res, done) {
    console.log("in transaction edit");
    Transaction.updateOne(
      { _id: req.params.transactionid },
      {
        $set: {
          date: req.body.date,
          amount: req.body.amount,
          type: req.body.type,
        },
      }
    )
      .then(function () {
        console.log("Transaction Updated"); // Success
        res.send("Transaction Updated");
      })
      .catch(function (error) {
        console.log(error);
      });
  }
);

app.delete(
  "/addtransaction/:transactionid",
  checkAuthenticated,
  function (req, res, done) {
    console.log(req);
    Transaction.deleteOne({ _id: req.params.transactionid })
      .then(function () {
        console.log("Transaction deleted"); // Success
        res.send("Transaction With id " + req.params.transactionid + "Deleted");
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
  }
);

app.post(
  "/gettransaction/:transactionid",
  checkAuthenticated,
  function (req, res, done) {
    console.log(req);
    Transaction.findOne({ _id: req.params.transactionid }).exec(function (
      err,
      transaction
    ) {
      if (err) throw err;
      res.send(transaction);
    });
  }
);
/*
app.post('/get_customer_list',function (req,res,done) {      
      Customer.findOne({'userid' : req.user.id},function (err,customer) {
          if(err)
              return err;
          if(customer) {
              var data={
                  confession:userprofile.book.confession,
                  confession1:userprofile.book.confession1,
                  label:userprofile.book.label_con1
              };
              userprofile.save(function (err) {
                  if(err)
                      console.log(err);
              })
              res.send(data);

          }

      })
});