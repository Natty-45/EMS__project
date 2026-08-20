import express from 'express';
import VerifiedUser from '../middleware/VerifiedUser.Middleware.js';
import { deleteUser, getTicketDetails, getTickets, updateProfile, contactForm, getAllUsers, updateUserRole, adminDeleteUser, cancelTicket } from '../controllers/user.controller.js';

const router = express.Router();

// Protected route - only accessible to verified users
router.put('/updateProfile/:id', VerifiedUser, updateProfile);
router.delete('/deleteUser/:id', VerifiedUser, deleteUser);
router.get('/tickets', VerifiedUser, getTickets);
router.get('/tickets/:id', VerifiedUser, getTicketDetails);
router.put('/tickets/:id/cancel', VerifiedUser, cancelTicket);

// Admin / superAdmin routes
router.get('/all', VerifiedUser, getAllUsers);
router.put('/:id/role', VerifiedUser, updateUserRole);
router.delete('/:id/admin-delete', VerifiedUser, adminDeleteUser);

// Public route
router.post('/contact', contactForm);

export default router;
