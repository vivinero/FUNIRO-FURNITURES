const blog = require("express").Router()
const {upload} = require("../middleWares/multer")

const { createBlog, search, getRecentPosts, getAllPost, getOnePost } = require("../controllers/blogControl")

blog.post("/create-blog", upload.array('images', 5), createBlog)
blog.post("/search", search)
blog.post("/recentPost", getRecentPosts)
blog.get("/get-all-post", getAllPost)
blog.get("/get-one-post/:id", getOnePost)

module.exports = blog