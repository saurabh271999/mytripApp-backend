import express from 'express';
import User from '../models/user.js'; // Adjust path if needed

const router = express.Router();

// GET /api/profile?email=someone@example.com
router.get('/', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      // Add more fields if needed
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;