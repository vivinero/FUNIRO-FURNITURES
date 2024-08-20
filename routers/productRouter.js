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
    toggleLikeProduct,
    getProductLikes,
    rateProduct,
    commentProduct,
    deleteAllComments,
    deleteAllCommentsUnderProduct,
    allComments,
    sortProducts,
    updateStock,
    getAllStock,
    getProductStock
     } = require("../controllers/productController");
const { authenticate } = require("../middleWares/authentication");
const {upload} = require("../middleWares/multer")


//endpoint to create product category
router.post('/create-product/:categoryId', upload.array('images', 5),  createProduct);

//endpoint to update product 
router.put('/update-product/:productId', upload.array('images', 5), updateProduct);

//endpoint to update stock 
router.put('/update-stock/:productId',  updateStock);

//endpoint to get all stocks
router.get('/stocks', getAllStock);

//endpoint to get a stock for one product
router.get('/stock/:productId', getProductStock);

//endpoint to share product
router.get('/share/:productId', shareProduct)

//endpoint to like products
router.post('/product/:id/like', authenticate, toggleLikeProduct);

//endpoint to get all likes
router.get('/product/:id/likes', getProductLikes);

//endpoint to rate product
 router.post ("/product/:productId/rate", authenticate,  rateProduct)

 //endpoint to make comment
 router.post('/product/:id/comment', authenticate, commentProduct)

 //endpoint to delete comments under all products
 router.delete('/delete-comments', deleteAllComments);

//endpoint to delete comments under a product
 router.delete('/delete/:id/comments', deleteAllCommentsUnderProduct);


 //endpoint to get all comments
 router.get('/product/:id/comments', authenticate, allComments)


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
router.get('/get-products', getAllProducts)

//endpoint to get one product by id
router.get('/get-one-product/:id', async (req, res) => {
    try {
      const product = await getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

//endpoint to delete product by id
router.delete("/delete-product/:id", authenticate, deleteProduct)

//sortBy to sort products
router.get("/sort-product", sortProducts)


module.exports = router