const express = require('express');
const { createBooking, getMyBookings, getBooking, updateBookingStatus } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All booking routes are protected

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.put('/:id/status', authorize('receptionist', 'admin'), updateBookingStatus);
router.get('/:id', getBooking);

module.exports = router;
