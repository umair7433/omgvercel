const express = require('express');
const app = express();
require('dotenv').config();
const path = require("path")
const hbs = require("hbs")

//requires-END

// Configure body-parser to parse JSON and form data
app.use(express.json()); // To parse JSON
app.use(express.urlencoded({ extended: false })); // To parse form data



const flash = require('express-flash');

const port = process.env.PORT || 3000;
const dbConnectionString = process.env.DB_CONNECTION_STRING;
const apiKey = process.env.API_KEY;
require("./db")
//app use
//set partials and hbs view engine
app.use(express.static('public'));

const views = path.join(__dirname, "/views")
app.set('views', views);
app.set("view engine", "hbs")
hbs.registerPartials(path.join(__dirname, '/views/partials'));


//databse connection
app.get('/', (req, res) => {
  res.render('index.hbs');

});




const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'thisisthesessionasdfn@#I$IOHO#IHOH#$#$',
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



passport.use(new GoogleStrategy({
  clientID: "1011184896532-rujq6aq7vibcj2036qigsjk8u36la3rh.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/auth/google/callback"
},
  function (accessToken, refreshToken, profile, cb) {
    cb(null, profile)
  }
))



passport.serializeUser(function (user, cb) {
  cb(null, user)
})
passport.deserializeUser(function (user, cb) {
  cb(null, user)
})




const UserSchema = require("./modle/userSchema")

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async function (req, res) {
  const user = req.user
  const username = user.displayName
  const userphoto = user.photos[0].value
  const useremail = user.emails[0].value
  try {
    const userfind = await UserSchema.findOne({ email: useremail })

    if (userfind) {
      passport.serializeUser((user, done) => {
        done(null, user);
      });

      // Deserialize user information from the cookie
      passport.deserializeUser((obj, done) => {
        done(null, obj);
      });
      const userinfo = { username, userphoto, useremail }
      res.cookie('user',userinfo);
      res.redirect("/dashboard")
    }
    else {
      const newuser = new UserSchema({
        name: username,
        email: useremail
      })
      const userdata = await newuser.save()
      passport.serializeUser((user, done) => {
        done(null, user);
      });

      // Deserialize user information from the cookie
      passport.deserializeUser((obj, done) => {
        done(null, obj);
      });
      const userinfo = { username, userphoto, useremail }
      res.cookie('user',userinfo);
      res.redirect("/dashboard")
    }
  } catch (e) {
    res.redirect("/signin")
  }

});




const mainRouter = require("./router/mainrouter")
app.use(mainRouter)



app.listen(port, () => {
  console.log(`server started at port ${port}`);
})