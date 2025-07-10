import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected`);
    }
    catch(err){
        console.error(`Error connecting to MongoDB: ${err.message}`);
    }
}

export default connectDB;
