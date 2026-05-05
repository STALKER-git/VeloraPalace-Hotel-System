const supabase = require('../config/supabase');

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const { full_name, phone, nationality, avatar_url, username, identity_document } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        nationality,
        avatar_url,
        username,
        identity_document,
        updated_at: new Date()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const redirectTo = process.env.FRONTEND_URL || 'http://localhost:5173/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Private (User is already authenticated via email link)
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Supabase auth.updateUser() updates the currently logged in user's password
    // The user becomes authenticated when they click the reset link in their email
    // This endpoint should be protected by the 'protect' middleware which verifies the JWT
    
    const { data: { user }, error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};
