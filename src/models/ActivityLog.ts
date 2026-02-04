import mongoose, { Document, Schema } from 'mongoose';

export enum ActivityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface IActivityLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  action: ActivityAction;
  target: string; // e.g., 'Donor', 'Donation', 'PaymentMethod', 'Admin'
  details: string; // e.g., 'Added donor Shanto', 'Deleted donation #123'
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    action: { type: String, enum: Object.values(ActivityAction), required: true },
    target: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
