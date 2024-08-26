const express = require("express");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { upload } = require("../config/config");
const { Post } = require("../models/blogModel");
const Category = require("../models/categoryModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");

exports.createBlog = async (req, res) => {
  try {
    const { categoryId, title, content } = req.body;
    console.log("Request Body: ", req.body);
    console.log("categoryId: ", categoryId);

    // Check if the category exists
    const category = await Category.findById(categoryId);
    console.log("Category found: ", category);

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    let imageDetails = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const imageFilePath = path.resolve(file.path);

        // Check if the file exists before trying to unlink
        if (fs.existsSync(imageFilePath)) {
          // Upload image to Cloudinary
          const cloudinaryUpload = await cloudinary.uploader.upload(
            imageFilePath,
            {
              folder: "blogImages",
            }
          );

          imageDetails.push({
            public_id: cloudinaryUpload.public_id,
            url: cloudinaryUpload.secure_url,
          });

          // Remove file from server after upload
          fs.unlinkSync(imageFilePath);
        } else {
          console.log(`File not found: ${imageFilePath}`);
        }
      }
    }

    // Create new blog post
    const newPost = await Post.create({
      title,
      content,
      images: imageDetails,
      category: categoryId,
      date: new Date(),
    });

    res.status(201).json({
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
    });
  }
};

exports.search = async (req, res) => {
  try {
    const { title, alphabet, category } = req.body;

    let query = {};

    // Search by title
    if (title) {
      query.itemName = { $regex: title, $options: "i" };
    }

    // Search by alphabet (first letter of the title)
    if (alphabet) {
      query.itemName = { $regex: `^${alphabet}`, $options: "i" };
    }

    // Search by category
    if (category) {
      const myCategory = await categoryModel.findOne({ name: category });
      if (myCategory) {
        query.category = myCategory._id;
      } else {
        return res.status(404).json({
          error: `Category "${category}" not found`,
        });
      }
    }

    // Execute the query
    const results = await productModel.find(query).populate("category");

    if (results.length === 0) {
      return res.status(404).json({
        message: "No products found matching the search criteria",
      });
    }

    res.status(200).json({
      message: "These are your search results",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

exports.getRecentPosts = async (req, res) => {
  try {
    //to allow the user specify the number of post to show
    const { limit } = req.query;
    //this is to set a default of 10 post if no number is provided
    const postLimit = parseInt(limit) || 10;

    // Find posts and sort them by the creation date in descending order
    const recentPosts = await Post.find({})
      .sort({ date: -1 })
      .limit(postLimit)
      .populate("category");

    // Check if any posts were found
    if (recentPosts.length === 0) {
      return res.status(404).json({
        message: "No recent posts found",
      });
    }

    res.status(200).json({
      message: "Recent posts retrieved successfully",
      data: recentPosts,
    });
  } catch (error) {
    res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};
