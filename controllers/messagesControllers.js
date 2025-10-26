import User from "../model/User.js";
import Messages from '../model/Messages.js'
import cloudinary from '../lib/cloudinaryy.js'
import { io, userSocketMap } from "../server.js";


export const getUsersForSideBar = async(req,res)=>{
    try {
        const userId = req.user._id;
        const filteredUser = await User.find({_id:{$ne:userId}}).select("-password")
        console.log(filteredUser,"user")

        const unSeenMessages = {}
        const promises = filteredUser.map(async(user)=>{
            const messages = await Messages.find({senderId:user._id,recieverId:userId,seen:false})
            if(messages.length > 0){
                unSeenMessages[user._id] = messages.length
            }
        })
        await Promise.all(promises);
        res.json({success:true, users:filteredUser, unSeenMessages})
    } catch (error) {
        console.log(error.messages)
        res.json({success:false, message:error.message})
    }
}

export const getMessages = async(req,res)=>{
    try {
        const {id : selectedUserId} = req.params
        const myId = req.user._id
        const messages = await Messages.find({
            $or:[
                {senderId:myId , recieverId: selectedUserId},
                {senderId: selectedUserId, recieverId: myId}
            ]
        })
        await Messages.updateMany({senderId: selectedUserId , recieverId: myId},{seen:true})
        res.json({success:true, messages})
    } catch (error) {
        console.log(error.message)
        res.json({success:false , message:error.message})
    }
}

// api to mark message as seen using message id

export const markMessageAsSeen = async(req,res)=>{
    try{
        const {id} = req.params;
        await Messages.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    }catch(error){
        console.log(error.message)
        res.json({success:false , message:error.message})
    }
}

export const sendMessage = async (req,res)=>{
    try {
        const {text, image} = req.body;
        const recieverId = req.params.id
        const senderId = req.user._id
        console.log(recieverId,"reciever id")

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = await Messages.create({
            senderId,
            recieverId,
            text,
            image: imageUrl
        })

        const recieverSocketId = userSocketMap[recieverId]
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage", newMessage)
        }

        res.json({success:true , newMessage,message:"something went wrong"})

    } catch (error) {
        console.log(error.message)
        res.json({success:false , message:error.message})
    }
}