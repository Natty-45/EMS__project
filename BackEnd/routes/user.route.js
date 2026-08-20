import express from 'express';
import VerifiedUser from '../middleware/VerifiedUser.Middleware.js';
import { deleteUser, getTicketDetails, getTickets, updateProfile, contactForm } from '../controllers/user.controller.js';

const router = express.Router();

// Protected route - only accessible to verified users
router.put('/updateProfile/:id', VerifiedUser, updateProfile);
router.delete('/deleteUser/:id', VerifiedUser, deleteUser);
router.get('/tickets', VerifiedUser, getTickets);
router.get('/tickets/:id', VerifiedUser, getTicketDetails);

// Public route
router.post('/contact', contactForm);

export default router;
