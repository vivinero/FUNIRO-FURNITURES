const productModel = require('../models/productModel.js');
const categoryModel = require('../models/categoryModel.js');

const filterProduct = async (req, res) => {
    try {
        // Extract the query parameters
        const { productName, categoryName } = req.query;

        // Log the query parameters for debugging
        console.log('Query Parameters:', { productName, categoryName });

        // Initialize an empty result object
        const result = {};

        // Build the filter object for products
        let productFilter = {};
        if (productName) {
            productFilter.itemName = new RegExp(productName, 'i'); // Correct key 'itemName'
        }

        // Build the filter object for categories
        let categoryFilter = {};
        if (categoryName) {
            categoryFilter.categoryName = new RegExp(categoryName, 'i');
        }

        // Find products based on the filter if productName is provided
        if (productName) {
            result.products = await productModel.find(productFilter);
        }

        // Find categories based on the filter if categoryName is provided
        if (categoryName) {
            result.categories = await categoryModel.find(categoryFilter);
        }

        // Send the filtered result as a response
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = filterProduct;
