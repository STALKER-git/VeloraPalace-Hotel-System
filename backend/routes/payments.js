const express = require('express');
const { processPayment, validatePromo } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/process', protect, processPayment);
router.get('/validate-promo/:code', validatePromo);

module.exports = router;
