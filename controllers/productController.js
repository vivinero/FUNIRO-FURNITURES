const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const cloudinary = require('../middleWares/cloudinary')


// Create a new product
const createProduct = async (req, res) => {
    try {
       const userId = req.user.userId;
        const { categoryId } = req.params;
        const { itemName, detail, price } = req.body;

        if (!userId) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const theCategory = await Category.findById(categoryId);

        if (!theCategory) {
            return res.status(404).json({
                error: 'Category not found'
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
                    message: 'Uploaded file not found'
                });
            }

            // Upload the image to Cloudinary
            const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
                folder: 'productImages'
            });

            imageDetails = {
                public_id: cloudinaryUpload.public_id,
                url: cloudinaryUpload.secure_url
            };

            // Optionally delete the local file after upload
            fs.unlinkSync(imageFilePath);
        }

       

        const newProduct = await Product.create({
            itemName,
            detail,
            price,
            image: imageDetails,
            category: categoryId
        });

        res.status(201).json({
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
//update a product by id
const updateProduct = async (req, res) => {
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
                    message: "Uploaded file not found"
                });
            }

            // Upload the image to Cloudinary
            const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
                folder: "productImages"
            });

            updatedImages.push(cloudinaryUpload.secure_url);

            // Optionally delete the local file after upload
            fs.unlinkSync(imageFilePath);
        }

        // Handle images to delete
        if (image && image.length > 0) {
            for (let imageUrl of image) {
                // Extract public ID from the image URL
                const publicId = imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`productImages/${publicId}`);
            }
        }

        const updateData = { itemName, detail, price };
        if (updatedImages.length > 0) {
            updateData.$push = { images: { $each: updatedImages } };
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        res.status(200).json({
            message: `Product updated`,
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



// Delete a product by ID
const deleteProduct = async (req, res) => {
    try {
       const userId = req.user.userId;
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }
        res.status(200).json({
            message: `Product deleted`,
            data: {}
        });
    } catch (error){
        res.status(500).json({
            error: error.message
        });
    }
};

// Get a product by ID
const getProductById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const product = await Product.findById(id).populate('Category');
        if (!product) {
            return res.status(404).json({
                error: 'Product not found' 
            });
        }
        res.status(200).json({
            message: `Product fetched`,
            data: product
        });
    } catch (error) {
        res.status(500).json({
        error: error.message
    });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const products = await Product.find().populate('Category');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { createProduct, updateProduct, getAllProducts, getProductById, deleteProduct }