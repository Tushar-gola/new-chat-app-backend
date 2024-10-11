// Validation middleware
const { body } = require('express-validator');
const { error } = require('../helpers/response');
const validateSignInData = [
    body('email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Email is required'),
    body('first_name').isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters').notEmpty().withMessage('First name is required'),
    body('last_name').isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters').notEmpty().withMessage('Last name is required'),
    // Conditional password validation
    body('password').if((value, { req }) => req.body.login_by == 'email')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .notEmpty().withMessage('Password is required'),

    // Confirm password validation (only if login_by is email)
    body('confirm_password').if((value, { req }) => req.body.login_by == 'email')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    body('login_by').isIn(['google', 'facebook', 'email']).withMessage('Invalid login method').notEmpty().withMessage('Login method is required'),
    body('user_name').optional().isAlphanumeric().withMessage('Username must be alphanumeric').isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('platform').optional(),
    body('userAgent').optional()
];
const validateSignUpUser = [
    body('email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Email is required'),
    body('password').if((value, { req }) => req.body.login_by == 'email')
        .notEmpty().withMessage('Password is required'),
    body('login_by').isIn(['google', 'facebook', 'email']).withMessage('Invalid login method').notEmpty().withMessage('Login method is required'),
];

module.exports = { validateSignInData,validateSignUpUser }