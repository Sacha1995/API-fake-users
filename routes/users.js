const express = require("express");
const app = express.Router();
const {
  editSchema,
  addSchema,
  searchSchema,
  loginSchema,
  signupSchema,
} = require("../validation/joi");
const { genToken, checkToken } = require("../utils");
const sha256 = require("sha256");

//*********************************sign up**********************************//
app.post("/signup", (req, res) => {
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

  //checks if there is already a user with that email
  const indexOf = req.users.findIndex((user) => {
    return user.email.toLowerCase() === req.body.email.toLowerCase();
  });

  if (indexOf >= 0) {
    res.status(400).send({ status: 0, reason: "email already exist" });
    return;
  }

  //make the password sha and add extra bit to make it stronger
  req.body.password = sha256(process.env.SALT + req.body.password);

  //add extra info
  req.body.id = newId;
  const now = new Date();
  req.body.creationAt = now.toISOString();
  req.body.updateAt = now.toISOString();
  req.body.role = "customer"; //everyone signs up as customer, can later change it to admin

  //add user and return status
  req.users.push(req.body);
  res.send({ status: 1 });
});

//***********************************login***********************************//
app.post("/login", (req, res) => {
  //validate input from user
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    return res.status(400).json({ status: 0, error: errorArr });
  }

  const inputPassword = sha256(process.env.SALT + req.body.password);

  //check if the password and email match with what is in the system
  const user = req.users.find((user) => {
    return (
      user.email.toLowerCase() === req.body.email.toLowerCase() &&
      user.password === inputPassword
    );
  });

  if (!user) {
    res.status(400).send({ status: 0, reason: "invalid email/password combo" });
    return;
  }

  //generate, store and send token
  const token = genToken();
  user.tokens = user.tokens ? [...user.tokens, token] : [token];
  res.send({ status: 1, token: token });
});

//*******************************change data*******************************//
app.put("/edit", checkToken, (req, res) => {
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
  req.body.updateAt = now.toISOString();

  //get index so you can change it in offical data
  const indexOf = req.users.findIndex((user) => {
    return user.id === req.authedUser.id;
  });

  if (indexOf === -1) {
    res.status(400).send("We could not find your info to change");
    return;
  }

  // //update the info
  req.users[indexOf] = { ...req.authedUser, ...req.body };
  res.send({ status: 1 });
});

//*******************************add data*******************************//
app.patch("/", checkToken, (req, res) => {
  if (!req.body) {
    res.status(400).send("No input");
    return;
  }

  const keys = Object.keys(req.body);

  //check if they have not tried to add something that is not allowed
  keys.forEach((key) => {
    if (
      key !== "profession" &&
      key !== "yearsOfExperience" &&
      key !== "company"
    ) {
      res
        .status(400)
        .send(
          "not allowed to add this data. You can only add profession, yearsOfExperience and company"
        );
    }
  });

  //destructure user input
  let { profession, yearsOfExperience, company } = req.body;

  //create array of the input
  const input = {
    profession: profession ? profession : "",
    yearsOfExperience: yearsOfExperience ? yearsOfExperience : "",
    company: company ? company : "",
  };

  // check what is being send in
  const { error } = addSchema.validate(input, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    return res.status(400).json({ status: 0, error: errorArr });
  }

  //loop through the input and add if it has a value
  for (const key in input) {
    const value = input[key];
    if (value) {
      req.authedUser = { ...req.authedUser, [key]: value };
    }
  }

  //update timestamp
  const now = new Date();
  req.authedUser.updateAt = now.toISOString();

  //get index so you can change it in offical data
  const indexOf = req.users.findIndex((user) => {
    return user.id === req.authedUser.id;
  });

  if (indexOf === -1) {
    res.status(400).send("We could not find your info to add");
    return;
  }

  // //update the info
  req.users[indexOf] = req.authedUser;
  res.send({ status: 1 });
});

//******************************get user info******************************//
app.get("/", checkToken, (req, res) => {
  res.send({ user: req.authedUser });
});

module.exports = app;

//this is naughty now, should not be able to get this info
//http://localhost:6001/users for all the users
//choose what to filter it with
app.get("/ALL/:name?/:role?/:email?", (req, res) => {
  // always first make a copy
  let _users = [...req.users];

  //destructure user input
  let { name, role, email } = req.params;

  //create array of filters
  const filters = {
    name: name ? name.toLowerCase() : "",
    role: role ? role.toLowerCase() : "",
    email: email ? email.toLowerCase() : "",
  };

  // check what is being send in
  const { error } = searchSchema.validate(filters, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    return res.status(400).json({ status: 0, error: errorArr });
  }

  //filter
  for (const key in filters) {
    const value = filters[key];
    if (value) {
      _users = _users.filter((user) => user[key].toLowerCase().includes(value));
    }
  }

  if (_users.length === 0) {
    res.status(400).send("There are no matches");
    return;
  }

  //send back results
  res.send(_users);
});

//**********************************delete**********************************//
app.delete("/:id", (req, res) => {
  let { id } = req.params;
  id = Number(id);

  if (isNaN(id) || id < 0) {
    res.status(400).send("Invalid id, make sure it is a number");
    return;
  }

  const indexOf = req.users.findIndex((user) => {
    return user.id === id;
  });

  if (indexOf === -1) {
    res.status(400).send("There are no matches, check the id");
    return;
  }

  req.users.splice(indexOf, 1);
  res.send({ status: 1 });
});
