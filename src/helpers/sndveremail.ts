import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        // Create transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Your Gmail address
                pass: process.env.GMAIL_PASS, // App password (not your regular password)
            },
        });

        // Email HTML body
        const html = `
            <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
                <div style="background: #fff; border-radius: 8px; max-width: 480px; margin: 40px auto; border: 1px solid #eaeaea; padding: 32px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #222; margin-bottom: 8px;">Welcome, ${username}</h2>
                    <p style="font-size: 16px; color: #444; margin-bottom: 24px;">Thanks for using our services.</p>
                    <p style="font-size: 16px; color: #222; margin-bottom: 8px;">Please use the following One-Time Password (OTP) to verify your account:</p>
                    <div style="background: #f4f8fb; border: 1px dashed #0070f3; border-radius: 6px; padding: 18px 0; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0070f3; margin: 16px 0 24px 0;">
                        ${verifyCode}
                    </div>
                    <p style="color: #888; font-size: 14px;">This OTP is valid for a limited time. If you did not request this, please ignore this email.</p>
                    <p style="color: #bbb; font-size: 12px; margin-top: 32px;">&copy; ${new Date().getFullYear()} Home Manager. All rights reserved.</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `HomeAppBeta <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Verification code for HomeAppBeta',
            html,
        });
        return { success: true, message: 'Email sent successfully' };
    } catch (emailError) {
        console.error('Error sending verification email', emailError);
        return { success: false, message: 'Failed to send verification email' };
    }
}
