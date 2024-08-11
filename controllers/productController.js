const productModel = require("../models/productModel");
const Category = require("../models/categoryModel");
const cloudinary = require("../middlewares/cloudinary");

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

  let discount = 0;
  let isNew = false;

  if (productAgeInMinutes <= 2) {
    isNew = true; // Product is new
  } else {
    discount = 0.1; // 10% discount for products older than 2 minutes
  }

  // Discount the general price
  const discountedGeneralPrice = product.price * (1 - discount);

  const discountedPrices = product.sizes.map((sizeObj) => {
    const discountedPrice = sizeObj.price * (1 - discount);
    return {
      size: sizeObj.size,
      price: discountedPrice,
    };
  });

  return {
    isNew,
    discountedPrices,
    discountedGeneralPrice
  };
}

// const createProduct = async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const { itemName, description, colors, sizes, price } = req.body;

//     const theCategory = await Category.findById(categoryId);
//     if (!theCategory) {
//       return res.status(404).json({
//         error: "Category not found",
//       });
//     }

//     let imageDetails = {};

//     // Handle image upload if a file is provided
//     if (req.file) {
//       // Path to the uploaded file
//       const imageFilePath = path.resolve(req.file.path);

//       // Check if the file exists before proceeding
//       if (!fs.existsSync(imageFilePath)) {
//         return res.status(400).json({
//           message: "Uploaded file not found",
//         });
//       }

//       // Upload the image to Cloudinary
//       const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
//         folder: "productImages",
//       });

//       imageDetails = {
//         public_id: cloudinaryUpload.public_id,
//         url: cloudinaryUpload.secure_url,
//       };

//       // Optionally delete the local file after upload
//       fs.unlinkSync(imageFilePath);
//     }

//     // Parse sizes if it's a string
//     const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

//     // Create the new product
//     const newProduct = await productModel.create({
//       itemName,
//       description,
//       colors,
//       sizes: parsedSizes,
//       price,
//       images: imageDetails,
//       category: categoryId,
//     });
//    // Calculate the discounted prices and tags
//    const { discountedPrices, isNew } = calculateDiscountAndTag(newProduct);

//    newProduct.discountedPrices = discountedPrices;
//    newProduct.isNew = isNew; // Store the "new" tag
//    await newProduct.save();

//     res.status(201).json({
//       message: "Product created successfully",
//       data: newProduct,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Internal Server Error: " + error.message,
//     });
//   }
// };

const createProduct = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { itemName, description, colors, sizes, price } = req.body;

    const theCategory = await Category.findById(categoryId);
    if (!theCategory) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    let imageDetails = {};

    // Handle image upload if a file is provided
    if (req.file) {
      const imageFilePath = path.resolve(req.file.path);

      if (!fs.existsSync(imageFilePath)) {
        return res.status(400).json({
          message: "Uploaded file not found",
        });
      }

      const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
        folder: "productImages",
      });

      imageDetails = {
        public_id: cloudinaryUpload.public_id,
        url: cloudinaryUpload.secure_url,
      };

      fs.unlinkSync(imageFilePath);
    }

    // Parse sizes if it's a string
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

    // Calculate discounted prices if necessary
    const now = new Date();
    const discountedPrices = parsedSizes.map((sizeObj) => {
      const discountedPrice =
        now - Date.now() > 2 * 60 * 1000
          ? sizeObj.price * 0.9 // 10% discount if product is older than 2 minutes
          : sizeObj.price;

      return {
        size: sizeObj.size,
        price: discountedPrice,
      };
    });

    // Create the new product
    const newProduct = await productModel.create({
      itemName,
      description,
      colors,
      sizes: parsedSizes,
      price,
      discountedPrices,
      images: imageDetails,
      category: categoryId,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  }
};

const updateProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;

    // Validate that updates contain at least one of the expected fields
    const allowedUpdates = ["name", "description", "colors", "sizes"];
    const isValidUpdate = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ message: "Invalid updates!" });
    }
    let updatedImages = [];

    // Handle image upload if a file is provided
    if (req.file) {
      // Path to the uploaded file
      const imageFilePath = path.resolve(req.file.path);

      // Check if the file exists before proceeding
      if (!fs.existsSync(imageFilePath)) {
        return res.status(400).json({
          message: "Uploaded file not found",
        });
      }

      // Upload the image to Cloudinary
      const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
        folder: "productImages",
      });

      updatedImages.push(cloudinaryUpload.secure_url);

      // Optionally delete the local file after upload
      fs.unlinkSync(imageFilePath);
    }

    // Handle images to delete
    if (image && image.length > 0) {
      for (let imageUrl of image) {
        // Extract public ID from the image URL
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`productImages/${publicId}`);
      }
    }

    const updateData = { itemName, detail, price };
    if (updatedImages.length > 0) {
      updateData.$push = { images: { $each: updatedImages } };
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product fields
    if (updates.name) product.name = updates.name;
    if (updates.description) product.description = updates.description;
    if (updates.colors) product.colors = updates.colors;
    if (updates.sizes) product.sizes = updates.sizes;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;
    const { imagesToDelete = [] } = updates;

    // Validate that updates contain at least one of the expected fields
    const allowedUpdates = [
      "itemName",
      "description",
      "price",
      "colors",
      "sizes",
      "imagesToDelete",
    ];
    const isValidUpdate = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    let updatedImages = [];

    // Handle image upload if a file is provided
    if (req.file) {
      // Path to the uploaded file
      const imageFilePath = path.resolve(req.file.path);

      // Check if the file exists before proceeding
      if (!fs.existsSync(imageFilePath)) {
        return res.status(400).json({
          message: "Uploaded file not found",
        });
      }

      // Upload the image to Cloudinary
      const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
        folder: "productImages",
      });

      updatedImages.push(cloudinaryUpload.secure_url);

      // Optionally delete the local file after upload
      fs.unlinkSync(imageFilePath);
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle images to delete
    if (imagesToDelete.length > 0) {
      for (let imageUrl of imagesToDelete) {
        // Extract public ID from the image URL
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`productImages/${publicId}`);

        // Remove the image URL from the product's images array
        product.images = product.images.filter((img) => img !== imageUrl);
      }
    }

    // Update the product fields
    if (updates.itemName) product.itemName = updates.itemName;
    if (updates.description) product.description = updates.description;
    if (updates.colors) product.colors = updates.colors;
    if (updates.sizes) product.sizes = updates.sizes;
    if (updates.price) product.sizes = updates.price;
    if (updatedImages.length > 0) product.images.push(...updatedImages);

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

