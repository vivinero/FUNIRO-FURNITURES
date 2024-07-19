const router = require("express").Router();

const { createCategory, updateCategory,getAllCategory, getAllCategories, getCategoryById, deleteCategory } = require("../controllers/categoryController");
const { authenticate } = require("../middleWares/authentication");


//endpoint to create product category
router.post('/create-category',createCategory)

// GET /api/categories - Fetch all categories with sub-categories
router.get('/all-categories', getAllCategory)

//endpoint to update product category
router.put('/update-category/:id', authenticate, updateCategory)

//endpoint to get all product categories
router.get('/get-categories', getAllCategories)

//endpoint to get one category by id
router.get("/get-one-category",authenticate, getCategoryById)

//endpoint to delete category by id
router.delete("/delete-category/:categoryId", authenticate, deleteCategory)


module.exports = router