const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/config');

// User login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username and password are required'
      });
    }
    
    // Find user by username
    const [users] = await pool.execute(
      'SELECT id, username, password, email, full_name, role, is_active FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.execute(`
      SELECT id, username, email, full_name, role, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, full_name } = req.body;
    
    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    // If updating email, check for duplicates
    if (email) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (duplicate.length > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already exists'
        });
      }
    }
    
    // Build dynamic update query
    const updateFields = {};
    if (email !== undefined) updateFields.email = email;
    if (full_name !== undefined) updateFields.full_name = full_name;
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No fields to update'
      });
    }
    
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await pool.execute(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, userId]
    );
    
    // Return updated user
    const [updatedUser] = await pool.execute(`
      SELECT id, username, email, full_name, role, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Current password and new password are required'
      });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Get current user
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    
    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );
    
    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to change password'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const [users] = await pool.execute(
      'SELECT id, username, role, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive'
      });
    }
    
    const user = users[0];
    
    // Generate new JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      message: 'Token refreshed successfully',
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh token'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the token from storage
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout
};
