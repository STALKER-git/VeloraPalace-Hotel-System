const supabase = require('../config/supabase');

// @desc    Process payment (Mock)
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const { booking_id, amount, method, discount_code } = req.body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demonstration, let's assume payment is always successful
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: req.user.id,
          booking_id,
          amount,
          method,
          status: 'completed',
          discount_code
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update booking status to confirmed
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking_id);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate discount code
// @route   GET /api/payments/validate-promo/:code
// @access  Public
exports.validatePromo = async (req, res, next) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Invalid or expired promo code' });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};
