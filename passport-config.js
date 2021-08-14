var LocalStrategy   = require('passport-local').Strategy;
const User = require('./models/userSchema')
const Customer = require('./models/customerSchema')

module.exports = function(passport,bcrypt) {

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
            // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'username' :  email }, async function(err, user) {
        // if there are any errors, return the error
        if (err){
            return done(err);
        }
            

        // check to see if theres already a user with that email
        if (user) {
           return done(null, false, { message: 'A User with the following Email/Username is Already Present' })
        } else {               const hashedPassword = await bcrypt.hash(password, 10)
            var newUser            = new User();

            newUser.name    = req.body.name;
            newUser.firmname = req.body.firmname;
            newUser.username    = email;
            newUser.password = hashedPassword;
            newUser.sub    = false;
            newUser.save(function(err) {
                if (err) {
                    console.log(err);
                }
                return done(null, newUser);
            });
        }
        
      });

    });
  
  }));
  
  
  
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form
  
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists