const productModel = require("../models/productModel");
const Category = require("../models/categoryModel");
const cloudinary = require("../middlewares/cloudinary");
const userModel = require("../models/userModel");
const {
  validateComment,
  validateRating,
} = require("../middleWares/userValidation");

const fs = require("fs");
const path = require("path");

// function calculateDiscountAndTag(product) {
//   const now = new Date();
//   const productAgeInDays = Math.floor((now - product.createdAt) / (1000 * 60 * 60 * 24));

//   let discount = 0;
//   let isNew = false;

//   if (productAgeInDays <= 30) {
//     isNew = true; // Product is new
//   }

//   if (productAgeInDays > 30) {
//     discount = 0.10; // 10% discount for products older than 30 days
//   }

//   const discountedPrice = product.price * (1 - discount);

//   return {
//     isNew,
//     discountedPrice,
//   };
// }


function calculateDiscountAndTag(product) {
  const now = new Date();
  const productAgeInMinutes = Math.floor(
    (now - product.createdAt) / (1000 * 60)
  );

  let isNew = productAgeInMinutes <= 2;
  let discount = product.discountPercentage / 100;

  // Discount the general price and round to two decimal places
  const discountedGeneralPrice = (product.price * (1 - discount)).toFixed(2);

  const discountedPrices = product.sizes.map((sizeObj) => {
    // Calculate and round the discounted price for each size
    const discountedPrice = (sizeObj.price * (1 - discount)).toFixed(2);
    return {
      size: sizeObj.size,
      price: parseFloat(discountedPrice), // Convert back to a number if needed
    };
  });

  return {
    isNew,
    discountedPrices,
    discountedGeneralPrice: parseFloat(discountedGeneralPrice), // Convert back to a number if needed
  };
}


//Function to create a product
const createProduct = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      itemName,
      description,
      sizes,
      price,
      stock,
      discountPercentage = 0,
    } = req.body;

    //Check if colors is a string. If so, parse it into an array. If it's already an array, it will remain unchanged.
    const colors = typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : req.body.colors;

    const theCategory = await Category.findById(categoryId);
    if (!theCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Ensure stock is provided for products without sizes
    if (!sizes && (stock === undefined || stock < 0)) {
      return res
        .status(400)
        .json({
          message: "Stock quantity is required for products without sizes",
        });
    }

    // Parse sizes if it's a string and if it's provided
    const parsedSizes = sizes
      ? typeof sizes === "string"
        ? JSON.parse(sizes)
        : sizes
      : [];

    // Ensure stock is provided for each size
    if (parsedSizes.length > 0) {
      for (const size of parsedSizes) {
        if (size.stock === undefined || size.stock < 0) {
          return res
            .status(400)
            .json({
              message: `Stock quantity is required for size ${size.size}`,
            });
        }
      }
    }

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
        message: "One or more uploaded images not found",
      });
    }

    // Upload the images to Cloudinary and collect the results
    const cloudinaryUploads = await Promise.all(
      filePaths.map((filePath) =>
        cloudinary.uploader.upload(filePath, {
          folder: "Product-Images",
        })
      )
    );

    // Calculate discounted prices only if sizes are provided
    let discountedPrices = [];
    if (parsedSizes.length > 0) {
      discountedPrices = parsedSizes.map((sizeObj) => {
        const discountedPrice = (sizeObj.price * (1 - discountPercentage / 100)).toFixed(2);
        return {
          size: sizeObj.size,
          price: parseFloat(discountedPrice), // Convert back to number
          stock: sizeObj.stock, // Include stock for each size
        };
      });
    }

    // Calculate the discounted general price
    const discountedGeneralPrice = parseFloat((price * (1 - discountPercentage / 100)).toFixed(2));

    // Create the new product with or without sizes
    const newProduct = await productModel.create({
      itemName,
      description,
      colors,
      price: discountedGeneralPrice, 
      discountPercentage,
      discountedPrices,
      sizes: parsedSizes, 
      images: cloudinaryUploads.map((upload) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      })),
      stock: sizes && sizes.length > 0 ? 0 : stock, // Handle general stock if no sizes
      category: categoryId,
    });

    theCategory.products.push(newProduct._id);
    await theCategory.save();

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  } finally {
    // Cleanup the uploaded files
    req.files.forEach((file) => {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
};


//Function to update a product
const updateProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    const {
      itemName,
      description,
      sizes,
      price,
      discountPercentage = 0,
    } = req.body;

    //Check if colors is a string. If so, parse it into an array. If it's already an array, it will remain unchanged.
    const colors = typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : req.body.colors;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle new image uploads
    let newImages = [];

    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map((file) => path.resolve(file.path));

      // Check if all files exist
      const allFilesExist = filePaths.every((filePath) =>
        fs.existsSync(filePath)
      );

      if (!allFilesExist) {
        return res
          .status(400)
          .json({ message: "One or more uploaded images not found" });
      }

      // Upload the images to Cloudinary
      const cloudinaryUploads = await Promise.all(
        filePaths.map((filePath) =>
          cloudinary.uploader.upload(filePath, {
            folder: "Product-Images",
          })
        )
      );

      // Store new images
      newImages = cloudinaryUploads.map((upload) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      }));
    }

    // If new images are uploaded, replace the old images
    if (newImages.length > 0) {
      // Optionally, delete old images from Cloudinary (if desired)
      for (const oldImage of product.images) {
        await cloudinary.uploader.destroy(oldImage.public_id);
      }

      // Replace the product's images with the new ones
      product.images = newImages;
    }

    // Update product fields
    if (itemName) product.itemName = itemName;
    if (description) product.description = description;
    if (colors) product.colors = colors;
    if (sizes)
      product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    if (price) product.price = price;
    if (discountPercentage) product.discountPercentage = discountPercentage;

    // Recalculate discounted prices if sizes, price, or discountPercentage are updated
    if (sizes && (price || discountPercentage)) {
      const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

      if (parsedSizes && parsedSizes.length > 0) {
        product.discountedPrices = parsedSizes.map((sizeObj) => {
          const discountedPrice =
            product.price * (1 - product.discountPercentage / 100);
          return {
            size: sizeObj.size,
            price: discountedPrice,
          };
        });
      } else {
        product.discountedPrices = [];
      }
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  } finally {
    // Cleanup the uploaded files
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.resolve(file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
};


const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const {
      itemName,
      description,
      sizes,
      price,
      discountPercentage = 0,
    } = req.body;

    //Check if colors is a string. If so, parse it into an array. If it's already an array, it will remain unchanged.
    const colors = typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : req.body.colors;

    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle new image uploads
    let updatedImages = product.images; // Start with the existing images

    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map((file) => path.resolve(file.path));

      // Check if all files exist
      const allFilesExist = filePaths.every((filePath) =>
        fs.existsSync(filePath)
      );

      if (!allFilesExist) {
        return res.status(400).json({ message: "One or more uploaded images not found" });
      }

      // Upload the images to Cloudinary
      const cloudinaryUploads = await Promise.all(
        filePaths.map((filePath) =>
          cloudinary.uploader.upload(filePath, {
            folder: "Product-Images",
          })
        )
      );

      // Prepare the updated images array
      updatedImages = cloudinaryUploads.map((upload) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      }));

      // Optionally, delete old images from Cloudinary (if they are being replaced)
      for (const oldImage of product.images) {
        await cloudinary.uploader.destroy(oldImage.public_id);
      }
    }

    // Recalculate discounted prices if sizes, price, or discountPercentage are updated
    let discountedPrices = product.discountedPrices; // Start with existing discounted prices
    if (sizes && (price || discountPercentage)) {
      const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

      if (parsedSizes && parsedSizes.length > 0) {
        discountedPrices = parsedSizes.map((sizeObj) => {
          const discountedPrice =
            price * (1 - discountPercentage / 100);
          return {
            size: sizeObj.size,
            price: discountedPrice,
          };
        });
      } else {
        discountedPrices = [];
      }
    }

    // Update the product 
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        itemName,
        description,
        colors,
        sizes: sizes ? (typeof sizes === "string" ? JSON.parse(sizes) : sizes) : product.sizes,
        price,
        discountPercentage,
        discountedPrices,
        images: updatedImages,
      },
      { new: true } 
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  } finally {
    // Cleanup the uploaded files
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.resolve(file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
};



//Function to update a product stock
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, stock } = req.body;

    // Find the product by ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.sizes && product.sizes.length > 0) {
      // Update stock for a specific size
      const sizeIndex = product.sizes.findIndex((s) => s.size === size);

      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock = stock;
      } else {
        return res.status(400).json({ message: `Size ${size} not found.` });
      }
    } else {
      // Update general stock for products without sizes
      product.stock = stock;
    }

    await product.save();

    res.status(200).json({
      message: "Stock updated successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Function to get a product stock
const getProductStock = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product by ID
    const product = await productModel.findById(productId).select('itemName stock sizes colors');
    if (!product) {
      return res.status(400).json({ message: "Product not found." });
    }

    // If the product has sizes, return the stock and colors for each size
    if (product.sizes && product.sizes.length > 0) {
      const sizeStock = product.sizes.map((sizeDetail) => ({
        size: sizeDetail.size,
        stock: sizeDetail.stock,
        colors: sizeDetail.colors || [],  
      }));
      
      return res.status(200).json({
        productName: product.itemName,
        sizeStock: sizeStock,
      });
    }

    // If no sizes, return the general stock and colors
    return res.status(200).json({
      productName: product.itemName,
      stock: product.stock,
      colors: product.colors || [],  
    });
  } catch (err) {
    res.status(500).json({ message: `Error fetching product stock: ${err.message}` });
  }
};
//Function to get all products stocks
const getAllStock = async (req, res) => {
  try {
    // Fetch all products with necessary fields
    const products = await productModel.find().select('itemName stock sizes colors');

    // Map through each product and structure the response
    const productStocks = products.map(product => {
      if (product.sizes && product.sizes.length > 0) {
        // If the product has sizes, return stock and colors for each size
        const sizeStock = product.sizes.map(sizeDetail => ({
          size: sizeDetail.size,
          stock: sizeDetail.stock,
          colors: sizeDetail.colors || [],  // Return available colors for each size
        }));

        return {
          productName: product.itemName,
          sizeStock: sizeStock,
        };
      }

      // If no sizes, return the general stock and colors
      return {
        productName: product.itemName,
        stock: product.stock,
        colors: product.colors || [],  // Return available colors for the general product
      };
    });

    // Send response with all product stock details
    return res.status(200).json({ products: productStocks });
  } catch (err) {
    return res.status(500).json({ message: `Error fetching all product stocks: ${err.message}` });
  }
};

//Function to compare two products
const compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length < 2) {
      return res.status(400).json({
        message: "Please provide at least two product IDs to compare.",
      });
    }

    // Fetch products from the database
    const products = await productModel.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res
        .status(404)
        .json({ message: "One or more products not found." });
    }

    // Extract relevant attributes for comparison, including discounted prices
    const comparisonResult = products.map((product) => {
      // Apply discount logic
      const { isNew, discountedPrices, discountedGeneralPrice } =
        calculateDiscountAndTag(product);

      return {
        itemName: product.itemName,
        price: product.price,
        discountedGeneralPrice: discountedGeneralPrice,
        description: product.description,
        colors: product.colors,
        sizes: product.sizes,
        discountedPrices: discountedPrices,
        isNew: isNew,
      };
    });

    res.status(200).json({
      message: "Products compared successfully",
      comparisonResult,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

//Function to generate urls to share a product
const generateShareUrls = (product) => {
  const encodedProductName = encodeURIComponent(product.itemName);
  const encodedProductUrl = encodeURIComponent(
    `https://furniro-iota-eight.vercel.app/products/${product._id}`
  );

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedProductUrl}&t=${encodedProductName}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedProductUrl}&text=${encodedProductName}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedProductUrl}&title=${encodedProductName}`;
  const pinterestShareUrl = `http://pinterest.com/pin/create/button/?url=${encodedProductUrl}&description=${encodedProductName}`;

  return {
    facebook: facebookShareUrl,
    twitter: twitterShareUrl,
    linkedin: linkedInShareUrl,
    pinterest: pinterestShareUrl,
  };
};

//Function to share product
const shareProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const shareUrls = generateShareUrls(product);

    return res.status(200).json({
      message: "Share URLs generated successfully",
      data: shareUrls,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to like and unlike a product
const toggleLikeProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // Check if the user has already liked the product
    const likedIndex = product.likedBy.indexOf(userId);

    let update;
    let message;

    if (likedIndex !== -1) {
      // User has already liked the product, so unlike it
      update = {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      };
      message = "Product unliked successfully";
    } else {
      // User has not liked the product yet, so like it
      update = {
        $inc: { likes: 1 },
        $push: { likedBy: userId },
      };
      message = "Product liked successfully";
    }

    const updatedProduct = await productModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    return res.status(200).json({
      message,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

//Function to fetch all likes on a product
const getProductLikes = async (req, res) => {
  try {
    const { id } = req.params; // Product ID

    const product = await productModel
      .findById(id)
      .populate("likedBy", "username email"); // Populate with user details

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product likes fetched successfully",
      data: {
        likes: product.likes,
        likedBy: product.likedBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

//Function to rate a product
const rateProduct = async (req, res) => {
  try {
    const { error, value } = validateRating(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { productId } = req.params;
    const { rating } = req.body;
    const userId = req.user.userId;

    // Validate rating value
    // if (rating < 1 || rating > 5) {
    //   return res.status(400).json({ message: "Rating must be between 1 and 5" });
    // }

    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find existing rating by the user
    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update the existing rating
      product.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      product.ratings.push({ userId, rating });
    }

    // Recalculate the average rating
    const totalRating = product.ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / product.ratings.length;

    // Save the updated product with new ratings and average rating
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: { ratings: product.ratings, averageRating } },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: "Rating submitted successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  }
};


//Function to comment on a product
const commentProduct = async (req, res) => {
  try {
    const { error, value } = validateComment(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;

    // Check if the product exists
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Retrieve user's first name, last name, and profile image
    const user = await userModel.findById(userId).select("firstName lastName profileImage");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the new comment object with user's first name, last name, and profile image
    const newComment = {
      user: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      comment,
    };

    // Use findByIdAndUpdate to push the new comment
    const updatedProduct = await productModel
      .findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true, runValidators: false }
      );

    // Find the newly added comment with user details
    const addedComment = updatedProduct.comments[updatedProduct.comments.length - 1];

    // Concatenate firstName and lastName to form the full name
    const fullName = `${addedComment.firstName} ${addedComment.lastName}`;

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        _id: addedComment._id,
        user: addedComment.user,
        // firstName: addedComment.firstName,
        // lastName: addedComment.lastName,
        fullName,
        profileImage: addedComment.profileImage,
        comment: addedComment.comment,
        createdAt: addedComment.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

//Function to delete all comments under all products
const deleteAllComments = async (req, res) => {
  try {
    // Find all products
    const products = await productModel.find();

    // Iterate over each product and clear the comments array
    for (const product of products) {
      product.comments = []; 
      await product.save();  
    }

    res.status(200).json({
      message: "All comments under all products have been deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: `Error deleting comments: ${error.message}`,
    });
  }
};

//Function to delete all comments under a product
const deleteAllCommentsUnderProduct = async (req, res) => {
  try {
    const { id } = req.params; 

    // Find the product by ID
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Clear the comments array
    product.comments = [];

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: "All comments under the product have been deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: `Error deleting comments: ${error.message}`,
    });
  }
};

//Function to get all commnets on a product
const allComments = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel
      .findById(id)
      .populate("comments.user", "firstName lastName profileImage");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const comments = product.comments.map((comment) => ({
      ...comment._doc,
      user: {
        _id: comment.user._id,
        name: `${comment.user.firstName} ${comment.user.lastName}`,
        profileImage: comment.user.profileImage,
      },
    }));

    res.status(200).json({
      message: "Comments fetched successfully",
      length: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

//Function to update prices and sizes
const updateSize = async (req, res) => {
  try {
    const productId = req.params.productId;
    const sizeId = req.params.sizeId;
    const { size, price } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sizeIndex = product.sizes.findIndex(
      (sizeItem) => sizeItem._id.toString() === sizeId
    );
    if (sizeIndex === -1) {
      return res.status(404).json({ message: "Size not found" });
    }

    if (size) {
      product.sizes[sizeIndex].size = size;
    }
    if (price) {
      product.sizes[sizeIndex].price = price;
    }

    await product.save();

    return res.status(200).json({
      message: "Size updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to delete size
const deleteSize = async (req, res) => {
  try {
    const productId = req.params.productId;
    const sizeId = req.params.sizeId;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.sizes = product.sizes.filter(
      (size) => size._id.toString() !== sizeId
    );

    await product.save();

    return res.status(200).json({
      message: "Size deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to update colour
const updateColor = async (req, res) => {
  try {
    const productId = req.params.productId;
    const colorIndex = parseInt(req.params.colorIndex, 10);
    const { color } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (colorIndex < 0 || colorIndex >= product.colors.length) {
      return res.status(404).json({ message: "Color not found" });
    }

    if (color) {
      product.colors[colorIndex] = color;
    }

    await product.save();

    return res.status(200).json({
      message: "Color updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to delete color
const deleteColor = async (req, res) => {
  try {
    const productId = req.params.productId;
    const colorIndex = parseInt(req.params.colorIndex, 10);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (colorIndex < 0 || colorIndex >= product.colors.length) {
      return res.status(404).json({ message: "Color not found" });
    }

    product.colors.splice(colorIndex, 1);

    await product.save();

    return res.status(200).json({
      message: "Color deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }
    res.status(200).json({
      message: `Product deleted`,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

//Function to get a product by Id
const getProductById = async (productId) => {
  try {
    const product = await productModel.findById(productId).populate("category");

    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate discount and tag
    const { isNew, discountedPrices, discountedGeneralPrice } =
      calculateDiscountAndTag(product);

    // Determine the label for the product
    let label;
    if (isNew) {
      label = "new";
    } else if (product.discountPercentage && product.discountPercentage > 0) {
      label = `-${product.discountPercentage}%`;
    } else {
      label = "new"; // If there's no discount, it will still show "new"
    }

    // Update the product's discountedPrices, isNew fields, and label
    product.discountedPrices = discountedPrices;
    product.isNew = isNew;
    product.discountedGeneralPrice = discountedGeneralPrice;

    return [{
      ...product._doc,
      label,
    }];
  } catch (error) {
    throw error;
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find().populate("category");

    // Iterate over each product and apply the discount and tag logic
    const updatedProducts = products.map((product) => {
      const { isNew, discountedPrices, discountedGeneralPrice } =
        calculateDiscountAndTag(product);

      // // Determine the label for the product
      // const label = isNew ? "new" : `-${product.discountPercentage}%`;

       // Determine the label for the product
    let label;
    if (isNew) {
      label = "new";
    } else if (product.discountPercentage && product.discountPercentage > 0) {
      label = `-${product.discountPercentage}%`;
    } else {
      label = "new"; // If there's no discount, it will still show "new"
    }


      return {
        ...product._doc,
        isNew,
        discountedPrices,
        discountedGeneralPrice,
        label,
      };
    });

    res.status(200).json({
      success: true,
      length: updatedProducts.length,
      data: updatedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//Function to sort products
const sortProducts = async (req, res) => {
  try {
    const { sortBy, search } = req.query;
    let sortCriteria = {};
    let searchCriteria = {};

    // Handling search by name
    if (search) {
      searchCriteria.itemName = new RegExp(search, 'i'); 
    }

    // Handling sort by criteria
    switch (sortBy) {
      case "price-asc":
        sortCriteria["sizes.price"] = 1;
        break;
      case "price-desc":
        sortCriteria["sizes.price"] = -1;
        break;
      case "name-asc":
        sortCriteria.itemName = 1;
        break;
      case "name-desc":
        sortCriteria.itemName = -1;
        break;
      case "category":
        sortCriteria.category = 1;
        break;
      // Default: ascending order by price
      default:
        sortCriteria["sizes.price"] = 1;
        break;
    }


    // Fetch products based on search and sort criteria
    const products = await productModel.find(searchCriteria).sort(sortCriteria);


    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  shareProduct,
  updateSize,
  compareProducts,
  deleteSize,
  updateColor,
  deleteColor,
  getProductById,
  deleteProduct,
  toggleLikeProduct,
  getProductLikes,
  rateProduct,
  commentProduct,
  allComments,
  deleteAllComments,
  sortProducts,
  updateStock,
  getAllStock,
  getProductStock,
  deleteAllCommentsUnderProduct
};
