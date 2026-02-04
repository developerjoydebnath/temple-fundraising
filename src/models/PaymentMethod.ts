import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  accountNumber: string;
  type: 'Bank' | 'Mobile Banking' | 'Other';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ['Bank', 'Mobile Banking', 'Other'],
      default: 'Mobile Banking',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
