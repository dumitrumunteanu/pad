import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
});

const Car = mongoose.model("Car", postSchema);
export default Car;
