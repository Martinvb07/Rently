import { Schema, model, Document } from 'mongoose';

export type UserRole = 'huesped' | 'anfitrion' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['huesped', 'anfitrion', 'admin'], default: 'huesped' },
    phone:        { type: String },
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);
