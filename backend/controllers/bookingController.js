const socketManager = require('../socket');
const supabase = require('../config/supabase');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { 
      room_id, 
      check_in, 
      check_out, 
      guests, 
      total_price, 
      promo_code, 
      discount_amount, 
      payment_method, 
      special_requests 
    } = req.body;

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: req.user.id,
          room_id,
          check_in,
          check_out,
          guests,
          total_price,
          promo_code,
          discount_amount,
          payment_method,
          special_requests,
          status: 'confirmed'
        }
      ])
      .select('*, rooms(*), profiles(*)')
      .single();

    if (error) throw error;

    // Update room status
    await supabase.from('rooms').update({ status: 'occupied' }).eq('id', room_id);

    // Broadcast new booking
    const io = socketManager.getIO();
    io.emit('new_booking', booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bookings (or all if staff)
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    let query = supabase
      .from('bookings')
      .select('*, rooms(*), profiles(*)');

    // If staff/admin and requested 'all', return all bookings
    const isStaff = ['receptionist', 'admin'].includes(req.user.role);
    if (isStaff && req.query.all === 'true') {
      // Return all
    } else {
      query = query.eq('user_id', req.user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Staff
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .select('*, rooms(*), profiles(*)')
      .single();

    if (error) throw error;

    // Broadcast update
    const io = socketManager.getIO();
    io.emit('booking_updated', booking);

    // If checked out, update room status
    if (status === 'cancelled') {
        await supabase.from('rooms').update({ status: 'available' }).eq('id', booking.room_id);
        io.emit('room_status_updated', { id: booking.room_id, status: 'available' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
