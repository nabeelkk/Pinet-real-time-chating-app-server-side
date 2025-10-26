import mongoose from "mongoose";
import User from "../model/User.js";
import { generateToken } from "../lib/util.js";
import cloudinary from "../lib/cloudinaryy.js";
import bcrypt from 'bcryptjs'


export const signup = async(req,res)=>{
    const {fullName,email,password,bio} = req.body

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success:false, message:"Missing details"})
        }
        const user = await User.findOne({email})
        if(user){
            return res.json({success:false, message:"Account already exist"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            fullName,email,password:hashedPass,bio
        })
        const token = generateToken(newUser._id)
        console.log(newUser,"newUser")
        res.json({success:true, userData: newUser, token , message:"Account Created Succesfully"})
    } catch (error) {
        console.log("signup side",error.message)
        res.json({success:false,message:error.message})
    }
}

export const login = async(req,res)=>{
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        
        const checkPass = await bcrypt.compare(password,user.password)
        if(!checkPass){
            return res.json({success:false, message:"Invalid Credentails"})
        }

        const token = generateToken(user._id)

        res.json({success:true, userData:user, token, message:"Login Successfully"})

    } catch(error){
        console.log("login side",error.message)
        res.json({success:false, message:error.message})
    }

}

export const checkAuth = async(req,res)=>{
    res.json({success:true, user:req.user})
}

export const updateProfile = async(req,res)=>{
    try {
        const {profilePic, fullName, bio} = req.body

        const userId = req.user._id

        let updatedUser 

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{fullName, bio},{new:true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId , {profilePic:upload.secure_url, fullName, bio},
                {new:true}
            )
        }
        res.json({success:true, user: updatedUser})
    } catch (error) {
        console.log("update-profile side",error.message)
        res.json({success:true, message: error.message})
    }
}