import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    senderId : {
       type : mongoose.Schema.Types.ObjectId,
       ref : "User",
       required : true
    },
    recieverId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    text: {type:String},
    image:{type:String},
    seen:{type : Boolean, default:false}

})

const message = mongoose.model('Messagea',messageSchema)

export default message