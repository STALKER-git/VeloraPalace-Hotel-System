const supabase = require('../config/supabase');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

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
