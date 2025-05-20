import nodemailer from "nodemailer";

export default async function SendCodeEmail(name, email, code, text) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.OWNER_EMAIL,
        pass: process.env.EMAIL_SENDING_VALUE,
      },
    });

    const logoCid = "logo@letstopic";

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:${logoCid}" alt="Let's Topic Logo" style="width: 150px; height: auto;" />
          </div>
          <h2 style="text-align: center; color: #645EE2; margin-top: 0;">Hello ${name},</h2>
          <p style="font-size: 16px; text-align: center;">
            ${text}
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <h3 style="font-size: 28px; color: #645EE2; background: #f0f0ff; display: inline-block; padding: 10px 20px; border-radius: 8px; letter-spacing: 2px;">
              ${code}
            </h3>
          </div>
          <p style="font-size: 14px; color: #888;text-align: center;">
If this was you, no action is needed.  <br>
If this wasn’t you, please secure your account immediately by changing your password.          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="text-align: center; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Let's Topic. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.OWNER_EMAIL,
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${code}`,
      html: emailHtml,
      attachments: [
        {
          filename: "logo.png",
          path: "./public/images/logo.png",
          cid: logoCid,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
