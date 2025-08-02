import mongoose, { Schema, Document } from "mongoose";

export interface PendingVerification extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    attempts: number;
    createdAt: Date;
}

const PendingVerificationSchema: Schema<PendingVerification> = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyCode: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 180 // 3 minutes in seconds
    }
});

const PendingVerificationModel = (mongoose.models.PendingVerification as mongoose.Model<PendingVerification>) || mongoose.model<PendingVerification>("PendingVerification", PendingVerificationSchema);

export default PendingVerificationModel; 