import express, { response } from "express";
import Candidate from "../models/Candidate.js"
import { jwtAuthMiddleware } from "../jwt.js";
import User from "../models/user.js"

const candidateRoute=express.Router();

const checkadminRole=async(userId)=>{
    try{
        const user=await User.findById(userId);
        return user.role==="admin";
    }
    catch(err){
        return false;
    }
}


// post route to add a candidate:
candidateRoute.post('/',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkadminRole(req.user.id)){
            return res.status(403).json({message:"user has not admin role"});
        }
        const data=req.body;

        // create a new user:
        const newcandidate=new Candidate(data);

        // save this user into database:
        const response=await newcandidate.save();
        console.log('data saved');
       
        res.status(200).json({reponse:response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"});
    }
})






// From where user can change password
candidateRoute.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkadminRole(req.user.id)){
            return res.status(403).json({message:"user has not admin role"});
        }
       
           const candidateID=req.params.candidateID;
           const updateCandidateData=req.body;


        // Find the user by userid
        const reponse=await Candidate.findByIdAndUpdate(candidateID,updateCandidateData,{
        new:true,
        runValidators:true,
        })


        if(!reponse){
            return res.status(404).json({error:"candidate not found"});
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(error){
        console.log(error);
        res.status(500).json({error:"Internal server error"});
    }
})









candidateRoute.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkadminRole(req.user.id)){
            return res.status(403).json({message:"user has not admin role"});
        }

        const candidateID=req.params.candidateID;


        // Find the user by userid
        const reponse=await Candidate.findByIdAndDelete(candidateID)


        if(!reponse){
            return res.status(404).json({error:"candidate not found"});
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})






// lets  start voting
candidateRoute.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed to vote' });
        }

        // Update the candidate document to record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update the user document to indicate they have voted
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});








// vote count
candidateRoute.get('/vote/count',async(req,res)=>{
    try{
        // find all the candidates and sort them by votecount in descending order
        const candidate=await Candidate.find().sort({voteCount:'desc'});

        // map the candidates to only return their name and votecount
        const voterecord=candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        });
        return res.status(200).json(voterecord);
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal server error"});
    }
})
export default candidateRoute;