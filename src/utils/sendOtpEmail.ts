import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Chill Labs" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Signup OTP Verification',
    html: `
      <h2>Your OTP: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `
  });
};
