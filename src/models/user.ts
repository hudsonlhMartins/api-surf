import mongoose from "mongoose";


export interface User {
    name: string
    email: string,
    password: string,
    _id?: string
}

const schema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: { type: String, required: true },
    },
    {
      toJSON: {
        transform: (_, ret): void => {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
  );

  export const User = mongoose.model<User>('User', schema)