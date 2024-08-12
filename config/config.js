const mongoose = require("mongoose")
require("dotenv").config()

const db = process.env.APILINK

mongoose.connect(db).then(()=>{
    console.log('Database Connected Successfully');
}).catch((e)=>{
    console.log(e.message);
})

