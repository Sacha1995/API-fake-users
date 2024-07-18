const express = require("express");
const Joi = require("joi");
const app = express();
const users = require("./users.json");
let lastId = users[users.length - 1].id;

//middleware
app.use(express.json());

//http://localhost:6001/users for all the users
//choose what to filter it with
//Not very happy with this. It does not work very well. If i want to do name and email it does not work.
app.get("/users/:name?/:role?/:email?", (req, res) => {
  // always first make a copy
  let _users = [...users];

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
    console.log(errorArr);
    return res.status(400).json({ error: errorArr });
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

//delete a user
app.delete("/users/:id", (req, res) => {
  let { id } = req.params;
  id = Number(id);

  if (isNaN(id) || id < 0) {
    res.status(400).send("Invalid id, make sure it is a number");
    return;
  }

  const indexOf = users.findIndex((user) => {
    return user.id === id;
  });

  if (indexOf === -1) {
    res.status(400).send("There are no matches, check the id");
    return;
  }

  users.splice(indexOf, 1);
  res.send({ status: 1 });
});

//add a user
app.post("/users", (req, res) => {
  lastId++;

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send("No input");
    return;
  }

  const { error } = addSchema.validate(req.body, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    console.log(errorArr);
    return res.status(400).json({ error: errorArr });
  }

  //add Id
  req.body.id = lastId;

  //add user and return status
  users.push(req.body);
  res.send({ status: 1 });
});

//manipulate the data
app.put("/users/:id", (req, res) => {
  let { id } = req.params;
  id = Number(id);

  if (isNaN(id) || id < 0) {
    res.status(400).send("Invalid id, make sure it is a number");
    return;
  }

  if (!req.body) {
    res.status(400).send("No input");
    return;
  }

  const { error } = manipulateSchema.validate(req.body, { abortEarly: false });

  if (error) {
    let errorArr = [];
    error.details.forEach((item) => {
      errorArr.push(item.message);
    });
    console.log(errorArr);
    return res.status(400).json({ error: errorArr });
  }

  req.body.id = id;

  const indexOf = users.findIndex((user) => {
    return user.id === id;
  });

  if (indexOf === -1) {
    res.status(400).send("There are no matches, check the id");
    return;
  }

  // so you can change part of the info
  if (Object.keys(req.body).length < 8) {
    users[indexOf] = { ...users[indexOf], ...req.body };
    res.send({ status: 1 });
    return;
  }

  users[indexOf] = req.body;
  res.send({ status: 1 });
});

const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//joi schema's to check the req.body
const manipulateSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(12)
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      "string.pattern.base": "Name must only contain alphabetic characters",
    }),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).messages({
    "string.pattern.base":
      "Password must only contain alphabetic characters and numbers",
  }),
  role: Joi.string().valid("customer", "admin"),
  avatar: Joi.string().custom((value, helpers) => {
    // Check if the file name ends with .jpg, .jpeg, or .png
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const extension = value.split(".").pop();
    if (!allowedExtensions.includes(extension)) {
      return helpers.message(
        "Image must be a file with one of the following extensions: .jpg, .jpeg, .png"
      );
    }
    return value;
  }),
  creationAt: Joi.date().iso(),
  updatedAt: Joi.date().iso(),
});

// duplicate the above schema, but make everything required
const addSchema = manipulateSchema.fork(
  ["name", "email", "password", "role", "avatar", "creationAt", "updatedAt"],
  (schema) => schema.required()
);

//duplicate manipulateSchema, but allow empty values
const searchSchema = manipulateSchema.fork(
  ["name", "email", "role"],
  (schema) => schema.allow(null, "")
);
