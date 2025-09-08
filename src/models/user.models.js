import mongoose ,{Schema} from "mongoose";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UseSchema= new Schema({

    username:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
       type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
  
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true
    },
    password:{
     type:String,
     require:[true,"Password is true"],
     
    },
   avatar:{
    type:String,
    require:true,
   },
   coverImage:{
      type:String,
   },
   watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"video",
    }
   ],
   refrenceToken:{
    type:String,
   }
},{
    timestamps:true,
}
)



UseSchema.pre("save",async function(next){
     if(!this.isModified("password")) return next();
   this.password= await bcrypt.hash(this.password, 12);
   next();
})


UseSchema.methods.isPosswordCurrect=async function(password) {
        return await bcrypt.compare(this.password,password);
}



UseSchema.methods.generateAccessToken= function (){
    return  jwt.sign(
        {
           _id:this._id,
        email:this.email,
         username:this.username,
         fullName:this.fullName,
       },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )
}




UseSchema.methods.generateRefreashToken=function(){
    return jwt.sign({
        _id:this._id,
    },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
)
} 


export const User = mongoose.model("User",UseSchema);