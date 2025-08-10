import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {generateTokens} from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req,res)=>{
    const {fullName, email, password} = req.body;
    try{

        if(!fullName || !email || !password){
            return res.status(400).json({
                message : "All the fields are required"
            })
        }

        if(password.length < 6){
            return res.status(400).json({
                message : "Password must be at least 6 characters"
            })
        }

        const user = await User.findOne({email})

        if(user){
            return res.status(400).json({
                message : "Email Already Exists"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword
        })

        if(newUser){
            // Generate the JWT token here
            generateTokens(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                newUser,
                message : "New User Created Successfully"
            })
        }else{
            res.status(400).json({
                message : "Invalid User Data"
            })
        }

    }catch(err){
        console.log("Error in the signup controller", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const login = async (req,res)=>{
    const {email, password} = req.body;
    
    try{
        const user = await User.findOne({email});

        if(!user){
            res.status(400).json({
                message : "Invalid Credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            res.status(400).json({
                message : "Invalid Credentials"
            })
        }

        generateTokens(user._id, res);

        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic,
        });

    }catch(err){
        console.log("Error in the login controller", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const logout = (req,res)=>{
    try{
        res.cookie("jwt","", {maxAge : 0})

        res.status(200).json({
            message : "Logged Out Successfully!"
        })
    }catch(err){
        console.log("Error in the logout controller", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const updateProfile = async(req,res) =>{
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({
                message : "Profile Pic is required"
            });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser= await User.findByIdAndUpdate(userId, {profilePic : uploadResponse.secure_url}, {new:true}) //By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.

        res.status(200).json(updatedUser);

    }catch(err){
        console.log("Error in the updateProfile controller", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const checkAuth = (req,res) =>{
    try{
        res.status(200).json(req.user);
    }catch(err){
        console.log("Error in the checkAuth controller", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}