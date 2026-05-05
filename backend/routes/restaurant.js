const express = require('express');
const { getMenu, getTables, bookTable, getMyTableBookings } = require('../controllers/restaurantController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/menu', getMenu);
router.get('/tables', getTables);
router.post('/book', protect, bookTable);
router.get('/bookings/my', protect, getMyTableBookings);

module.exports = router;
