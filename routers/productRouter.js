const router = require("express").Router();

const {  createProduct,
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
    sortProducts, } = require("../controllers/productController");
const { authenticate } = require("../middleWares/authentication");
const {upload} = require("../middleWares/multer")

//endpoint to create product category
router.post('/create-product/:categoryId', upload.array('images', 5),  createProduct);

//endpoint to update product 
router.put('/update-product/:productId', upload.array('images', 5), updateProduct);

//endpoint to share product
router.get('/share/:productId', shareProduct)

//endpoint to update size and price of product
router.put('/update-size/:productId/:sizeId', updateSize);

//endpoint to delete product by id
router.delete("/delete-size/:productId/:sizeId", authenticate, deleteSize)

//endpoint to update color of product
router.put('/update-color/:productId/colors/:colorIndex', updateColor);

// Compare Products Endpoint
router.post('/compare', compareProducts)

//endpoint to delete color
router.delete('/delete-color/:productId/:colors/:colorIndex', deleteColor);

//endpoint to get all products
router.get('/get-products', authenticate, getAllProducts)

//endpoint to get one product by id
router.get("/get-one-product/:id",authenticate, getProductById)

//endpoint to delete product by id
router.delete("/delete-product/:id", authenticate, deleteProduct)

//sortBy to sort products
router.get("/sort-product", sortProducts)


module.exports = router