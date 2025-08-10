import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSideBar = async(req,res) =>{
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-password"); // find all the users expect the logged in user

        res.status(200).json(filteredUsers);
    }catch(err){
        console.log("Error in the getUSersForSidebar controller : ", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const getMessages = async (req,res) =>{
    try {
        const {id : userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({   // find all the messages where sender is me and the reciever and u or the vice versa
            $or:[
                {senderId : myId, receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId},
            ]
        })

        res.status(200).json(messages);

    } catch (err) {
        console.log("Error in the getMessages controller : ", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const sendMessage = async (req,res) =>{
    try {
        const {text, image} = req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if(image){
            //upload base64 image to the cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl,
        });

        await newMessage.save();

        // todo : realtime functionality goes here => socket.io

        res.status(201).json(newMessage);
    } catch (err) {
        console.log("Error in the sendMessage controller : ", err.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}