import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        mongoose.connection.on('connected',()=>console.log("MongoDb Connected"))
        mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch (error) {
        console.log("MongoDb Error:",error)
    }
}

export default connectDb