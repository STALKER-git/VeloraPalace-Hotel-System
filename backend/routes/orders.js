const express = require('express');
const { createOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.put('/:id/status', authorize('receptionist', 'admin'), updateOrderStatus);

module.exports = router;
