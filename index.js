//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.set("strictQuery", false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Create user Schema
const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

UserSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


// Create user model
const User = mongoose.model("User", UserSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
        .then(() => {
            res.render("secrets");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
        });
});

app.post("/login" , function(req, res){
   const username = req.body.username;
   const password = req.body.password;
   User.findOne({email: username})
         .then((foundUser) => {
             if(foundUser){
                 if(foundUser.password === password){
                     res.render("secrets");
                 }
             } else {
                 res.send("No, Wrong!");
             }
         })
});

connectDB().then(() => {
    app.listen(PORT, function () {
        console.log(`Server started on port ${PORT}`);
    });
});