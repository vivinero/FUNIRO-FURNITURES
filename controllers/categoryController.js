const Category = require("../models/categoryModel");

const cloudinary = require("../middlewares/cloudinary");

const fs = require("fs");
const path = require("path");

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { categoryName, categoryInfo } = req.body;

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files were uploaded",
      });
    }

    const filePaths = req.files.map((file) => path.resolve(file.path));

    // Check if all files exist
    const allFilesExist = filePaths.every((filePath) =>
      fs.existsSync(filePath)
    );

    if (!allFilesExist) {
      return res.status(400).json({
        message: "One or more uploaded files not found",
      });
    }

    // Upload the images to Cloudinary and collect the results
    const cloudinaryUploads = await Promise.all(
      filePaths.map((filePath) =>
        cloudinary.uploader.upload(filePath, {
          folder: "Catgory-Images",
        })
      )
    );

    const category = await Category.create({
      categoryName,
      categoryInfo,
      images: cloudinaryUploads.map((upload) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      })),
    });

    if (!category) {
      return res.status(400).json({
        error: "Unable to create category",
      });
    }

    res.status(201).json({
      message: `Category added successfully`,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, categoryInfo } = req.body;

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files were uploaded",
      });
    }

    const filePaths = req.files.map((file) => path.resolve(file.path));

    // Check if all files exist
    const allFilesExist = filePaths.every((filePath) =>
      fs.existsSync(filePath)
    );

    if (!allFilesExist) {
      return res.status(400).json({
        message: "One or more uploaded files not found",
      });
    }

    // Upload the images to Cloudinary and collect the results
    const cloudinaryUploads = await Promise.all(
      filePaths.map((filePath) =>
        cloudinary.uploader.upload(filePath, {
          folder: "Category-Images",
        })
      )
    );

    // Find and update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        categoryName,
        categoryInfo,
        images: cloudinaryUploads.map((upload) => ({
          public_id: upload.public_id,
          url: upload.secure_url,
        })),
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    res.status(200).json({
      message: `Category updated successfully`,
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const id = req.params.categoryId;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        error: "Category not found",
      });
    }
    res.status(200).json({
      message: `Category deleted`,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get a single category by ID
const getCategoryById = async (req, res) => {
  try {
    const id = req.params.categoryId;
    const category = await Category.findById(id).populate("products");
    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }
    res.status(200).json({
      message: `Category fetched`,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("products");
    res.status(200).json({
      message: `There are ${categories.length} categories here`,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
};
