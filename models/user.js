import mongoose from "mongoose"
import bcryptjs from "bcryptjs"

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    
    mobile:{
        type:String,
    },
    email:{
        type:String,
    },
    address:{
        type:String,
        required:true,
    },
    aadharcard:{
        type:Number,
        required:true,
        unique:true,
    },
    role:{
        type:String,
        enum:["voter","admin"],
        default:"voter"
    },
    password:{
        required:true,
        type:String
    },
    isVoted:{
        type:Boolean,
        default:false
    }

});



userSchema.pre('save', async function(next){
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if(!person.isModified('password')) return next();
    try{
        // hash password generation
        const salt = await bcryptjs.genSalt(10);

        // hash password
        const hashedPassword = await bcryptjs.hash(person.password, salt);
        
        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})


userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcryptjs.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

const User=mongoose.model("User",userSchema)
export default User;
