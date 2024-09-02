const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        public_id: String,
        url: String
    },
    category: {
        type: String,
        required: true
    },
    date: { 
        type: Date, default: Date.now 
    }
}, {timestamps: true});

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
