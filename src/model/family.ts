import mongoose, { Document, Model, Types } from 'mongoose';

interface IFamily extends Document {
  name: string;
  createdBy: Types.ObjectId; // User who created the family
  invitationCode: string; // Unique join code
  members: {
    userId: Types.ObjectId; // Reference to user who joined
    joinedAt: Date; // When they accepted the code
  }[];
  // Google Drive folder links for different content types
  docsFolder?: string; // Google Drive folder for documents
  videosFolder?: string; // Google Drive folder for videos
  photosFolder?: string; // Google Drive folder for photos
  createdAt: Date;
  updatedAt: Date;
  tasks: {
    title: string;
    createdBy: Types.ObjectId;
    tobecompletedBy: 'Today' | 'Tomorrow' | 'This Week' | 'This Month';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: Date;
  }[];
}

const familySchema = new mongoose.Schema<IFamily>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitationCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  members: [{
    _id: false, // Disable auto _id for subdocs
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // This helps, but MongoDB does not enforce uniqueness in subdocs by default
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Google Drive folder fields
  docsFolder: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty values since it's optional
        // Basic validation for Google Drive folder links
        return /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/.test(v);
      },
      message: 'Please provide a valid Google Drive folder link for documents'
    }
  },
  videosFolder: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty values since it's optional
        // Basic validation for Google Drive folder links
        return /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/.test(v);
      },
      message: 'Please provide a valid Google Drive folder link for videos'
    }
  },
  photosFolder: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty values since it's optional
        // Basic validation for Google Drive folder links
        return /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/.test(v);
      },
      message: 'Please provide a valid Google Drive folder link for photos'
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tasks: [{
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tobecompletedBy: { type: String, enum: ['Today', 'Tomorrow', 'This Week', 'This Month'], required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    dueDate: { type: Date, required: true },
  }]
});

// Generate unique alpha-numeric code before saving
familySchema.pre<IFamily>('save', async function(next) {
  if (!this.isNew) return next();
  console.log('Pre-save hook running for invitationCode');
  // Generate 8-character alphanumeric code
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  this.invitationCode = code;
  next();
});

const FamilyModel = (mongoose.models.Family as mongoose.
  Model<IFamily>) || mongoose.model<IFamily>("Family", familySchema)

export default FamilyModel;