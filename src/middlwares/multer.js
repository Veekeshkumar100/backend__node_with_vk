import multer from "multer";


const randomString=()=>
{
   const character="abcdefghijklmnopqrstuvwxyz"

   let result="";
   for(let i=0;i<=10;i++)
   {
      result+=character[Math.floor(Math.random()*character.length)];
   }
   return result;
}



const storage=multer.diskStorage({
   destination: function(req,file,cb){
    cb(null,"./public/temp")
   },

    filename: function(req,file,cd){
    cd(null,randomString() + '-' + file.originalname)
  }
})

export const upload=multer({ storage})