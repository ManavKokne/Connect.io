import User from "../models/user.model";
import bcrypt from "bcryptjs";

export const signup = async (req,res)=>{
    const {fullName, email, password} = req.body;
    try{
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

        const newUser = await User({
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

export const login = (req,res)=>{
    res.send("login route")
}

export const logout = (req,res)=>{
    res.send("logout route")
}