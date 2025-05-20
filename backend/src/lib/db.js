import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL);
    console.log(connection.connection.host + '  connectdb');
  } catch (error) {
    console.log(error);
  }
};
