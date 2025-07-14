import express, { Router } from 'express';
import Otp from './../models/otp.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate Random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();
  console.log('Received email:', email, 'Generated OTP:', otp);

  try {
    const otpDoc = await Otp.create({ email, otp });
    console.log('OTP saved:', otpDoc);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`
    };

    const mailResult = await transporter.sendMail(mailOptions);
    console.log('Mail sent:', mailResult);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error in /send-otp:', err);
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });

    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Optional: Delete OTP after successful verification
    await Otp.deleteOne({ _id: validOtp._id });

    res.status(200).json({ message: 'OTP Verified Successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

export default router;
