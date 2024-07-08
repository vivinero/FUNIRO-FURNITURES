const router = require("express").Router();

const { createProduct, updateProduct, getAllProducts, getProductById, deleteProduct } = require("../controllers/productController");
const { authenticate } = require("../middlewares/authentication");
const {upload} = require("../middlewares/multer")

//endpoint to create product category
router.post('/create-product/:categoryId', upload.array('image', 5), authenticate, createProduct);

//endpoint to update product 
router.put('/update-product/:id', upload.array('image', 5), authenticate, updateProduct);

//endpoint to get all products
router.get('/get-products', authenticate, getAllProducts)

//endpoint to get one product by id
router.get("/get-one-product/:id",authenticate, getProductById)

//endpoint to delete product by id
router.delete("/delete-product/:id", authenticate, deleteProduct)


module.exports = router