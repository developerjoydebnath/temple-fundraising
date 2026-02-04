import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethodId: mongoose.Types.ObjectId;
  transactionId?: string;
  date: Date;
  note?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    amount: { type: Number, required: true },
    paymentMethodId: { type: Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
    transactionId: { type: String },
    date: { type: Date, default: Date.now },
    note: { type: String },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
