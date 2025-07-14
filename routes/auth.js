// ✅ Place all imports at top
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import Otp from '../models/otp.js'
import { Router } from 'express'

const router = Router()

// ✅ Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
  }
})

// ✅ Login with password
router.post("/login-by-password", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Invalid password" })

    return res.status(200).json({ message: "Login successful", user })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

// ✅ Login with OTP
router.post('/verify-login', async (req, res) => {
  const { email, otp } = req.body
  try {
    const validOtp = await Otp.findOne({ email, otp })
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    await Otp.deleteOne({ _id: validOtp._id })
    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// ✅ Signup with OTP verification
router.post('/verify-signup', async (req, res) => {
  const { name, email, password, otp } = req.body
  try {
    const validOtp = await Otp.findOne({ email, otp })
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' })

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()

    await Otp.deleteOne({ _id: validOtp._id })

    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
