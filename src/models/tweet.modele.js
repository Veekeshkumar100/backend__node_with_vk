import mongoose, { Schema } from "mongoose";

const tweetSchema=new mongoose.Schema({
 content:{
      type:String,
      require:true,
    },
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
    },
},{timestamps:true})

export const Tweet=mongoose.Model("Tweet",tweetSchema)
