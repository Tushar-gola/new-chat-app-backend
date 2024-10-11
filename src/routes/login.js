const express = require('express')
const { handleSignIndata, handleVerifyUser, handleSignUpUser, handleUserRefreshToken } = require('../controllers/auth')
const { validateSignInData, validateSignUpUser } = require('../validations/auth')
const verifyUserToken = require('../middlewares/access-token')

const authRoutes = express.Router()

authRoutes.post('/sign-up', validateSignInData, handleSignIndata)
authRoutes.post('/sign-in', validateSignUpUser, handleSignUpUser)
authRoutes.get('/check-user', verifyUserToken, handleVerifyUser)
authRoutes.post('/refresh-token', handleUserRefreshToken)

module.exports = { authRoutes }


