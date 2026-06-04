import { Schema, model, Document } from 'mongoose';
import type { SceneType, FincaStatus, AmenityKey } from '../types';

export interface IFinca extends Document {
  slug: string;
  name: string;
  sector: string;
  city: string;
  dept: string;
  capacity: number;
  bedrooms: number;
  baths: number;
  pricePerNight: number;
  rating: number;
  reviews: number;
  status: FincaStatus;
  scene: SceneType;
  tagline: string;
  description: string;
  amenities: AmenityKey[];
  images: string[];
  owner: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FincaSchema = new Schema<IFinca>(
  {
    slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:          { type: String, required: true, trim: true },
    sector:        { type: String, required: true },
    city:          { type: String, required: true },
    dept:          { type: String, required: true },
    capacity:      { type: Number, required: true, min: 1 },
    bedrooms:      { type: Number, required: true, min: 1 },
    baths:         { type: Number, required: true, min: 1 },
    pricePerNight: { type: Number, required: true, min: 0 },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    reviews:       { type: Number, default: 0 },
    status:        { type: String, enum: ['disponible', 'ocupado'], default: 'disponible' },
    scene:         { type: String, enum: ['amanecer', 'pradera', 'atardecer', 'rio'], default: 'pradera' },
    tagline:       { type: String },
    description:   { type: String },
    amenities:     [{ type: String, enum: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire', 'rio'] }],
    images:        [{ type: String }],
    owner:         { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default model<IFinca>('Finca', FincaSchema);
