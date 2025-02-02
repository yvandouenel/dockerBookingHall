import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as bookingController from '../controllers/booking.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Routes d'authentification
router.post('/auth/signup', verifyToken, isAdmin, authController.signup);
router.post('/auth/login', authController.login);
router.put('/auth/users/:email', verifyToken, authController.updateUser);

// Routes de réservation
router.post('/bookings', verifyToken, bookingController.createBooking);
router.get('/bookings/monthly', bookingController.getMonthlyBookings);
//router.put('/bookings/:bid', verifyToken, bookingController.updateBooking);
router.put('/bookings/:bid', verifyToken, bookingController.updateBooking);

export default router;
