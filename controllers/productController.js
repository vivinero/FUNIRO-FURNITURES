const productModel = require("../models/productModel");
const Category = require("../models/categoryModel");
const cloudinary = require("../middlewares/cloudinary");

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
    discountedGeneralPrice,
  };
}


const createProduct = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      itemName,
      description,
      colors,
      sizes,
      price,
      discountPercentage = 0,
    } = req.body;

    const theCategory = await Category.findById(categoryId);
    if (!theCategory) {
      return res.status(404).json({ error: "Category not found" });
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

    // Parse sizes if it's a string and if it's provided
    const parsedSizes = sizes
      ? typeof sizes === "string"
        ? JSON.parse(sizes)
        : sizes
      : [];

    // Calculate discounted prices only if sizes are provided
    let discountedPrices = [];
    if (parsedSizes.length > 0) {
      discountedPrices = parsedSizes.map((sizeObj) => {
        const discountedPrice = price * (1 - discountPercentage / 100);
        return {
          size: sizeObj.size,
          price: discountedPrice,
        };
      });
    }

    // Create the new product with or without sizes
    const newProduct = await productModel.create({
      itemName,
      description,
      colors,
      price,
      discountPercentage,
      discountedPrices,
      sizes: parsedSizes,
      images: cloudinaryUploads.map((upload) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      })),
      category: categoryId,
    });

    await newProduct.save();

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

