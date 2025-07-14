import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/seed', async (req, res) => {
  try {
    const user = new User({ name: 'Saurabh Bhardwaj', email: 'saurabh@example.com' });
    await user.save();
    res.send('✔️ User inserted into DB');
  } catch (err) {
    res.status(500).send('❌ Error: ' + err.message);
  }
});

export default router;
