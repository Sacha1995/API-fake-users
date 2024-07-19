const Joi = require("joi");

//joi schema's to check the req.body
const editSchema = Joi.object({
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
const signupSchema = editSchema.fork(["name", "email", "password"], (schema) =>
  schema.required()
);

//duplicate editSchema, but allow empty values
const searchSchema = editSchema.fork(["name", "email", "role"], (schema) =>
  schema.allow(null, "")
);

const loginSchema = editSchema.fork(["email", "password"], (schema) =>
  schema.required()
);

// schema for when they want to add something
const addSchema = Joi.object({
  profession: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z]+$/)
    .allow(""),
  yearsOfExperience: Joi.string()
    .pattern(/^[0-9]+$/)
    .allow(""),
  company: Joi.string().min(3).max(20).allow(""),
});

module.exports = {
  editSchema,
  addSchema,
  searchSchema,
  loginSchema,
  signupSchema,
};
