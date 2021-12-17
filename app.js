//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5")
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// app.use(session({
//   secret: "Secret to passwords.",
//   resave: false,
//   saveUninitialized: false
// }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDb",{useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
// mongoose-encryption:
// userSchema.plugin(encrypt, {secret : process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
})
app.get("/register", function(req,res){
  res.render("register");
});

app.get("/basic", function(req, res){
  res.render("basic");
});

app.get("/contact", function(req, res){
  res.render("contact");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/details", function(req, res){
  res.render("details");
});

app.get("/reports", function(req, res){
  res.render("reports");
});


app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if(err){
      console.log(err);
    }else {
      if(foundUsers){
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
  }
});
});
  // if(req.isAuthenticated()){
  //   res.render("submit");
  // } else {
  //   res.redirect("/login");
  // }


app.get("/submit", (req,res)=>{
  if(req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
})

app.post("/submit",(req,res)=>{
  const submittedSecret = req.body.secret;
  User.findById(req.user.id,(err, foundUser)=>{
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        foundUser.secret = submittedSecret;
        foundUser.save(()=>{
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.post("/login", function(req,res){
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  //   const newUser= new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //   newUser.save(function(err){
  //     if(err){
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     }
  //   });
  // });
  User.login({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/home");
    } else {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/details");
      });
    }
  })
})

app.post("/register", function(req,res){
  // const username = req.body.username;
  // const password = req.body.password;
  // User.findOne({email: username},function(err, foundUser){
  //   if(err){
  //     console.log(err);
  //   } else {
  //     if(foundUser){
  //       bcrypt.compare(password, foundUser.password, function(err, result){
  //           if(result=== true){
  //             res.render("secrets");
  //           } else {
  //             return err;
  //           }
  //       });
  //     }
  //   }
  // });
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.register(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/details");
      });
    }
  })
});

app.listen(3000, function(){
  console.log("Server started");
});
