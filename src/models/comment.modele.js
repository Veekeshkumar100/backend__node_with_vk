
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const CommentSchema=new mongoose.Schema({
    content:{
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
videoSchema.plugin(mongooseAggregatePaginate)

export const Comment=mongoose.Model("Comment",CommentSchema)