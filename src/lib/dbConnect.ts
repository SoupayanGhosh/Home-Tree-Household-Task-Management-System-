import { promises } from "dns";
import mongoose from "mongoose";

type ConnectionObject = {
    isConnected? : number
}

const connection: ConnectionObject = {}

async function dbConnect (): Promise<void> {
    if(connection.isConnected){
        console.log("Already Connected to Database")
        return
    }

    try{
        await mongoose.connect(process.env.MONGODB_URI || '',{})
        console.log("DB connected successfully")
    } catch(error){
        console.log("Failed to connect",error)
        process.exit(1)
    }
}

export default dbConnect;