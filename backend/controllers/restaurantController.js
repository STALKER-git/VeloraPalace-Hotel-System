const socketManager = require('../socket');
const supabase = require('../config/supabase');

// @desc    Book a table
// @route   POST /api/restaurant/book
// @access  Private
exports.bookTable = async (req, res, next) => {
  try {
    const { table_id, date, time, guests, special_requests } = req.body;

    const { data: booking, error } = await supabase
      .from('table_bookings')
      .insert([
        {
          user_id: req.user.id,
          table_id,
          date,
          time,
          guests,
          special_requests,
          status: 'confirmed'
        }
      ])
      .select('*, profiles(*), restaurant_tables(*)')
      .single();

    if (error) throw error;

    // Broadcast
    const io = socketManager.getIO();
    io.emit('new_restaurant_reservation', booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menu items
// @route   GET /api/restaurant/menu
// @access  Public
exports.getMenu = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);

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

// @desc    Get restaurant tables
// @route   GET /api/restaurant/tables
// @access  Public
exports.getTables = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('is_available', true);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get my table bookings
// @route   GET /api/restaurant/bookings/my
// @access  Private
exports.getMyTableBookings = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('table_bookings')
      .select('*, restaurant_tables(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

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
