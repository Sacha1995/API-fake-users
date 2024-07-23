const express = require("express");
const asyncMySQL = require("../mysql/connection");
const app = express.Router();
const {
  editSchema,
  addSchema,
  searchSchema,
  loginSchema,
  signupSchema,
} = require("../validation/joi");
const { genToken, checkToken } = require("../utils");
const {
  addUser,
  getId,
  addToken,
  setProfession,
  selectAll,
  updateInfo,
} = require("../mysql/queries");
const sha256 = require("sha256");

//*********************************sign up**********************************//
app.post("/signup", async (req, res) => {
  let lastId = req.users[req.users.length - 1].id;
  const newId = lastId + 1;

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send("No input");
    return;
  }

  //checks if info is valid
  const { error } = signupSchema.validate(req.body, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    return res.status(400).json({ status: 0, error: errorArr });
  }

  //make the password sha and add extra bit to make it stronger
  req.body.password = sha256(process.env.SALT + req.body.password);

  //add extra info
  req.body.role = "customer";

  //check for errors
  const query = addUser(
    req.body.email,
    req.body.password,
    req.body.name,
    req.body.role
  );
  try {
    await asyncMySQL(query);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .send({ status: 0, message: "This email already has an account" });
    } else {
      res.status(400).send({
        status: 0,
        message: e,
      });
    }
    return;
  }

  res.send({ status: 1 });
});

//***********************************login***********************************//
app.post("/login", async (req, res) => {
  //validate input from user
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    return res.status(400).json({ status: 0, error: errorArr });
  }

  //make password safe
  const inputPassword = sha256(process.env.SALT + req.body.password);

  // get user id by email and password
  try {
    const results = await asyncMySQL(getId(req.body.email, inputPassword));

    if (!results) {
      throw new Error("No user found with this email/password combo");
    }

    //add a token
    const token = genToken();

    await asyncMySQL(addToken(results[0].id, token));
    res.send({ status: 1, token: token });
    return;
  } catch (e) {
    res.status(400).send({ status: 0, reason: "Invalid email/password combo" });
    return;
  }
});

//*******************************change data*******************************//
app.put("/edit", checkToken, async (req, res) => {
  if (!req.body) {
    res.status(400).send("No input");
    return;
  }

  // stop them changin password like this
  if (req.body.password) {
    res
      .status(400)
      .send(
        "You can't change your password like this. Request a password changing link"
      );
    return;
  }

  //validate input
  const { error } = editSchema.validate(req.body, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    return res.status(400).json({ status: 0, error: errorArr });
  }

  //update timestamp
  const now = new Date();
  req.body.updatedAt = now.toISOString();

  const keys = Object.keys(req.body);
  console.log(req.body);

  try {
    await asyncMySQL(updateInfo(req.body, req.authedUserId));
    return res.send({ status: 1 });
  } catch (e) {
    return res.status(400).send({ status: 0, message: e.message });
  }
});

//*******************************add data*******************************//
app.patch("/", checkToken, async (req, res) => {
  if (!req.body) {
    res.status(400).send("No input");
    return;
  }

  //check if they have not tried to add something that is not allowed
  const key = Object.keys(req.body);
  if (key[0] !== "profession") {
    res
      .status(400)
      .send("not allowed to add this data. You can only add a profession");
  }

  // check what is being send in
  const { error } = addSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ status: 0, error: error.message });
  }

  //update timestamp
  const now = new Date();
  req.body.updatedAt = now.toISOString();

  try {
    await asyncMySQL(
      setProfession(req.authedUserId, req.body.profession, req.body.updatedAt)
    );
  } catch (e) {
    res.status(400).send({
      status: 0,
      message: e.message,
    });
    return;
  }

  res.send({ status: 1 });
});

module.exports = app;

//*******************************get all data*******************************//
//this is naughty now, should not be able to get this info
//http://localhost:6001/users for all the users
//choose what to filter it with
app.get("/ALL", async (req, res) => {
  try {
    const results = await asyncMySQL(selectAll());
    res.send(results);
  } catch (e) {
    res.status(400).send({
      status: 0,
      message: e,
    });
    return;
  }
});
