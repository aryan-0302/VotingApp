import express from "express";
import User from "../models/user.js";
import { jwtAuthMiddleware,generateToken } from "../jwt.js";


const userRoute=express.Router();

// SignUp:
userRoute.post('/signup',async(req,res)=>{
    try{
        const data=req.body;

        // create a new user:
        const newuser=new User(data);

        // save this user into database:
        const response=await newuser.save();
        console.log('data saved');


        // generating token:sirf id bhej rhe hai kyuki agar aadhar cardno bhej denge to koi bhi token se adhar cardno nikal lega.
        const payload={
            id:response.id,
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload);
        console.log("Token:",token);
        res.status(200).json({reponse:response,token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"});
    }
})





// Login:
userRoute.post('/login',async(req,res)=>{
    try{
        const {aadharcard,password}=req.body;

        // Find the user by aadharcard
        const user=await User.findOne({aadharcard:aadharcard});

        // if user does not exist or password
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({
                error:"Invalid username or password"
            });
        }


        // generate token
        const payload={
            id:user.id,
        }
        const token=generateToken(payload);
        res.json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error:"});
    }
});




// Profile route: where user can see his profile/data
userRoute.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData=req.user;
        const userId=userData.id;
        const user=await User.findById(userId)
        res.status(200).json({user});
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            error:"internal server error"
        });
    }
})





// From where user can change password
userRoute.put('/profile/password',async(req,res)=>{
    try{
        // extract the id from the token
           const userId=req.user;
           const {currentPassword,newPassword}=req.user;


        // Find the user by userid
        const user=await User.findById(userId);

        // if password does not match,return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({
                error:"Invalid username or password"
            });
        }

        // update
        user.password=newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message:"password updated"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal server error"});
    }
})

export default userRoute;