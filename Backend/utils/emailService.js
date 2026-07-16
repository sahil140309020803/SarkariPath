import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


// Verify SMTP connection when the server starts
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed:");
        console.error(error);
    } else {
        console.log("✅ SMTP Server is ready to send emails.");
    }
});

export const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: `"SarkariPath Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "SarkariPath Email Verification OTP",
        text: `Your email verification OTP is ${otp}. This OTP is valid for 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">SarkariPath Email Verification</h2>
                <p>Hello,</p>
                <p>Thank you for signing up on SarkariPath. Please use the following 6-digit OTP to verify your email address:</p>
                <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 5px; color: #1e1b4b; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                    ${otp}
                </div>
                <p>This OTP is valid for <strong>5 minutes</strong> and can only be used once.</p>
                <p>If you did not request this verification, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated message. Please do not reply to this email.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

export const sendForgotPasswordOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: `"SarkariPath Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "SarkariPath Password Reset OTP",
        text: `Your password reset OTP is ${otp}. This OTP is valid for 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">SarkariPath Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your SarkariPath account. Please use the following 6-digit OTP to proceed with the password reset:</p>
                <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 5px; color: #1e1b4b; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                    ${otp}
                </div>
                <p>This OTP is valid for <strong>5 minutes</strong> and can only be used once.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated message. Please do not reply to this email.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

