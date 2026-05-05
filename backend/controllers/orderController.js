const socketManager = require('../socket');
const supabase = require('../config/supabase');

// @desc    Create room service order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, total_price, room_id, special_requests } = req.body;

    const { data: order, error } = await supabase
      .from('room_service_orders')
      .insert([
        {
          user_id: req.user.id,
          room_id,
          items,
          total_price,
          special_requests,
          status: 'pending'
        }
      ])
      .select('*, profiles(*)')
      .single();

    if (error) throw error;

    // Broadcast update
    const io = socketManager.getIO();
    io.emit('new_room_service_order', order);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders (or all if staff)
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    let query = supabase.from('room_service_orders').select('*, profiles(*), rooms(*)');

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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { data: order, error } = await supabase
      .from('room_service_orders')
      .update({ status })
      .eq('id', req.params.id)
      .select('*, profiles(*)')
      .single();

    if (error) throw error;

    // Broadcast update
    const io = socketManager.getIO();
    io.emit('order_status_updated', order);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
