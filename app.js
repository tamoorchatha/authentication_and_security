const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "this is my secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/secretsDB");

const registerSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, "plz enter the gmail"],
//   },
//   password: {
//     type: String,
//     required: [true, "plz enter the password"],
//   },
    email: String,
    password: String,
});

registerSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", registerSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.post("/register", (req, res) => {
  User.register({username: req.body.username}, req.body.password, (err, newUser)=>{
    if(err){
        console.log(err);
        res.redirect("/register")
    }else{
        passport.authenticate("local")(req, res, ()=>{
            res.redirect("/secrets")
        })
    }
  })
});

app.post("/login", (req, res) => {
    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });

    req.logIn(user, (err)=>{
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets")
            })
        }
    })
});

app.listen(3000, (req, res) => {
  console.log("your app is running on port 3000");
});
