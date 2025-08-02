import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface GroceryItem {
  id: string;  // Explicit id field for frontend compatibility
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
}

interface GroceryListDocument extends Document {
  creator: Types.ObjectId;
  recipients: Types.ObjectId[]; // Changed from single ObjectId to array
  title?: string;
  items: GroceryItem[];
  status: 'active' | 'completed';
  completedAt : Date
}

const GroceryListSchema = new Schema<GroceryListDocument>({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Changed to array
  title: { type: String, maxlength: 100 },
  items: [{
    id: { type: String, required: true }, // Ensure id is present for each item
    name: { type: String, required: true, maxlength: 50 },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true, maxlength: 10 },
    completed: { type: Boolean, default: false }
  }],
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  completedAt : {
    type : Date
  }
});


const GroceryListModel = (mongoose.models.GroceryList as mongoose.
    Model<GroceryListDocument>) || mongoose.model<GroceryListDocument>("GroceryList", GroceryListSchema)

export default GroceryListModel;