// const compareProducts = async (req, res) => {
//   try {
//     const { productIds } = req.body;

//     if (!productIds || productIds.length < 2) {
//       return res.status(400).json({
//         message: "Please provide at least two product IDs to compare.",
//       });
//     }

//     // Fetch products from the database
//     const products = await productModel.find({ _id: { $in: productIds } });

//     if (products.length !== productIds.length) {
//       return res
//         .status(404)
//         .json({ message: "One or more products not found." });
//     }

//     // Extract relevant attributes for comparison
//     const comparisonResult = products.map((product) => ({
//       itemName: product.itemName,
//       price: product.price,
//       description: product.description,
//       colors: product.colors,
//       sizes: product.sizes,
//       // Add any other attributes you want to compare
//     }));

//     res.status(200).json({
//       message: "Products compared successfully",
//       comparisonResult,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal Server Error: " + error.message,
//     });
//   }
// };

//Function to generate share URL

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
      const { isNew, discountedPrices, discountedGeneralPrice } = calculateDiscountAndTag(product);

      return {
        itemName: product.itemName,
        price: product.price,
        discountedGeneralPrice: discountedGeneralPrice, // Include the discounted general price
        description: product.description,
        colors: product.colors,
        sizes: product.sizes,
        discountedPrices: discountedPrices, // Include discounted prices per size
        isNew: isNew, // Include whether the product is new
        // Add any other attributes you want to compare
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

const generateShareUrls = (product) => {
  const encodedProductName = encodeURIComponent(product.itemName);
  const encodedProductUrl = encodeURIComponent(
    `http://yourwebsite.com/products/${product._id}`
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

const rateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating } = req.body;
    const userId = req.user.userId;

    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find existing rating by the user
    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    let update;

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

    // Prepare update object
    update = {
      ratings: product.ratings,
      averageRating,
    };

    // Save the product without triggering full validation
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: update },
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

const commentProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;

    // Check if the product exists
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create the new comment object
    const newComment = {
      user: userId,
      comment,
    };

    // Use findByIdAndUpdate to push the new comment
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { new: true, runValidators: false }
    ).populate({
      path: "comments.user",
      select: "firstName lastName profileImage",
    });

    // Get the newly added comment with the populated user details
    const addedComment = updatedProduct.comments.pop();

    // Combine firstName and lastName
    const fullName = `${addedComment.user.firstName} ${addedComment.user.lastName}`;

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        ...addedComment._doc,
        user: {
          _id: addedComment.user._id,
          name: fullName,
          profileImage: addedComment.user.profileImage, // Include the user's profile image
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

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

//End point to update prices and sizes
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

//Endpoint to update colour
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

//Endpoint to delete color
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

// Get a product by ID
// const getProductById = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { id } = req.params;
//     const product = await productModel.findById(id).populate("Category");
//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found",
//       });
//     }
//     res.status(200).json({
//       message: `Product fetched`,
//       data: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//     });
//   }
// };

const getProductById = async (productId) => {
  try {
    const product = await productModel.findById(productId).populate("category");

    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate discount and tag
    const { isNew, discountedPrices, discountedGeneralPrice } = calculateDiscountAndTag(product);

    // Update the product's discountedPrices and isNew fields
    product.discountedPrices = discountedPrices;
    product.isNew = isNew;
    product.discountedGeneralPrice = discountedGeneralPrice;

    return product;
  } catch (error) {
    throw error;
  }
};

// Get all products
// const getAllProducts = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const products = await productModel.find().populate("Category");
//     res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find().populate("category");

    

    // Iterate over each product and apply the discount and tag logic
    const updatedProducts = products.map((product) => {
      const { isNew, discountedPrices, discountedGeneralPrice } = calculateDiscountAndTag(product);
      product.isNew = isNew;
      product.discountedPrices = discountedPrices;
      product.discountedGeneralPrice = discountedGeneralPrice;
      
      return product;
     
    });
    

    res.status(200).json({ success: true,
      length : products.length,
       data: updatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
};
