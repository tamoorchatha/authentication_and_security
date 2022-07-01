const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
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

const User = mongoose.model("User", registerSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const email = req.body.username;
    const password = req.body.password;

    const newUser = new User({
      email: email,
      password: hash,
    });

    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", (req, res) => {
  User.findOne({ email: req.body.username }, (err, found) => {
    if (!err) {
      if (found) {
        bcrypt.compare(req.body.password, found.password, (err, result)=>{
            if (result === true) {
                res.render("secrets");
              }else{
                console.log(err)
              }
        })
      }
    } else {
      console.log(err);
    }
  });
});

app.listen(3000, (req, res) => {
  console.log("your app is running on port 3000");
});
