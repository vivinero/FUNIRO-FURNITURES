const mongoose = require('mongoose')

const contactUsSchema = new mongoose.Schema({
    yourName:{
        type:String,
        required:true
    },
    emailAddress:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:false
    },
    message:{
        type:String,
        required:true
    },
},
{
    timestamp:true
}
)

const contactUs = mongoose.model('contactUS', contactUsSchema )
module.exports = contactUs