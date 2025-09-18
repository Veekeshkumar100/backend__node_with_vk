import mongoose, { Schema } from "mongoose";

const likesSchema=new mongoose.Schema({
    likedBy:{
      type:Schema.Types.ObjectId,
      ref:"User"
    },
    comment:{
      type:Schema.Types.ObjectId,
      ref:"Comment"
    },
    videos:{
 type:Schema.Types.ObjectId,
      ref:"Video"
    },
    tweet:{
 type:Schema.Types.ObjectId,
      ref:"tweet"
    },
},{timestamps:true})

export const Like=mongoose.Model("Like",likesSchema)
