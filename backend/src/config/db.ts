import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no está definido en .env');

  await mongoose.connect(uri);
  console.log(`✅ MongoDB conectado: ${mongoose.connection.host}`);
}
