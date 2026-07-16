import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const from = process.env.EMAIL_FROM;
        if (!from) {
            throw new Error("EMAIL_FROM environment variable is not defined.");
        }
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY environment variable is not defined.");
        }

        const { data, error } = await resend.emails.send({
            from,
            to: [to],
            subject,
            html,
            text
        });

        if (error) {
            console.error(`❌ Email send failed to ${to}:`, error);
            throw new Error(`Resend Error: ${error.message || JSON.stringify(error)}`);
        }

        console.log(`✅ Email sent successfully to ${to}. Message ID: ${data?.id}`);
        return { success: true, data };
    } catch (err) {
        console.error(`❌ sendEmail critical failure to ${to}:`, err.message);
        throw err;
    }
};


export const sendOtpEmail = async (email, otp) => {
    const subject = "SarkariPath Email Verification OTP";
    const text = `Your email verification OTP is ${otp}. This OTP is valid for 5 minutes.`;
    const html = `
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
    `;

    return await sendEmail({ to: email, subject, html, text });
};


export const sendForgotPasswordOtpEmail = async (email, otp) => {
    const subject = "SarkariPath Password Reset OTP";
    const text = `Your password reset OTP is ${otp}. This OTP is valid for 5 minutes.`;
    const html = `
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
    `;

    return await sendEmail({ to: email, subject, html, text });
};
