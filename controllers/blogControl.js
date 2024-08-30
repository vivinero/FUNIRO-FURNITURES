const express = require("express");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { upload } = require("../config/config");
const { Post } = require("../models/blogModel");
const productModel = require("../models/productModel");
const { post } = require("../routers/userRouter");
const userModel = require("../models/userModel")

exports.createBlog = async (req, res) => {
  try {
    const { category, title, content } = req.body;

    let imageDetail = null;
    if (req.file) { 
      const imageFilePath = path.resolve(req.file.path);

      if (fs.existsSync(imageFilePath)) {
        try {
          // Upload image to Cloudinary
          const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
            folder: "blogImages",
          });

          imageDetail = {
            public_id: cloudinaryUpload.public_id,
            url: cloudinaryUpload.secure_url,
          };

          // Remove file from server after upload
          fs.unlinkSync(imageFilePath);
        } catch (uploadError) {
          console.error("Error uploading file to Cloudinary:", uploadError);
          return res.status(500).json({
            error: "Error uploading image",
          });
        }
      } else {
        console.log(`File not found: ${imageFilePath}`);
      }
    }

    // Format date "
    const date = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);

    // Create new blog post
    const newPost = await Post.create({
      title,
      content,
      image: imageDetail, 
      category,
      date: formattedDate,
    });

    res.status(201).json({
      message: "Post created successfully",
      data: newPost,
      formattedDate
    });

  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
    });
  }
};

exports.search = async (req, res) => {
  try {
    const { title, alphabet, category } = req.body;

    // Validate input
    if (!title && !alphabet && !category) {
      return res.status(400).json({
        error: "At least one search criterion (title, alphabet, or category) must be provided.",
      });
    }

    // Initialize query object
    let query = {};

    // Search by title
    if (title) {
      if (title.trim() === "") {
        return res.status(400).json({
          error: "Search title cannot be empty or contain only spaces.",
        });
      }
      query.title = { $regex: title, $options: "i" };
    }

    // Search by alphabet (first letter of the title)
    if (alphabet) {
      if (alphabet.trim() === "" || alphabet.length !== 1) {
        return res.status(400).json({
          error: "Alphabet must be a single letter.",
        });
      }
      query.title = { $regex: `^${alphabet}`, $options: "i" };
    }

    // Search by category
    if (category) {
      const myCategory = await Category.findOne({ name: category });
      if (myCategory) {
        query.category = myCategory._id;
      } else {
        return res.status(404).json({
          error: `Category "${category}" not found.`,
        });
      }
    }

    // Execute the query
    const results = await Post.find(query).populate("category");

    if (results.length === 0) {
      return res.status(404).json({
        message: "No posts found matching the search criteria.",
      });
    }

    res.status(200).json({
      message: "Search results",
      data: results,
    });
  } catch (error) {
    console.error("Error searching posts:", error);
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

exports.getOnePost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    res.status(200).json({
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    // Fetch all blog posts
    const posts = await Post.find() 
    if (!posts || posts.length === 0) {
      return res.status(200).json({
        message: "No posts found in this blog",
      });
    }

    res.status(200).json({
      message: `Found ${posts.length} post(s) in this blog`,
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};