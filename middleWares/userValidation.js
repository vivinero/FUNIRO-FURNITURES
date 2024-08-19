const Joi = require("@hapi/joi");

const userValidation = (req, res, next) => {
  const validation = Joi.object({
    firstName: Joi.string().min(3).max(30).required().messages({
      "string.base": "First name must be a string",
      "string.empty": "First name is required",
      "string.min": "First name must be at least {#limit} characters long",
      "string.max": "First name cannot be longer than {#limit} characters",
    }),
    lastName: Joi.string().min(3).max(30).required().messages({
      "string.base": "Last name must be a string",
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least {#limit} characters long",
      "string.max": "Last name cannot be longer than {#limit} characters",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Invalid email address",
    }),
    phoneNumber: Joi.string()
      .pattern(new RegExp("^[0-9]{11}$"))
      .required()
      .messages({
        "string.base": "Phone number must be a string",
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be a valid 11-digit number",
      }),
    password: Joi.string().required().min(8).max(30).messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be min of 8 characters",
      "string.max": "Password must be max of 30 characters",
    }),
  });
  const { firstName, lastName, email, phoneNumber, password } = req.body;
  const { error } = validation.validate(
    { firstName, lastName, email, phoneNumber, password },
    { abortEarly: false }
  );
  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
  next();
};

// Comment validation schema
const validateComment = (data) => {
  try {
    const commentValidation = Joi.object({
      comment: Joi.string().required().min(2).trim()
      .max(500).messages({
        "string.base": "Comment text should be a valid string.",
        "string.empty": "Comment text cannot be empty.",
        "string.min": "Comment text should have at least 2 characters.",
        "string.max": "Comment text should have at most 500 characters.",
        "any.required": "Comment text is required.",
      }),
    });
    return commentValidation.validate(data);
  } catch (error) {
    throw error;
  }
};


const validateRating = (data) => {
  try {
const rateSchema = Joi.object({
  
  rating: Joi.number()
    .optional()
    .min(1)
    .max(5)
    .messages({
      'number.base': 'Rating should be a valid number.',
      'number.min': 'Rating should be at least 1.',
      'number.max': 'Rating should be at most 5.'
    })
})
return rateSchema.validate(data);
} catch (error) {
  throw error;
}}


module.exports = { userValidation,
  validateRating,
   validateComment };
