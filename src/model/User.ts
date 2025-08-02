import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document{
    sender : Schema.Types.ObjectId;
    content : string;
    createdAt : Date;
    sendto : Schema.Types.ObjectId;
    status : 'Read'|'Completed'|'Sent';
}

const MessageSchema: Schema<Message> = new Schema({
    sender : {
        type : Schema.Types.ObjectId,
        required : true
    },
    content : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        required : true,
        default : Date.now
    },
    sendto : {
        type : Schema.Types.ObjectId,
        required : true
    },
    status: { 
    type: String, 
    enum: ['Read', 'Completed', 'Sent'], 
    default: 'Sent' 
  }
})

export interface Medicine extends Document {
    name: string;
    quantity: number;
    UsePerDay: number;
    DateAdded: Date;
    time: string;
    // Remove quantityLeft as it's calculated dynamically
}

const MedicineSchema: Schema<Medicine> = new Schema({
    name : {
        type : String,
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    UsePerDay : {
        type : Number,
        required : true
    },
    DateAdded : {
        type : Date,
        required : true,
        default : Date.now
    },
    time: {
        type: String,
        required: true,
        default: '08:00'
    }
})

export interface User extends Document{
    username : string;
    email : string;
    password : string;
    verifyCode : string;
    verifyCodeExpiry : Date;
    isVerified : boolean;
    family_ID : Schema.Types.ObjectId;
    medicines : Medicine[];
    messages : Message[];
    ToDoList : TodoItem[];
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    dueDate?: Date;
}

const UserSchema: Schema<User> = new Schema({
    username : {
        type : String,
        required : [true, "Username is required"],
        trim : true,
        unique : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    family_ID : {
        type : Schema.Types.ObjectId
    },
    verifyCode:{
        type : String,
        required : false
    },
    verifyCodeExpiry:{
        type : Date,
        required : false
    },
    isVerified: {
        type : Boolean,
        default : false
    },
    medicines : [MedicineSchema],
    messages : [MessageSchema],
    ToDoList : [{
        id: { type: String, required: true },
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        createdAt: { type: Date, default: Date.now },
        dueDate: { type: Date }
    }]
})

const UserModel = (mongoose.models.User as mongoose.
    Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;