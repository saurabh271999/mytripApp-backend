import mongoose from 'mongoose'
import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import otpRoutes from './routes/otp.route.js'
import userProfileRoutes from './routes/userprofile.js';
import bookingRoutes from './routes/booking.route.js';
import test from './routes/test.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/userprofile', userProfileRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/test', test);


// MongoDB Connection and Server Start
mongoose.connect(process.env.MONGO_URI, {
  
}).then(() => {
  console.log('MongoDB Connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error(err));