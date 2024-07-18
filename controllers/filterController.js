const productModel = require('../models/productModel.js');
const categoryModel = require('../models/categoryModel.js');


const filterProduct = async(req, res) =>{
    try{
        // extract the query parameter
        const {productName, categoryName} = req.query

        // build the filter object for both product and category
        let productFilter = {};
        let categoryFilter = {};

        if(productName) {
          productFilter.productName = new Regexp(productName, 'i')
        }

        if(categoryName) {
          categoryFilter.categoryName = new RegExp(categoryName, 'i')
          }
               // Find products and categories based on the filters
          const product = await productModel.find(productFilter)
          const category = await categoryModel.find(categoryFilter)
          
        //   send the fikltered result as response
        res.json({product,category})

    }catch(err){
     res.status(500).json({error:err.message})

    }
}

module.exports = filterProduct;