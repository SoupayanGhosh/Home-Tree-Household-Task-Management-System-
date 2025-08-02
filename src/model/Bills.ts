import mongoose, { Document, Model, Types } from 'mongoose';
// Define interface for each bill type
interface IBillEntry {
  amount: number;
  dueDate: Date;
  isPaid?: boolean;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
}

// Main Bill interface
interface IBill extends Document {
  family_id: Types.ObjectId;
  electricity?: IBillEntry;
  cable?: IBillEntry;
  wifi?: IBillEntry;
  tax?: IBillEntry;
}

// Bill Schema
const billSchema = new mongoose.Schema<IBill>({
  family_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  electricity: {
    amount: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date },
    status: { type: String, default: 'pending' }
  },
  cable: {
    amount: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date },
    status: { type: String, default: 'pending' }
  },
  wifi: {
    amount: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date },
    status: { type: String, default: 'pending' }
  },
  tax: {
    amount: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date },
    status: { type: String, default: 'pending' }
  }
}, { 
  strict: false // Allow additional fields
});

const BillModel = (mongoose.models.Bills as mongoose.
    Model<IBill>) || mongoose.model<IBill>("Bills", billSchema)

export default BillModel;