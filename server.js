const express = require("express");
const Joi = require("joi");
const app = express();
const users = require("./users.json");

function addUsersAndId(req, res, next) {
  req.users = users;
  next();
}

//middleware
app.use(express.json());
app.use(addUsersAndId);
app.use("/users", require("./routes/users"));

//where to run it
const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
