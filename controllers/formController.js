
const Address = require("../models/formModel");
const userModel = require("../models/userModel");

const form = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Fetch the logged-in user's data
    const user = await userModel.findById(req.user.userId);

    // Validate if the user's details match
    if (
      firstName.toLowerCase() !== user.firstName.toLowerCase() ||
      lastName.toLowerCase() !== user.lastName.toLowerCase() ||
      email.toLowerCase() !== user.email.toLowerCase()
    ) {
      return res.status(400).json({
        error: "User details do not match the logged-in user.",
      });
    }

    // If valid, save the address data
    const addressData = new Address(req.body);
    await addressData.save();

    res
      .status(200)
      .json({
        message: "Billing detils submitted successfully",
        data: addressData,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
}

module.exports = form;
