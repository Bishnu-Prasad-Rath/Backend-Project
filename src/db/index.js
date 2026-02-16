import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import { app } from '../app.js';

const connectDB  = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connecter successfully to ${connectionInstance.connection.host} \n`);
        app.on("error",(error)=>{
            console.log("there is something wrong with server",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port  ${process.env.PORT} is running from db/index.js`);
        })
    } catch (error) {
        console.log("MongoDb connection failed",error);
        process.exit(1); 
    }
}

export default connectDB;