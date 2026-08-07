import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Mongo URL exists:", !!process.env.MONGODB_URL);

    const connection = await mongoose.connect(process.env.MONGODB_URL);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};