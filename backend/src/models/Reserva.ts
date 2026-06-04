import { Schema, model, Document } from 'mongoose';
import type { ReservaStatus } from '../types';

export interface IReserva extends Document {
  finca: Schema.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  people: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  status: ReservaStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservaSchema = new Schema<IReserva>(
  {
    finca:        { type: Schema.Types.ObjectId, ref: 'Finca', required: true },
    guestName:    { type: String, required: true, trim: true },
    guestEmail:   { type: String, required: true, lowercase: true, trim: true },
    checkIn:      { type: Date, required: true },
    checkOut:     { type: Date, required: true },
    nights:       { type: Number, required: true, min: 1 },
    people:       { type: Number, required: true, min: 1 },
    subtotal:     { type: Number, required: true },
    cleaningFee:  { type: Number, default: 90000 },
    serviceFee:   { type: Number, required: true },
    total:        { type: Number, required: true },
    status:       { type: String, enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' },
    notes:        { type: String },
  },
  { timestamps: true }
);

export default model<IReserva>('Reserva', ReservaSchema);
