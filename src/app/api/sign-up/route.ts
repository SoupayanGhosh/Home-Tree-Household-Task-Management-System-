import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sndveremail";
import PendingVerificationModel from "@/model/PendingVerification";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();

        // Check if username or email exists in verified users
        const existingVerifiedUser = await UserModel.findOne({
            $or: [{ username }, { email }],
            isVerified: true
        });
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: existingVerifiedUser.username === username
                    ? "Username already taken"
                    : "Email already registered"
            }, { status: 400 });
        }

        // Remove any previous pending verification for this email
        await PendingVerificationModel.deleteOne({ email });

        // Generate OTP and expiry
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store in MongoDB (PendingVerification)
        await PendingVerificationModel.create({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            // createdAt is set automatically
        });

        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message || "Failed to send verification email"
            }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: "Verification OTP sent to email"
        }, { status: 200 });

    } catch (error) {
        console.error("Error in registration process", error);
        return Response.json({
            success: false,
            message: "Error in registration process"
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const { email, otp } = await request.json();
        console.log("OTP VERIFY REQUEST", { email, otp });

        // Find pending verification
        const pending = await PendingVerificationModel.findOne({ email });
        console.log("PENDING DOC FOUND", pending);
        if (!pending) {
            return Response.json({
                success: false,
                message: "OTP expired or invalid email"
            }, { status: 400 });
        }

        // Track attempts in a separate field (default 0)
        let attempts = pending.get("attempts") || 0;
        if (attempts >= 3) {
            await PendingVerificationModel.deleteOne({ email });
            return Response.json({
                success: false,
                message: "Maximum attempts reached. Please register again."
            }, { status: 400 });
        }

        if (pending.verifyCode !== otp) {
            attempts += 1;
            pending.set("attempts", attempts);
            await pending.save();
            return Response.json({
                success: false,
                message: "Invalid OTP",
                attemptsLeft: 3 - attempts
            }, { status: 400 });
        }

        // OTP is correct, create user
        const newUser = new UserModel({
            username: pending.username,
            email: pending.email,
            password: pending.password,
            isVerified: true,
            family_ID: null,
            medicines: [],
            messages: [],
            ToDoList: []
        });
        await newUser.save();
        await PendingVerificationModel.deleteOne({ email });

        return Response.json({
            success: true,
            message: "Account verified and created successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Error verifying OTP", error);
        return Response.json({
            success: false,
            message: "Error verifying OTP"
        }, { status: 500 });
    }
}