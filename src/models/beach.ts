import mongoose, { Document, Model, model } from "mongoose";


export enum BeachePosition{
    S= 'S',
    E= 'E',
    N= 'N',
    W= 'W'
}

export interface Beach {
    lat: number
    lng: number,
    name: string,
    position: BeachePosition,
    _id?: string
}
const schema = new mongoose.Schema(
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: { type: String, required: true },
      position: { type: String, required: true },
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


  export const Beach = mongoose.model<Beach>('Beach', schema)