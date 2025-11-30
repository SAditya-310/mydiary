import mongoose from 'mongoose';
export const note=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'second', required: true },
    title:String,
    content:String,
    mood:{ type: String,default:"neutral" },
    date:{type:String}
});
// export const notes=mongoose.model("notes",note);