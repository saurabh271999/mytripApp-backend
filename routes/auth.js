import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import Otp from '../models/otp.js'; // Make sure this import exists
import { Router } from 'express'

const router = Router();

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json(
            { message: "User already exists" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()

        res.status(201).json({ message: "User created successfully" })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'User not found' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.json({ message: 'Login successful', token })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error })
    }
})

router.post('/verify-signup', async (req, res) => {
    const { name, email, password, otp } = req.body;
    try {
        // 1. Verify OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // 4. Delete OTP after use
        await Otp.deleteOne({ _id: validOtp._id });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/verify-login', async (req, res) => {
    const { email, otp } = req.body;
    try {
        // 1. Find OTP for this email
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // 2. Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // 3. Delete OTP after use
        await Otp.deleteOne({ _id: validOtp._id });

        // 4. Respond with success
        res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;





