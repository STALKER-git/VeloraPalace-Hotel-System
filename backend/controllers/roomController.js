const socketManager = require('../socket');
const supabase = require('../config/supabase');

// @desc    Get all rooms with filters
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    const { 
      price_min, price_max, 
      adults, children, babies, 
      type, view_type, status 
    } = req.query;

    let query = supabase.from('rooms').select('*');

    // Apply filters
    if (price_min) query = query.gte('price_per_night', price_min);
    if (price_max) query = query.lte('price_per_night', price_max);
    if (adults) query = query.gte('capacity_adults', adults);
    if (children) query = query.gte('capacity_children', children);
    if (babies) query = query.gte('capacity_babies', babies);
    if (type && type !== 'all') query = query.eq('type', type);
    if (view_type && view_type !== 'all') query = query.eq('view_type', view_type);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room status
// @route   PUT /api/rooms/:id/status
// @access  Private/Receptionist/Admin
exports.updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const { data, error } = await supabase
      .from('rooms')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Broadcast update via Socket.io
    const io = socketManager.getIO();
    io.emit('room_status_updated', data);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new room
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;

    // Broadcast update
    const io = socketManager.getIO();
    io.emit('room_added', data);

    res.status(201).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    // Broadcast update
    const io = socketManager.getIO();
    io.emit('room_deleted', { id: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
