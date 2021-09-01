const mongoose = require("mongoose");
const validator = require("validator");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

mongoose.connect(
  "mongodb+srv://qwer1234:qwer1234@cluster0.xa6fp.mongodb.net/deakinDB",
  {
    useNewUrlParser: true,
  }
);

const AccountSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("The email is not valid!");
      }
    },
  },
  password: String,
  address: String,
  city: String,
  region: String,
  postalCode: String,
  phone: Number,
});
const AccountModel = mongoose.model("Account", AccountSchema);

const app = express();
app.use(express.static("public"));
app.use(bodyParser());

app.get("/", async (req, res) => {
  res.redirect("./custsignin.html");
});

app.post("/accounts", async (req, res) => {
  try {
    const account = req.body;
    if (account.password.length < 8) {
      throw new Error("The password must be at least 8 characters!");
    }
    if (account.password !== account.confirmPassword) {
      throw new Error("Two password are not same!");
    }
    account.password = bcrypt.hashSync(account.password, salt);
    await AccountModel.create(account);
    res.redirect("/custsignin.html?message=Create Account successfully!");
  } catch (err) {
    res.redirect("/custsignup.html?message=" + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AccountModel.findOne({ email });
    if (!user) {
      throw Error("User not exists!");
    }
    const matchedPassword = bcrypt.compareSync(password, user.password);
    if (!matchedPassword) {
      throw Error("Password is not right!");
    }
    res.redirect("/custtask.html");
  } catch (err) {
    res.redirect("/custsignin.html?message=" + err.message);
  }
});

app.listen(process.env.PORT || 3001);
