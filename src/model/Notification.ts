import mongoose, { Schema, Document } from "mongoose";

export interface Notification extends Document {
  userId: Schema.Types.ObjectId;
  type: 'message' | 'grocery' | 'medicine' | 'bill' | 'task';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: Schema.Types.ObjectId; // ID of related item (message, bill, etc.)
  priority: 'low' | 'medium' | 'high';
  billType?: string;
  dueDate?: Date;
  deletedAt?: Date;
}

const NotificationSchema: Schema<Notification> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'grocery', 'medicine', 'bill', 'task'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400
  },
  relatedId: {
    type: Schema.Types.ObjectId
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  billType: {
    type: String
  },
  dueDate: {
    type: Date
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const NotificationModel = (mongoose.models.Notification as mongoose.Model<Notification>) || 
  mongoose.model<Notification>("Notification", NotificationSchema);

export default NotificationModel; 