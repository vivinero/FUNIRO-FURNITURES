const router = require("express").Router();

const { createCategory, updateCategory, getAllCategories, getCategoryById, deleteCategory } = require("../controllers/categoryController");
const { authenticate } = require("../middleWares/authentication");
const { upload } = require("../middleWares/multer");


//endpoint to create product category
router.post('/create-category', upload.array('images', 5),  createCategory)

//endpoint to update product category
router.put('/update-category/:id', upload.array('images', 5), updateCategory)

//endpoint to get all product categories
router.get('/get-categories',  getAllCategories)

//endpoint to get one category by id
router.get("/get-one-category/:categoryId", getCategoryById)

//endpoint to delete category by id
router.delete("/delete-category/:categoryId", authenticate, deleteCategory)


module.exports = router