import AuthService  from "@src/services/authServices";
import mongoose from "mongoose";


export interface User {
    name: string
    email: string,
    password: string,
    _id?: string
}

export enum CUSTOM_VALIDATION{
  DUPLICATED = 'DUBLICATED',
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
  schema.path('email').validate(
    async (email: string) => {
      const emailCount = await mongoose.models.User.countDocuments({ email });
      return !emailCount;
    },
    'already exists in the database.',
    CUSTOM_VALIDATION.DUPLICATED
  );





  schema.pre('save', async function ():Promise<void> {
    if(!this.password || !this.isModified('password')){
      return
    }
    try{
      const hashedPassword = await AuthService.hashPassword(this.password)
      this.password = hashedPassword
    }catch(err){
      console.error(`Error hasing the password for the  user ${this.name}`)
    }
})

  export const User = mongoose.model<User>('User', schema)