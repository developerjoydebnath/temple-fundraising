import mongoose, { Document, Schema } from 'mongoose';

export interface IDonor extends Document {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  occupation?: string;
  totalDonation: number;
  lastDonationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonor>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    occupation: { type: String },
    totalDonation: { type: Number, default: 0 },
    lastDonationDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Donor || mongoose.model<IDonor>('Donor', DonorSchema);
