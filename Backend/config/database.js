import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();    

const connectDB = async () => { 

    try {
 
        const DB_URI = process.env.DB_URI;
        await mongoose.connect(DB_URI);
        console.log("Database Connected Successfully");

    } catch (error) { 

        console.log("Error in connecting to database",error.message);
    }

}

export default connectDB;