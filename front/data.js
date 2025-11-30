import mongoose from 'mongoose';
export const entry=new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    password:String
});
// export const user=mongoose.model("second",entry);