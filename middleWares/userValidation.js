const Joi = require("joi");

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



// const validateForm = (data) => {
//   try {
//     const addressSchema = Joi.object({
//       firstName: Joi.string().min(2).max(30).required().messages({
//         'string.base': 'First name should be a string.',
//         'string.min': 'First name should have at least 2 characters.',
//         'string.max': 'First name should not exceed 30 characters.',
//         'any.required': 'First name is required.'
//       }),
//       lastName: Joi.string().min(2).max(30).required().messages({
//         'string.base': 'Last name should be a string.',
//         'string.min': 'Last name should have at least 2 characters.',
//         'string.max': 'Last name should not exceed 30 characters.',
//         'any.required': 'Last name is required.'
//       }),
//       companyName: Joi.string().max(50).allow('').messages({
//         'string.base': 'Company name should be a string.',
//         'string.max': 'Company name should not exceed 50 characters.'
//       }), // Optional field
//       streetAddress: Joi.string().min(5).max(100).required().messages({
//         'string.base': 'Street address should be a string.',
//         'string.min': 'Street address should have at least 5 characters.',
//         'string.max': 'Street address should not exceed 100 characters.',
//         'any.required': 'Street address is required.'
//       }),
//       zipCode: Joi.string().pattern(/^[0-9]{5,6}$/).required().messages({
//         'string.base': 'Zip code should be a string.',
//         'string.pattern.base': 'Zip code must be a valid 5 or 6 digit number.',
//         'any.required': 'Zip code is required.'
//       }),
//       phone: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
//         'string.base': 'Phone number should be a string.',
//         'string.pattern.base': 'Phone number must be between 10 and 15 digits.',
//         'any.required': 'Phone number is required.'
//       }),
//       email: Joi.string().email().required().messages({
//         'string.base': 'Email should be a string.',
//         'string.email': 'Email must be a valid email address.',
//         'any.required': 'Email is required.'
//       }),
//       additionalInformation: Joi.string().max(200).allow('').messages({
//         'string.base': 'Additional information should be a string.',
//         'string.max': 'Additional information should not exceed 200 characters.'
//       }), // Optional field
//       country: Joi.string().min(2).max(50).required().messages({
//         'string.base': 'Country should be a string.',
//         'string.min': 'Country should have at least 2 characters.',
//         'string.max': 'Country should not exceed 50 characters.',
//         'any.required': 'Country is required.'
//       }),
//       city: Joi.string().min(2).max(50).required().messages({
//         'string.base': 'City should be a string.',
//         'string.min': 'City should have at least 2 characters.',
//         'string.max': 'City should not exceed 50 characters.',
//         'any.required': 'City is required.'
//       }),
//       state: Joi.string().min(2).max(50).required().messages({
//         'string.base': 'State should be a string.',
//         'string.min': 'State should have at least 2 characters.',
//         'string.max': 'State should not exceed 50 characters.',
//         'any.required': 'State is required.'
//       }),
//     });

//     const { error, value } = addressSchema.validate(data, { abortEarly: false });
//     if (error) {
//       return { error: error.details.map(detail => detail.message) };
//     }
//     return { value };
//   } catch (error) {
//     throw error;
//   }
// };

const validateForm = (data) => {
  try {
    const addressSchema = Joi.object({
      firstName: Joi.required().messages({
        'any.required': 'First name is required.'
      }),
      lastName: Joi.required().messages({
        'any.required': 'Last name is required.'
      }),
      companyName: Joi.max(50).allow('').messages({
        'string.max': 'Company name should have a maximum length of 50 characters.'
      }), 
      streetAddress: Joi.min(5).max(100).required().messages({
        'string.min': 'Street address should have a minimum length of 5 characters.',
        'string.max': 'Street address should have a maximum length of 100 characters.',
        'any.required': 'Street address is required.'
      }),
      zipCode: Joi.pattern(/^[0-9]{5,6}$/).required().messages({
        'string.pattern.base': 'Zip code must be a valid 5 or 6 digit number.',
        'any.required': 'Zip code is required.'
      }),
      phone: Joi.pattern(/^[0-9]{10,15}$/).required().messages({
        'string.pattern.base': 'Phone number must be a valid number between 10 to 15 digits.',
        'any.required': 'Phone number is required.'
      }),
      email: Joi.email().required().messages({
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.'
      }),
      additionalInformation: Joi.min(5).max(200).allow('').messages({
        'string.max': 'Additional information should have a maximum length of 200 characters.',
        'string.min': 'Additional information should have a maximum length of 200 characters.'
      }), 
      country: Joi.required().messages({
        'any.required': 'Country is required.'
      }),
      city: Joi.required().messages({
        'any.required': 'City is required.'
      }),
      state: Joi.required().messages({
        'any.required': 'State is required.'
      }),
    });
    return addressSchema.validate(data, { abortEarly: false }); // Validate all errors
  } catch (error) {
    throw error;
  }
};




module.exports = { userValidation,
  validateRating,
   validateComment,
   validateForm };
