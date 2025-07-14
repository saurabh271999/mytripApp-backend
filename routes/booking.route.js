import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { from, to, departureDate, arrivalDate, userEmail } = req.body;
   console.log("Sending to:", userEmail);
  if (!userEmail) {
    return res.status(400).json({ success: false, message: "User email not provided" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: userEmail, // ✅ MUST BE VALID
      subject: 'Flight Booking Confirmation',
      html: `
        <h2>Your flight is booked!</h2>
        <p><strong>From:</strong> ${from}</p>
        <p><strong>To:</strong> ${to}</p>
        <p><strong>Departure:</strong> ${departureDate}</p>
        <p><strong>Arrival:</strong> ${arrivalDate}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Email failed", error: err.message });
  }
});

export default router;
