const Address = require("../models/formModel");
const userModel = require("../models/userModel");
const {validateForm} = require("../middleWares/userValidation")

//Fill billing information function
const form = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body);

    if (error) {
        // Map through all error messages
        const errorMessages = error.details.map(err => ({
          field: err.context.key,
          message: err.message
        }));
        return res.status(400).json({ errors: errorMessages });
      }
    const {
      firstName,
      lastName,
      email,
      companyName,
      streetAddress,
      zipCode,
      phone,
      additionalInformation,
      country,
      state,
      city,
    } = req.body;

    // Fetch the logged-in user's data
    const user = await userModel.findById(req.user.userId);

    // Validate if the user's details match
    if (
      firstName.trim().toLowerCase() !== user.firstName.toLowerCase() ||
      lastName.trim().toLowerCase() !== user.lastName.toLowerCase() ||
      email.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      return res.status(400).json({
        error: "User details do not match the logged-in user.",
      });
    }

    // If valid, save the address data including the userId
    const addressData = new Address({
      userId: req.user.userId, 
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      companyName,
      streetAddress,
      zipCode,
      phone,
      additionalInformation,
      country,
      state,
      city,
    });

    await addressData.save();

    res.status(200).json({
      message: "Billing details submitted successfully",
      data: addressData,
    });
} catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

module.exports = form;
