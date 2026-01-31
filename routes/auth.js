const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Login validation
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  authController.login
];

// Profile update validation
const validateProfileUpdate = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  authController.updateProfile
];

// Password change validation
const validatePasswordChange = [
  body('current_password')
    .isLength({ min: 6 })
    .withMessage('Current password is required'),
  
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  
  authController.changePassword
];

// Public routes
router.post('/login', validateLogin);

// Protected routes
router.use(authenticateToken);

router.get('/profile', authController.getProfile);
router.put('/profile', validateProfileUpdate);
router.put('/change-password', validatePasswordChange);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
