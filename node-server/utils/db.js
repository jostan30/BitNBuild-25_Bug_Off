import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;
if (!URI) {
    throw new Error("MONGODB_URI is not defined in .env");
}

const connectDB = async () => {
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB Connection Failed >>", error);
        throw error; 
    }
};

export default connectDB;
