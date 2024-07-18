const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const cloudinary = require("../middlewares/cloudinary");
const path = require("path");
const fs = require("fs");
const productModel = require("../models/productModel");

// Create a new product
// const createProduct = async (req, res) => {
//     try {
//        //const userId = req.user.userId;
//         const { categoryId } = req.params;
//         const { itemName, detail, price } = req.body;

//         if (!userId) {
//             return res.status(404).json({
//                 error: 'User not found'
//             });
//         }

//         const theCategory = await Category.findById(categoryId);

//         if (!theCategory) {
//             return res.status(404).json({
//                 error: 'Category not found'
//             });
//         }

//         let imageDetails = {};

//         // Handle image upload if a file is provided
//         if (req.file) {
//             // Path to the uploaded file
//             const imageFilePath = path.resolve(req.file.path);

//             // Check if the file exists before proceeding
//             if (!fs.existsSync(imageFilePath)) {
//                 return res.status(400).json({
//                     message: 'Uploaded file not found'
//                 });
//             }

//             // Upload the image to Cloudinary
//             const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
//                 folder: 'productImages'
//             });

//             imageDetails = {
//                 public_id: cloudinaryUpload.public_id,
//                 url: cloudinaryUpload.secure_url
//             };

//             // Optionally delete the local file after upload
//             fs.unlinkSync(imageFilePath);
//         }

//         const newProduct = await Product.create({
//             itemName,
//             detail,
//             price,
//             image: imageDetails,
//             category: categoryId
//         });

//         res.status(201).json({
//             message: 'Product created successfully',
//             data: newProduct
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: error.message
//         });
//     }
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

      imageDetails = {
        public_id: cloudinaryUpload.public_id,
        url: cloudinaryUpload.secure_url,
      };

      // Optionally delete the local file after upload
      fs.unlinkSync(imageFilePath);
    }

    // Parse sizes if it's a string
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

    // Create the new product
    const newProduct = await productModel.create({
      itemName,
      description,
      colors,
      sizes: parsedSizes,
      price,
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

const compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length < 2) {
      return res
        .status(400)
        .json({
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

    // Extract relevant attributes for comparison
    const comparisonResult = products.map((product) => ({
      itemName: product.itemName,
      price: product.price,
      description: product.description,
      colors: product.colors,
      sizes: product.sizes,
      // Add any other attributes you want to compare
    }));

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

//Function to generate share URL
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

//update a product by id
const updateProductsss = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { itemName, detail, price, image } = req.body;
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

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json({
      message: `Product updated`,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
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
const getProductById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const product = await productModel.findById(id).populate("Category");
    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }
    res.status(200).json({
      message: `Product fetched`,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const products = await productModel.find().populate("Category");
    res.status(200).json({ success: true, data: products });
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
};