const createProductS = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      itemName,
      description,
      colors,
      sizes,
      price,
      discountPercentage = 0,
    } = req.body;

    const theCategory = await Category.findById(categoryId);
    if (!theCategory) {
      return res.status(404).json({ error: "Category not found" });
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

    // Parse sizes if it's a string and if it's provided
    const parsedSizes = sizes
      ? typeof sizes === "string"
        ? JSON.parse(sizes)
        : sizes
      : [];

    let sizeImageMap = {};
    let generalImages = [];

    // Separate general images and size-specific images
    cloudinaryUploads.forEach((upload, index) => {
      const fileFieldName = req.files[index].fieldname;
      const sizeMatch = fileFieldName.match(/size-(\w+)/); // Assuming field names like "size-M", "size-L"
      
      if (sizeMatch) {
        const size = sizeMatch[1];
        if (!sizeImageMap[size]) {
          sizeImageMap[size] = [];
        }
        sizeImageMap[size].push({
          public_id: upload.public_id,
          url: upload.secure_url,
        });
      } else {
        generalImages.push({
          public_id: upload.public_id,
          url: upload.secure_url,
        });
      }
    });

    // Map the size images back to the corresponding size objects
    const updatedSizes = parsedSizes.map((sizeObj) => ({
      ...sizeObj,
      images: sizeImageMap[sizeObj.size] || [],
    }));

    // Calculate discounted prices only if sizes are provided
    let discountedPrices = [];
    if (updatedSizes.length > 0) {
      discountedPrices = updatedSizes.map((sizeObj) => {
        const discountedPrice = price * (1 - discountPercentage / 100);
        return {
          size: sizeObj.size,
          price: discountedPrice,
        };
      });
    }

    // Create the new product with or without sizes
    const newProduct = await productModel.create({
      itemName,
      description,
      colors,
      price,
      discountPercentage,
      discountedPrices,
      sizes: updatedSizes,
      images: generalImages, // Store the general images separately
      category: categoryId,
    });

    await newProduct.save();

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
      "discountPercentage",
      "imagesToDelete",
    ];
    const isValidUpdate = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedImages = product.images || {};

    // Handle images to delete
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach(async (imageUrl) => {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`productImages/${publicId}`);
      });

      // Remove deleted images from the product images field
      updatedImages = Object.entries(updatedImages).reduce(
        (acc, [size, images]) => {
          acc[size] = images.filter(
            (img) => !imagesToDelete.includes(img.url)
          );
          return acc;
        },
        {}
      );
    }

    // Check if files are uploaded
    if (req.files && req.files.length > 0) {
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

      // Map uploaded images to their respective sizes
      cloudinaryUploads.forEach((upload, index) => {
        const fieldName = req.files[index].fieldname; // E.g., 'images-L'
        const size = fieldName.split('-')[1]; // Extract size from the field name

        if (!updatedImages[size]) {
          updatedImages[size] = [];
        }

        updatedImages[size].push({
          public_id: upload.public_id,
          url: upload.secure_url,
        });
      });
    }

    // Update the product fields
    if (updates.itemName) product.itemName = updates.itemName;
    if (updates.description) product.description = updates.description;
    if (updates.colors) product.colors = updates.colors;
    if (updates.sizes) product.sizes = updates.sizes;
    if (updates.price) product.price = updates.price;
    if (updates.discountPercentage)
      product.discountPercentage = updates.discountPercentage;
    product.images = updatedImages;

    // Recalculate discounted prices if sizes or price/discountPercentage are updated
    if (updates.sizes && (updates.discountPercentage || updates.price)) {
      const parsedSizes =
        typeof updates.sizes === "string"
          ? JSON.parse(updates.sizes)
          : updates.sizes;

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
    req.files.forEach((file) => {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
};


const updateProducts = async (req, res) => {
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
      "discountPercentage",
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
      const imageFilePath = path.resolve(req.file.path);

      if (!fs.existsSync(imageFilePath)) {
        return res.status(400).json({
          message: "Uploaded file not found",
        });
      }

      const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
        folder: "productImages",
      });

      updatedImages.push(cloudinaryUpload.secure_url);

      fs.unlinkSync(imageFilePath);
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle images to delete
    if (imagesToDelete.length > 0) {
      for (let imageUrl of imagesToDelete) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`productImages/${publicId}`);

        product.images = product.images.filter((img) => img !== imageUrl);
      }
    }

    // Update the product fields
    if (updates.itemName) product.itemName = updates.itemName;
    if (updates.description) product.description = updates.description;
    if (updates.colors) product.colors = updates.colors;
    if (updates.sizes) product.sizes = updates.sizes;
    if (updates.price) product.price = updates.price;
    if (updates.discountPercentage)
      product.discountPercentage = updates.discountPercentage;
    if (updatedImages.length > 0) product.images.push(...updatedImages);

    // Recalculate discounted prices only if sizes are provided and either discountPercentage or price is updated
    if (updates.sizes && (updates.discountPercentage || updates.price)) {
      const parsedSizes =
        typeof updates.sizes === "string"
          ? JSON.parse(updates.sizes)
          : updates.sizes;

      if (parsedSizes && parsedSizes.length > 0) {
        const { discountedPrices, discountedGeneralPrice } =
          calculateDiscountAndTag(product);
        product.discountedPrices = discountedPrices;
        product.discountedGeneralPrice = discountedGeneralPrice;
      } else {
        // If there are no sizes, reset discountedPrices
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
      const { isNew, discountedPrices, discountedGeneralPrice } =
        calculateDiscountAndTag(product);

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

    if (req.body.rating < 1 || req.body.rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

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
    const updatedProduct = await productModel
      .findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true, runValidators: false }
      )
      .populate({
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
    const { isNew, discountedPrices, discountedGeneralPrice } =
      calculateDiscountAndTag(product);

    // Determine the label for the product
    const label = isNew ? "new" : `-${product.discountPercentage}%`;

    // Update the product's discountedPrices, isNew fields, and label
    product.discountedPrices = discountedPrices;
    product.isNew = isNew;
    product.discountedGeneralPrice = discountedGeneralPrice;

    return {
      ...product._doc,
      label,
    };
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
      const { isNew, discountedPrices, discountedGeneralPrice } =
        calculateDiscountAndTag(product);

      // Determine the label for the product
      const label = isNew ? "new" : `-${product.discountPercentage}%`;

      return {
        ...product._doc,
        isNew,
        discountedPrices,
        discountedGeneralPrice,
        label, // Add the label field
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

//sortBy Function
// const sortProducts = async (req, res) => {
//     try {
//         const { sortBy } = req.query;
//         //This object is to hold the sort criteria
//         let sortCriteria = {};

//         if (sortBy === 'price-asc') {
//             sortCriteria.price = 1;
//         } else if (sortBy === 'price-desc') {
//             sortCriteria.price = -1;
//         } else if (sortBy === 'name-asc') {
//             sortCriteria.itemName = 1;
//         } else if (sortBy === 'name-desc') {
//             sortCriteria.itemName = -1;
//         }else if (sortBy === 'category') {
//             sortCriteria.category = 1;
//         } else {
//             sortCriteria.price = 1;
//         }

//         const products = await productModel.find().sort(sortCriteria);
//         res.json(products);
//     } catch (error) {
//         res.status(500).json({
//             error: error.message
//         });
//     }
// };

const sortProducts = async (req, res) => {
  try {
    const { sortBy } = req.query;
    let sortCriteria = {};

    console.log("Received sortBy:", sortBy);

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
      // set default accending order to price
      default:
        sortCriteria["sizes.price"] = 1;
        break;
    }

    console.log("Sort Criteria:", sortCriteria); // Debugging statement

    const products = await productModel.find().sort(sortCriteria);
    console.log("Fetched Products:", products); // Debugging statement

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
  sortProducts,
};
