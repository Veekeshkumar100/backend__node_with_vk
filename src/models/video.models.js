import mongoose ,{Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema= new Schema({
  videoFile:{
    type:String,
    require:true,
  },
  description:{
    type:String,
    require:true,
  },
  thumbnail:{
    type:String,
    require:true,
  },
  title:{
     type:String,
    require:true,
  },
  duration:{
    type:Number,
    require:true,
  },
  views:{
      type:Number,
    require:true,
    default:true,
  },
  isPublished:{
    type:Boolean,
    require:true,
  },
  owner:{
   type: Schema.Types.ObjectId,
   ref:"User"
  }

},{timestamp:true})

videoSchema.plugin(mongooseAggregatePaginate)
export  const  Video=  mongoose.model("Video",videoSchema);