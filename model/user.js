const mongoose = require('mongoose');

//basic info
const basicInfo= new mongoose.Schema({
    password:{type:String,required:true},
    email:{type:String,required:true},
    name:{type:String,required:true},
    role:{
        type:String,
        required:true,
        default:'user'
    },
    photoUrl:{
        type:String,
        required:false
    }
})


const User= mongoose.model('user',basicInfo);
module.exports= {User};

