import mongoose, { Schema } from "mongoose";

const playlistSchema=new mongoose.Schema({
    description:{
 type:String,
    require:true,
    },
    name:{
 type:String,
    require:true,
    },
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User"
   
    },
    videos:{
 type:Schema.Types.ObjectId,
      ref:"Video"
    },


},{timestamps:true})

export const Playlist=mongoose.Model("Playlist",playlistSchema)
