import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async(req, res, next)=>{
    try{
        const token = req.cookie.jwt;

        if(!token){
            return res.status(401).json({
                message : "Unauthorized Access - No Token Provided"
            });
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({
                message : "Unauthorized Access - Token is Invalid"
            });
        }

        const user = await User.findById(decoded.userId).select("-password"); //deselect password field, dont send the password back

        if(!user){
            return res.status(404).json({
                message : "User not Fount"
            });
        }  

        req.user = user; //adds the user to the req

        next();

    }catch(err){
        console.log("Error in the protectRoute middleware", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}