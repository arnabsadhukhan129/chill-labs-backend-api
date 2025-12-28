import nodemailer from "nodemailer";

interface SendAdminMailPayload {
  to: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export const sendAdminCredentialsEmail = async ({
  to,
  name,
  email,
  password,
  role
}: SendAdminMailPayload) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const roleLabel =
      role === "HR_MANAGER" ? "HR Manager" : "School Admin";

    const mailOptions = {
      from: `"Admin Panel" <${process.env.MAIL_USER}>`,
      to,
      subject: `Your ${roleLabel} Account Has Been Created`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>Hello ${name},</h2>

          <p>Your <strong>${roleLabel}</strong> account has been created successfully.</p>

          <h3>Login Credentials</h3>
          <p>
            <strong>Email:</strong> ${email}<br/>
            <strong>Password:</strong> ${password}
          </p>

          <br/>
          <p>Regards,<br/>Admin Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Admin credentials email sent successfully");
  } catch (error) {
    console.error("Email send failed:", error);
  }
};
