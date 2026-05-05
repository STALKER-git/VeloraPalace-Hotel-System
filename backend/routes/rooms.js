const express = require('express');
const { getRooms, getRoom, updateRoomStatus, createRoom, deleteRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getRooms);
router.get('/:id', getRoom);

// Protected routes
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id/status', protect, authorize('receptionist', 'admin'), updateRoomStatus);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
