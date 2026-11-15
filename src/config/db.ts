import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectToDb = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL as string, {
            dbName: 'Tomato_clone'
        })
        console.log('connected to mongodb.');
    }
    catch(err){
        throw new Error(`database connection error:  ${err}`);
    }
}