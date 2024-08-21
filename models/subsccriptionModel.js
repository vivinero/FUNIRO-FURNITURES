const mongoose = require('mongoose');
const subscriberSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    subscribedAt:{
        type:Date,
        default:Date.now()
    },
    confirmed: { 
        type: Boolean, 
        default: false }
},
{timestamps:true}
)

const subscriber = mongoose.model("Subscriber", subscriberSchema)
module.exports = subscriber