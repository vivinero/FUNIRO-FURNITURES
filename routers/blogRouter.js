const blog = require("express").Router()
const {upload} = require("../middleWares/multer")

const { createBlog, search, getRecentPosts } = require("../controllers/blogControl")

blog.post("/create-blog", upload.array('images', 5), createBlog)
blog.post("/search", search)
blog.post("/recentPost", getRecentPosts)

module.exports = blog