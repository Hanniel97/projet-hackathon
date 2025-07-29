import mongoose from "mongoose"

export const connectDatabase = async () => {
    try{
        const {connection} = await mongoose.connect("mongodb+srv://"+ process.env.DB_USER_PASS + "@cluster0.c26dsbx.mongodb.net/hackathon_db");
        console.log(`MongoDB connected: ${connection.host}`);
    }catch(error){
        console.log(error)
        process.exit(1);
    }
}