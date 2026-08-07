import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.log(error);
  }
};
