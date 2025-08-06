const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: '"Hired Ready" <noreply@hiredready.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("There was an error sending the email. Try again later.");
  }
};

module.exports = sendEmail;